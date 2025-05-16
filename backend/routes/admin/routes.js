const express = require('express');
const router = express.Router();
const Route = require('../../models/Route');
const adminMiddleware = require('../../middleware/adminMiddleware');

// @route   GET /api/admin/routes
// @desc    Get all routes for admin
// @access  Admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const routes = await Route.find().populate('location', 'name city code');
    res.json(routes);
  } catch (err) {
    console.error('Error fetching routes:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/routes
// @desc    Create a new route
// @access  Admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      distance,
      difficulty,
      estimatedTime,
      routeType,
      coordinates,
      elevationGain,
      images,
      tags
    } = req.body;

    const newRoute = new Route({
      name,
      description,
      location,
      distance,
      difficulty,
      estimatedTime,
      routeType,
      coordinates,
      elevationGain,
      images,
      tags
    });

    const route = await newRoute.save();
    res.json(route);
  } catch (err) {
    console.error('Error creating route:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/routes/:id
// @desc    Update a route
// @access  Admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updatedRoute);
  } catch (err) {
    console.error('Error updating route:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Route not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/routes/:id
// @desc    Delete a route
// @access  Admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ msg: 'Route not found' });
    }

    await route.deleteOne();
    res.json({ msg: 'Route removed' });
  } catch (err) {
    console.error('Error deleting route:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Route not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 