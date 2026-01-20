const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    service: {
      serviceId: mongoose.Schema.Types.ObjectId,
      serviceName: String,
      price: Number,
      duration: Number, // in minutes
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      startTime: String, // HH:MM format
      endTime: String,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    specialRequirements: [String],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentId: String, // Stripe or payment gateway ID
    cancellationReason: String,
    rating: {
      score: {
        type: Number,
        min: 1,
        max: 5,
      },
      review: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
