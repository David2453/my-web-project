// backend/models/Route.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RouteSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true
  },
  routeType: {
    type: String,
    enum: ['loop', 'out-and-back', 'point-to-point'],
    default: 'loop'
  },
  coordinates: [{
    lat: Number,
    lng: Number
  }],
  elevationGain: {
    type: Number, // in meters
    default: 0
  },
  images: [String],
  tags: [String], // e.g., "scenic", "mountainous", "family-friendly"
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Route', RouteSchema);