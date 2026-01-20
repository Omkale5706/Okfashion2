import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-header">
          <h2>About OK Fashion</h2>
          <p>Revolutionizing fashion choices through artificial intelligence</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h3>Our Mission</h3>
            <p>
              We believe everyone deserves to look and feel their best. OK Fashion uses 
              cutting-edge AI technology to analyze your unique features and provide 
              personalized fashion recommendations that enhance your natural beauty.
            </p>
            <p>
              No more fashion mistakes or endless hours wondering what looks good on you. 
              Our AI understands face shapes, body types, skin tones, and personal style 
              preferences to deliver suggestions that are perfectly tailored to you.
            </p>

            <div className="founder-info">
              <h3>Founded by Om Kale</h3>
              <p>
                A passionate technologist and fashion enthusiast dedicated to solving the 
                universal problem of poor fashion choices through innovative AI solutions.
              </p>
            </div>
          </div>

          <div className="about-visual">
            <div className="about-circle">
              <div className="decoration-dots">
                <span className="dot dot-orange"></span>
                <span className="dot dot-blue"></span>
                <span className="dot dot-yellow"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <button className="cta-button" onClick={() => navigate('/ai-stylist')}>
            START YOUR STYLE JOURNEY
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
