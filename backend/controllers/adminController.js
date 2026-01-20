const User = require('../models/User');
const Partner = require('../models/Partner');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const ScanResult = require('../models/ScanResult');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalPartners = await Partner.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalSalons = await Salon.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const revenueStats = {
      total: totalRevenue[0]?.total || 0,
      byMonth: await getMonthlyRevenue(),
    };

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPartners,
        totalBookings,
        totalSalons,
        completedBookings,
        conversionRate: totalUsers > 0 ? ((totalBookings / totalUsers) * 100).toFixed(2) : 0,
        revenueStats,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function for monthly revenue
const getMonthlyRevenue = async () => {
  try {
    const monthlyData = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    return monthlyData;
  } catch (error) {
    return [];
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role = 'user' } = req.query;
    const skip = (page - 1) * limit;

    const users = await User.find({ role })
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ role });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('savedOutfits');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bookings = await Booking.find({ user: user._id });
    const scanResults = await ScanResult.find({ user: user._id });

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalBookings: bookings.length,
          totalScans: scanResults.length,
          completedBookings: bookings.filter(b => b.status === 'completed').length,
        },
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all partners
// @route   GET /api/admin/partners
// @access  Private/Admin
exports.getAllPartners = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'verified' } = req.query;
    const skip = (page - 1) * limit;

    const partners = await Partner.find({ verificationStatus: status })
      .populate('user')
      .populate('salon')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Partner.countDocuments({ verificationStatus: status });

    res.json({
      success: true,
      data: partners,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify a partner
// @route   PUT /api/admin/partners/:id/verify
// @access  Private/Admin
exports.verifyPartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'verified' },
      { new: true }
    ).populate('user');

    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reject a partner
// @route   PUT /api/admin/partners/:id/reject
// @access  Private/Admin
exports.rejectPartner = async (req, res) => {
  try {
    const { reason } = req.body;

    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected' },
      { new: true }
    ).populate('user');

    // TODO: Send rejection email to partner
    res.json({ success: true, data: partner, rejectionReason: reason });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get booking analytics
// @route   GET /api/admin/bookings/analytics
// @access  Private/Admin
exports.getBookingAnalytics = async (req, res) => {
  try {
    const bookingsByStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const topSalons = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$salon',
          totalBookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'salons',
          localField: '_id',
          foreignField: '_id',
          as: 'salon',
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        bookingsByStatus,
        topSalons,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get salons
// @route   GET /api/admin/salons
// @access  Private/Admin
exports.getAllSalons = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const salons = await Salon.find()
      .populate('partner')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Salon.countDocuments();

    res.json({
      success: true,
      data: salons,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get system health/metrics
// @route   GET /api/admin/health
// @access  Private/Admin
exports.getSystemHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const metrics = {
      uptime: Math.floor(uptime),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      },
      database: {
        connected: true, // TODO: Add actual DB connection check
      },
      timestamp: new Date(),
    };

    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
