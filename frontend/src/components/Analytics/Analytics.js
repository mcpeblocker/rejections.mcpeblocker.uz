/**
 * Analytics Component
 * Shows statistics and insights about rejections
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { analyticsAPI, userAPI } from '../../utils/api';
import BackButton from '../Layout/BackButton';
import Footer from '../Layout/Footer';
import './Analytics.css';

function Analytics({ user }) {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, insightsData, badgesData] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getInsights(),
        userAPI.getBadges()
      ]);

      if (!statsData.error) setStats(statsData);
      if (!insightsData.error) setInsights(insightsData);
      if (!badgesData.error) setBadges(badgesData.badges);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
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

      <div className="container analytics-content">
        <motion.div
          className="analytics-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="analytics-title">📊 Your Analytics</h1>
          <p className="analytics-subtitle">Insights into your growth journey</p>
        </motion.div>

        <div className="analytics-grid">
          {/* Summary Stats */}
          <motion.div 
            className="card summary-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="card-title">📈 Summary</h2>
            {stats && (
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-icon">🎯</div>
                  <div className="summary-value">{stats.total}</div>
                  <div className="summary-label">Total Rejections</div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">📅</div>
                  <div className="summary-value">{stats.last30Days}</div>
                  <div className="summary-label">Last 30 Days</div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">🏆</div>
                  <div className="summary-value">{stats.milestones?.length || 0}</div>
                  <div className="summary-label">Milestones</div>
                </div>
                <div className="summary-item">
                  <div className="summary-icon">🎨</div>
                  <div className="summary-value">{stats.byType?.length || 0}</div>
                  <div className="summary-label">Categories</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* By Type */}
          <motion.div 
            className="card type-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="card-title">📊 Rejections by Type</h2>
            {stats && stats.byType && stats.byType.length > 0 ? (
              <div className="type-list">
                {stats.byType.map((item, index) => (
                  <div key={index} className="type-item">
                    <div className="type-header">
                      <span className="type-name">{item.type}</span>
                      <span className="type-count">{item.count}</span>
                    </div>
                    <div className="type-bar">
                      <div 
                        className="type-fill"
                        style={{ 
                          width: `${(item.count / stats.total) * 100}%`,
                          background: `hsl(${index * 40}, 70%, 60%)`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No data yet. Start logging rejections!</p>
            )}
          </motion.div>

          {/* Monthly Trend */}
          <motion.div 
            className="card monthly-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="card-title">📅 Monthly Activity</h2>
            {stats && stats.byMonth && stats.byMonth.length > 0 ? (
              <div className="monthly-list">
                {stats.byMonth.map((item, index) => (
                  <div key={index} className="monthly-item">
                    <span className="monthly-month">{item.month}</span>
                    <div className="monthly-bar-container">
                      <div 
                        className="monthly-bar"
                        style={{ 
                          width: `${(item.count / Math.max(...stats.byMonth.map(m => m.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="monthly-count">{item.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No monthly data available yet.</p>
            )}
          </motion.div>

          {/* Milestones */}
          <motion.div 
            className="card milestones-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="card-title">🏆 Milestones Achieved</h2>
            {stats && stats.milestones && stats.milestones.length > 0 ? (
              <div className="milestones-list">
                {stats.milestones.map((milestone, index) => (
                  <div key={index} className="milestone-item">
                    <div className="milestone-icon">{milestone.icon}</div>
                    <div className="milestone-info">
                      <div className="milestone-badge">{milestone.badge}</div>
                      <div className="milestone-type">{milestone.type}</div>
                      <div className="milestone-date">
                        {new Date(milestone.achievedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-message">
                <p>No milestones yet!</p>
                <p className="empty-hint">Keep logging rejections to unlock achievements 🎯</p>
              </div>
            )}
          </motion.div>

          {/* Badges */}
          <motion.div 
            className="card badges-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="card-title">🎖️ Badges Earned</h2>
            {badges.length > 0 ? (
              <div className="badges-grid">
                {badges.map((badge) => (
                  <div key={badge.id} className="badge-item">
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-name">{badge.name}</div>
                    <div className="badge-description">{badge.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No badges earned yet. Keep going! 💪</p>
            )}
          </motion.div>

          {/* AI Insights */}
          <motion.div 
            className="card insights-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="card-title">🤖 Insights</h2>
            {insights && insights.insights && insights.insights.length > 0 ? (
              <div className="insights-list">
                {insights.insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-icon">
                      {insight.type === 'pattern' && '🔍'}
                      {insight.type === 'achievement' && '🎉'}
                      {insight.type === 'suggestion' && '💡'}
                    </div>
                    <p className="insight-message">{insight.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Building insights... Log more rejections!</p>
            )}
            {insights && insights.note && (
              <div className="ai-note">
                <div className="ai-note-icon">🤖</div>
                <p>{insights.note}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Analytics;
