import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import './Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();
  const [activePlan, setActivePlan] = useState('free');


  return (
    <>
      <div className="pricing-page">
        <div className="pricing-header">
          <h1>Pricing Plans</h1>
          <p>Choose a plan that matches your style journey</p>
        </div>

        <div className="plan-switcher">
          <button
            className={`plan-tab ${activePlan === 'free' ? 'active' : ''}`}
            onClick={() => setActivePlan('free')}
          >
            Free
          </button>
          <button
            className={`plan-tab ${activePlan === 'pro' ? 'active' : ''}`}
            onClick={() => setActivePlan('pro')}
          >
            Pro
          </button>
          <button
            className={`plan-tab ${activePlan === 'partner' ? 'active' : ''}`}
            onClick={() => setActivePlan('partner')}
          >
            Partner
          </button>
        </div>

        <div className="pricing-grid">
          <div
            className={`pricing-card ${activePlan === 'free' ? 'active' : ''}`}
            onClick={() => setActivePlan('free')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActivePlan('free')}
          >
            <h2>Free</h2>
            <p className="price">₹0</p>
            <ul>
              <li>1 scan/day</li>
              <li>Basic style tips</li>
              <li>Save up to 5 scans</li>
            </ul>
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Get Started
            </button>
          </div>

          <div
            className={`pricing-card featured ${activePlan === 'pro' ? 'active' : ''}`}
            onClick={() => setActivePlan('pro')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActivePlan('pro')}
          >
            <h2>Pro</h2>
            <p className="price">₹499/mo</p>
            <ul>
              <li>Unlimited scans</li>
              <li>PDF style reports</li>
              <li>Priority salon booking</li>
              <li>Advanced recommendations</li>
            </ul>
            <button className="btn-primary" onClick={() => navigate('/signup')}>
              Go Pro
            </button>
          </div>

          <div
            className={`pricing-card ${activePlan === 'partner' ? 'active' : ''}`}
            onClick={() => setActivePlan('partner')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setActivePlan('partner')}
          >
            <h2>Salon Partner</h2>
            <p className="price">Custom</p>
            <ul>
              <li>Partner dashboard</li>
              <li>Booking management</li>
              <li>Featured listing</li>
            </ul>
            <button className="btn-secondary" onClick={() => navigate('/partner-signup')}>
              Contact Sales
            </button>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Pricing;
