/**
 * Profile Component
 * User profile and settings
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../../utils/api';
import Avatar from '../Avatar/Avatar';
import './Profile.css';

function Profile({ user, onLogout }) {
  const [profile, setProfile] = useState(user);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const [profileData, badgesData] = await Promise.all([
        userAPI.getProfile(),
        userAPI.getBadges()
      ]);

      if (!profileData.error) {
        setProfile(profileData);
      }

      if (!badgesData.error) {
        setBadges(badgesData.badges);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
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

      <div className="container profile-content">
        <motion.div
          className="profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="profile-title">👤 Your Profile</h1>
        </motion.div>

        <div className="profile-grid">
          {/* Avatar Section */}
          <motion.div 
            className="card profile-avatar-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Avatar 
              level={profile.avatarLevel} 
              rejectionCount={profile.rejectionCount}
            />
          </motion.div>

          {/* User Info */}
          <motion.div 
            className="card profile-info-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="card-title">📋 Profile Information</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Username</span>
                <span className="info-value">{profile.username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profile.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Avatar Level</span>
                <span className="info-value badge-level">Level {profile.avatarLevel}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Total Rejections</span>
                <span className="info-value badge-count">{profile.rejectionCount}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Badges Collection */}
          <motion.div 
            className="card profile-badges-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="card-title">🎖️ Your Badges ({badges.length})</h2>
            {badges.length > 0 ? (
              <div className="profile-badges-grid">
                {badges.map((badge) => (
                  <div key={badge.id} className="profile-badge-item">
                    <div className="profile-badge-icon">{badge.icon}</div>
                    <div className="profile-badge-name">{badge.name}</div>
                    <div className="profile-badge-date">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-badges">
                <p>No badges yet! 🎯</p>
                <p className="empty-hint">Keep logging rejections to earn badges.</p>
              </div>
            )}
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            className="card profile-stats-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="card-title">📊 Quick Stats</h2>
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-icon">🎯</div>
                <div className="profile-stat-value">{profile.rejectionCount}</div>
                <div className="profile-stat-label">Rejections</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-icon">🏆</div>
                <div className="profile-stat-value">{profile.avatarLevel}</div>
                <div className="profile-stat-label">Level</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-icon">🎖️</div>
                <div className="profile-stat-value">{badges.length}</div>
                <div className="profile-stat-label">Badges</div>
              </div>
            </div>
          </motion.div>

          {/* Settings & Actions */}
          <motion.div 
            className="card profile-actions-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="card-title">⚙️ Settings</h2>
            <div className="actions-list">
              <Link to="/dashboard" className="action-item">
                <span className="action-icon">🏠</span>
                <span className="action-text">Back to Dashboard</span>
              </Link>
              <Link to="/analytics" className="action-item">
                <span className="action-icon">📈</span>
                <span className="action-text">View Analytics</span>
              </Link>
              <div className="action-divider"></div>
              <button onClick={onLogout} className="action-item action-logout">
                <span className="action-icon">🚪</span>
                <span className="action-text">Logout</span>
              </button>
            </div>
            
            {/* Future Feature Placeholders */}
            <div className="future-features">
              <h3>🔮 Coming Soon</h3>
              <ul>
                <li>✉️ Gmail Integration for auto-detection</li>
                <li>🤖 AI-powered reflection suggestions</li>
                <li>👥 Connect with other users</li>
                <li>🎨 Custom avatar customization</li>
                <li>📧 Email notifications & reminders</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
