const Ride = require('../models/Ride');

class DriverStatsService {
  static async getWeeklyStats(driverId) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const stats = await Ride.aggregate([
      {
        $match: {
          driver: driverId,
          status: 'completed',
          endTime: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$endTime' },
          rides: { $sum: 1 },
          earnings: { $sum: '$fare' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    return stats;
  }

  static async getPerformanceMetrics(driverId) {
    const rides = await Ride.find({
      driver: driverId,
      status: 'completed'
    });

    const metrics = {
      acceptanceRate: this.calculateAcceptanceRate(rides),
      completionRate: this.calculateCompletionRate(rides),
      averageRideTime: this.calculateAverageRideTime(rides)
    };

    return metrics;
  }

  static calculateAcceptanceRate(rides) {
    const total = rides.length;
    const accepted = rides.filter(ride => ride.status !== 'rejected').length;
    return total > 0 ? (accepted / total) * 100 : 0;
  }

  static calculateCompletionRate(rides) {
    const total = rides.length;
    const completed = rides.filter(ride => ride.status === 'completed').length;
    return total > 0 ? (completed / total) * 100 : 0;
  }

  static calculateAverageRideTime(rides) {
    const completedRides = rides.filter(ride => 
      ride.status === 'completed' && ride.startTime && ride.endTime
    );

    if (completedRides.length === 0) return 0;

    const totalTime = completedRides.reduce((acc, ride) => {
      return acc + (ride.endTime - ride.startTime);
    }, 0);

    return totalTime / completedRides.length;
  }
}

module.exports = DriverStatsService;