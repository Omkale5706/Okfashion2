const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const {
  registerPartner,
  getPartnerProfile,
  updatePartnerProfile,
  createSalon,
  getSalon,
  updateSalon,
  getAllPartners,
  verifyPartner,
  searchSalons,
} = require('../controllers/partnerController');

// Public routes
router.get('/salons/search', searchSalons);

// Protected routes (Partner only)
router.post('/register', protect, registerPartner);
router.get('/me', protect, authorize(['partner']), getPartnerProfile);
router.put('/me', protect, authorize(['partner']), updatePartnerProfile);
router.post('/salon', protect, authorize(['partner']), createSalon);
router.get('/salon', protect, authorize(['partner']), getSalon);
router.put('/salon', protect, authorize(['partner']), updateSalon);

// Admin routes
router.get('/', protect, authorize(['admin']), getAllPartners);
router.put('/:id/verify', protect, authorize(['admin']), verifyPartner);

module.exports = router;
