const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const {
  createBooking,
  getUserBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  rateBooking,
  getPartnerBookings,
  confirmBooking,
  completeBooking,
} = require('../controllers/bookingController');

// User routes
router.post('/', protect, authorize(['user']), createBooking);
router.get('/my', protect, authorize(['user']), getUserBookings);
router.get('/:id', protect, getBooking);
router.put('/:id', protect, updateBooking);
router.put('/:id/cancel', protect, authorize(['user']), cancelBooking);
router.put('/:id/rate', protect, authorize(['user']), rateBooking);

// Partner routes
router.get('/partner/requests', protect, authorize(['partner']), getPartnerBookings);
router.put('/:id/confirm', protect, authorize(['partner']), confirmBooking);
router.put('/:id/complete', protect, authorize(['partner']), completeBooking);

module.exports = router;
