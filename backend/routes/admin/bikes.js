// backend/routes/admin/bikes.js
const express = require('express');
const router = express.Router();
const Bike = require('../../models/Bikes');
const adminMiddleware = require('../../middleware/adminMiddleware');

// @route   POST /api/admin/bikes
// @desc    Add a new bike
// @access  Admin
router.post('/', adminMiddleware, async (req, res) => {
  try {
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

    // Create new bike
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
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/bikes/:id
// @desc    Update a bike
// @access  Admin
router.put('/:id', adminMiddleware, async (req, res) => {
  try {
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

    // Build bike object
    const bikeFields = {};
    if (name) bikeFields.name = name;
    if (type) bikeFields.type = type;
    if (description) bikeFields.description = description;
    if (price) bikeFields.price = price;
    if (rentalPrice) bikeFields.rentalPrice = rentalPrice;
    if (image) bikeFields.image = image;
    if (features) bikeFields.features = features;
    if (purchaseStock !== undefined) bikeFields.purchaseStock = purchaseStock;
    if (rentalInventory) bikeFields.rentalInventory = rentalInventory;

    // Find bike by ID and update
    let bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    bike = await Bike.findByIdAndUpdate(
      req.params.id,
      { $set: bikeFields },
      { new: true }
    );

    res.json(bike);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/bikes/:id
// @desc    Delete a bike
// @access  Admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    // Find bike by ID
    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    await bike.deleteOne();
    res.json({ msg: 'Bike removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;