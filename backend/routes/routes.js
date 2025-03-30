// backend/routes/routes.js
const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const auth = require('../middleware/auth');

// @route   GET api/routes
// @desc    Get all routes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find().populate('location', 'name city code');
    res.json(routes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/routes/location/:locationId
// @desc    Get routes by location
// @access  Public
router.get('/location/:locationId', async (req, res) => {
  try {
    const routes = await Route.find({ 
      location: req.params.locationId 
    }).populate('location', 'name city code');
    
    res.json(routes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/routes/:id
// @desc    Get route by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('location', 'name city code');
    
    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }
    
    res.json(route);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Route not found' });
    }
    res.status(500).send('Server error');
  }
});

// Admin routes for creating/updating/deleting routes
// (Similar to your other admin routes)

module.exports = router;