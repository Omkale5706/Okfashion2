import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ isDarkMode, onToggleTheme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const menuRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            OK Fashion
          </Link>

          <ul className="navbar-menu">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
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
        </div>

        <div className="navbar-actions" ref={profileRef}>
          <button className="theme-toggle" onClick={onToggleTheme}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          {token && (
            <div className="profile-dropdown">
              <button
                className="profile-icon"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-label="Profile"
                aria-expanded={profileOpen}
              >
                <FaUserCircle />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <button onClick={() => navigate('/profile-settings')}>My Profile</button>
                  <button onClick={() => navigate('/dashboard')}>My Style Analysis</button>
                  <button onClick={() => navigate('/wishlist')}>Wishlist</button>
                  <button onClick={() => navigate('/salons')}>Saved Salons</button>
                  <button onClick={() => navigate('/profile-settings')}>Settings</button>
                  <button
                    className="logout"
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      navigate('/');
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
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
            <div className="navbar-auth-spacer"></div>
          )}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile" ref={menuRef}>
          <ul>
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
            <li><Link to="/services" onClick={() => setMenuOpen(false)}>Services</Link></li>
            <li><Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link></li>
            <li><Link to="/salons" onClick={() => setMenuOpen(false)}>Salons</Link></li>
            <li><Link to="/ai-stylist" onClick={() => setMenuOpen(false)}>AI Stylist</Link></li>
            {token && user?.role === 'user' && (
              <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
            )}
            {token && user?.role === 'partner' && (
              <li><Link to="/partner-dashboard" onClick={() => setMenuOpen(false)}>Partner</Link></li>
            )}
            {token && user?.role === 'admin' && (
              <li><Link to="/admin-dashboard" onClick={() => setMenuOpen(false)}>Admin</Link></li>
            )}
          </ul>
          <div className="mobile-actions">
            {!token ? (
              <>
                <button className="btn-login" onClick={() => { setMenuOpen(false); navigate('/login'); }}>
                  Login
                </button>
                <button className="btn-signup" onClick={() => { setMenuOpen(false); navigate('/signup'); }}>
                  Sign Up
                </button>
              </>
            ) : (
              <button
                className="btn-login"
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setMenuOpen(false);
                  navigate('/');
                }}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
