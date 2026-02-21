import { create } from 'zustand';
import { progressAPI } from '../services/api';

const useProgressStore = create((set) => ({
  xp: 0,
  level: 1,
  streak: 0,
  badges: [],
  weaknesses: [],
  skills: {
    vocabulary: 0,
    grammar: 0,
    phrases: 0,
    culture: 0,
    conversation: 0,
  },
  xpHistory: [],
  lessonsCompleted: 0,
  gamesPlayed: 0,
  isLoading: false,

  fetchProgress: async () => {
    set({ isLoading: true });
    try {
      const response = await progressAPI.getSummary();
      const d = response.data;
      set({
        xp: d.total_xp || 0,
        level: Math.floor((d.total_xp || 0) / 500) + 1,
        streak: d.current_streak || 0,
        lessonsCompleted: d.total_lessons_completed || 0,
        gamesPlayed: d.total_games_played || 0,
        badges: d.badges || [],
        xpHistory: d.xp_history || [],
        skills: d.skills || { vocabulary: 0, grammar: 0, phrases: 0, culture: 0, conversation: 0 },
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      set({ isLoading: false });
    }
  },

  fetchWeaknesses: async () => {
    try {
      const response = await progressAPI.getWeaknesses();
      const weaknesses = (response.data || []).map((w) => ({
        area: w.skill_area,
        score: Math.max(0, 100 - w.error_count * 5),
        suggestion: `Practice ${w.skill_area} exercises`,
      }));
      set({ weaknesses });
    } catch (error) {
      console.error('Failed to fetch weaknesses:', error);
    }
  },

  updateXP: (amount) => {
    set((state) => ({
      xp: state.xp + amount,
      level: Math.floor((state.xp + amount) / 500) + 1,
    }));
  },

  addBadge: (badge) => {
    set((state) => ({
      badges: state.badges.map((b) =>
        b.id === badge.id ? { ...b, earned: true, earned_at: new Date().toISOString() } : b
      ),
    }));
  },

  incrementStreak: () => {
    set((state) => ({ streak: state.streak + 1 }));
  },
}));

export default useProgressStore;
