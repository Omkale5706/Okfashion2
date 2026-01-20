import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [scans, setScans] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || 'User'}</h1>
        <p>Manage your profile, bookings, and style scans</p>
      </div>

      <div className="dashboard-nav">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          My Bookings
        </button>
        <button
          className={`tab-btn ${activeTab === 'scans' ? 'active' : ''}`}
          onClick={() => setActiveTab('scans')}
        >
          Style Scans
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
              <div className="stat-card">
                <h3>{bookings.filter(b => b.status === 'completed').length}</h3>
                <p>Completed</p>
              </div>
              <div className="stat-card">
                <h3>{scans.length}</h3>
                <p>Style Scans</p>
              </div>
              <div className="stat-card">
                <h3>{user?.savedOutfits?.length || 0}</h3>
                <p>Saved Outfits</p>
              </div>
            </div>

            <div className="recent-bookings">
              <h2>Recent Bookings</h2>
              {bookings.length > 0 ? (
                <div className="booking-list">
                  {bookings.slice(0, 3).map(booking => (
                    <div key={booking._id} className="booking-item">
                      <div>
                        <h4>{booking.salon?.name}</h4>
                        <p>{booking.service?.serviceName}</p>
                        <p className="date">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No bookings yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>My Bookings</h2>
            {bookings.length > 0 ? (
              <div className="booking-list">
                {bookings.map(booking => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-info">
                      <h3>{booking.salon?.name}</h3>
                      <p>Service: {booking.service?.serviceName}</p>
                      <p>Price: ₹{booking.totalPrice}</p>
                      <p>Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                      <p>Time: {booking.timeSlot?.startTime}</p>
                    </div>
                    <div className="booking-actions">
                      <span className={`status ${booking.status}`}>{booking.status}</span>
                      {booking.status === 'completed' && !booking.rating && (
                        <button className="btn-small" onClick={() => navigate(`/scan-result/${booking._id}`)}>
                          Rate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No bookings yet</p>
            )}
          </div>
        )}

        {activeTab === 'scans' && (
          <div className="scans-section">
            <h2>My Style Scans</h2>
            {scans.length > 0 ? (
              <div className="scans-grid">
                {scans.map(scan => (
                  <div key={scan._id} className="scan-card">
                    <img src={scan.imageUrl} alt="Scan" className="scan-image" />
                    <div className="scan-info">
                      <p className="scan-date">{new Date(scan.createdAt).toLocaleDateString()}</p>
                      <div className="scan-actions">
                        <button className="btn-small" onClick={() => navigate(`/scan-result/${scan._id}`)}>
                          View
                        </button>
                        <button className="btn-small secondary">
                          {scan.isSaved ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No scans yet. Start by visiting the AI Stylist page!</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h2>Profile Settings</h2>
            <div className="settings-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={user?.name} readOnly />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user?.email} readOnly />
              </div>
              <div className="form-group">
                <label>Body Type</label>
                <select defaultValue={user?.preferences?.bodyType || ''}>
                  <option>Select</option>
                  <option>Pear</option>
                  <option>Apple</option>
                  <option>Hourglass</option>
                  <option>Rectangle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Skin Tone</label>
                <select defaultValue={user?.preferences?.skinTone || ''}>
                  <option>Select</option>
                  <option>Fair</option>
                  <option>Medium</option>
                  <option>Olive</option>
                  <option>Deep</option>
                </select>
              </div>
              <button className="btn-primary" onClick={() => navigate('/profile-settings')}>
                Edit Full Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
