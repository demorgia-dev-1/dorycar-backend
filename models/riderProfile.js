const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const riderProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    rides: [{
        type: Schema.Types.ObjectId,
        ref: 'Ride'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RiderProfile', riderProfileSchema);