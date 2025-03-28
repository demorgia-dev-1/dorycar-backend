const Ride = require('../models/Ride');

class RouteMatchingService {
  static async findMatchingRides(pickup, destination, time, maxDistance = 5000) {
    try {
      const matchingRides = await Ride.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: pickup.coordinates
            },
            distanceField: "pickupDistance",
            maxDistance: maxDistance,
            spherical: true
          }
        },
        {
          $match: {
            status: "scheduled",
            "startLocation.departureTime": {
              $gte: new Date(time)
            }
          }
        },
        {
          $addFields: {
            destinationDistance: {
              $distance: {
                from: {
                  type: "Point",
                  coordinates: destination.coordinates
                },
                to: "$endLocation.coordinates"
              }
            }
          }
        },
        {
          $match: {
            destinationDistance: { $lte: maxDistance }
          }
        },
        {
          $sort: {
            "startLocation.departureTime": 1,
            pickupDistance: 1
          }
        }
      ]);

      return matchingRides;
    } catch (error) {
      throw new Error('Error finding matching rides: ' + error.message);
    }
  }

  static async findRidesViaStops(pickup, destination, time) {
    try {
      const rides = await Ride.find({
        status: "scheduled",
        "stops.location.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: pickup.coordinates
            },
            $maxDistance: 5000
          }
        }
      }).where("startLocation.departureTime").gte(time);

      // Filter rides that have stops near both pickup and destination
      const validRides = rides.filter(ride => {
        const hasPickupStop = this.hasNearbyStop(ride.stops, pickup.coordinates);
        const hasDestinationStop = this.hasNearbyStop(ride.stops, destination.coordinates);
        return hasPickupStop && hasDestinationStop;
      });

      return validRides;
    } catch (error) {
      throw new Error('Error finding rides via stops: ' + error.message);
    }
  }

  static hasNearbyStop(stops, coordinates, maxDistance = 5000) {
    return stops.some(stop => {
      const distance = this.calculateDistance(
        stop.location.coordinates,
        coordinates
      );
      return distance <= maxDistance;
    });
  }

  static calculateDistance(coord1, coord2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1[1] * Math.PI) / 180;
    const φ2 = (coord2[1] * Math.PI) / 180;
    const Δφ = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const Δλ = ((coord2[0] - coord1[0]) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }
}

module.exports = RouteMatchingService;