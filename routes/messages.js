const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authenticate = require('../middleware/authMiddleware');

// Apply authentication middleware to all message routes
router.use(authenticate);

// Route to send a new message
router.post('/', messageController.sendMessage);

// Route to get all messages for a ride
router.get('/:rideId', messageController.getMessages);

module.exports = router;
