import { create } from 'zustand';
import { gamesAPI } from '../services/api';

// Map backend game_type identifiers to frontend component keys
const BACKEND_TYPE_MAP = {
  fill_blank: 'fill_in_blank',
  conversation: 'conversation_sim',
  listening: 'multiple_choice',
  translation: 'fill_in_blank',
};

function normalizeSession(raw) {
  return {
    ...raw,
    games: (raw.games || []).map((g) => ({
      type: BACKEND_TYPE_MAP[g.game_type] || g.game_type || g.type,
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
    const { currentSession, results, totalXPEarned } = get();
    try {
      // Submit each game result individually
      const games = currentSession?.games || [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const game = games[result.gameIndex] || games[i];
        const gameType = game?.type || 'multiple_choice';
        await gamesAPI.submitResult(gameType, {
          score: result.correct ? 100 : 0,
          xp_earned: result.xpEarned,
        });
      }
    } catch (error) {
      console.error('Failed to submit game results:', error);
    }
    set({
      currentSession: null,
      currentGameIndex: 0,
      isSessionComplete: false,
    });
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
