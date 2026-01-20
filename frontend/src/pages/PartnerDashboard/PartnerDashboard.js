import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PartnerDashboard.css';

const PartnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [salon, setSalon] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchSalon();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/bookings/partner/requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookings(response.data.data);
  };

  const fetchSalon = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/partners/salon', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSalon(response.data.data);
  };

  return (
    <div className="partner-dashboard">
      <h1>Partner Dashboard</h1>
      <p>Manage bookings and salon details</p>

      <section>
        <h2>Salon Info</h2>
        {salon ? (
          <div className="card">
            <h3>{salon.name}</h3>
            <p>{salon.description}</p>
          </div>
        ) : (
          <p>No salon details found.</p>
        )}
      </section>

      <section>
        <h2>Booking Requests</h2>
        {bookings.map((booking) => (
          <div key={booking._id} className="card">
            <p>{booking.user?.name} - {booking.service?.serviceName}</p>
            <p>{new Date(booking.bookingDate).toLocaleDateString()}</p>
            <span className={`status ${booking.status}`}>{booking.status}</span>
          </div>
        ))}
      </section>
    </div>
  );
};

export default PartnerDashboard;
