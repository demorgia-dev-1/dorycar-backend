const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/submit', ratingController.submitRating);
router.get('/user', ratingController.getUserRatings);
router.get('/ride/:rideId', ratingController.getRideRatings);

module.exports = router;