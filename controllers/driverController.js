const DriverProfile = require('../models/driverProfile');
const User = require('../models/user');
const Ride = require('../models/ride');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register Driver
exports.registerDriver = async (req, res) => {
    try {
        const { name, email, password, vehicleType, licenseNumber, vehicleRegistration } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user with driver role
        const newUser = new User({
            name,
            email,
            password,
            role: 'driver'
        });

        // Hash password before saving
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();

        // Create driver profile
        const driverProfile = new DriverProfile({
            user: newUser._id,
            vehicleType,
            licenseNumber,
            vehicleRegistration
        });

        await driverProfile.save();

        res.status(201).json({ message: 'Driver registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering driver' });
    }
};

// Login Driver
exports.loginDriver = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find driver by email
        const user = await User.findOne({ email, role: 'driver' });
        if (!user) {
            return res.status(404).json({ message: 'Driver not found' });
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
        res.status(500).json({ message: 'Error logging in driver' });
    }
};

// Get Driver Profile
exports.getDriverProfile = async (req, res) => {
    try {
        const driverProfile = await DriverProfile.findOne({ user: req.user.userId })
            .populate('user', '-password')
            .populate({
                path: 'rides',
                populate: {
                    path: 'driver',
                    select: '-password'
                }
            });

        res.status(200).json(driverProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching driver profile' });
    }
};

// Update Driver Profile
exports.updateDriverProfile = async (req, res) => {
    try {
        const driverProfile = await DriverProfile.findOneAndUpdate(
            { user: req.user.userId },
            { $set: req.body },
            { new: true }
        )
            .populate('user', '-password')
            .populate({
                path: 'rides',
                populate: {
                    path: 'driver',
                    select: '-password'
                }
            });

        res.status(200).json(driverProfile);
    } catch (error) {
        res.status(500).json({ message: 'Error updating driver profile' });
    }
};

// Create Ride
exports.createRide = async (req, res) => {
    try {
        const { from, to, date, time, vehicleType } = req.body;

        const ride = new Ride({
            from,
            to,
            date,
            time,
            vehicleType,
            driver: req.user.userId
        });

        await ride.save();

        res.status(201).json({ message: 'Ride created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating ride' });
    }
};

// Get All Rides
exports.getAllRides = async (req, res) => {
    try {
        const rides = await Ride.find()
            .populate('driver', '-password');

        res.status(200).json(rides);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rides' });
    }
};

// Search Rides
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

// Book Ride
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

// Join Ride
exports.joinRide = async (req, res) => {
    try {
        const rideId = req.params.rideId;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        if (ride.driver.toString() === req.user.userId) {
            return res.status(400).json({ message: 'You cannot join your own ride' });
        }

        if (ride.riders && ride.riders.includes(req.user.userId)) {
            return res.status(400).json({ message: 'You have already joined this ride' });
        }

        const updatedRide = await Ride.findByIdAndUpdate(
            rideId,
            { $addToSet: { riders: req.user.userId } },
            { new: true }
        )
            .populate('driver', '-password');

        res.status(200).json(updatedRide);
    } catch (error) {
        res.status(500).json({ message: 'Error joining ride' });
    }
};