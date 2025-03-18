const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Driver routes
router.post('/register', driverController.registerDriver);
router.post('/login', driverController.loginDriver);
router.get('/profile', driverController.getDriverProfile);
router.put('/profile', driverController.updateDriverProfile);
router.post('/rides', driverController.createRide);
router.get('/rides', driverController.getAllRides);
router.post('/rides/search', driverController.searchRides);
router.post('/rides/:id/book', driverController.bookRide);
router.post('/rides/:rideId/join', driverController.joinRide);

module.exports = router;