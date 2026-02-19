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
  updateProfile: (data) => api.put('/auth/me', data),
};

// Lessons endpoints
export const lessonsAPI = {
  list: (params) => api.get('/lessons', { params }),
  getById: (id) => api.get(`/lessons/${id}`),
  complete: (id, score) => api.post(`/lessons/${id}/complete`, { score }),
  getRecommended: () => api.get('/lessons/recommended'),
};

// Games endpoints
export const gamesAPI = {
  getSession: () => api.get('/games/session'),
  submitResult: (gameType, data) => api.post(`/games/${gameType}/submit`, data),
};

// Progress endpoints
export const progressAPI = {
  getSummary: () => api.get('/progress'),
  getWeaknesses: () => api.get('/progress/weaknesses'),
  getRecentActivity: (limit = 10) => api.get(`/progress/recent-activity?limit=${limit}`),
};

// Leaderboard endpoints
export const leaderboardAPI = {
  get: (period = 'weekly') => api.get(`/leaderboard?period=${period}`),
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
