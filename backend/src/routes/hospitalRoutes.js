const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getEmergencyRequests,
  respondToRequest,
  updateAvailability,
  addAmbulance
} = require('../controllers/hospitalController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(authenticateToken);
router.use(authorizeRoles('HOSPITAL', 'ADMIN'));

router.get('/dashboard', getDashboardData);
router.get('/requests', getEmergencyRequests);
router.put('/requests/:id/respond', respondToRequest);
router.put('/availability', updateAvailability);
router.post('/ambulances', addAmbulance);

module.exports = router;
