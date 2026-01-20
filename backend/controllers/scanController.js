const ScanResult = require('../models/ScanResult');
const User = require('../models/User');

// @desc    Save a scan result
// @route   POST /api/scans
// @access  Private/User
exports.saveScanResult = async (req, res) => {
  try {
    const { imageUrl, analysis, confidence } = req.body;

    const scanResult = await ScanResult.create({
      user: req.user.id,
      imageUrl,
      analysis,
      confidence,
      isSaved: true,
    });

    // Update user's savedOutfits
    await User.findByIdAndUpdate(req.user.id, {
      $push: { savedOutfits: scanResult._id },
    });

    res.status(201).json({ success: true, data: scanResult });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's scan results
// @route   GET /api/scans
// @access  Private/User
exports.getUserScans = async (req, res) => {
  try {
    const scanResults = await ScanResult.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: scanResults });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get a single scan result
// @route   GET /api/scans/:id
// @access  Private
exports.getScanResult = async (req, res) => {
  try {
    const scanResult = await ScanResult.findById(req.params.id)
      .populate('user')
      .populate('sharedWith');

    if (!scanResult) {
      return res.status(404).json({ message: 'Scan result not found' });
    }

    // Check authorization
    if (scanResult.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      if (!scanResult.isShared || !scanResult.sharedWith.some(u => u._id.toString() === req.user.id)) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    res.json({ success: true, data: scanResult });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update scan result
// @route   PUT /api/scans/:id
// @access  Private
exports.updateScanResult = async (req, res) => {
  try {
    let scanResult = await ScanResult.findById(req.params.id);

    if (!scanResult) {
      return res.status(404).json({ message: 'Scan result not found' });
    }

    if (scanResult.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const allowedFields = ['isSaved', 'isShared', 'feedback'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    scanResult = await ScanResult.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: scanResult });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete scan result
// @route   DELETE /api/scans/:id
// @access  Private
exports.deleteScanResult = async (req, res) => {
  try {
    const scanResult = await ScanResult.findById(req.params.id);

    if (!scanResult) {
      return res.status(404).json({ message: 'Scan result not found' });
    }

    if (scanResult.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Remove from user's savedOutfits
    await User.findByIdAndUpdate(scanResult.user, {
      $pull: { savedOutfits: scanResult._id },
    });

    await ScanResult.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Scan result deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Share scan result
// @route   PUT /api/scans/:id/share
// @access  Private
exports.shareScanResult = async (req, res) => {
  try {
    const { userIds } = req.body;

    const scanResult = await ScanResult.findById(req.params.id);

    if (!scanResult) {
      return res.status(404).json({ message: 'Scan result not found' });
    }

    if (scanResult.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    scanResult.isShared = true;
    scanResult.sharedWith = userIds;
    await scanResult.save();

    await scanResult.populate('sharedWith');

    res.json({ success: true, data: scanResult });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get shared scans
// @route   GET /api/scans/shared/with-me
// @access  Private
exports.getSharedScans = async (req, res) => {
  try {
    const scanResults = await ScanResult.find({
      sharedWith: req.user.id,
      isShared: true,
    })
      .populate('user')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: scanResults });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Submit feedback on scan result
// @route   PUT /api/scans/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { helpful, comments } = req.body;

    const scanResult = await ScanResult.findByIdAndUpdate(
      req.params.id,
      { feedback: { helpful, comments } },
      { new: true }
    );

    res.json({ success: true, data: scanResult });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
