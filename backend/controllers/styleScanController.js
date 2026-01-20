const StyleScan = require('../models/StyleScan');

// Create new style scan
exports.createStyleScan = async (req, res) => {
  try {
    const { imageUrl, analysis } = req.body;
    
    const styleScan = await StyleScan.create({
      userId: req.user.id,
      imageUrl,
      analysis
    });

    res.status(201).json({
      success: true,
      message: 'Style scan completed successfully',
      data: styleScan
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get user's style scans
exports.getUserStyleScans = async (req, res) => {
  try {
    const scans = await StyleScan.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: scans.length,
      data: scans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get style scan by ID
exports.getStyleScanById = async (req, res) => {
  try {
    const scan = await StyleScan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Style scan not found'
      });
    }

    // Check if scan belongs to user
    if (scan.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this scan'
      });
    }

    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete style scan
exports.deleteStyleScan = async (req, res) => {
  try {
    const scan = await StyleScan.findById(req.params.id);
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Style scan not found'
      });
    }

    // Check if scan belongs to user
    if (scan.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this scan'
      });
    }

    await scan.remove();
    
    res.json({
      success: true,
      message: 'Style scan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
