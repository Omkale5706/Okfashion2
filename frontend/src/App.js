import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Services from './pages/Services/Services';
import AIStylist from './pages/AIStylist/AIStylist';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import Contact from './pages/Contact/Contact';
import Pricing from './pages/Pricing/Pricing';
import Dashboard from './pages/Dashboard/Dashboard';
import PartnerSignup from './pages/PartnerSignup/PartnerSignup';
import PartnerDashboard from './pages/PartnerDashboard/PartnerDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ProfileSettings from './pages/ProfileSettings/ProfileSettings';
import SalonBrowser from './pages/SalonBrowser/SalonBrowser';
import ScanResult from './pages/ScanResult/ScanResult';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/ai-stylist" element={<AIStylist />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/salons" element={<SalonBrowser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['user']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-settings"
            element={
              <ProtectedRoute roles={['user']}>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan-result/:id"
            element={
              <ProtectedRoute roles={['user']}>
                <ScanResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-signup"
            element={
              <ProtectedRoute roles={['user']}>
                <PartnerSignup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-dashboard"
            element={
              <ProtectedRoute roles={['partner']}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
