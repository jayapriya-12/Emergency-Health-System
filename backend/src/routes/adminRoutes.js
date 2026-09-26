const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getUsers,
  updateUserRole,
  getHospitals,
  toggleHospitalVerification,
  getAmbulances,
  getAllEmergencyRequests
} = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/hospitals', getHospitals);
router.put('/hospitals/:id/verify', toggleHospitalVerification);
router.get('/ambulances', getAmbulances);
router.get('/emergency-requests', getAllEmergencyRequests);

module.exports = router;
