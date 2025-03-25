// backend/models/CartItem.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bike: {
    type: Schema.Types.ObjectId,
    ref: 'Bikes',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
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
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CartItem', CartItemSchema);