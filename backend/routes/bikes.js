// backend/routes/bikes.js
const express = require('express');
const router = express.Router();
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

// @route   GET api/bikes/rental/:locationId
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

// @route   GET api/bikes/rental/:locationId
// @desc    Get bikes available for rental at a specific location
// @access  Public
// backend/routes/bikes.js - update the rental route:

// @route   GET api/bikes/rental/:locationId
// @desc    Get bikes available for rental at a specific location
// @access  Public
router.get('/rental/:locationId', async (req, res) => {
    try {
      const locationId = req.params.locationId;
      console.log('Fetching bikes for location:', locationId);
      
      // Ensure locationId is a valid ObjectId
      let locationObjectId;
      try {
        locationObjectId = new mongoose.Types.ObjectId(locationId);
      } catch (err) {
        console.log('Invalid location ID format');
        return res.status(400).json({ msg: 'Invalid location ID' });
      }
  
      // Find bikes with rental inventory at the specified location
      const bikes = await Bike.find({
        'rentalInventory': {
          $elemMatch: {
            'location': locationObjectId,
            'stock': { $gt: 0 }
          }
        }
      }).populate('rentalInventory.location', 'name city');
      
      console.log(`Found ${bikes.length} bikes for location ${locationId}`);
      
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