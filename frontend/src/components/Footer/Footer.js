import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaYoutube, FaLinkedin, FaInstagram, FaTwitter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/newsletter/subscribe`, {
        email
      });

      if (response.data.success) {
        toast.success('Successfully subscribed to newsletter!');
        setEmail('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-col footer-about">
            <h3>OK Fashion</h3>
            <p>
              Your AI-powered fashion stylist. Transform your style with personalized 
              recommendations that enhance your natural beauty.
            </p>
            <div className="social-links">
              <a href="https://youtube.com/@OKfashionai" target="_blank" rel="noopener noreferrer">
                <FaYoutube />
              </a>
              <a href="https://linkedin.com//company/ok-fashion-ai" target="_blank" rel="noopener noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com//okfashion_ai/" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://x.com/OKFashionAi" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services">Outfit Recommendations</Link></li>
              <li><Link to="/services">Hairstyle Suggestions</Link></li>
              <li><Link to="/services">Color Analysis</Link></li>
              <li><Link to="/services">Style Transformation</Link></li>
              <li><Link to="/ai-stylist">Scan Your Style</Link></li>
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for the latest fashion trends and AI styling tips.</p>
            <form onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 OK Fashion. Made with ❤️ Om Kale</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
