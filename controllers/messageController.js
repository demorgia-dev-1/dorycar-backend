const Message = require('../models/Message');

// Send a message related to a ride
exports.sendMessage = async (req, res) => {
  try {
    const { rideId, content } = req.body;
    const sender = req.user.userId; // Provided by your authentication middleware

    // Validate required fields
    if (!rideId || !content) {
      return res.status(400).json({ message: 'rideId and content are required.' });
    }

    // Create and save a new message
    const newMessage = new Message({ ride: rideId, sender, content });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error });
  }
};

// Get all messages for a specific ride
exports.getMessages = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    if (!rideId) {
      return res.status(400).json({ message: 'rideId is required in the URL.' });
    }

    // Fetch messages and populate sender details
    const messages = await Message.find({ ride: rideId })
      .populate('sender', 'name email');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages', error });
  }
};
