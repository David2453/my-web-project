// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const statisticsRoutes = require('./routes/admin/statistics');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servire fișiere statice din directorul uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bikes', require('./routes/bikes'));
app.use('/api/locations', require('./routes/locations'));

// Add new routes
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/routes', require('./routes/routes'));

app.use('/api/admin/bikes', require('./routes/admin/bikes'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/orders', require('./routes/admin/orders'));
app.use('/api/admin/statistics', statisticsRoutes);
app.use('/api/admin/routes', require('./routes/admin/routes'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));