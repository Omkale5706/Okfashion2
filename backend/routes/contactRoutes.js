const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getAllContacts);
router.put('/:id', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;
