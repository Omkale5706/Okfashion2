const mongoose = require('mongoose');

const styleScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  analysis: {
    faceShape: String,
    skinTone: String,
    colorPalette: [String],
    recommendations: {
      outfits: [String],
      hairstyles: [String],
      accessories: [String],
      colors: [String]
    }
  },
  scanDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StyleScan', styleScanSchema);
