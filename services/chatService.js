const Chat = require('../models/Chat');

class ChatService {
  static async createChat(rideId, senderId, message) {
    try {
      const chat = await Chat.create({
        ride: rideId,
        sender: senderId,
        message,
        timestamp: new Date()
      });

      return chat;
    } catch (error) {
      throw new Error('Error creating chat message: ' + error.message);
    }
  }

  static async getRideChat(rideId) {
    try {
      const messages = await Chat.find({ ride: rideId })
        .populate('sender', 'name role')
        .sort({ timestamp: 1 });
      return messages;
    } catch (error) {
      throw new Error('Error fetching chat messages: ' + error.message);
    }
  }
}

module.exports = ChatService;