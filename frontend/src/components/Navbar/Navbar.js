import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          OK Fashion
        </Link>

        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><Link to="/salons">Salons</Link></li>
          {token && user?.role === 'user' && (
            <li><Link to="/dashboard">Dashboard</Link></li>
          )}
          {token && user?.role === 'partner' && (
            <li><Link to="/partner-dashboard">Partner</Link></li>
          )}
          {token && user?.role === 'admin' && (
            <li><Link to="/admin-dashboard">Admin</Link></li>
          )}
          <li>
            <Link to="/ai-stylist" className="ai-stylist-link">
              ✨ AI Stylist
            </Link>
          </li>
        </ul>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          {!token ? (
            <>
              <button className="btn-login" onClick={() => navigate('/login')}>
                Login
              </button>
              <button className="btn-signup" onClick={() => navigate('/signup')}>
                Sign Up
              </button>
            </>
          ) : (
            <button
              className="btn-login"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
