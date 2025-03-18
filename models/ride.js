const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rideSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    riders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride;