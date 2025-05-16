const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/adminMiddleware');
const Order = require('../../models/Orders');
const User = require('../../models/Users');

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: 'user',
        select: 'username profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName'
        }
      })
      .populate('items.bike', 'name type image')
      .populate('items.location', 'name city')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/orders/pending
// @desc    Get only pending orders for admin
// @access  Admin
router.get('/pending', adminMiddleware, async (req, res) => {
  try {
    const pendingOrders = await Order.find({ status: 'pending' })
      .populate('user', 'firstName lastName email')
      .populate('items.bike', 'name type image')
      .populate('items.location', 'name city')
      .sort({ createdAt: -1 });
    
    res.json(pendingOrders);
  } catch (err) {
    console.error('Error fetching pending orders:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/orders/:id
// @desc    Get specific order by id for admin
// @access  Admin
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.bike', 'name type image price rentalPrice')
      .populate('items.location', 'name city address phone');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error fetching order details:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router; 