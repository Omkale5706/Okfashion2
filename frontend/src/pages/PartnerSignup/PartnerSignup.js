import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import './PartnerSignup.css';

const PartnerSignup = () => {
  const [form, setForm] = useState({
    businessName: '',
    businessLicense: '',
    yearsOfExperience: '',
    specialization: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/partners/register', {
        ...form,
        specialization: form.specialization.split(',').map(s => s.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Partner registration submitted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="partner-signup-page">
      <div className="partner-signup-card">
        <h1>Salon Partner Registration</h1>
        <p>Join OK Fashion as a verified salon partner.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Business Name</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Business License</label>
            <input name="businessLicense" value={form.businessLicense} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input type="number" name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Specialization (comma-separated)</label>
            <input name="specialization" value={form.specialization} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default PartnerSignup;
