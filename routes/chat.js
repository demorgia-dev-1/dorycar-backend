const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ChatService = require('../services/chatService');

router.get('/:rideId', protect, async (req, res) => {
  try {
    const messages = await ChatService.getRideChat(req.params.rideId);
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;