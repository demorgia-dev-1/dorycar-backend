const Driver = require('../models/Driver');
const Ride = require('../models/Ride');

class MatchingService {
  static async findNearestDrivers(pickup, maxDistance = 5000) {
    try {
      const availableDrivers = await Driver.find({
        isAvailable: true,
        isVerified: true,
        currentLocation: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: pickup.coordinates
            },
            $maxDistance: maxDistance // in meters
          }
        }
      }).limit(5);

      return availableDrivers;
    } catch (error) {
      throw new Error('Error finding nearest drivers: ' + error.message);
    }
  }

  static async assignDriver(rideId) {
    try {
      const ride = await Ride.findById(rideId);
      if (!ride) {
        throw new Error('Ride not found');
      }

      const nearestDrivers = await this.findNearestDrivers(ride.pickup);
      
      if (nearestDrivers.length === 0) {
        ride.status = 'no_drivers';
        await ride.save();
        return null;
      }

      // Select the closest driver
      const selectedDriver = nearestDrivers[0];
      
      // Update ride with driver information
      ride.driver = selectedDriver._id;
      ride.status = 'driver_assigned';
      await ride.save();

      // Update driver availability
      selectedDriver.isAvailable = false;
      await selectedDriver.save();

      return {
        ride,
        driver: selectedDriver
      };
    } catch (error) {
      throw new Error('Error assigning driver: ' + error.message);
    }
  }

  static calculateETA(driverLocation, pickup) {
    // Calculate estimated time of arrival based on distance
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (driverLocation.coordinates[1] * Math.PI) / 180;
    const φ2 = (pickup.coordinates[1] * Math.PI) / 180;
    const Δφ = ((pickup.coordinates[1] - driverLocation.coordinates[1]) * Math.PI) / 180;
    const Δλ = ((pickup.coordinates[0] - driverLocation.coordinates[0]) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    // Assuming average speed of 30 km/h in city
    const averageSpeed = 30 * 1000 / 3600; // meters per second
    const eta = Math.round(distance / averageSpeed);

    return {
      distance,
      eta
    };
  }

  static async findMatchingRides(userLocation, destination, preferences = {}) {
    try {
      const rides = await Ride.find({
        status: 'active',
        'route.startLocation': {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: userLocation
            },
            $maxDistance: 5000 // 5km radius
          }
        },
        'route.endLocation': {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: destination
            },
            $maxDistance: 5000
          }
        },
        availableSeats: { $gte: 1 }
      }).populate('driver', 'name rating vehicleDetails');

      return rides;
    } catch (error) {
      throw new Error('Error finding matching rides: ' + error.message);
    }
  }
}

module.exports = MatchingService;