/**
 * Footer Component
 * Reusable footer for all pages
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>🎯 Rejection Platform</h3>
          <p>Turn your setbacks into comebacks</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/dashboard" className="footer-link">Dashboard</Link>
          <Link to="/leaderboard" className="footer-link">Leaderboard</Link>
          <Link to="/wall" className="footer-link">Wall of Rejections</Link>
          <Link to="/analytics" className="footer-link">Analytics</Link>
        </div>
        
        <div className="footer-section">
          <h4>Community</h4>
          <Link to="/search" className="footer-link">Search Users</Link>
          <Link to="/profile" className="footer-link">Your Profile</Link>
          <a href="https://github.com/mcpeblocker/rejection.mcpeblocker.uz" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
        </div>
        
        <div className="footer-section">
          <h4>Support</h4>
          <a href="mailto:mcpeblocker@gmail.com" className="footer-link">Contact</a>
          <Link to="/" className="footer-link">About</Link>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 Rejection Platform. Built with 💜 by mcpeblocker</p>
        <p className="footer-quote">"The only real failure is giving up"</p>
      </div>
    </footer>
  );
}

export default Footer;
