/**
 * BackButton Component
 * Navigate back to dashboard
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

function BackButton({ to = '/dashboard', label = '← Back to Dashboard' }) {
  const navigate = useNavigate();

  return (
    <button 
      className="back-button"
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );
}

export default BackButton;
