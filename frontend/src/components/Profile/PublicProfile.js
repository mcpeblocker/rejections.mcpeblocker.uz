/**
 * Public Profile Component
 * Displays a user's public profile (accessible without authentication)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackButton from '../Layout/BackButton';
import Footer from '../Layout/Footer';
import './PublicProfile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    fetchPublicProfile();
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/public/${username}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="public-profile-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-error">
        <div className="error-icon">😕</div>
        <h2>{error}</h2>
        <button onClick={() => navigate('/')} className="btn-primary">
          Go to Home
        </button>
      </div>
    );
  }

  const { user, badges, stats } = profile;
  const memberDays = Math.floor((new Date() - new Date(user.memberSince)) / (1000 * 60 * 60 * 24));

  return (
    <div className="public-profile-container">
      <BackButton to="/leaderboard" label="← Back to Leaderboard" />
      {/* Hero Section */}
      <motion.div 
        className="profile-hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-header">
          <motion.div 
            className="profile-avatar-large"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {getAvatarEmoji(user.avatarLevel)}
          </motion.div>
          
          <div className="profile-info">
            <h1 className="profile-username">{user.username}</h1>
            <div className="profile-level">
              Level {user.avatarLevel} Rejection Warrior
            </div>
            <div className="profile-member-since">
              Member for {memberDays} days
            </div>
          </div>
        </div>

        {!isAuthenticated && (
          <motion.div 
            className="cta-banner"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p>Inspired by {user.username}'s journey?</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn-cta">
                🚀 Start Your Journey
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Section */}
      <motion.div 
        className="stats-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="section-title">📊 Journey Stats</h2>
        
        <div className="stats-grid">
          <motion.div 
            className="stat-card-large"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">🧱</div>
            <div className="stat-value">{stats.totalRejections}</div>
            <div className="stat-label">Total Rejections</div>
          </motion.div>

          <motion.div 
            className="stat-card-large"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.typesCount}</div>
            <div className="stat-label">Types Explored</div>
          </motion.div>

          <motion.div 
            className="stat-card-large"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{badges.length}</div>
            <div className="stat-label">Badges Earned</div>
          </motion.div>

          <motion.div 
            className="stat-card-large"
            whileHover={{ scale: 1.05 }}
          >
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{user.avatarLevel}</div>
            <div className="stat-label">Current Level</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Rejection Types Breakdown */}
      {stats.byType && stats.byType.length > 0 && (
        <motion.div 
          className="types-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="section-title">📈 Rejection Breakdown</h2>
          
          <div className="types-chart">
            {stats.byType.map((type, index) => {
              const percentage = (type.count / stats.totalRejections) * 100;
              return (
                <motion.div 
                  key={type.rejection_type}
                  className="type-bar"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <div className="type-info">
                    <span className="type-name">
                      {formatRejectionType(type.rejection_type)}
                    </span>
                    <span className="type-count">{type.count}</span>
                  </div>
                  <div className="type-progress">
                    <motion.div 
                      className="type-progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.8 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Badges Section */}
      {badges.length > 0 && (
        <motion.div 
          className="badges-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="section-title">🏅 Badges Collection</h2>
          
          <div className="badges-grid">
            {badges.map((badge, index) => (
              <motion.div
                key={index}
                className="badge-card"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="badge-icon">{badge.badge_icon || '🏆'}</div>
                <div className="badge-name">{badge.badge_name}</div>
                <div className="badge-date">
                  {new Date(badge.unlocked_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bottom CTA */}
      {!isAuthenticated && (
        <motion.div 
          className="bottom-cta"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2>Ready to Track Your Own Journey?</h2>
          <p>Join {user.username} and thousands of others turning rejections into growth</p>
          <Link to="/signup" className="btn-cta-large">
            Create Free Account 🎯
          </Link>
        </motion.div>
      )}

      {isAuthenticated && (
        <motion.div 
          className="authenticated-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link to="/dashboard" className="btn-secondary">
            ← Back to Dashboard
          </Link>
          <Link to="/search" className="btn-secondary">
            🔍 Search More Users
          </Link>
        </motion.div>
      )}
      <Footer />
    </div>
  );
}

// Helper functions
function getAvatarEmoji(level) {
  if (level <= 1) return '🐣';
  if (level <= 2) return '🐥';
  if (level <= 3) return '🐶';
  if (level <= 4) return '🐺';
  if (level <= 5) return '🦊';
  if (level <= 6) return '🦄';
  if (level <= 7) return '🦁';
  if (level <= 8) return '🐉';
  if (level <= 9) return '🚀';
  return '👑';
}

function formatRejectionType(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export default PublicProfile;
