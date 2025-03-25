// Enhance backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  const { username, email, profile } = req.body;
  
  // Build user object
  const userFields = {};
  if (username) userFields.username = username;
  if (email) userFields.email = email;
  
  // Build profile object if profile fields are provided
  if (profile) {
    userFields.profile = {};
    if (profile.firstName) userFields.profile.firstName = profile.firstName;
    if (profile.lastName) userFields.profile.lastName = profile.lastName;
    if (profile.phone) userFields.profile.phone = profile.phone;
    if (profile.address) userFields.profile.address = profile.address;
  }
  
  try {
    // Check if username or email already exists (if changed)
    if (username || email) {
      const user = await User.findById(req.user.id);
      
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(400).json({ msg: 'Username already exists' });
        }
      }
      
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ msg: 'Email already exists' });
        }
      }
    }
    
    // Update
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me/password
// @desc    Change user password
// @access  Private
router.put('/me/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private (Admin only)
router.put('/:id/role', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const { role } = req.body;
    
    if (!role || !['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user (admin only)
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ msg: 'Cannot delete your own account' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    await user.remove();
    
    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;