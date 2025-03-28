const RatingService = require('../services/ratingService');
const Ride = require('../models/Ride');

const ratingController = {
  submitRating: async (req, res) => {
    try {
      const { rideId, rating, comment } = req.body;
      const ride = await Ride.findById(rideId);

      if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      // Determine who is being rated
      const isDriver = req.user.role === 'user';
      const ratedUserId = isDriver ? ride.driver : ride.rider;
      const type = isDriver ? 'driver' : 'rider';

      const newRating = await RatingService.createRating(
        rideId,
        req.user._id,
        ratedUserId,
        rating,
        comment,
        type
      );

      res.status(201).json(newRating);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getUserRatings: async (req, res) => {
    try {
      const ratings = await RatingService.getUserRatings(req.user._id);
      res.json(ratings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getRideRatings: async (req, res) => {
    try {
      const ratings = await RatingService.getRideRating(req.params.rideId);
      res.json(ratings);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = ratingController;