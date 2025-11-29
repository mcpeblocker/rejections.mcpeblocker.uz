/**
 * User Search Component
 * Search for users by username (authenticated users only)
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../Layout/BackButton';
import Footer from '../Layout/Footer';
import './UserSearch.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function UserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  // Fetch suggested users on component mount
  React.useEffect(() => {
    fetchSuggestedUsers();
  }, []);

  const fetchSuggestedUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/suggested?limit=12`);
      const data = await response.json();
      
      if (response.ok && data.users) {
        setSuggestedUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch suggested users:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (query.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.users);
        setHasSearched(true);
        if (data.users.length === 0) {
          setError('No users found');
        }
      } else {
        setError(data.error || 'Failed to search');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="user-search-container">
      <BackButton />
      <div className="user-search-header">
        <h1>🔍 Find Other Rejection Warriors</h1>
        <p>Search for users and see their journey</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={loading}
          >
            {loading ? '⏳' : '🔍'} Search
          </button>
        </div>
      </form>

      {error && (
        <div className="search-error">
          {error}
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && hasSearched && (
          <motion.div 
            className="search-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <h2>Search Results ({results.length})</h2>
            <div className="user-grid">
              {results.map((user) => (
                <motion.div
                  key={user.id}
                  className="user-card"
                  onClick={() => handleUserClick(user.username)}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="user-avatar-circle">
                    <div className="avatar-emoji">
                      {getAvatarEmoji(user.avatarLevel)}
                    </div>
                  </div>
                  <div className="user-info">
                    <h3>{user.username}</h3>
                    <div className="user-stats-mini">
                      <span className="stat-badge">
                        🚀 Level {user.avatarLevel}
                      </span>
                      <span className="stat-badge">
                        🧱 {user.rejectionCount} rejections
                      </span>
                    </div>
                  </div>
                  <div className="view-profile-hint">
                    Click to view profile →
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Users - Show when no search has been performed */}
      {!hasSearched && suggestedUsers.length > 0 && (
        <motion.div 
          className="suggested-users"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="suggested-header">
            <h2>🌟 Top Rejection Warriors</h2>
            <p>Explore profiles of users ranked by their rejection count</p>
          </div>
          <div className="user-grid">
            {suggestedUsers.map((user, index) => (
              <motion.div
                key={user.id}
                className="user-card suggested-card"
                onClick={() => handleUserClick(user.username)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {index < 3 && (
                  <div className="rank-badge">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </div>
                )}
                <div className="user-avatar-circle">
                  <div className="avatar-emoji">
                    {getAvatarEmoji(user.avatarLevel)}
                  </div>
                </div>
                <div className="user-info">
                  <h3>{user.username}</h3>
                  {user.fullName && (
                    <p className="user-full-name">{user.fullName}</p>
                  )}
                  {user.bio && (
                    <p className="user-bio">{user.bio.substring(0, 60)}{user.bio.length > 60 ? '...' : ''}</p>
                  )}
                  <div className="user-stats-mini">
                    <span className="stat-badge">
                      🚀 Level {user.avatarLevel}
                    </span>
                    <span className="stat-badge highlight">
                      🧱 {user.rejectionCount} rejections
                    </span>
                  </div>
                </div>
                <div className="view-profile-hint">
                  Click to view profile →
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      <Footer />
    </div>
  );
}

// Helper function to get avatar emoji based on level
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

export default UserSearch;
