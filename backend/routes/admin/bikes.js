// backend/routes/admin/bikes.js
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/adminMiddleware');
const Bike = require('../../models/Bikes');

// @route   GET /api/admin/bikes
// @desc    Get all bikes for admin
// @access  Admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const bikes = await Bike.find().sort({ createdAt: -1 });
    res.json(bikes);
  } catch (err) {
    console.error('Error fetching bikes:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/bikes
// @desc    Create a new bike
// @access  Admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const newBike = new Bike(req.body);
    const bike = await newBike.save();
    res.json(bike);
  } catch (err) {
    console.error('Error creating bike:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/bikes/:id
// @desc    Update a bike
// @access  Admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    
    res.json(bike);
  } catch (err) {
    console.error('Error updating bike:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/bikes/:id
// @desc    Delete a bike
// @access  Admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    
    await bike.remove();
    
    res.json({ msg: 'Bike removed' });
  } catch (err) {
    console.error('Error deleting bike:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;