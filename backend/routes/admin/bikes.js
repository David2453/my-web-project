// backend/routes/admin/bikes.js
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/adminMiddleware');
const upload = require('../../middleware/uploadMiddleware');
const Bike = require('../../models/Bikes');
const mongoose = require('mongoose');

// @route   GET /api/admin/bikes
// @desc    Get all bikes for admin (including inactive ones)
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
router.post('/', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    // Creează un nou obiect Bike
    const newBike = new Bike({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      price: Number(req.body.price || 0),
      rentalPrice: Number(req.body.rentalPrice || 0),
      purchaseStock: Number(req.body.purchaseStock || 0),
      isActive: req.body.isActive === 'true'
    });
    
    // Procesează features
    if (req.body.features) {
      try {
        newBike.features = JSON.parse(req.body.features);
      } catch (err) {
        console.error('Error parsing features:', err);
        return res.status(400).json({ msg: 'Invalid features format' });
      }
    }
    
    // Procesează rentalInventory
    if (req.body.rentalInventory) {
      try {
        const parsedInventory = JSON.parse(req.body.rentalInventory);
        
        // Adaugă fiecare locație cu stoc
        for (const item of parsedInventory) {
          newBike.rentalInventory.push({
            location: item.location, // Mongoose va converti automat în ObjectId
            stock: Number(item.stock)
          });
        }
        
        console.log('Set rentalInventory:', newBike.rentalInventory);
      } catch (err) {
        console.error('Error parsing rentalInventory:', err);
        return res.status(400).json({ msg: 'Invalid rental inventory format' });
      }
    }
    
    // Adaugă imaginea dacă există
    if (req.file) {
      console.log('Setting image path:', `/uploads/bikes/${req.file.filename}`);
      newBike.image = `/uploads/bikes/${req.file.filename}`;
    }
    
    // Salvează bicicleta în baza de date
    await newBike.save();
    console.log('Bike created successfully:', newBike);
    
    res.json(newBike);
  } catch (err) {
    console.error('Error creating bike:', err);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/bikes/:id
// @desc    Update a bike
// @access  Admin
router.put('/:id', adminMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    // Găsește bicicleta existentă
    const bike = await Bike.findById(req.params.id);
    
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    // Actualizează proprietățile simple
    if (req.body.name) bike.name = req.body.name;
    if (req.body.type) bike.type = req.body.type;
    if (req.body.description) bike.description = req.body.description;
    if (req.body.price) bike.price = Number(req.body.price);
    if (req.body.rentalPrice) bike.rentalPrice = Number(req.body.rentalPrice);
    if (req.body.purchaseStock) bike.purchaseStock = Number(req.body.purchaseStock);
    if (req.body.isActive !== undefined) bike.isActive = req.body.isActive === 'true';
    
    // Actualizează features
    if (req.body.features) {
      try {
        bike.features = JSON.parse(req.body.features);
      } catch (err) {
        console.error('Error parsing features:', err);
        return res.status(400).json({ msg: 'Invalid features format' });
      }
    }
    
    // Actualizează rentalInventory
    if (req.body.rentalInventory) {
      try {
        const parsedInventory = JSON.parse(req.body.rentalInventory);
        
        // Golește array-ul existent
        bike.rentalInventory = [];
        
        // Adaugă fiecare locație cu stoc
        for (const item of parsedInventory) {
          bike.rentalInventory.push({
            location: item.location, // Mongoose va converti automat în ObjectId
            stock: Number(item.stock)
          });
        }
        
        console.log('Updated rentalInventory:', bike.rentalInventory);
      } catch (err) {
        console.error('Error parsing rentalInventory:', err);
        return res.status(400).json({ msg: 'Invalid rental inventory format' });
      }
    }
    
    // Actualizează imaginea dacă a fost încărcată una nouă
    if (req.file) {
      console.log('Setting new image path:', `/uploads/bikes/${req.file.filename}`);
      bike.image = `/uploads/bikes/${req.file.filename}`;
    }
    
    // Salvează bicicleta actualizată
    await bike.save();
    console.log('Bike saved successfully:', bike);
    
    res.json(bike);
  } catch (err) {
    console.error('Error updating bike:', err);
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
    await bike.deleteOne();
    res.json({ msg: 'Bike removed' });
  } catch (err) {
    console.error('Error deleting bike:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;