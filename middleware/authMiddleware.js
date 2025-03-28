const { verifyToken } = require('../utils/jwtUtils');
const Driver = require('../models/Driver');
const Rider = require('../models/Rider');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = verifyToken(token);
    
    // Check if user is a driver or rider
    let user = await Driver.findById(decoded.id).select('-password');
    let userType = 'driver';

    if (!user) {
      user = await Rider.findById(decoded.id).select('-password');
      userType = 'rider';
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Set user and type in request object
    req.user = user;
    req.userType = userType;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
