// backend/models/Orders.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  bike: {
    type: Schema.Types.ObjectId,
    ref: 'Bikes',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'rental'],
    required: true
  },
  startDate: {
    type: Date,
    required: function() { return this.type === 'rental'; }
  },
  endDate: {
    type: Date,
    required: function() { return this.type === 'rental'; }
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: function() { return this.type === 'rental'; }
  }
});

const OrderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [OrderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    required: true,
    default: 'Credit Card'
  },
  paymentDetails: {
    // This would typically connect to a payment processor
    // For now, we'll just store basic details
    transactionId: String,
    last4: String
  },
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Orders', OrderSchema);