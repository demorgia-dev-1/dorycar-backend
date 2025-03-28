const Rider = require('../models/Rider');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');
const MatchingService = require('../services/matchingService');
const RiderStatsService = require('../services/riderStatsService');

const riderController = {
  registerRider: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      const riderExists = await Rider.findOne({ email });
      if (riderExists) {
        return res.status(400).json({ message: 'Rider already exists' });
      }

      const rider = await Rider.create({
        name,
        email,
        password
      });

      if (rider) {
        res.status(201).json({
          _id: rider._id,
          name: rider.name,
          email: rider.email,
          token: generateToken(rider._id)
        });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  loginRider: async (req, res) => {
    try {
      const { email, password } = req.body;
      const rider = await Rider.findOne({ email });

      if (rider && (await bcrypt.compare(password, rider.password))) {
        res.json({
          _id: rider._id,
          name: rider.name,
          email: rider.email,
          token: generateToken(rider._id)
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getRiderProfile: async (req, res) => {
    try {
      const rider = await Rider.findById(req.user._id).select('-password');
      res.json(rider);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateRiderProfile: async (req, res) => {
    try {
      const rider = await Rider.findById(req.user._id);
      
      if (rider) {
        rider.name = req.body.name || rider.name;
        rider.email = req.body.email || rider.email;
        
        if (req.body.password) {
          rider.password = req.body.password;
        }

        const updatedRider = await rider.save();
        res.json({
          _id: updatedRider._id,
          name: updatedRider.name,
          email: updatedRider.email
        });
      } else {
        res.status(404).json({ message: 'Rider not found' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = riderController;