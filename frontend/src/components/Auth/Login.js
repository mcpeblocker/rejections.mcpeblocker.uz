/**
 * Login Component
 * User authentication with playful design
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import GoogleButton from './GoogleButton';
import './Auth.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authAPI.login(email, password);
      
      if (data.error) {
        setError(data.error);
      } else {
        onLogin(data.token, data.user);
        
        // Sync local rejections if any exist
        await syncLocalRejections(data.token);
        
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync local rejections after login
  const syncLocalRejections = async (token) => {
    const localRejections = JSON.parse(localStorage.getItem('localRejections') || '[]');
    
    if (localRejections.length === 0) return;
    
    try {
      const { rejectionAPI } = await import('../../utils/api');
      
      for (const rejection of localRejections) {
        await rejectionAPI.create({
          title: rejection.title,
          rejection_type: rejection.rejection_type,
          rejection_date: rejection.rejection_date,
          notes: rejection.notes || '',
          source: 'pre-login'
        });
      }
      
      // Clear local rejections after successful sync
      localStorage.removeItem('localRejections');
      console.log(`Synced ${localRejections.length} local rejections to account`);
    } catch (err) {
      console.error('Failed to sync local rejections:', err);
      // Don't fail login if sync fails
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1 className="auth-title">🎯 Welcome Back!</h1>
          <p className="auth-subtitle">Log in to continue your growth journey</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <GoogleButton text="Sign in with Google" />
          
          <div className="divider">
            <span>or</span>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login 🚀'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/signup" className="auth-link">Sign up here!</Link>
          </p>
        </div>

        <div className="auth-emoji-decoration">
          <span className="emoji">🎮</span>
          <span className="emoji">💪</span>
          <span className="emoji">🌟</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
