// backend/routes/orders.js - Enhanced with additional routes
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Orders');
const CartItem = require('../models/CartItem');
const Bike = require('../models/Bikes');
const auth = require('../middleware/auth');

// @route   GET api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.bike', 'name type image')
      .populate('items.location', 'name city')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.bike', 'name type description price rentalPrice image')
      .populate('items.location', 'name city address phone');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if user owns the order
    if (order.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});
// @route   POST api/orders
// @desc    Create a new order from cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentDetails } = req.body;
    
    // Validate shipping address for purchases
    if (!shippingAddress && req.body.hasPurchaseItems) {
      return res.status(400).json({ msg: 'Shipping address is required for purchase items' });
    }
    
    // Get cart items
    const cartItems = await CartItem.find({ user: req.user.id })
      .populate('bike')
      .populate('location');
    
    if (cartItems.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }
    
    // Calculate totals
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of cartItems) {
      // Calculate price based on item type
      let itemPrice = 0;
      
      if (item.type === 'purchase') {
        itemPrice = item.bike.price * item.quantity;
        
        // Update bike stock
        const bike = await Bike.findById(item.bike._id);
        if (bike.purchaseStock < item.quantity) {
          return res.status(400).json({ 
            msg: `Not enough stock for ${bike.name}. Available: ${bike.purchaseStock}` 
          });
        }
        
        bike.purchaseStock -= item.quantity;
        await bike.save();
      } else {
        // For rentals, calculate based on days
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        const days = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
        itemPrice = item.bike.rentalPrice * days;
        
        // Update rental inventory
        const bike = await Bike.findById(item.bike._id);
        const locationInventory = bike.rentalInventory.find(
          inventory => inventory.location.toString() === item.location._id.toString()
        );
        
        if (!locationInventory || locationInventory.stock < 1) {
          return res.status(400).json({ 
            msg: `${bike.name} is not available at ${item.location.name}` 
          });
        }
        
        locationInventory.stock -= 1;
        await bike.save();
      }
      
      subtotal += itemPrice;
      
      orderItems.push({
        bike: item.bike._id,
        quantity: item.quantity,
        price: item.type === 'purchase' ? item.bike.price : item.bike.rentalPrice,
        type: item.type,
        startDate: item.startDate,
        endDate: item.endDate,
        location: item.location ? item.location._id : null
      });
    }
    
    // Calculate tax and shipping
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 15.99; // Fixed shipping fee
    const total = subtotal + tax + shipping;
    
    // Create the order
    const newOrder = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Credit Card',
      paymentDetails,
      subtotal,
      tax,
      shipping,
      total
    });
    
    const order = await newOrder.save();
    
    // Clear the cart
    await CartItem.deleteMany({ user: req.user.id });
    
    // Populate order details before returning
    const populatedOrder = await Order.findById(order._id)
      .populate('items.bike', 'name type image')
      .populate('items.location', 'name city');
    
    res.json(populatedOrder);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    order.status = status;
    order.updatedAt = Date.now();
    
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/user/rentals
// @desc    Get user's upcoming rental items
// @access  Private
router.get('/user/rentals', auth, async (req, res) => {
  try {
    const today = new Date();
    
    // Find orders with rental items that have an end date in the future
    const orders = await Order.find({ 
      user: req.user.id,
      'items.type': 'rental',
      'items.endDate': { $gte: today }
    })
    .populate('items.bike', 'name type image')
    .populate('items.location', 'name city code')
    .sort({ 'items.startDate': 1 });
    
    // Extract rental items from orders
    const rentalItems = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.type === 'rental' && new Date(item.endDate) >= today) {
          rentalItems.push({
            id: `${order._id}-${item._id}`,
            orderId: order._id,
            bikeId: item.bike._id,
            bikeName: item.bike.name,
            bikeType: item.bike.type,
            startDate: item.startDate,
            endDate: item.endDate,
            location: item.location,
            status: order.status,
            createdAt: order.createdAt
          });
        }
      });
    });
    
    res.json(rentalItems);
  } catch (err) {
    console.error('Error fetching rental items:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/recent
// @desc    Get user's recent orders
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const orders = await Order.find({ user: req.user.id })
      .populate('items.bike', 'name type image')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching recent orders:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;