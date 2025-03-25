// backend/routes/bikes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Make sure mongoose is imported
const Bike = require('../models/Bikes');
const Location = require('../models/Locations');
const auth = require('../middleware/auth');

// @route   GET api/bikes
// @desc    Get all bikes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.json(bikes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bikes/purchase
// @desc    Get all bikes available for purchase
// @access  Public
router.get('/purchase', async (req, res) => {
  try {
    // Get all bikes with purchase stock > 0
    const bikes = await Bike.find({ purchaseStock: { $gt: 0 } });
    res.json(bikes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bikes/rental/:locationParam
// @desc    Get bikes available for rental at a specific location
// @access  Public
router.get('/rental/:locationParam', async (req, res) => {
    try {
      const locationParam = req.params.locationParam;
      console.log('Location parameter:', locationParam);
      
      // Find the location by ID or code
      let location;
      if (mongoose.Types.ObjectId.isValid(locationParam)) {
        location = await Location.findById(locationParam);
      } else {
        location = await Location.findOne({ code: locationParam });
      }
      
      if (!location) {
        return res.status(404).json({ msg: 'Location not found' });
      }
      
      console.log(`Found location: ${location.name}, ID: ${location._id}`);
      
      // Find bikes with rental inventory at the specified location
      const bikes = await Bike.find({
        'rentalInventory': {
          $elemMatch: {
            'location': location._id,
            'stock': { $gt: 0 }
          }
        }
      }).populate('rentalInventory.location', 'name city code');
      
      console.log(`Found ${bikes.length} bikes for location ${location.name}`);
      
      res.json(bikes);
    } catch (err) {
      console.error('Error fetching bikes by location:', err.message);
      res.status(500).send('Server error');
    }
});

// @route   GET api/bikes/featured/purchase
// @desc    Get featured bikes for purchase
// @access  Public
router.get('/featured/purchase', async (req, res) => {
  try {
    // Get limited number of bikes with purchase stock > 0
    const bikes = await Bike.find({ purchaseStock: { $gt: 0 } })
      .sort({ createdAt: -1 }) // Newest first
      .limit(4); // Limit to 4 bikes
    
    res.json(bikes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bikes/featured/rental/:locationId
// @desc    Get featured bikes for rental at a specific location
// @access  Public
router.get('/featured/rental/:locationId', async (req, res) => {
  try {
    const bikes = await Bike.find({
      'rentalInventory': {
        $elemMatch: {
          location: req.params.locationId,
          stock: { $gt: 0 }
        }
      }
    })
    .sort({ createdAt: -1 }) // Newest first
    .limit(4) // Limit to 4 bikes
    .populate('rentalInventory.location', 'name city');
    
    res.json(bikes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/bikes/:id
// @desc    Get bike by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id)
      .populate('rentalInventory.location', 'name city');
    
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    
    res.json(bike);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server error');
  }
});

// Add this to backend/routes/bikes.js
// @route   GET api/bikes/search
// @desc    Search bikes by name or type
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, type, minPrice, maxPrice } = req.query;
    
    // Build search criteria
    const searchCriteria = {};
    
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (type) {
      searchCriteria.type = { $regex: type, $options: 'i' };
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      searchCriteria.price = {};
      if (minPrice) searchCriteria.price.$gte = Number(minPrice);
      if (maxPrice) searchCriteria.price.$lte = Number(maxPrice);
    }
    
    const bikes = await Bike.find(searchCriteria);
    
    res.json(bikes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/bikes
// @desc    Create a new bike
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      name,
      type,
      description,
      price,
      rentalPrice,
      image,
      features,
      purchaseStock,
      rentalInventory
    } = req.body;

    // Create new bike object
    const newBike = new Bike({
      name,
      type,
      description,
      price,
      rentalPrice,
      image,
      features,
      purchaseStock,
      rentalInventory
    });

    const bike = await newBike.save();
    res.json(bike);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/bikes/:id
// @desc    Update a bike
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    // Update fields
    const {
      name,
      type,
      description,
      price,
      rentalPrice,
      image,
      features,
      purchaseStock,
      rentalInventory
    } = req.body;

    if (name) bike.name = name;
    if (type) bike.type = type;
    if (description) bike.description = description;
    if (price) bike.price = price;
    if (rentalPrice) bike.rentalPrice = rentalPrice;
    if (image) bike.image = image;
    if (features) bike.features = features;
    if (purchaseStock !== undefined) bike.purchaseStock = purchaseStock;
    if (rentalInventory) bike.rentalInventory = rentalInventory;

    await bike.save();
    res.json(bike);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/bikes/:id
// @desc    Delete a bike
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    await bike.remove();
    res.json({ msg: 'Bike removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;