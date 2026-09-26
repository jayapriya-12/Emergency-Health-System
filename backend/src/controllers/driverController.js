const prisma = require('../config/db');

// Get Driver Dashboard info & Active trip
const getDashboardData = async (req, res) => {
  try {
    const driver = await prisma.ambulanceDriver.findUnique({
      where: { userId: req.user.id },
      include: {
        ambulance: true,
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    // Active request assigned to driver or accepted
    const activeRequest = await prisma.emergencyRequest.findFirst({
      where: {
        driverId: driver.id,
        status: { in: ['ACCEPTED_BY_HOSPITAL', 'DRIVER_ASSIGNED', 'EN_ROUTE_TO_PATIENT', 'PATIENT_PICKED_UP', 'EN_ROUTE_TO_HOSPITAL'] }
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: true,
        ambulance: true,
        trips: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    // Nearby pending requests if available
    const pendingRequests = await prisma.emergencyRequest.findMany({
      where: {
        status: 'PENDING',
        driverId: null
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: true
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json({
      driver,
      activeRequest: activeRequest || null,
      pendingRequests,
    });
  } catch (error) {
    console.error('Error fetching driver dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch driver dashboard' });
  }
};

// Update Driver Availability Status (AVAILABLE, ON_TRIP, OFFLINE)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['AVAILABLE', 'ON_TRIP', 'OFFLINE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const driver = await prisma.ambulanceDriver.update({
      where: { userId: req.user.id },
      data: { status },
      include: { ambulance: true }
    });

    if (driver.currentAmbulanceId) {
      await prisma.ambulance.update({
        where: { id: driver.currentAmbulanceId },
        data: { status }
      });
    }

    // Emit live status via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('driver_status_changed', driver);
    }

    res.json({ message: `Driver status updated to ${status}`, driver });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

// Update Driver Live GPS Location
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, speed, heading, requestId } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const driver = await prisma.ambulanceDriver.update({
      where: { userId: req.user.id },
      data: { latitude: lat, longitude: lng },
      include: { ambulance: true }
    });

    if (driver.currentAmbulanceId) {
      await prisma.ambulance.update({
        where: { id: driver.currentAmbulanceId },
        data: { latitude: lat, longitude: lng }
      });
    }

    // Store in Location history
    await prisma.location.create({
      data: {
        entityId: driver.id,
        entityType: 'DRIVER',
        latitude: lat,
        longitude: lng,
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null,
      }
    });

    // Emit socket broadcast
    const io = req.app.get('io');
    if (io && requestId) {
      io.to(`request:${requestId}`).emit('driver_location_changed', {
        driverId: driver.id,
        requestId,
        latitude: lat,
        longitude: lng,
        speed,
        heading
      });
    }

    res.json({ message: 'Location updated successfully', location: { latitude: lat, longitude: lng } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update driver location' });
  }
};

// Accept Emergency Request
const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params; // Emergency Request ID

    const driver = await prisma.ambulanceDriver.findUnique({
      where: { userId: req.user.id },
      include: { ambulance: true }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    if (driver.status === 'OFFLINE') {
      return res.status(400).json({ error: 'You are currently OFFLINE. Set status to AVAILABLE first.' });
    }

    const request = await prisma.emergencyRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    if (request.status !== 'PENDING' && request.status !== 'ACCEPTED_BY_HOSPITAL') {
      return res.status(400).json({ error: `Request already processed (Status: ${request.status})` });
    }

    // Update emergency request
    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id },
      data: {
        driverId: driver.id,
        ambulanceId: driver.currentAmbulanceId || request.ambulanceId,
        status: 'DRIVER_ASSIGNED',
        acceptedAt: new Date(),
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: true,
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        ambulance: true,
      }
    });

    // Update Driver & Ambulance status to ON_TRIP
    await prisma.ambulanceDriver.update({
      where: { id: driver.id },
      data: { status: 'ON_TRIP' }
    });

    if (driver.currentAmbulanceId) {
      await prisma.ambulance.update({
        where: { id: driver.currentAmbulanceId },
        data: { status: 'ON_TRIP' }
      });
    }

    // Create Trip entry
    const trip = await prisma.trip.create({
      data: {
        emergencyRequestId: updatedRequest.id,
        driverId: driver.id,
        ambulanceId: driver.currentAmbulanceId,
        patientId: updatedRequest.patientId,
        hospitalId: updatedRequest.hospitalId,
        status: 'IN_PROGRESS',
        startLatitude: driver.latitude,
        startLongitude: driver.longitude,
      }
    });

    // Broadcast Socket.IO update
    const io = req.app.get('io');
    if (io) {
      io.to(`request:${updatedRequest.id}`).emit('trip_status_updated', {
        request: updatedRequest,
        trip,
        status: 'DRIVER_ASSIGNED',
      });
      io.to(`user:${updatedRequest.patient.userId}`).emit('emergency_status_changed', updatedRequest);
    }

    res.json({ message: 'Emergency request accepted successfully', request: updatedRequest, trip });
  } catch (error) {
    console.error('Error accepting emergency request:', error);
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

// Update Trip Step Workflow:
// EN_ROUTE_TO_PATIENT -> PATIENT_PICKED_UP -> EN_ROUTE_TO_HOSPITAL -> REACHED_HOSPITAL -> COMPLETED
const updateTripStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body; // status: EN_ROUTE_TO_PATIENT, PATIENT_PICKED_UP, EN_ROUTE_TO_HOSPITAL, REACHED_HOSPITAL, COMPLETED

    const driver = await prisma.ambulanceDriver.findUnique({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const request = await prisma.emergencyRequest.findUnique({
      where: { id: requestId },
      include: { patient: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const isCompleted = status === 'COMPLETED';

    const updatedRequest = await prisma.emergencyRequest.update({
      where: { id: requestId },
      data: {
        status,
        completedAt: isCompleted ? new Date() : undefined,
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: true,
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        ambulance: true,
      }
    });

    // If trip completed, free up driver & ambulance status to AVAILABLE
    if (isCompleted) {
      await prisma.ambulanceDriver.update({
        where: { id: driver.id },
        data: { status: 'AVAILABLE' }
      });

      if (driver.currentAmbulanceId) {
        await prisma.ambulance.update({
          where: { id: driver.currentAmbulanceId },
          data: { status: 'AVAILABLE' }
        });
      }

      await prisma.trip.updateMany({
        where: { emergencyRequestId: requestId, status: 'IN_PROGRESS' },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
          endLatitude: driver.latitude,
          endLongitude: driver.longitude,
        }
      });
    }

    // Broadcast Socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`request:${requestId}`).emit('trip_status_updated', {
        request: updatedRequest,
        status,
      });
      io.to(`user:${request.patient.userId}`).emit('emergency_status_changed', updatedRequest);
    }

    res.json({ message: `Trip status updated to ${status}`, request: updatedRequest });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({ error: 'Failed to update trip status' });
  }
};

// Get Driver Trip History
const getTripHistory = async (req, res) => {
  try {
    const driver = await prisma.ambulanceDriver.findUnique({
      where: { userId: req.user.id }
    });

    if (!driver) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const trips = await prisma.emergencyRequest.findMany({
      where: { driverId: driver.id },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: { select: { name: true, address: true } },
        ambulance: true,
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip history' });
  }
};

module.exports = {
  getDashboardData,
  updateStatus,
  updateLocation,
  acceptRequest,
  updateTripStatus,
  getTripHistory,
};
