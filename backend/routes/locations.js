// backend/routes/locations.js
const express = require('express');
const router = express.Router();
const Location = require('../models/Locations');
const auth = require('../middleware/auth');

// @route   GET api/locations
// @desc    Get all locations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ name: 1 });
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/locations/:id
// @desc    Get location by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    res.json(location);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/locations
// @desc    Create a new location
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email
    } = req.body;

    // Create new location object
    const newLocation = new Location({
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email
    });

    const location = await newLocation.save();
    res.json(location);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/locations/:id
// @desc    Update a location
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }

    // Update fields
    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email
    } = req.body;

    if (name) location.name = name;
    if (address) location.address = address;
    if (city) location.city = city;
    if (state) location.state = state;
    if (zipCode) location.zipCode = zipCode;
    if (phone) location.phone = phone;
    if (email) location.email = email;

    await location.save();
    res.json(location);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/locations/:id
// @desc    Delete a location
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }

    await location.remove();
    res.json({ msg: 'Location removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;