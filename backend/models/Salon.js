const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a salon name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    contact: {
      phone: String,
      email: String,
      website: String,
    },
    services: [
      {
        serviceId: mongoose.Schema.Types.ObjectId,
        serviceName: String,
        price: Number,
        duration: Number, // in minutes
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    images: [String], // Array of image URLs
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Salon', salonSchema);
