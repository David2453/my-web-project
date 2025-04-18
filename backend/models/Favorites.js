// backend/models/Favorite.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavoriteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  },
  bike: {
    type: Schema.Types.ObjectId,
    ref: 'Bikes',
    required: true
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
});

// Ensure a user can only favorite a bike once
FavoriteSchema.index({ user: 1, bike: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);