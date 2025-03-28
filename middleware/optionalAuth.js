const { verifyToken } = require('../utils/jwtUtils');
const Rider = require('../models/Rider');
const Driver = require('../models/Driver');

const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);
      
      // Check if user is rider or driver
      const rider = await Rider.findById(decoded.id).select('-password');
      const driver = await Driver.findById(decoded.id).select('-password');
      
      req.user = rider || driver;
      req.userType = rider ? 'rider' : 'driver';
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = optionalAuth;