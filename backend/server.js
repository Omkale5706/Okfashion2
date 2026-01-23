const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/style-scan', require('./routes/styleScanRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/scans', require('./routes/scanRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/trends', require('./routes/trendRoutes'));
app.use('/api/nearby-salons', require('./routes/nearbySalonRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'OK Fashion API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
