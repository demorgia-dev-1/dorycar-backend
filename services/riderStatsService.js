const Ride = require('../models/Ride');

class RiderStatsService {
  static async getRideHistory(riderId) {
    const rides = await Ride.find({ 
      rider: riderId 
    })
    .sort({ createdAt: -1 })
    .populate('driver', 'name phone vehicleDetails rating')
    .select('pickup destination fare startTime endTime status rating');

    return rides;
  }

  static async getRideStats(riderId) {
    const stats = await Ride.aggregate([
      {
        $match: { 
          rider: riderId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRides: { $sum: 1 },
          totalSpent: { $sum: '$fare' },
          averageRide: { $avg: '$fare' }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : {
      totalRides: 0,
      totalSpent: 0,
      averageRide: 0
    };
  }

  static async getFavoriteRoutes(riderId) {
    const routes = await Ride.aggregate([
      {
        $match: {
          rider: riderId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            pickup: '$pickup.address',
            destination: '$destination.address'
          },
          count: { $sum: 1 },
          averageFare: { $avg: '$fare' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    return routes;
  }
}

module.exports = RiderStatsService;