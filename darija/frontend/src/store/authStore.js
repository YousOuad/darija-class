import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('darijalingo_user') || 'null'),
  token: localStorage.getItem('darijalingo_token') || null,
  isAuthenticated: !!localStorage.getItem('darijalingo_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { access_token } = response.data;
      localStorage.setItem('darijalingo_token', access_token);
      set({ token: access_token, isAuthenticated: true });

      // Fetch user profile
      const meResponse = await authAPI.getMe();
      const user = meResponse.data;
      localStorage.setItem('darijalingo_user', JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (displayName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ display_name: displayName, email, password });
      const { access_token } = response.data;
      localStorage.setItem('darijalingo_token', access_token);
      set({ token: access_token, isAuthenticated: true });

      // Fetch user profile
      const meResponse = await authAPI.getMe();
      const user = meResponse.data;
      localStorage.setItem('darijalingo_user', JSON.stringify(user));
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('darijalingo_token');
    localStorage.removeItem('darijalingo_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  refreshToken: async () => {
    try {
      const response = await authAPI.refresh();
      const { access_token } = response.data;
      localStorage.setItem('darijalingo_token', access_token);
      set({ token: access_token });
    } catch {
      get().logout();
    }
  },

  fetchUser: async () => {
    try {
      const response = await authAPI.getMe();
      const user = response.data;
      localStorage.setItem('darijalingo_user', JSON.stringify(user));
      set({ user });
    } catch {
      // Silent fail - user will be redirected on 401
    }
  },

  clearError: () => set({ error: null }),

  // Mock login for demo purposes
  mockLogin: (name = 'Youssef') => {
    const mockUser = {
      id: 'demo-user-1',
      display_name: name,
      email: `${name.toLowerCase()}@demo.com`,
      level: 'B1',
      xp: 1250,
      streak: 7,
      created_at: new Date().toISOString(),
    };
    const mockToken = 'demo-token-12345';
    localStorage.setItem('darijalingo_token', mockToken);
    localStorage.setItem('darijalingo_user', JSON.stringify(mockUser));
    set({ user: mockUser, token: mockToken, isAuthenticated: true });
    return mockUser;
  },
}));

export default useAuthStore;
