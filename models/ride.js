const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  startLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  endLocation: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [Number],
    address: String
  },
  departureTime: {
    type: Date,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  riders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider'
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

rideSchema.index({ "startLocation": "2dsphere" });
rideSchema.index({ "endLocation": "2dsphere" });

module.exports = mongoose.model('Ride', rideSchema);