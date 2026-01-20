const Partner = require('../models/Partner');
const Salon = require('../models/Salon');
const User = require('../models/User');

// @desc    Register a new partner
// @route   POST /api/partners/register
// @access  Private
exports.registerPartner = async (req, res) => {
  try {
    const { businessName, businessLicense, yearsOfExperience, specialization } = req.body;

    // Check if partner already exists for this user
    const existingPartner = await Partner.findOne({ user: req.user.id });
    if (existingPartner) {
      return res.status(400).json({ message: 'Partner already registered' });
    }

    const partner = await Partner.create({
      user: req.user.id,
      businessName,
      businessLicense,
      yearsOfExperience,
      specialization,
    });

    // Update user role to partner
    await User.findByIdAndUpdate(req.user.id, { role: 'partner' });

    res.status(201).json({ success: true, data: partner });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get partner profile
// @route   GET /api/partners/me
// @access  Private
exports.getPartnerProfile = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id })
      .populate('user')
      .populate('salon');

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update partner profile
// @route   PUT /api/partners/me
// @access  Private
exports.updatePartnerProfile = async (req, res) => {
  try {
    const allowedFields = ['businessName', 'specialization', 'bankDetails'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    const partner = await Partner.findOneAndUpdate({ user: req.user.id }, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create salon
// @route   POST /api/partners/salon
// @access  Private
exports.createSalon = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const { name, description, location, contact, services } = req.body;

    const salon = await Salon.create({
      name,
      description,
      location,
      contact,
      services,
      partner: partner._id,
    });

    // Update partner with salon reference
    partner.salon = salon._id;
    await partner.save();

    res.status(201).json({ success: true, data: salon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get partner's salon
// @route   GET /api/partners/salon
// @access  Private
exports.getSalon = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }

    const salon = await Salon.findById(partner.salon);
    res.json({ success: true, data: salon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update salon
// @route   PUT /api/partners/salon
// @access  Private
exports.updateSalon = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner || !partner.salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const allowedFields = ['name', 'description', 'location', 'contact', 'services', 'images'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    });

    const salon = await Salon.findByIdAndUpdate(partner.salon, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: salon });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all partners (Admin only)
// @route   GET /api/partners
// @access  Private/Admin
exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().populate('user').populate('salon');
    res.json({ success: true, data: partners });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Verify partner (Admin only)
// @route   PUT /api/partners/:id/verify
// @access  Private/Admin
exports.verifyPartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'verified' },
      { new: true }
    );

    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get salons by location/filter
// @route   GET /api/partners/salons/search
// @access  Public
exports.searchSalons = async (req, res) => {
  try {
    const { city, service, rating } = req.query;
    const filter = { isActive: true };

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (service) {
      filter['services.serviceName'] = new RegExp(service, 'i');
    }

    if (rating) {
      filter['ratings.average'] = { $gte: parseInt(rating) };
    }

    const salons = await Salon.find(filter).populate('partner');
    res.json({ success: true, data: salons });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
