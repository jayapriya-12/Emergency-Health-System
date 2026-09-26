const express = require('express');
const router = express.Router();
const {
  getNearbyHospitals,
  getHospitalById,
  getAvailableAmbulances,
  createEmergencyRequest,
  getActiveRequest,
  getRequestHistory,
  updateProfile
} = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(authenticateToken);

router.get('/hospitals', getNearbyHospitals);
router.get('/hospitals/:id', getHospitalById);
router.get('/ambulances', getAvailableAmbulances);
router.post('/emergency-request', createEmergencyRequest);
router.get('/active-request', getActiveRequest);
router.get('/request-history', getRequestHistory);
router.put('/profile', updateProfile);

module.exports = router;
