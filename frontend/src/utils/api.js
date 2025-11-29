/**
 * API utility functions
 * Centralized API calls with authentication
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Auth APIs
export const authAPI = {
  signup: async (username, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  updateAvatar: async (avatarLevel, avatarImage) => {
    const response = await fetch(`${API_URL}/api/users/avatar`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatarLevel, avatarImage })
    });
    return response.json();
  },

  getLeaderboard: async (limit = 10) => {
    const response = await fetch(`${API_URL}/api/users/list/leaderboard?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getBadges: async () => {
    const response = await fetch(`${API_URL}/api/users/badges/list`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Rejection APIs
export const rejectionAPI = {
  create: async (rejectionData) => {
    const response = await fetch(`${API_URL}/api/rejections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(rejectionData)
    });
    return response.json();
  },

  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/api/rejections?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/api/rejections/${id}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  update: async (id, rejectionData) => {
    const response = await fetch(`${API_URL}/api/rejections/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(rejectionData)
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/api/rejections/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Analytics APIs
export const analyticsAPI = {
  getStats: async () => {
    const response = await fetch(`${API_URL}/api/analytics/stats`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getInsights: async () => {
    const response = await fetch(`${API_URL}/api/analytics/insights`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

export default {
  authAPI,
  userAPI,
  rejectionAPI,
  analyticsAPI
};
