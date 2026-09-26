const prisma = require('../config/db');

// Admin Dashboard stats
const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.patient.count();
    const totalHospitals = await prisma.hospital.count();
    const totalDrivers = await prisma.ambulanceDriver.count();
    const totalAmbulances = await prisma.ambulance.count();
    const availableAmbulances = await prisma.ambulance.count({ where: { status: 'AVAILABLE' } });
    const totalEmergencyRequests = await prisma.emergencyRequest.count();
    const activeEmergencyRequests = await prisma.emergencyRequest.count({
      where: {
        status: { in: ['PENDING', 'ACCEPTED_BY_HOSPITAL', 'DRIVER_ASSIGNED', 'EN_ROUTE_TO_PATIENT', 'PATIENT_PICKED_UP', 'EN_ROUTE_TO_HOSPITAL'] }
      }
    });

    const recentRequests = await prisma.emergencyRequest.findMany({
      take: 10,
      orderBy: { requestedAt: 'desc' },
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: { select: { name: true } },
        driver: { include: { user: { select: { name: true } } } }
      }
    });

    res.json({
      stats: {
        totalUsers,
        totalPatients,
        totalHospitals,
        totalDrivers,
        totalAmbulances,
        availableAmbulances,
        totalEmergencyRequests,
        activeEmergencyRequests,
      },
      recentRequests,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard statistics' });
  }
};

// Manage Users
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        patient: true,
        hospital: true,
        driver: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() }
    });

    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Manage Hospitals
const getHospitals = async (req, res) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        user: { select: { email: true, phone: true } },
        facilities: true,
        ambulances: true,
      }
    });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
};

// Verify/Approve Hospital
const toggleHospitalVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const hospital = await prisma.hospital.findUnique({ where: { id } });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    const updated = await prisma.hospital.update({
      where: { id },
      data: { isVerified: !hospital.isVerified }
    });

    res.json({ message: `Hospital verification set to ${updated.isVerified}`, hospital: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update hospital status' });
  }
};

// Manage Ambulances
const getAmbulances = async (req, res) => {
  try {
    const ambulances = await prisma.ambulance.findMany({
      include: {
        hospital: { select: { name: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } }
      }
    });
    res.json(ambulances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ambulances' });
  }
};

// Monitor Emergency Requests
const getAllEmergencyRequests = async (req, res) => {
  try {
    const requests = await prisma.emergencyRequest.findMany({
      include: {
        patient: { include: { user: { select: { name: true, phone: true } } } },
        hospital: { select: { name: true } },
        driver: { include: { user: { select: { name: true, phone: true } } } },
        ambulance: true,
      },
      orderBy: { requestedAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency requests' });
  }
};

module.exports = {
  getAdminDashboard,
  getUsers,
  updateUserRole,
  getHospitals,
  toggleHospitalVerification,
  getAmbulances,
  getAllEmergencyRequests,
};
