import React, { useEffect, useState } from 'react';
import { FaTshirt, FaCut, FaPalette, FaGem, FaMagic, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/services`);
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      // Fallback to static services if API fails
      setServices(staticServices);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      'accessory': <FaGem />,
      'face-analysis': <FaUserCircle />,
      'transformation': <FaMagic />,
      'outfit': <FaTshirt />,
      'hairstyle': <FaCut />,
      'color': <FaPalette />
    };
    return icons[iconName] || <FaMagic />;
  };

  const staticServices = [
    {
      title: 'Accessory Matching',
      description: 'Complete your look with the right accessories. Get personalized suggestions for jewelry, bags, and other items.',
      icon: 'accessory'
    },
    {
      title: 'Face Shape Analysis',
      description: 'Understand your unique face shape and receive tailored recommendations for hairstyles, glasses, and makeup.',
      icon: 'face-analysis'
    },
    {
      title: 'Style Transformation',
      description: 'Ready for a complete makeover? Our AI creates personalized style transformations based on your preferences.',
      icon: 'transformation'
    },
    {
      title: 'Outfit Recommendations',
      description: 'Get personalized outfit suggestions based on your body type, style preferences, and occasion.',
      icon: 'outfit'
    },
    {
      title: 'Hairstyle Suggestions',
      description: 'Discover hairstyles that complement your face shape and features. From casual to formal looks.',
      icon: 'hairstyle'
    },
    {
      title: 'Color Analysis',
      description: 'Learn which colors enhance your natural beauty. Our AI analyzes your skin tone, hair color, and eye color.',
      icon: 'color'
    }
  ];

  const displayServices = services.length > 0 ? services : staticServices;

  return (
    <section className="services-section" id="services">
      <div className="services-container">
        <div className="services-header">
          <h2>Our AI Services</h2>
          <p>Comprehensive styling solutions powered by advanced artificial intelligence</p>
        </div>

        <div className="services-grid">
          {displayServices.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-icon">
                {getIcon(service.icon)}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
