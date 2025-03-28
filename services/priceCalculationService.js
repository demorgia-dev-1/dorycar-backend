const BASE_RATE = 2.5; // Base rate per kilometer
const MIN_FARE = 5.0;  // Minimum fare
const PEAK_HOUR_MULTIPLIER = 1.5;

const vehicleRates = require('../config/vehicleRates');

class PriceCalculationService {
  static calculatePrice(distance, vehicleType = 'economy', time = new Date()) {
    const rates = vehicleRates[vehicleType];
    if (!rates) {
      throw new Error('Invalid vehicle type');
    }

    let price = rates.baseRate; // Base fare
    price += distance * rates.perKmRate; // Distance based fare

    // Apply peak hour pricing
    if (this.isPeakHour(time)) {
      price *= PEAK_HOUR_MULTIPLIER;
    }

    // Round to 2 decimal places
    price = Math.round(price * 100) / 100;

    // Apply minimum fare based on vehicle type
    return Math.max(price, rates.minFare);
  }

  static getVehicleTypes() {
    return Object.keys(vehicleRates).map(type => ({
      type,
      ...vehicleRates[type]
    }));
  }

  static isPeakHour(time) {
    const hour = time.getHours();
    return (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  }

  static calculateMultiStopPrice(stops) {
    let totalPrice = 0;
    
    for (let i = 0; i < stops.length - 1; i++) {
      const distance = this.calculateDistance(
        stops[i].location.coordinates,
        stops[i + 1].location.coordinates
      );
      totalPrice += this.calculatePrice(distance);
    }

    return totalPrice;
  }

  static calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const φ1 = (coord1[1] * Math.PI) / 180;
    const φ2 = (coord2[1] * Math.PI) / 180;
    const Δφ = ((coord2[1] - coord1[1]) * Math.PI) / 180;
    const Δλ = ((coord2[0] - coord1[0]) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Returns distance in kilometers
  }
}

module.exports = PriceCalculationService;