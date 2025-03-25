// backend/routes/favorites.js
const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorites');
const auth = require('../middleware/auth');

// @route   GET api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .populate('bike', 'name type description price rentalPrice image features')
      .sort({ addedOn: -1 });
    
    res.json(favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/favorites
// @desc    Add a bike to favorites
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bikeId } = req.body;

    if (!bikeId) {
      return res.status(400).json({ msg: 'Bike ID is required' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      bike: bikeId
    });

    if (existingFavorite) {
      return res.status(400).json({ msg: 'Bike already in favorites' });
    }

    // Create new favorite
    const newFavorite = new Favorite({
      user: req.user.id,
      bike: bikeId
    });

    const favorite = await newFavorite.save();
    
    // Populate the bike details before returning
    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate('bike', 'name type description price rentalPrice image features');
    
    res.json(populatedFavorite);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/favorites/:id
// @desc    Remove a bike from favorites
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    
    if (!favorite) {
      return res.status(404).json({ msg: 'Favorite not found' });
    }
    
    // Check user owns the favorite
    if (favorite.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Use deleteOne() instead of remove()
    await Favorite.deleteOne({ _id: req.params.id });
    // Alternative: await favorite.deleteOne();
    
    res.json({ msg: 'Favorite removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Favorite not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/favorites/check/:bikeId
// @desc    Check if a bike is in user's favorites
// @access  Private
router.get('/check/:bikeId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user.id,
      bike: req.params.bikeId
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;