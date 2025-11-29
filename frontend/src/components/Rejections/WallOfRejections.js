/**
 * Wall of Rejections Component
 * Interactive 2.5D wall displaying all rejections
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { rejectionAPI } from '../../utils/api';
import BackButton from '../Layout/BackButton';
import Footer from '../Layout/Footer';
import './WallOfRejections.css';

function WallOfRejections({ user }) {
  const [rejections, setRejections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRejection, setSelectedRejection] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRejections();
  }, [filter]);

  const fetchRejections = async () => {
    try {
      const filters = filter !== 'all' ? { type: filter } : {};
      const data = await rejectionAPI.getAll(filters);
      
      if (!data.error) {
        setRejections(data.rejections);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch rejections:', error);
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Job Application': '💼',
      'Pitch/Proposal': '💡',
      'Dating': '💕',
      'Opportunity': '🚀',
      'Academic': '📚',
      'Creative Submission': '🎨',
      'Business Venture': '💰',
      'Other': '🎯'
    };
    return icons[type] || '🎯';
  };

  const getTypeColor = (type) => {
    const colors = {
      'Job Application': '#667eea',
      'Pitch/Proposal': '#f093fb',
      'Dating': '#fa709a',
      'Opportunity': '#30cfd0',
      'Academic': '#a8edea',
      'Creative Submission': '#fed6e3',
      'Business Venture': '#ffd89b',
      'Other': '#c3cfe2'
    };
    return colors[type] || '#c3cfe2';
  };

  const uniqueTypes = [...new Set(rejections.map(r => r.rejectionType))];

  return (
    <div className="wall-container">
      <BackButton />
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

      <div className="container wall-content">
        <motion.div
          className="wall-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="wall-title">🧱 Your Wall of Rejections</h1>
          <p className="wall-subtitle">Each brick represents growth and resilience!</p>
        </motion.div>

        {/* Filter Bar */}
        <motion.div 
          className="filter-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({rejections.length})
          </button>
          {uniqueTypes.map((type) => (
            <button 
              key={type}
              className={`filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
            >
              {getTypeIcon(type)} {type}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="spinner"></div>
        ) : rejections.length === 0 ? (
          <motion.div 
            className="empty-wall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="empty-icon">🎯</div>
            <h2>No rejections yet!</h2>
            <p>Start building your wall of growth by logging your first rejection.</p>
            <Link to="/log-rejection" className="btn btn-primary">
              Log Your First Rejection
            </Link>
          </motion.div>
        ) : (
          <>
            {/* The Wall */}
            <div className="wall-grid">
              {rejections.map((rejection, index) => (
                <motion.div
                  key={rejection.id}
                  className="brick"
                  style={{ 
                    background: `linear-gradient(135deg, ${getTypeColor(rejection.rejectionType)}80, ${getTypeColor(rejection.rejectionType)})`,
                  }}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.05,
                    type: "spring"
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: 10,
                    zIndex: 10,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
                  }}
                  onClick={() => setSelectedRejection(rejection)}
                >
                  <div className="brick-icon">{getTypeIcon(rejection.rejectionType)}</div>
                  <div className="brick-title">{rejection.title}</div>
                  <div className="brick-date">
                    {new Date(rejection.rejectionDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="brick-hover-text">Click for details</div>
                </motion.div>
              ))}
            </div>

            {/* Stats Footer */}
            <motion.div 
              className="wall-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="stat-card">
                <div className="stat-icon">🏗️</div>
                <div className="stat-info">
                  <div className="stat-number">{rejections.length}</div>
                  <div className="stat-label">Total Bricks</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎨</div>
                <div className="stat-info">
                  <div className="stat-number">{uniqueTypes.length}</div>
                  <div className="stat-label">Types</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💪</div>
                <div className="stat-info">
                  <div className="stat-number">100%</div>
                  <div className="stat-label">Resilience</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRejection && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRejection(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  {getTypeIcon(selectedRejection.rejectionType)} {selectedRejection.title}
                </h2>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedRejection(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <strong>Type:</strong>
                  <span className="detail-badge" style={{ background: getTypeColor(selectedRejection.rejectionType) }}>
                    {selectedRejection.rejectionType}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>
                  <span>{new Date(selectedRejection.rejectionDate).toLocaleDateString()}</span>
                </div>
                {selectedRejection.notes && (
                  <div className="detail-section">
                    <strong>Notes:</strong>
                    <p>{selectedRejection.notes}</p>
                  </div>
                )}
                {selectedRejection.reflection && (
                  <div className="detail-section">
                    <strong>Your Reflection:</strong>
                    <p className="reflection-text">{selectedRejection.reflection}</p>
                  </div>
                )}
                <div className="detail-footer">
                  <small>Logged on {new Date(selectedRejection.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

export default WallOfRejections;
