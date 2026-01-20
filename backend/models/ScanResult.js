const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    analysis: {
      colorPalette: [
        {
          color: String,
          name: String,
          hex: String,
        },
      ],
      recommendations: {
        styles: [String],
        fabrics: [String],
        colors: [String],
        patterns: [String],
      },
      bodyType: String,
      skinTone: String,
      faceShape: String,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    feedback: {
      helpful: Boolean,
      comments: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScanResult', scanResultSchema);
