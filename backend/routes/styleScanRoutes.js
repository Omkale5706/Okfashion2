const express = require('express');
const router = express.Router();
const {
  createStyleScan,
  getUserStyleScans,
  getStyleScanById,
  deleteStyleScan
} = require('../controllers/styleScanController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createStyleScan);
router.get('/', protect, getUserStyleScans);
router.get('/:id', protect, getStyleScanById);
router.delete('/:id', protect, deleteStyleScan);

module.exports = router;
