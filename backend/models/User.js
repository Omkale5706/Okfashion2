const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: ''
  },
  preferences: {
    bodyType: String,
    stylePreference: String,
    skinTone: String,
    hairColor: String
  },
  savedOutfits: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StyleScan'
  }],
  role: {
    type: String,
    enum: ['user', 'partner', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
