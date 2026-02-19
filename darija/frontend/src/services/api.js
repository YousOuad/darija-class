import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || '';
const cleanUrl = rawUrl ? rawUrl.replace(/\/+$/, '') : '';
const API_BASE_URL = !cleanUrl
  ? '/api'
  : cleanUrl.endsWith('/api')
    ? cleanUrl
    : `${cleanUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('darijalingo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('darijalingo_token');
      // Don't redirect demo users — let the calling code handle the error
      if (token && token.startsWith('demo-')) {
        return Promise.reject(error);
      }
      localStorage.removeItem('darijalingo_token');
      localStorage.removeItem('darijalingo_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
};

// Lessons endpoints
export const lessonsAPI = {
  list: (params) => api.get('/lessons', { params }),
  getById: (id) => api.get(`/lessons/${id}`),
  complete: (id) => api.post(`/lessons/${id}/complete`),
};

// Games endpoints
export const gamesAPI = {
  getSession: () => api.get('/games/session'),
  submitResult: (data) => api.post('/games/result', data),
};

// Progress endpoints
export const progressAPI = {
  getSummary: () => api.get('/progress/summary'),
  getWeaknesses: () => api.get('/progress/weaknesses'),
};

// Leaderboard endpoints
export const leaderboardAPI = {
  get: (period = 'weekly') => api.get(`/leaderboard?period=${period}`),
};

// Badges endpoints
export const badgesAPI = {
  list: () => api.get('/badges'),
};

// User endpoints
export const userAPI = {
  getStreak: () => api.get('/user/streak'),
  updateSettings: (data) => api.put('/user/settings', data),
};

// AI endpoints
export const aiAPI = {
  sendConversation: (data) => api.post('/ai/conversation', data),
};

export default api;
