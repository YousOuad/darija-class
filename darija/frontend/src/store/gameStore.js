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
  ],
};

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
        currentSession: response.data,
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
