const RiderProfile = require('../models/riderProfile');
const User = require('../models/user');
const Ride = require('../models/ride');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Rider
exports.registerRider = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with rider role
        const newUser = new User({
            name,
            email,
            password,
            role: 'rider'
        });

        // Hash password before saving
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();

        // Create rider profile
        const riderProfile = new RiderProfile({
            user: newUser._id,
            phone
        });

        await riderProfile.save();

        res.status(201).json({ message: 'Rider registered successfully' });
    } catch (error) {
            res.status(500).json({ message: 'Error registering rider' });
    }
};

// Login Rider
exports.loginRider = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find rider by email
        const user = await User.findOne({ email, role: 'rider' });
        if (!user) {
            return res.status(404).json({ message: 'Rider not found' });
        }

        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(200).json({ token });
    } catch (error) {
            res.status(500).json({ message: 'Error logging in rider' });
    }
};

// Get Rider Profile
exports.getRiderProfile = async (req, res) => {
    try {
        const riderProfile = await RiderProfile.findOne({ user: req.user.userId })
            .populate('user', '-password')
            .populate({
                path: 'rides',
                populate: {
                    path: 'rider',
                    select: '-password'
                }
            });

        res.status(200).json(riderProfile);
    } catch (error) {
            res.status(500).json({ message: 'Error fetching rider profile' });
    }
};

// Update Rider Profile
exports.updateRiderProfile = async (req, res) => {
    try {
        const riderProfile = await RiderProfile.findOneAndUpdate(
            { user: req.user.userId },
            { $set: req.body },
            { new: true }
        )
            .populate('user', '-password')
            .populate({
                path: 'rides',
                populate: {
                    path: 'rider',
                    select: '-password'
                }
            });

        res.status(200).json(riderProfile);
    } catch (error) {
            res.status(500).json({ message: 'Error updating rider profile' });
    }
};

// Search for Rides
exports.searchRides = async (req, res) => {
    try {
        const { from, to, date } = req.body;

        const rides = await Ride.find({
            from: { $regex: from, $options: 'i' },
            to: { $regex: to, $options: 'i' },
            date: { $regex: date, $options: 'i' }
        })
            .populate('driver', '-password');

        res.status(200).json(rides);
    } catch (error) {
            res.status(500).json({ message: 'Error searching rides' });
    }
};

// Book a Ride
exports.bookRide = async (req, res) => {
    try {
        const rideId = req.params.id;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.riders && ride.riders.includes(req.user.userId)) {
            return res.status(400).json({ message: 'You have already booked this ride' });
        }

        const updatedRide = await Ride.findByIdAndUpdate(
            rideId,
            { $addToSet: { riders: req.user.userId } },
            { new: true }
        )
            .populate('driver', '-password');

        res.status(200).json(updatedRide);
    } catch (error) {
            res.status(500).json({ message: 'Error booking ride' });
    }
};