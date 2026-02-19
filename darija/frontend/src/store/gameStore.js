import { create } from 'zustand';
import { gamesAPI } from '../services/api';

const MOCK_SESSION = {
  id: 'session-1',
  games: [
    {
      type: 'multiple_choice',
      title: 'Quick Quiz',
      data: {
        question: { arabic: 'كيفاش كتقول "Thank you" بالدارجة؟', latin: 'Kifach katgoul "Thank you" b darija?' },
        options: [
          { id: 'a', arabic: 'شكرا', latin: 'Choukran', correct: true },
          { id: 'b', arabic: 'لا', latin: 'La', correct: false },
          { id: 'c', arabic: 'بسلامة', latin: 'Bslama', correct: false },
          { id: 'd', arabic: 'واخا', latin: 'Wakha', correct: false },
        ],
      },
    },
    {
      type: 'word_match',
      title: 'Word Match',
      data: {
        pairs: [
          { id: 1, darija_arabic: 'سلام', darija_latin: 'Salam', english: 'Hello' },
          { id: 2, darija_arabic: 'شكرا', darija_latin: 'Choukran', english: 'Thank you' },
          { id: 3, darija_arabic: 'بسلامة', darija_latin: 'Bslama', english: 'Goodbye' },
          { id: 4, darija_arabic: 'واخا', darija_latin: 'Wakha', english: 'Okay' },
          { id: 5, darija_arabic: 'مزيان', darija_latin: 'Mezyan', english: 'Good' },
        ],
      },
    },
    {
      type: 'fill_in_blank',
      title: 'Fill in the Blank',
      data: {
        sentence_arabic: 'أنا _____ من المغرب',
        sentence_latin: 'Ana _____ men lMaghrib',
        english: 'I am _____ from Morocco',
        answer: { arabic: 'جاي', latin: 'jay' },
        hint: 'j',
      },
    },
    {
      type: 'sentence_builder',
      title: 'Sentence Builder',
      data: {
        correct_order_arabic: ['أنا', 'كنتكلم', 'الدارجة', 'مزيان'],
        correct_order_latin: ['Ana', 'kantkellm', 'darija', 'mezyan'],
        english: 'I speak Darija well',
      },
    },
    {
      type: 'flashcard_sprint',
      title: 'Flashcard Sprint',
      data: {
        cards: [
          { id: 1, front_arabic: 'الما', front_latin: 'Lma', back: 'Water' },
          { id: 2, front_arabic: 'خبز', front_latin: 'Khobz', back: 'Bread' },
          { id: 3, front_arabic: 'أتاي', front_latin: 'Atay', back: 'Tea' },
          { id: 4, front_arabic: 'دار', front_latin: 'Dar', back: 'House' },
          { id: 5, front_arabic: 'مدرسة', front_latin: 'Mdrasa', back: 'School' },
          { id: 6, front_arabic: 'سوق', front_latin: 'Souq', back: 'Market' },
          { id: 7, front_arabic: 'طريق', front_latin: 'Triq', back: 'Road' },
          { id: 8, front_arabic: 'كتاب', front_latin: 'Ktab', back: 'Book' },
        ],
      },
    },
    {
      type: 'cultural_quiz',
      title: 'Cultural Quiz',
      data: {
        question: 'What is the traditional Moroccan mint tea called?',
        options: [
          { id: 'a', text: 'Atay Nana', correct: true },
          { id: 'b', text: 'Chai Masala', correct: false },
          { id: 'c', text: 'Qamar al-Din', correct: false },
          { id: 'd', text: 'Sahlab', correct: false },
        ],
        explanation: 'Atay Nana (literally "mint tea") is Morocco\'s beloved national drink. It\'s made with Chinese gunpowder green tea, fresh spearmint leaves, and lots of sugar. Serving tea is a sign of hospitality and friendship in Moroccan culture.',
        funFact: 'In Morocco, tea is traditionally poured from a height to create a frothy top, and it\'s considered rude to refuse a glass!',
      },
    },
    {
      type: 'word_scramble',
      title: 'Word Scramble',
      data: {
        words: [
          { word: 'CHOUKRAN', meaning: 'Thank you', arabic: 'شكرا' },
          { word: 'MEZYAN', meaning: 'Good', arabic: 'مزيان' },
          { word: 'SALAM', meaning: 'Hello/Peace', arabic: 'سلام' },
        ],
      },
    },
    {
      type: 'memory_match',
      title: 'Memory Match',
      data: {
        pairs: [
          { darija: 'Salam', english: 'Hello' },
          { darija: 'Choukran', english: 'Thank you' },
          { darija: 'Bslama', english: 'Goodbye' },
          { darija: 'Wakha', english: 'Okay' },
          { darija: 'Mezyan', english: 'Good' },
          { darija: 'Lma', english: 'Water' },
        ],
      },
    },
    {
      type: 'story_gap_fill',
      title: 'Story Gap Fill',
      data: {
        title: 'A Day at the Souq',
        paragraphs: [
          {
            text: 'Karim went to the ___1___ in the morning. He wanted to buy some ___2___ for breakfast.',
            gaps: {
              1: { answer: 'souq', options: ['souq', 'mdrasa', 'dar'] },
              2: { answer: 'khobz', options: ['khobz', 'ktab', 'triq'] },
            },
          },
          {
            text: 'He said "___3___" to the seller and asked for the price. The seller replied "___4___, only 5 dirhams!"',
            gaps: {
              3: { answer: 'salam', options: ['bslama', 'salam', 'la'] },
              4: { answer: 'wakha', options: ['wakha', 'choukran', 'mezyan'] },
            },
          },
        ],
        wordBank: ['souq', 'khobz', 'salam', 'wakha', 'bslama', 'mdrasa', 'dar', 'ktab', 'triq', 'la', 'choukran', 'mezyan'],
      },
    },
    {
      type: 'conversation_sim',
      title: 'Conversation Practice',
      data: {
        context: 'You are at a Moroccan cafe ordering tea.',
        messages: [
          {
            role: 'ai',
            arabic: 'مرحبا! أهلا وسهلا فالقهوة ديالنا. شنو بغيتي تشرب؟',
            latin: 'Merhba! Ahlan w sahlan f l9ahwa dyalna. Chnou bghiti tchrob?',
            english: 'Welcome! What would you like to drink?',
          },
        ],
        suggestions: [
          { arabic: 'بغيت أتاي عافاك', latin: 'Bghit atay 3afak', english: 'I want tea please' },
          { arabic: 'واش عندكم قهوة نص نص؟', latin: 'Wach 3ndkom qahwa noss noss?', english: 'Do you have half-half coffee?' },
          { arabic: 'عطيني الما عافاك', latin: '3tini lma 3afak', english: 'Give me water please' },
        ],
      },
    },
  ],
};

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

  startSession: async () => {
    set({ isLoading: true });
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
    } catch {
      // Use mock session
      set({
        currentSession: MOCK_SESSION,
        currentGameIndex: 0,
        results: [],
        totalXPEarned: 0,
        isSessionComplete: false,
        isLoading: false,
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
    const { results, totalXPEarned } = get();
    try {
      await gamesAPI.submitResult({ results, totalXPEarned });
    } catch {
      // Silent fail
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
    });
  },
}));

export default useGameStore;
