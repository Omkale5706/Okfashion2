# OK Fashion - AI Fashion Stylist

A complete MERN stack application for AI-powered fashion recommendations and style analysis.

![OK Fashion](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- **AI Style Scanning**: Upload photos and get personalized fashion recommendations
- **Face Shape Analysis**: Understand your unique facial features
- **Color Palette Analysis**: Discover colors that enhance your natural beauty
- **Outfit Recommendations**: Get personalized outfit suggestions
- **Hairstyle Suggestions**: Find hairstyles that complement your face shape
- **User Authentication**: Secure login and signup functionality
- **Newsletter Subscription**: Stay updated with fashion trends
- **Contact Form**: Easy communication with support

## 📁 Project Structure

```
ok/
├── backend/          # Node.js + Express backend
├── frontend/         # React frontend
└── database/         # MongoDB schemas and seed data
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd ok
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with backend API URL
   npm start
   ```

4. **Setup Database**
   ```bash
   # Start MongoDB
   mongod

   # Seed initial data (optional)
   cd database
   node seed.js
   ```

## 🛠️ Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router v6
- Axios for API calls
- React Icons
- React Toastify for notifications

### Database
- MongoDB

## 📝 API Endpoints

### User Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Service Routes
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

### Newsletter Routes
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter

### Contact Routes
- `POST /api/contact` - Submit contact form

### Style Scan Routes
- `POST /api/style-scan` - Create new style scan (protected)
- `GET /api/style-scan` - Get user's style scans (protected)

## 🎨 Features in Detail

### AI Style Analysis
Users can upload their photos to receive:
- Face shape detection
- Skin tone analysis
- Personalized color palette
- Outfit recommendations
- Hairstyle suggestions
- Accessory matching

### User Dashboard
- View past style scans
- Save favorite recommendations
- Update profile preferences
- Manage account settings

## 🔒 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ok-fashion
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Om Kale**
- Website: [okfashion.me](https://www.okfashion.me)

## 🙏 Acknowledgments

- Design inspired by modern fashion platforms
- Icons from React Icons
- UI components built with pure CSS

## 📞 Support

For support, email support@okfashion.me or create an issue in the repository.

---

Made with ❤️ by Om Kale
