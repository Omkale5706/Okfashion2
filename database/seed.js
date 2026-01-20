const mongoose = require('../backend/node_modules/mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Import models
const Service = require('../backend/models/Service');
const User = require('../backend/models/User');

// Connect to database
const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/ok-fashion',
      { serverSelectionTimeoutMS: 8000 }
    );
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Sample services data
const services = [
  {
    title: 'Accessory Matching',
    description: 'Complete your look with the right accessories. Get personalized suggestions for jewelry, bags, and other items that complement your outfit and enhance your overall style.',
    icon: 'accessory',
    category: 'recommendation',
    features: [
      'Jewelry recommendations',
      'Bag matching',
      'Style coordination',
      'Occasion-based suggestions'
    ]
  },
  {
    title: 'Face Shape Analysis',
    description: 'Understand your unique face shape and receive tailored recommendations for hairstyles, glasses, and makeup that best suit your facial features. From casual to formal looks, find the perfect cut and style for any occasion.',
    icon: 'face-analysis',
    category: 'analysis',
    features: [
      'Face shape detection',
      'Hairstyle recommendations',
      'Glasses suggestions',
      'Makeup tips'
    ]
  },
  {
    title: 'Style Transformation',
    description: 'Ready for a complete makeover? Our AI creates personalized style transformations based on your preferences, body type, and lifestyle. Get a complete new look tailored just for you.',
    icon: 'transformation',
    category: 'style',
    features: [
      'Complete makeover',
      'Body type analysis',
      'Lifestyle-based styling',
      'Trend integration'
    ]
  },
  {
    title: 'Outfit Recommendations',
    description: 'Get personalized outfit suggestions based on your body type, style preferences, and occasion. Our AI considers fit, color coordination, and current trends.',
    icon: 'outfit',
    category: 'recommendation',
    features: [
      'Body type matching',
      'Occasion-based outfits',
      'Color coordination',
      'Trend analysis'
    ]
  },
  {
    title: 'Hairstyle Suggestions',
    description: 'Discover hairstyles that complement your face shape and features. From casual to formal looks, find the perfect cut and style for any occasion.',
    icon: 'hairstyle',
    category: 'recommendation',
    features: [
      'Face shape matching',
      'Style variety',
      'Maintenance tips',
      'Occasion-based styles'
    ]
  },
  {
    title: 'Color Analysis',
    description: 'Learn which colors enhance your natural beauty. Our AI analyzes your skin tone, hair color, and eye color to recommend your perfect palette.',
    icon: 'color',
    category: 'analysis',
    features: [
      'Skin tone analysis',
      'Personal color palette',
      'Seasonal colors',
      'Combination suggestions'
    ]
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    await connectDB();
    // Clear existing data
    await Service.deleteMany({});
    await User.deleteMany({});

    console.log('Existing data cleared...');

    // Insert services
    await Service.insertMany(services);
    console.log('Services seeded successfully...');

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
