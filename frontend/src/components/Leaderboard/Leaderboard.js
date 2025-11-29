/**
 * Leaderboard Component
 * Displays top users ranked by rejection count
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackButton from '../Layout/BackButton';
import Footer from '../Layout/Footer';
import './Leaderboard.css';

function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, week, month

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/users/leaderboard?period=${filter}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Leaderboard fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <BackButton to="/" label="← Back to Home" />
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <BackButton to="/" label="← Back to Home" />
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchLeaderboard} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <BackButton to="/" label="← Back to Home" />
      <div className="leaderboard-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="leaderboard-title">
            🏆 Rejection Warriors Leaderboard
          </h1>
          <p className="leaderboard-subtitle">
            Celebrating those who turn rejections into success stories
          </p>
        </motion.div>

        <motion.div 
          className="filter-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Time
          </button>
          <button
            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            This Week
          </button>
        </motion.div>
      </div>

      <div className="leaderboard-content">
        {users.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="empty-emoji">📊</p>
            <h3>No users yet</h3>
            <p>Be the first to start tracking rejections!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </button>
          </motion.div>
        ) : (
          <div className="leaderboard-grid">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                className={`leaderboard-card ${getRankClass(index + 1)}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => navigate(`/profile/${user.username}`)}
              >
                <div className="rank-badge">
                  {getRankEmoji(index + 1)}
                </div>
                
                <div className="user-info">
                  <div className="user-avatar">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div className="user-details">
                    <h3 className="user-name">{user.full_name || user.username}</h3>
                    <p className="user-username">@{user.username}</p>
                  </div>
                </div>

                <div className="user-stats">
                  <div className="stat-item">
                    <span className="stat-number">{user.rejection_count || 0}</span>
                    <span className="stat-label">Rejections</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-number">{user.success_count || 0}</span>
                    <span className="stat-label">Successes</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="user-bio">{user.bio}</p>
                )}

                <div className="card-footer">
                  <span className="view-profile">View Profile →</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <motion.div 
        className="leaderboard-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>
          Want to see your name here? 
          <button 
            className="link-btn"
            onClick={() => navigate('/')}
          >
            Start tracking rejections
          </button>
        </p>
      </motion.div>
      <Footer />
    </div>
  );
}

export default Leaderboard;
