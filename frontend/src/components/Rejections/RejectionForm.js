/**
 * Rejection Form Component
 * Form to log new rejections with validation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { rejectionAPI } from '../../utils/api';
import './RejectionForm.css';

function RejectionForm({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    rejectionType: 'Job Application',
    rejectionDate: new Date().toISOString().split('T')[0],
    notes: '',
    reflection: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [milestones, setMilestones] = useState([]);

  const rejectionTypes = [
    'Job Application',
    'Pitch/Proposal',
    'Dating',
    'Opportunity',
    'Academic',
    'Creative Submission',
    'Business Venture',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await rejectionAPI.create(formData);

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess(true);
        setMilestones(data.milestones || []);
        
        // Reset form after 2 seconds
        setTimeout(() => {
          setFormData({
            title: '',
            rejectionType: 'Job Application',
            rejectionDate: new Date().toISOString().split('T')[0],
            notes: '',
            reflection: ''
          });
          setSuccess(false);
          setMilestones([]);
        }, 3000);
      }
    } catch (err) {
      setError('Failed to log rejection. Please try again.');
      console.error('Create rejection error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rejection-form-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/dashboard" className="logo">🎯 Rejection Platform</Link>
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/log-rejection" className="nav-link">Log Rejection</Link>
            <Link to="/wall" className="nav-link">Wall of Rejections</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
          </nav>
        </div>
      </header>

      <div className="container">
        <motion.div 
          className="form-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="form-header">
            <h1 className="form-title">📝 Log a Rejection</h1>
            <p className="form-subtitle">Every rejection is a badge of courage! 💪</p>
          </div>

          {success && (
            <motion.div 
              className="alert alert-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              🎉 Rejection logged successfully! You're growing stronger!
              {milestones.length > 0 && (
                <div className="milestone-alerts">
                  {milestones.map((m, i) => (
                    <div key={i} className="milestone-badge">
                      {m.icon} {m.badge} - {m.name}!
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="rejection-form">
            <div className="form-group">
              <label htmlFor="title">Rejection Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                placeholder="e.g., Software Engineer at TechCorp"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength="255"
              />
            </div>

            <div className="form-group">
              <label htmlFor="rejectionType">Type of Rejection *</label>
              <select
                id="rejectionType"
                name="rejectionType"
                className="form-control"
                value={formData.rejectionType}
                onChange={handleChange}
                required
              >
                {rejectionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="rejectionDate">Date *</label>
              <input
                type="date"
                id="rejectionDate"
                name="rejectionDate"
                className="form-control"
                value={formData.rejectionDate}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (Optional)</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                placeholder="What happened? Any context you want to remember..."
                value={formData.notes}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="reflection">Your Reflection (Optional)</label>
              <textarea
                id="reflection"
                name="reflection"
                className="form-control"
                placeholder="What did you learn? How do you feel? What's your next step?"
                value={formData.reflection}
                onChange={handleChange}
                rows="4"
              ></textarea>
              <small className="form-hint">
                💡 Taking a moment to reflect helps turn rejection into growth
              </small>
            </div>

            {/* TODO: AI Reflection Suggestion */}
            <div className="ai-placeholder">
              <div className="ai-icon">🤖</div>
              <div>
                <strong>AI-Powered Reflection</strong>
                <p>Coming soon! AI will help you gain insights from your rejections.</p>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Logging...' : '🎯 Log This Rejection'}
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>

          <div className="form-footer">
            <p className="motivation-quote">
              "I have not failed. I've just found 10,000 ways that won't work." - Thomas Edison
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default RejectionForm;
