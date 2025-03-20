// backend/models/Bike.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BikeSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  rentalPrice: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  features: [String],
  purchaseStock: {
    type: Number,
    default: 0
  },
  rentalInventory: [
    {
      location: {
        type: Schema.Types.ObjectId,
        ref: 'Location'
      },
      stock: {
        type: Number,
        default: 0
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bikes', BikeSchema);