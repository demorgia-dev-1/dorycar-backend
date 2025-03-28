const Rating = require('../models/Rating');
const Driver = require('../models/Driver');
const Rider = require('../models/Rider');

class RatingService {
  static async createRating(rideId, ratedById, ratedUserId, rating, comment, type) {
    try {
      const newRating = await Rating.create({
        ride: rideId,
        ratedBy: ratedById,
        ratedUser: ratedUserId,
        rating,
        comment,
        type
      });

      // Update rating based on user type
      await this.updateUserRating(ratedUserId, type);

      return newRating;
    } catch (error) {
      throw new Error('Error creating rating: ' + error.message);
    }
  }

  static async updateUserRating(userId, type) {
    const ratings = await Rating.find({ 
      ratedUser: userId,
      type: type 
    });
    
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
    const roundedRating = Math.round(averageRating * 10) / 10;

    if (type === 'driver') {
      await Driver.findByIdAndUpdate(userId, { rating: roundedRating });
    } else {
      await Rider.findByIdAndUpdate(userId, { rating: roundedRating });
    }
  }

  static async getUserRatings(userId, type) {
    return await Rating.find({ 
      ratedUser: userId,
      type: type 
    })
    .populate('ratedBy', 'name')
    .populate('ride', 'pickup destination createdAt')
    .sort({ createdAt: -1 });
  }

  static async getRideRating(rideId) {
    return await Rating.find({ ride: rideId })
      .populate('ratedBy', 'name')
      .populate({
        path: 'ratedUser',
        select: 'name',
        model: this.type === 'driver' ? Driver : Rider
      });
  }
}

module.exports = RatingService;