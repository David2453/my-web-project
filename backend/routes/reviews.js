// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Bike = require('../models/Bikes');
const auth = require('../middleware/auth');

// @route   GET api/reviews/bike/:bikeId
// @desc    Get reviews for a bike
// @access  Public
router.get('/bike/:bikeId', async (req, res) => {
  try {
    const reviews = await Review.find({ bike: req.params.bikeId })
      .populate('user', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reviews/user
// @desc    Get reviews by the current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('bike', 'name type image')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/reviews
// @desc    Create or update a review
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bikeId, rating, title, comment } = req.body;

    if (!bikeId || !rating || !title || !comment) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    // Check if user has already reviewed this bike
    let review = await Review.findOne({
      user: req.user.id,
      bike: bikeId
    });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.title = title;
      review.comment = comment;
      
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: req.user.id,
        bike: bikeId,
        rating,
        title,
        comment
      });
      
      await review.save();
    }
    
    // Update bike's average rating
    const reviews = await Review.find({ bike: bikeId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await Bike.findByIdAndUpdate(bikeId, { 
      $set: { 
        averageRating: averageRating.toFixed(1),
        reviewCount: reviews.length
      } 
    });
    
    // Populate user data before returning
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username profile.firstName profile.lastName');
    
    res.json(populatedReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    // Check if user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const bikeId = review.bike;
    
    await review.remove();
    
    // Update bike's average rating
    const reviews = await Review.find({ bike: bikeId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    
    await Bike.findByIdAndUpdate(bikeId, { 
      $set: { 
        averageRating: averageRating.toFixed(1),
        reviewCount: reviews.length
      } 
    });
    
    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;