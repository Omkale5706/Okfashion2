const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getAllSubscribers
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');

router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/subscribers', protect, authorize('admin'), getAllSubscribers);

module.exports = router;
