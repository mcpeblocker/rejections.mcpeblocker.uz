/**
 * Main App component
 * Handles routing and authentication state
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Landing from './components/Landing/Landing';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import GoogleCallback from './components/Auth/GoogleCallback';
import Dashboard from './components/Dashboard/Dashboard';
import RejectionForm from './components/Rejections/RejectionForm';
import WallOfRejections from './components/Rejections/WallOfRejections';
import Analytics from './components/Analytics/Analytics';
import Profile from './components/Profile/Profile';
import UserSearch from './components/Profile/UserSearch';
import PublicProfile from './components/Profile/PublicProfile';
import Leaderboard from './components/Leaderboard/Leaderboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in (has token)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Signup onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/auth/google/callback" 
            element={<GoogleCallback onLogin={handleLogin} />} 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/log-rejection" 
            element={
              isAuthenticated ? 
              <RejectionForm user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/wall" 
            element={
              isAuthenticated ? 
              <WallOfRejections user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/analytics" 
            element={
              isAuthenticated ? 
              <Analytics user={user} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
              <Profile user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/search" 
            element={
              isAuthenticated ? 
              <UserSearch /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/profile/:username" 
            element={<PublicProfile />} 
          />
          <Route 
            path="/leaderboard" 
            element={<Leaderboard />} 
          />
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
