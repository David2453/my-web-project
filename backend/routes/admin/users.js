// backend/routes/admin/users.js
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/adminMiddleware');
const User = require('../../models/Users');

// @route   GET /api/admin/users
// @desc    Get all users for admin
// @access  Admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Prevent admin deletion through API
    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'Admin users cannot be deleted' });
    }
    
    await user.remove();
    
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;