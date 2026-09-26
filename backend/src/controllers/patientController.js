const prisma = require('../config/db');
const { calculateDistance } = require('../utils/distance');

// Get nearby hospitals with distance calculations
const getNearbyHospitals = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userLat = lat ? parseFloat(lat) : (req.user.patient?.latitude || 13.0604);
    const userLng = lng ? parseFloat(lng) : (req.user.patient?.longitude || 80.2496);

    const hospitals = await prisma.hospital.findMany({
      include: {
        facilities: true,
        user: { select: { email: true, phone: true } }
      }
    });

    const formattedHospitals = hospitals.map(h => {
      const distanceKm = calculateDistance(userLat, userLng, h.latitude, h.longitude);
      return {
        ...h,
        distanceKm,
      };
    });

    // Sort by nearest hospital
    formattedHospitals.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(formattedHospitals);
  } catch (error) {
    console.error('Error fetching nearby hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch nearby hospitals' });
  }
};

// Get single hospital details
const getHospitalById = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        facilities: true,
        ambulances: { where: { status: 'AVAILABLE' } },
        user: { select: { email: true, phone: true } }
      }
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json(hospital);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospital details' });
  }
};

// Get available ambulances near patient
const getAvailableAmbulances = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userLat = lat ? parseFloat(lat) : (req.user.patient?.latitude || 13.0604);
    const userLng = lng ? parseFloat(lng) : (req.user.patient?.longitude || 80.2496);

    const ambulances = await prisma.ambulance.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        hospital: { select: { name: true, phone: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } }
      }
    });

    const result = ambulances.map(amb => {
      const dist = calculateDistance(userLat, userLng, amb.latitude, amb.longitude);
      return {
        ...amb,
        distanceKm: dist,
        etaMinutes: Math.round(dist * 3) + 2, // Estimated 3 mins per km + 2 min dispatch
      };
    });

    result.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available ambulances' });
  }
};

// Create Emergency Request (SOS / Ambulance dispatch request)
const createEmergencyRequest = async (req, res) => {
  try {
    const {
      emergencyType = 'GENERAL',
      severity = 'HIGH',
      pickupLatitude,
      pickupLongitude,
      pickupAddress,
      hospitalId,
      ambulanceId,
      notes
    } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(400).json({ error: 'Patient profile required to send SOS' });
    }

    const lat = pickupLatitude ? parseFloat(pickupLatitude) : (patient.latitude || 13.0604);
    const lng = pickupLongitude ? parseFloat(pickupLongitude) : (patient.longitude || 80.2496);
    const address = pickupAddress || patient.address || 'Emergency Location';

    // Create the emergency request
    const emergencyRequest = await prisma.emergencyRequest.create({
      data: {
        patientId: patient.id,
        hospitalId: hospitalId || null,
        ambulanceId: ambulanceId || null,
        status: 'PENDING',
        emergencyType,
        severity,
        pickupLatitude: lat,
        pickupLongitude: lng,
        pickupAddress: address,
        notes: notes || 'Immediate emergency assistance requested',
      },
      include: {
        patient: { include: { user: { select: { name: true, phone: true, email: true } } } },
        hospital: true,
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        ambulance: true,
      }
    });

    // Also emit socket event via req.app.get('io') if attached
    const io = req.app.get('io');
    if (io) {
      io.to('role:HOSPITAL').emit('new_emergency_request', emergencyRequest);
      io.to('role:DRIVER').emit('new_emergency_request', emergencyRequest);
      io.to('role:ADMIN').emit('new_emergency_request', emergencyRequest);
    }

    res.status(201).json({
      message: 'Emergency request submitted successfully. Dispatching nearest unit...',
      emergencyRequest
    });
  } catch (error) {
    console.error('Error creating emergency request:', error);
    res.status(500).json({ error: 'Failed to create emergency request' });
  }
};

// Get current active emergency request for patient
const getActiveRequest = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const activeRequest = await prisma.emergencyRequest.findFirst({
      where: {
        patientId: patient.id,
        status: {
          in: ['PENDING', 'ACCEPTED_BY_HOSPITAL', 'DRIVER_ASSIGNED', 'EN_ROUTE_TO_PATIENT', 'PATIENT_PICKED_UP', 'EN_ROUTE_TO_HOSPITAL']
        }
      },
      include: {
        hospital: true,
        driver: {
          include: {
            user: { select: { name: true, phone: true } },
            ambulance: true,
          }
        },
        ambulance: true,
        trips: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json(activeRequest || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active emergency request' });
  }
};

// Get emergency request history
const getRequestHistory = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const requests = await prisma.emergencyRequest.findMany({
      where: { patientId: patient.id },
      include: {
        hospital: { select: { name: true, emergencyPhone: true } },
        driver: { include: { user: { select: { name: true, phone: true } }, ambulance: true } },
        ambulance: true,
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request history' });
  }
};

// Update Patient Profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, age, bloodGroup, emergencyContactName, emergencyContactPhone, address, medicalNotes, latitude, longitude } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name || req.user.name,
        phone: phone || req.user.phone,
      }
    });

    const patient = await prisma.patient.update({
      where: { userId: req.user.id },
      data: {
        age: age ? parseInt(age) : undefined,
        bloodGroup: bloodGroup || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        address: address || undefined,
        medicalNotes: medicalNotes || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      }
    });

    res.json({ message: 'Profile updated successfully', patient });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = {
  getNearbyHospitals,
  getHospitalById,
  getAvailableAmbulances,
  createEmergencyRequest,
  getActiveRequest,
  getRequestHistory,
  updateProfile,
};
