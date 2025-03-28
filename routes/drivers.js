const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
// Remove or comment this line since we're using common authMiddleware
// const driverAuth = require('../middleware/driverAuthMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', driverController.registerDriver);
router.post('/login', driverController.loginDriver);

// Protected routes
router.use(protect);
router.get('/profile', driverController.getDriverProfile);
router.put('/profile', driverController.updateDriverProfile);
router.post('/create-ride', driverController.createRide);
router.get('/rides', driverController.getDriverRides);

module.exports = router;