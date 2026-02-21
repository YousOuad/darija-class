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

// Response interceptor: try token refresh on 401, then logout if that also fails
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('darijalingo_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token: newRefresh } = res.data;
          localStorage.setItem('darijalingo_token', access_token);
          localStorage.setItem('darijalingo_refresh_token', newRefresh);
          processQueue(null, access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch {
          processQueue(error);
        } finally {
          isRefreshing = false;
        }
      } else {
        isRefreshing = false;
      }

      // Refresh failed or no refresh token — log out
      localStorage.removeItem('darijalingo_token');
      localStorage.removeItem('darijalingo_refresh_token');
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
  deleteAccount: () => api.delete('/auth/me'),
  listUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
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
  sendOpenConversation: (data) => api.post('/ai/open-conversation', data),
};

// Flashcards endpoints
export const flashcardsAPI = {
  getMyDeck: () => api.get('/flashcards/my-deck'),
  create: (data) => api.post('/flashcards', data),
  delete: (id) => api.delete(`/flashcards/${id}`),
  getSuggestions: () => api.get('/flashcards/suggestions'),
  explore: () => api.get('/flashcards/explore'),
  copy: (id) => api.post(`/flashcards/${id}/copy`),
  getDueCards: () => api.get('/flashcards/due'),
  submitReview: (results) => api.post('/flashcards/review', { results }),
};

// Curriculum editor endpoints (teacher/admin only)
export const curriculumAPI = {
  getModules: () => api.get('/curriculum/modules'),
  getModule: (moduleId) => api.get(`/curriculum/modules/${moduleId}`),
  updateLesson: (lessonId, data) => api.put(`/curriculum/lessons/${lessonId}`, data),
  createLesson: (moduleId, data) => api.post(`/curriculum/modules/${moduleId}/lessons`, data),
  deleteLesson: (lessonId) => api.delete(`/curriculum/lessons/${lessonId}`),
};

export default api;
