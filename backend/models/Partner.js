const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
    },
    businessName: {
      type: String,
      required: [true, 'Please provide a business name'],
      trim: true,
    },
    businessLicense: {
      type: String,
      required: true,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
    },
    specialization: [String], // e.g., ['Hair', 'Makeup', 'Fashion']
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
    },
    commissionRate: {
      type: Number,
      default: 10, // percentage
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Partner', partnerSchema);
