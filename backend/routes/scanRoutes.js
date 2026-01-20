const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const {
  saveScanResult,
  getUserScans,
  getScanResult,
  updateScanResult,
  deleteScanResult,
  shareScanResult,
  getSharedScans,
  submitFeedback,
} = require('../controllers/scanController');

// User routes
router.post('/', protect, authorize(['user']), saveScanResult);
router.get('/', protect, authorize(['user']), getUserScans);
router.get('/shared/with-me', protect, authorize(['user']), getSharedScans);
router.get('/:id', protect, getScanResult);
router.put('/:id', protect, authorize(['user']), updateScanResult);
router.delete('/:id', protect, authorize(['user']), deleteScanResult);
router.put('/:id/share', protect, authorize(['user']), shareScanResult);
router.put('/:id/feedback', protect, authorize(['user']), submitFeedback);

module.exports = router;
