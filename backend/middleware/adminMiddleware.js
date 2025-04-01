const jwt = require('jsonwebtoken');
const User = require('../models/Users');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'Nu există token, autorizare refuzată' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user from payload
    req.user = decoded.user;
    
    // Check if user is admin
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'Utilizator negăsit' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ msg: 'Acces refuzat. Sunt necesare privilegii de administrator.' });
    }
    
    next();
  } catch (err) {
    console.error('Error in admin middleware:', err.message);
    res.status(401).json({ msg: 'Token invalid' });
  }
}; 