// backend/routes/admin/users.js
const express = require('express');
const router = express.Router();
const User = require('../../models/Users');
const adminMiddleware = require('../../middleware/adminMiddleware');

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Prevent deleting of admin users
    if (user.role === 'admin') {
      return res.status(400).json({ msg: 'Cannot delete admin users' });
    }

    await user.deleteOne();
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;