const Driver = require('../models/Driver');
const Ride = require('../models/Ride');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtils');

const driverController = {
  registerDriver: async (req, res) => {
    try {
      const { name, email, password, vehicleDetails } = req.body;
      
      const driverExists = await Driver.findOne({ email });
      if (driverExists) {
        return res.status(400).json({ message: 'Driver already exists' });
      }

      const driver = await Driver.create({
        name,
        email,
        password,
        vehicleDetails
      });

      if (driver) {
        res.status(201).json({
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          token: generateToken(driver._id)
        });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  loginDriver: async (req, res) => {
    try {
      const { email, password } = req.body;
      const driver = await Driver.findOne({ email });

      if (driver && (await bcrypt.compare(password, driver.password))) {
        res.json({
          _id: driver._id,
          name: driver.name,
          email: driver.email,
          token: generateToken(driver._id)
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getDriverProfile: async (req, res) => {
    try {
      const driver = await Driver.findById(req.user._id).select('-password');
      res.json(driver);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  updateDriverProfile: async (req, res) => {
    try {
      const driver = await Driver.findById(req.user._id);
      
      if (driver) {
        driver.name = req.body.name || driver.name;
        driver.email = req.body.email || driver.email;
        driver.vehicleDetails = req.body.vehicleDetails || driver.vehicleDetails;
        
        if (req.body.password) {
          driver.password = req.body.password;
        }

        const updatedDriver = await driver.save();
        res.json({
          _id: updatedDriver._id,
          name: updatedDriver.name,
          email: updatedDriver.email,
          vehicleDetails: updatedDriver.vehicleDetails
        });
      } else {
        res.status(404).json({ message: 'Driver not found' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  createRide: async (req, res) => {
    try {
      // Implement ride creation logic
      res.status(501).json({ message: 'Ride creation not implemented yet' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getDriverRides: async (req, res) => {
    try {
      // Implement get driver rides logic
      res.status(501).json({ message: 'Get driver rides not implemented yet' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = driverController;