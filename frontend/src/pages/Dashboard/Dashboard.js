import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCamera, FaMagic, FaHeart, FaChartLine, FaUpload, FaEdit } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchBookings();
    fetchScans();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user data');
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchScans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/scans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScans(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scans:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  const photosAnalyzed = scans.length;
  const recommendationsCount = scans.reduce(
    (acc, scan) => acc + (scan.analysis?.recommendations?.styles?.length || 0),
    0
  );
  const savedOutfits = user?.savedOutfits?.length || 0;
  const styleScore = photosAnalyzed ? Math.min(100, 70 + photosAnalyzed * 2) : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'User'}!</h1>
        <p>Here's your style journey overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaCamera />
          </div>
          <div>
            <h3>{photosAnalyzed}</h3>
            <p>Photos Analyzed</p>
            <span>AI style scans completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaMagic />
          </div>
          <div>
            <h3>{recommendationsCount}</h3>
            <p>Recommendations</p>
            <span>Personalized suggestions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaHeart />
          </div>
          <div>
            <h3>{savedOutfits}</h3>
            <p>Saved Outfits</p>
            <span>Favorite combinations</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div>
            <h3>{styleScore}%</h3>
            <p>Style Score</p>
            <span>Fashion compatibility</span>
          </div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Style Analysis</h2>
              <p>Upload your photos to get personalized fashion recommendations</p>
            </div>
          </div>

          <div className="upload-area">
            <div className="upload-icon">
              <FaUpload />
            </div>
            <h4>Upload your photos</h4>
            <p>Drag and drop or click to select face and body photos</p>
            <label className="upload-button">
              Choose Files
              <input type="file" multiple hidden />
            </label>
          </div>
        </div>

        <div className="dashboard-panel profile-panel">
          <div className="panel-header">
            <h2>Profile</h2>
            <button className="icon-button" onClick={() => navigate('/profile-settings')}>
              <FaEdit />
            </button>
          </div>
          <div className="profile-avatar">
            <div className="avatar-circle"></div>
            <button className="avatar-button">
              <FaCamera />
            </button>
          </div>
          <div className="profile-info">
            <div>
              <p>Name</p>
              <span>{user?.name || 'User'}</span>
            </div>
            <div>
              <p>Email</p>
              <span>{user?.email || 'user@example.com'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
