const Ride = require('../models/Ride');
const vehicleRates = require('../config/vehicleRates');

const rideController = {
  getVehicleTypes: async (req, res) => {
    try {
      res.json(vehicleRates);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  createRide: async (req, res) => {
    try {
      const { startLocation, endLocation, departureTime, availableSeats, price } = req.body;
      const ride = await Ride.create({
        driver: req.user._id,
        startLocation,
        endLocation,
        departureTime,
        availableSeats,
        price
      });
      res.status(201).json(ride);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getRideById: async (req, res) => {
    try {
      const ride = await Ride.findById(req.params.id)
        .populate('driver', 'name email')
        .populate('riders', 'name email');
      if (ride) {
        res.json(ride);
      } else {
        res.status(404).json({ message: 'Ride not found' });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getDriverRides: async (req, res) => {
    try {
      const rides = await Ride.find({ driver: req.params.driverId })
        .populate('riders', 'name email');
      res.json(rides);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getRiderRides: async (req, res) => {
    try {
      const rides = await Ride.find({ riders: req.params.riderId })
        .populate('driver', 'name email');
      res.json(rides);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = rideController;