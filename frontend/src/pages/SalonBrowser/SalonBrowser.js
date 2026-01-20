import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/Footer/Footer';
import './SalonBrowser.css';

const SalonBrowser = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await axios.get('/api/partners/salons/search');
      setSalons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching salons:', error);
      setSalons([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="salon-browser">
        <h1>Nearby Salons</h1>
        {loading ? (
          <p className="salon-empty">Loading salons...</p>
        ) : salons.length === 0 ? (
          <div className="salon-empty">
            <p>No salons found yet.</p>
            <button className="btn-primary" onClick={() => navigate('/partner-signup')}>
              Become a Partner
            </button>
          </div>
        ) : (
          <div className="salon-grid">
            {salons.map((salon) => (
              <div key={salon._id} className="salon-card">
                <h3>{salon.name}</h3>
                <p>{salon.location?.city}</p>
                <p>Rating: {salon.ratings?.average || 0}</p>
                <button className="btn-primary" onClick={() => navigate('/ai-stylist')}>
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SalonBrowser;
