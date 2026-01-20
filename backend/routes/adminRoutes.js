const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  getAllPartners,
  verifyPartner,
  rejectPartner,
  getBookingAnalytics,
  getAllSalons,
  getSystemHealth,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, authorize(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/health', getSystemHealth);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);

// Partners
router.get('/partners', getAllPartners);
router.put('/partners/:id/verify', verifyPartner);
router.put('/partners/:id/reject', rejectPartner);

// Salons
router.get('/salons', getAllSalons);

// Analytics
router.get('/bookings/analytics', getBookingAnalytics);

module.exports = router;
