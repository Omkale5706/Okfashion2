# OK Fashion Backend

Express.js backend API for OK Fashion AI styling platform.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ok-fashion
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Running the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/          # Route controllers
│   ├── serviceController.js
│   ├── userController.js
│   ├── newsletterController.js
│   ├── contactController.js
│   └── styleScanController.js
├── models/              # Mongoose schemas
│   ├── Service.js
│   ├── User.js
│   ├── Newsletter.js
│   ├── Contact.js
│   └── StyleScan.js
├── routes/              # API routes
│   ├── serviceRoutes.js
│   ├── userRoutes.js
│   ├── newsletterRoutes.js
│   ├── contactRoutes.js
│   └── styleScanRoutes.js
├── middleware/
│   └── auth.js          # JWT authentication
└── server.js            # Entry point
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Users
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile (protected)
- `PUT /users/profile` - Update profile (protected)

#### Services
- `GET /services` - Get all services
- `GET /services/:id` - Get service by ID

#### Newsletter
- `POST /newsletter/subscribe` - Subscribe
- `POST /newsletter/unsubscribe` - Unsubscribe

#### Contact
- `POST /contact` - Submit contact form

#### Style Scan
- `POST /style-scan` - Create style scan (protected)
- `GET /style-scan` - Get user scans (protected)

## Dependencies

- express - Web framework
- mongoose - MongoDB ODM
- dotenv - Environment variables
- cors - CORS middleware
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- express-validator - Input validation
- multer - File uploads
- nodemailer - Email service
