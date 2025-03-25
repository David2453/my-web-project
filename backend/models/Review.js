// backend/models/Review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only review a bike once
ReviewSchema.index({ user: 1, bike: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);