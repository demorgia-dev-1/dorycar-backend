const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/vehicle-types', rideController.getVehicleTypes);

// Protected routes
router.use(protect);
router.post('/create', rideController.createRide);
router.get('/:id', rideController.getRideById);
router.get('/driver/:driverId', rideController.getDriverRides);
router.get('/rider/:riderId', rideController.getRiderRides);

module.exports = router;