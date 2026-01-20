const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already subscribed' 
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        await existingSubscriber.save();
        return res.json({ 
          success: true, 
          message: 'Subscription reactivated successfully' 
        });
      }
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({ email });
    res.status(201).json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      data: subscriber 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Unsubscribe from newsletter
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const subscriber = await Newsletter.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({ 
        success: false, 
        message: 'Email not found' 
      });
    }

    subscriber.isActive = false;
    await subscriber.save();
    
    res.json({ 
      success: true, 
      message: 'Successfully unsubscribed from newsletter' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all subscribers (Admin only)
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true });
    res.json({ 
      success: true, 
      count: subscribers.length,
      data: subscribers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
