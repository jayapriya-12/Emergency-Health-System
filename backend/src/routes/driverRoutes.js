const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  updateStatus,
  updateLocation,
  acceptRequest,
  updateTripStatus,
  getTripHistory
} = require('../controllers/driverController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

router.use(authenticateToken);
router.use(authorizeRoles('AMBULANCE_DRIVER', 'ADMIN'));

router.get('/dashboard', getDashboardData);
router.put('/status', updateStatus);
router.put('/location', updateLocation);
router.post('/requests/:id/accept', acceptRequest);
router.put('/trip/status', updateTripStatus);
router.get('/history', getTripHistory);

module.exports = router;
