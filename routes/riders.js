const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', riderController.registerRider);
router.post('/login', riderController.loginRider);

// Protected routes
router.use(protect);
router.get('/profile', riderController.getRiderProfile);
router.put('/profile', riderController.updateRiderProfile);

module.exports = router;