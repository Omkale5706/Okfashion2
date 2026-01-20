import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    bodyType: '',
    stylePreference: '',
    skinTone: '',
    hairColor: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = response.data.data;
    setForm({
      name: user.name,
      email: user.email,
      ...user.preferences
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/users/profile', {
        name: form.name,
        preferences: {
          bodyType: form.bodyType,
          stylePreference: form.stylePreference,
          skinTone: form.skinTone,
          hairColor: form.hairColor
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="profile-settings">
      <h1>Profile Settings</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" value={form.email} readOnly />
        </div>
        <div className="form-group">
          <label>Body Type</label>
          <input name="bodyType" value={form.bodyType || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Style Preference</label>
          <input name="stylePreference" value={form.stylePreference || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Skin Tone</label>
          <input name="skinTone" value={form.skinTone || ''} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Hair Color</label>
          <input name="hairColor" value={form.hairColor || ''} onChange={handleChange} />
        </div>
        <button className="btn-primary" type="submit">Save</button>
      </form>
    </div>
  );
};

export default ProfileSettings;
