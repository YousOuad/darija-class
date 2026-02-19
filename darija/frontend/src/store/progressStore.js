import { create } from 'zustand';
import { progressAPI, badgesAPI } from '../services/api';

const MOCK_BADGES = [
  { id: 1, name: 'First Steps', description: 'Complete your first lesson', icon: 'footprints', earned: true, earned_at: '2024-01-15' },
  { id: 2, name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'flame', earned: true, earned_at: '2024-01-22' },
  { id: 3, name: 'Word Collector', description: 'Learn 50 vocabulary words', icon: 'book-open', earned: true, earned_at: '2024-02-01' },
  { id: 4, name: 'Game Master', description: 'Score 100% on any game', icon: 'trophy', earned: true, earned_at: '2024-02-05' },
  { id: 5, name: 'Culture Explorer', description: 'Complete 5 cultural quizzes', icon: 'compass', earned: false },
  { id: 6, name: 'Streak Legend', description: 'Maintain a 30-day streak', icon: 'crown', earned: false },
  { id: 7, name: 'Conversation Pro', description: 'Complete 10 AI conversations', icon: 'message-circle', earned: false },
  { id: 8, name: 'Grammar Guru', description: 'Master all grammar topics', icon: 'pen-tool', earned: false },
  { id: 9, name: 'Speed Demon', description: 'Complete Flashcard Sprint with 20+ cards', icon: 'zap', earned: false },
  { id: 10, name: 'Memory Master', description: 'Complete Memory Match in under 60 seconds', icon: 'brain', earned: false },
  { id: 11, name: 'Level Up', description: 'Reach Level 5', icon: 'arrow-up-circle', earned: false },
  { id: 12, name: 'Darija Expert', description: 'Reach Level 10', icon: 'star', earned: false },
];

const MOCK_WEAKNESSES = [
  { area: 'Verb Conjugation', score: 45, suggestion: 'Practice verb forms with Fill in the Blank games' },
  { area: 'Formal Vocabulary', score: 55, suggestion: 'Review B1 vocabulary lessons on formal speech' },
  { area: 'Listening Comprehension', score: 60, suggestion: 'Try more Conversation Simulation exercises' },
];

const useProgressStore = create((set, get) => ({
  xp: 1250,
  level: 3,
  streak: 7,
  badges: MOCK_BADGES,
  weaknesses: MOCK_WEAKNESSES,
  skills: {
    vocabulary: 72,
    grammar: 58,
    phrases: 80,
    culture: 65,
    conversation: 45,
  },
  xpHistory: [
    { date: 'Jan 19', xp: 50 }, { date: 'Jan 20', xp: 75 },
    { date: 'Jan 21', xp: 100 }, { date: 'Jan 22', xp: 60 },
    { date: 'Jan 23', xp: 90 }, { date: 'Jan 24', xp: 120 },
    { date: 'Jan 25', xp: 80 }, { date: 'Jan 26', xp: 110 },
    { date: 'Jan 27', xp: 95 }, { date: 'Jan 28', xp: 70 },
    { date: 'Jan 29', xp: 130 }, { date: 'Jan 30', xp: 85 },
    { date: 'Jan 31', xp: 100 }, { date: 'Feb 1', xp: 115 },
  ],
  lessonsCompleted: 12,
  gamesPlayed: 34,
  isLoading: false,

  fetchProgress: async () => {
    set({ isLoading: true });
    try {
      const [progressRes, badgesRes] = await Promise.all([
        progressAPI.getSummary(),
        badgesAPI.list(),
      ]);
      set({
        xp: progressRes.data.xp,
        level: progressRes.data.level,
        streak: progressRes.data.streak,
        skills: progressRes.data.skills,
        badges: badgesRes.data,
        isLoading: false,
      });
    } catch {
      // Use mock data on failure
      set({ isLoading: false });
    }
  },

  fetchWeaknesses: async () => {
    try {
      const response = await progressAPI.getWeaknesses();
      set({ weaknesses: response.data });
    } catch {
      // Use mock data
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
