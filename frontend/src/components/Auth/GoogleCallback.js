/**
 * Google OAuth Callback Handler
 * Processes the OAuth callback and logs the user in
 */

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function GoogleCallback({ onLogin }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const userJson = searchParams.get('user');

    if (token && userJson) {
      try {
        const user = JSON.parse(decodeURIComponent(userJson));
        
        // Sync local rejections if any exist
        syncLocalRejections(token).then(() => {
          onLogin(token, user);
          navigate('/dashboard');
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        navigate('/login?error=invalid_callback');
      }
    } else {
      navigate('/login?error=missing_token');
    }
  }, [searchParams, navigate, onLogin]);

  // Sync local rejections after Google OAuth login
  const syncLocalRejections = async (token) => {
    const localRejections = JSON.parse(localStorage.getItem('localRejections') || '[]');
    
    if (localRejections.length === 0) return;
    
    try {
      const { rejectionAPI } = await import('../../utils/api');
      
      // Temporarily set token for API calls
      localStorage.setItem('token', token);
      
      for (const rejection of localRejections) {
        await rejectionAPI.create({
          title: rejection.title,
          rejection_type: rejection.rejection_type,
          rejection_date: rejection.rejection_date,
          notes: rejection.notes || '',
          source: 'pre-google-login'
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontSize: '1.5rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔄</div>
        <div>Processing Google Sign-In...</div>
      </div>
    </div>
  );
}

export default GoogleCallback;
