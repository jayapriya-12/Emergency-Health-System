const prisma = require('../config/db');

// Get Hospital Dashboard metrics & active emergencies
const getDashboardData = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.id },
      include: {
        facilities: true,
        ambulances: true,
      }
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital profile not found' });
    }

    const pendingRequests = await prisma.emergencyRequest.count({
      where: {
        OR: [
          { hospitalId: hospital.id, status: 'PENDING' },
          { hospitalId: null, status: 'PENDING' }
        ]
      }
    });

    const activeRequests = await prisma.emergencyRequest.findMany({
      where: {
        hospitalId: hospital.id,
        status: { in: ['ACCEPTED_BY_HOSPITAL', 'DRIVER_ASSIGNED', 'EN_ROUTE_TO_PATIENT', 'PATIENT_PICKED_UP', 'EN_ROUTE_TO_HOSPITAL'] }
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        ambulance: true,
      },
      orderBy: { updatedAt: 'desc' }
    });

    const completedCount = await prisma.emergencyRequest.count({
      where: { hospitalId: hospital.id, status: 'COMPLETED' }
    });

    res.json({
      hospital,
      stats: {
        availableBeds: hospital.availableBeds,
        totalBeds: hospital.totalBeds,
        availableICUBeds: hospital.availableICUBeds,
        totalICUBeds: hospital.totalICUBeds,
        availableVentilators: hospital.availableVentilators,
        totalVentilators: hospital.totalVentilators,
        emergencyDeptStatus: hospital.emergencyDeptStatus,
        oxygenAvailable: hospital.oxygenAvailable,
        pendingRequestsCount: pendingRequests,
        activeRequestsCount: activeRequests.length,
        completedCount: completedCount,
      },
      activeRequests,
    });
  } catch (error) {
    console.error('Error fetching hospital dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch hospital dashboard data' });
  }
};

// Get emergency requests for hospital
const getEmergencyRequests = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.id }
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital profile not found' });
    }

    const requests = await prisma.emergencyRequest.findMany({
      where: {
        OR: [
          { hospitalId: hospital.id },
          { hospitalId: null, status: 'PENDING' }
        ]
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        ambulance: true,
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency requests' });
  }
};

// Accept or Reject Emergency Request
const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignDriverId, notes } = req.body; // ACCEPTED_BY_HOSPITAL or REJECTED

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.id }
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital profile not found' });
    }

    const targetStatus = status === 'REJECTED' ? 'REJECTED' : 'ACCEPTED_BY_HOSPITAL';

    const updated = await prisma.emergencyRequest.update({
      where: { id },
      data: {
        hospitalId: hospital.id,
        status: targetStatus,
        acceptedAt: targetStatus === 'ACCEPTED_BY_HOSPITAL' ? new Date() : null,
        driverId: assignDriverId || undefined,
        notes: notes ? notes : undefined,
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        hospital: true,
      }
    });

    // Notify via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`request:${updated.id}`).emit('emergency_status_changed', updated);
      io.to(`user:${updated.patient.userId}`).emit('emergency_status_changed', updated);
      io.to('role:DRIVER').emit('emergency_status_changed', updated);
    }

    res.json({ message: `Emergency request ${targetStatus.toLowerCase()}`, request: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request response' });
  }
};

// Update Hospital Bed & ICU Availability
const updateAvailability = async (req, res) => {
  try {
    const {
      availableBeds,
      totalBeds,
      availableICUBeds,
      totalICUBeds,
      availableVentilators,
      totalVentilators,
      emergencyDeptStatus,
      oxygenAvailable
    } = req.body;

    const hospital = await prisma.hospital.update({
      where: { userId: req.user.id },
      data: {
        availableBeds: availableBeds !== undefined ? parseInt(availableBeds) : undefined,
        totalBeds: totalBeds !== undefined ? parseInt(totalBeds) : undefined,
        availableICUBeds: availableICUBeds !== undefined ? parseInt(availableICUBeds) : undefined,
        totalICUBeds: totalICUBeds !== undefined ? parseInt(totalICUBeds) : undefined,
        availableVentilators: availableVentilators !== undefined ? parseInt(availableVentilators) : undefined,
        totalVentilators: totalVentilators !== undefined ? parseInt(totalVentilators) : undefined,
        emergencyDeptStatus: emergencyDeptStatus || undefined,
        oxygenAvailable: oxygenAvailable !== undefined ? Boolean(oxygenAvailable) : undefined,
      },
      include: { facilities: true }
    });

    // Emit live update to patients & admin
    const io = req.app.get('io');
    if (io) {
      io.emit('hospital_availability_updated', hospital);
    }

    res.json({ message: 'Hospital availability updated successfully', hospital });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// Manage Hospital Fleet / Add Ambulance
const addAmbulance = async (req, res) => {
  try {
    const { vehicleNumber, vehicleModel, type } = req.body;
    const hospital = await prisma.hospital.findUnique({ where: { userId: req.user.id } });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const ambulance = await prisma.ambulance.create({
      data: {
        vehicleNumber,
        vehicleModel: vehicleModel || 'Standard Emergency Unit',
        type: type || 'ALS',
        hospitalId: hospital.id,
        status: 'AVAILABLE',
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      }
    });

    res.status(201).json({ message: 'Ambulance added to fleet', ambulance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add ambulance' });
  }
};

module.exports = {
  getDashboardData,
  getEmergencyRequests,
  respondToRequest,
  updateAvailability,
  addAmbulance,
};
