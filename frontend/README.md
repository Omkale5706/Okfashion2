# OK Fashion Frontend

React frontend for OK Fashion AI styling platform.

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the App

Development mode:
```bash
npm start
```

Build for production:
```bash
npm run build
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar/
│   │   ├── Hero/
│   │   ├── Services/
│   │   ├── About/
│   │   └── Footer/
│   ├── pages/           # Page components
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Services/
│   │   ├── AIStylist/
│   │   ├── Login/
│   │   ├── SignUp/
│   │   └── Contact/
│   ├── App.js           # Main app component
│   ├── App.css
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
└── package.json
```

## Features

- Responsive design for all screen sizes
- Modern UI with smooth animations
- User authentication (login/signup)
- AI style scanning with image upload
- Newsletter subscription
- Contact form
- Service showcase
- About section with founder info

## Pages

1. **Home** - Hero section, services overview, about section
2. **About** - Mission statement and founder information
3. **Services** - Detailed service cards
4. **AI Stylist** - Upload and analyze photos
5. **Login** - User authentication
6. **Sign Up** - New user registration
7. **Contact** - Contact form

## Components

- **Navbar** - Navigation with theme toggle
- **Hero** - Landing section with CTA
- **Services** - Service cards grid
- **About** - Company mission and info
- **Footer** - Links, newsletter, social media

## Styling

- CSS Modules for component-specific styles
- CSS Variables for consistent theming
- Flexbox and Grid for layouts
- Media queries for responsiveness

## Dependencies

- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- react-icons - Icon library
- react-toastify - Notifications
