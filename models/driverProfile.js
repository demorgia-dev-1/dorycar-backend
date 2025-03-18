const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const driverProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vehicleType: {
        type: String,
        required: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    vehicleRegistration: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    vehicleCapacity: {
        type: Number
    },
    vehicleDescription: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DriverProfile', driverProfileSchema);