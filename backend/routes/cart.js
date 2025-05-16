// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CartItem = require('../models/CartItem');
const Bike = require('../models/Bikes');
const Location = require('../models/Locations');
const auth = require('../middleware/auth');

// @route   GET api/cart
// @desc    Get user's cart items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.id })
      .populate('bike', 'name type description price rentalPrice image features')
      .populate('location', 'name city code')
      .sort({ addedAt: -1 });
    
    res.json(cartItems);
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { bikeId, type, quantity, startDate, endDate, locationId } = req.body;

    // Validate request
    if (!bikeId || !type) {
      return res.status(400).json({ msg: 'Bike ID and type are required' });
    }

    if (type !== 'purchase' && type !== 'rental') {
      return res.status(400).json({ msg: 'Type must be purchase or rental' });
    }

    if (type === 'rental' && (!startDate || !endDate || !locationId)) {
      return res.status(400).json({ msg: 'Start date, end date, and location are required for rentals' });
    }

    // Check if bike exists and is active
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    if (!bike.isActive) {
      return res.status(400).json({ msg: 'Bicicleta nu este disponibilă momentan' });
    }

    // For purchase, check if there's enough inventory
    if (type === 'purchase') {
      if (bike.purchaseStock < quantity) {
        return res.status(400).json({ msg: 'Not enough stock available' });
      }
    }

    // For rental, check if location exists and has the bike
    let location = null;
    if (type === 'rental') {
      location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ msg: 'Location not found' });
      }

      // Check if the bike is available at the location
      const locationInventory = bike.rentalInventory.find(
        inventory => inventory.location.toString() === locationId
      );

      if (!locationInventory || locationInventory.stock <= 0) {
        return res.status(400).json({ msg: 'Bike not available at this location' });
      }
      
      // Verifică dacă există suficiente biciclete pentru cantitatea solicitată
      if (locationInventory.stock < quantity) {
        return res.status(400).json({ msg: `Nu există suficiente biciclete disponibile pentru închiriere la această locație. Disponibil: ${locationInventory.stock}` });
      }
    }

    // Define search criteria based on type
    let searchCriteria = {
      user: req.user.id,
      bike: bikeId,
      type
    };
    
    // For rentals, also consider dates and location when checking if it exists in cart
    if (type === 'rental') {
      searchCriteria.startDate = new Date(startDate);
      searchCriteria.endDate = new Date(endDate);
      searchCriteria.location = locationId;
    }

    // Check if item is already in cart
    let cartItem = await CartItem.findOne(searchCriteria);

    if (cartItem) {
      // Update quantity if it's a purchase
      if (type === 'purchase') {
        cartItem.quantity = quantity || cartItem.quantity + 1;
      } else {
        // Pentru închiriere, folosim exact cantitatea specificată sau incrementăm
        cartItem.quantity = quantity !== undefined ? Number(quantity) : cartItem.quantity + 1;
      }
      
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = new CartItem({
        user: req.user.id,
        bike: bikeId,
        quantity: quantity !== undefined ? Number(quantity) : 1,
        type,
        startDate: type === 'rental' ? startDate : null,
        endDate: type === 'rental' ? endDate : null,
        location: type === 'rental' ? locationId : null
      });
      
      await cartItem.save();
    }
    
    // Populate before returning
    const populatedCartItem = await CartItem.findById(cartItem._id)
      .populate('bike', 'name type description price rentalPrice image features')
      .populate('location', 'name city code');
    
    res.json(populatedCartItem);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/cart/:id
// @desc    Update cart item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    // Find the cart item
    const cartItem = await CartItem.findById(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    
    // Check if user owns the cart item
    if (cartItem.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update the quantity
    if (quantity) {
      cartItem.quantity = Number(quantity);
    }
    
    // For rental items, we could update dates if needed
    if (req.body.startDate && cartItem.type === 'rental') {
      cartItem.startDate = req.body.startDate;
    }
    
    if (req.body.endDate && cartItem.type === 'rental') {
      cartItem.endDate = req.body.endDate;
    }
    
    await cartItem.save();
    
    // Populate before returning
    const populatedCartItem = await CartItem.findById(cartItem._id)
      .populate('bike', 'name type description price rentalPrice image features')
      .populate('location', 'name city code');
    
    res.json(populatedCartItem);
  } catch (err) {
    console.error('Error updating cart item:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const cartItem = await CartItem.findById(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    
    // Check if user owns the cart item
    if (cartItem.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    await CartItem.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Cart item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/cart
// @desc    Clear the entire cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await CartItem.deleteMany({ user: req.user.id });
    res.json({ msg: 'Cart cleared' });
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/cart/cleanup
// @desc    Remove invalid items from cart (items without associated bike)
// @access  Private
router.delete('/cleanup', auth, async (req, res) => {
  try {
    // Găsește și șterge elementele din coș care nu au bicicletă asociată
    const result = await CartItem.deleteMany({
      user: req.user.id,
      $or: [
        { bike: null },
        { bike: { $exists: false } }
      ]
    });

    res.json({ 
      msg: `${result.deletedCount} elemente invalide au fost eliminate din coș`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error cleaning up cart:', err);
    res.status(500).json({ msg: 'Eroare la curățarea coșului' });
  }
});

module.exports = router;