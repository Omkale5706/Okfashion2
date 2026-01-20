import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMagic } from 'react-icons/fa';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Your AI <br />
            Fashion <span className="highlight">Stylist</span>
          </h1>
          <p className="hero-description">
            Transform your style with AI-powered fashion recommendations. 
            Upload your photo and discover personalized outfits, hairstyles, 
            and color combinations that perfectly match your unique features.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/ai-stylist')}>
              <FaMagic /> Scan Your Style
            </button>
            <button className="btn-secondary" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            <div className="face-icon">
              <div className="eye left"></div>
              <div className="eye right"></div>
              <div className="mouth"></div>
            </div>
          </div>
          <div className="floating-dot dot-1"></div>
          <div className="floating-dot dot-2"></div>
          <div className="floating-dot dot-3"></div>
          <div className="floating-dot dot-4"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
