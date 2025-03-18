const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply the authentication middleware to routes that need protection
router.use(authMiddleware);

// Rider routes
router.post('/register', riderController.registerRider);
router.post('/login', riderController.loginRider);
router.get('/profile', riderController.getRiderProfile);
router.put('/profile', riderController.updateRiderProfile);
router.post('/search', riderController.searchRides);
router.post('/rides/:id/book', riderController.bookRide);

module.exports = router;