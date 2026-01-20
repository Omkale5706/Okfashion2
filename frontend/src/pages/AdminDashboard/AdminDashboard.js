import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(response.data.data);
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      {stats ? (
        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Users</p></div>
          <div className="stat-card"><h3>{stats.totalPartners}</h3><p>Partners</p></div>
          <div className="stat-card"><h3>{stats.totalBookings}</h3><p>Bookings</p></div>
          <div className="stat-card"><h3>{stats.totalSalons}</h3><p>Salons</p></div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AdminDashboard;
