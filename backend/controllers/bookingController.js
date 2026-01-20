const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Partner = require('../models/Partner');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = async (req, res) => {
  try {
    const { salonId, partnerId, service, bookingDate, timeSlot, notes, specialRequirements } = req.body;

    // Verify salon and partner exist
    const salon = await Salon.findById(salonId);
    const partner = await Partner.findById(partnerId);

    if (!salon || !partner) {
      return res.status(404).json({ message: 'Salon or Partner not found' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      salon: salonId,
      partner: partnerId,
      service,
      bookingDate,
      timeSlot,
      notes,
      specialRequirements,
      totalPrice: service.price,
    });

    // Populate references
    await booking.populate(['user', 'salon', 'partner']);

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private/User
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('salon')
      .populate('partner')
      .sort({ bookingDate: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('salon')
      .populate('partner');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'partner') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const allowedFields = ['status', 'notes', 'specialRequirements', 'paymentStatus'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason;
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rate booking
// @route   PUT /api/bookings/:id/rate
// @access  Private
exports.rateBooking = async (req, res) => {
  try {
    const { score, review } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.rating = { score, review };
    await booking.save();

    // Update salon rating
    const salon = await Salon.findById(booking.salon);
    if (salon) {
      const allBookings = await Booking.find({ salon: booking.salon, 'rating.score': { $exists: true } });
      const averageRating =
        allBookings.reduce((sum, b) => sum + (b.rating.score || 0), 0) / allBookings.length;
      salon.ratings.average = averageRating;
      salon.ratings.count = allBookings.length;
      await salon.save();
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get partner's bookings
// @route   GET /api/bookings/partner/requests
// @access  Private/Partner
exports.getPartnerBookings = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const bookings = await Booking.find({ partner: partner._id })
      .populate('user')
      .populate('salon')
      .sort({ bookingDate: 1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Confirm booking (Partner)
// @route   PUT /api/bookings/:id/confirm
// @access  Private/Partner
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const partner = await Partner.findOne({ user: req.user.id });

    if (!partner || booking.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Complete booking (Partner)
// @route   PUT /api/bookings/:id/complete
// @access  Private/Partner
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const partner = await Partner.findOne({ user: req.user.id });

    if (!partner || booking.partner.toString() !== partner._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'completed';
    await booking.save();

    // Update partner's total bookings
    partner.totalBookings += 1;
    await partner.save();

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
