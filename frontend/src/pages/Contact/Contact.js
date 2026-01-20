import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Footer from '../../components/Footer/Footer';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/contact`,
        formData
      );

      if (response.data.success) {
        toast.success('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="contact-page">
        <div className="contact-container">
          <div className="contact-header">
            <h1>Contact Us</h1>
            <p>Have questions? We'd love to hear from you.</p>
          </div>

          <div className="contact-content">
            <div className="contact-info">
              <h3>Get in Touch</h3>
              <p>
                Whether you have questions about our AI fashion services, need 
                technical support, or want to provide feedback, our team is here 
                to help.
              </p>
              <div className="info-items">
                <div className="info-item">
                  <h4>Email</h4>
                  <p>support@okfashion.me</p>
                </div>
                <div className="info-item">
                  <h4>Response Time</h4>
                  <p>Within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Your message..."
                    rows="5"
                    disabled={loading}
                  ></textarea>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
