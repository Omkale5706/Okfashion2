const Contact = require('../models/Contact');

// Submit contact form
exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully. We will get back to you soon!',
      data: contact 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all contacts (Admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ 
      success: true, 
      count: contacts.length,
      data: contacts 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update contact status (Admin only)
exports.updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete contact (Admin only)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Contact deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
