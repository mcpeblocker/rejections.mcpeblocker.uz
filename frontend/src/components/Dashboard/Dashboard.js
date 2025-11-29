/**
 * Dashboard Component
 * Main hub showing avatar, stats, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { userAPI, rejectionAPI, analyticsAPI } from '../../utils/api';
import Avatar from '../Avatar/Avatar';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(user);
  const [recentRejections, setRecentRejections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, rejectionsData, statsData] = await Promise.all([
        userAPI.getProfile(),
        rejectionAPI.getAll({ limit: 5 }),
        analyticsAPI.getStats()
      ]);

      if (!profileData.error) {
        setProfile(profileData);
        // Update local storage
        localStorage.setItem('user', JSON.stringify(profileData));
      }

      if (!rejectionsData.error) {
        setRecentRejections(rejectionsData.rejections);
      }

      if (!statsData.error) {
        setStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/dashboard" className="logo">🎯 Rejection Platform</Link>
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/log-rejection" className="nav-link">Log Rejection</Link>
            <Link to="/wall" className="nav-link">Wall of Rejections</Link>
            <Link to="/analytics" className="nav-link">Analytics</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={onLogout} className="btn btn-secondary btn-sm">Logout</button>
          </nav>
        </div>
      </header>

      <div className="container dashboard-content">
        {/* Welcome Section */}
        <motion.div 
          className="welcome-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="welcome-title">Welcome back, {profile.username}! 🎮</h1>
          <p className="welcome-subtitle">Keep pushing boundaries and growing stronger!</p>
        </motion.div>

        <div className="dashboard-grid">
          {/* Avatar Card */}
          <motion.div 
            className="card avatar-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="card-title">Your Avatar</h2>
            <Avatar 
              level={profile.avatarLevel} 
              rejectionCount={profile.rejectionCount}
              onCelebration={triggerCelebration}
            />
            <div className="avatar-info">
              <div className="stat-item">
                <span className="stat-label">Level</span>
                <span className="stat-value">{profile.avatarLevel}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rejections</span>
                <span className="stat-value">{profile.rejectionCount}</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(profile.rejectionCount % 10) * 10}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {10 - (profile.rejectionCount % 10)} more rejections to level {profile.avatarLevel + 1}!
            </p>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div 
            className="card stats-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="card-title">Quick Stats 📊</h2>
            {stats ? (
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <span className="quick-stat-icon">🎯</span>
                  <div>
                    <div className="quick-stat-value">{stats.total}</div>
                    <div className="quick-stat-label">Total Rejections</div>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-icon">📅</span>
                  <div>
                    <div className="quick-stat-value">{stats.last30Days}</div>
                    <div className="quick-stat-label">Last 30 Days</div>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-icon">🏆</span>
                  <div>
                    <div className="quick-stat-value">{stats.milestones?.length || 0}</div>
                    <div className="quick-stat-label">Milestones</div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading stats...</p>
            )}
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div 
            className="card actions-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="card-title">Quick Actions ⚡</h2>
            <div className="action-buttons">
              <Link to="/log-rejection" className="btn btn-primary btn-block">
                📝 Log New Rejection
              </Link>
              <Link to="/wall" className="btn btn-secondary btn-block">
                🧱 View Wall of Rejections
              </Link>
              <Link to="/analytics" className="btn btn-success btn-block">
                📈 View Analytics
              </Link>
            </div>
          </motion.div>

          {/* Recent Rejections Card */}
          <motion.div 
            className="card recent-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="card-title">Recent Rejections 📜</h2>
            {recentRejections.length > 0 ? (
              <div className="recent-list">
                {recentRejections.map((rejection) => (
                  <div key={rejection.id} className="recent-item">
                    <div className="recent-icon">
                      {rejection.rejectionType === 'Job Application' && '💼'}
                      {rejection.rejectionType === 'Pitch/Proposal' && '💡'}
                      {rejection.rejectionType === 'Dating' && '💕'}
                      {rejection.rejectionType === 'Opportunity' && '🚀'}
                      {!['Job Application', 'Pitch/Proposal', 'Dating', 'Opportunity'].includes(rejection.rejectionType) && '🎯'}
                    </div>
                    <div className="recent-info">
                      <div className="recent-title">{rejection.title}</div>
                      <div className="recent-meta">
                        {rejection.rejectionType} • {new Date(rejection.rejectionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="emoji" style={{ fontSize: '3em' }}>🎯</p>
                <p>No rejections logged yet!</p>
                <p style={{ fontSize: '14px', color: '#666' }}>Start your journey by logging your first rejection.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Motivational Footer */}
        <motion.div 
          className="motivation-banner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="motivation-text">
            "Every rejection is a redirection to something better." 💪✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
