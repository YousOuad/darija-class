import { create } from 'zustand';
import { gamesAPI } from '../services/api';

// Map backend game_type identifiers to frontend component keys
const BACKEND_TYPE_MAP = {
  fill_blank: 'fill_in_blank',
  conversation: 'conversation_sim',
  listening: 'multiple_choice',
  translation: 'fill_in_blank',
  cultural_quiz: 'cultural_quiz',
  memory_match: 'memory_match',
  word_scramble: 'word_scramble',
  flashcard_sprint: 'flashcard_sprint',
  conjugation_quiz: 'multiple_choice',
  conjugation_fill: 'fill_in_blank',
};

const LEVEL_COLORS = {
  a1: '#6366f1',
  a2: '#0d9488',
  b1: '#f59e0b',
  b2: '#e11d48',
};

function normalizeSession(raw) {
  const level = raw.level || '';
  return {
    ...raw,
    level,
    levelLabel: raw.level_label || level.toUpperCase(),
    levelColor: LEVEL_COLORS[level] || '#0d9488',
    games: (raw.games || []).map((g) => ({
      type: BACKEND_TYPE_MAP[g.game_type] || g.game_type || g.type,
      backendType: g.game_type || g.type,
      title: g.title,
      data: g.config || g.data || {},
    })),
  };
}

const useGameStore = create((set, get) => ({
  currentSession: null,
  currentGameIndex: 0,
  results: [],
  totalXPEarned: 0,
  isSessionComplete: false,
  isLoading: false,
  error: null,

  startSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await gamesAPI.getSession();
      set({
        currentSession: normalizeSession(response.data),
        currentGameIndex: 0,
        results: [],
        totalXPEarned: 0,
        isSessionComplete: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to start game session:', error);
      set({
        isLoading: false,
        error: 'Failed to load game session. Please try again.',
      });
    }
  },

  submitAnswer: (gameIndex, result) => {
    const xp = result.correct ? (result.bonus || 25) : 5;
    set((state) => ({
      results: [...state.results, { gameIndex, ...result, xpEarned: xp }],
      totalXPEarned: state.totalXPEarned + xp,
    }));
  },

  nextGame: () => {
    const { currentSession, currentGameIndex } = get();
    if (currentGameIndex < currentSession.games.length - 1) {
      set({ currentGameIndex: currentGameIndex + 1 });
    } else {
      set({ isSessionComplete: true });
    }
  },

  endSession: async () => {
    const { currentSession, results } = get();
    let success = true;
    try {
      const games = currentSession?.games || [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const game = games[result.gameIndex] || games[i];
        // Use the original backend game type for the API call
        const backendType = game?.backendType || 'word_match';
        await gamesAPI.submitResult(backendType, {
          score: result.correct ? 1.0 : 0.0,
          answers: [{ correct: result.correct }],
        });
      }
    } catch (error) {
      console.error('Failed to submit game results:', error);
      success = false;
    }
    set({
      currentSession: null,
      currentGameIndex: 0,
      isSessionComplete: false,
    });
    return success;
  },

  resetSession: () => {
    set({
      currentSession: null,
      currentGameIndex: 0,
      results: [],
      totalXPEarned: 0,
      isSessionComplete: false,
      error: null,
    });
  },
}));

export default useGameStore;
