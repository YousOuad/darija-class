import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';

export default function FlashcardSprint({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400">No game data available.</p>
      </div>
    );
  }

  const cards = data?.cards || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [studyAgain, setStudyAgain] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [exitDirection, setExitDirection] = useState(0);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleKnow = useCallback(() => {
    setExitDirection(1);
    setKnown((prev) => prev + 1);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFlipped(false);
        setExitDirection(0);
      } else {
        setGameOver(true);
      }
    }, 200);
  }, [currentIndex, cards.length]);

  const handleStudyAgain = useCallback(() => {
    setExitDirection(-1);
    setStudyAgain((prev) => prev + 1);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setFlipped(false);
        setExitDirection(0);
      } else {
        setGameOver(true);
      }
    }, 200);
  }, [currentIndex, cards.length]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: known > studyAgain, score: known, total: known + studyAgain, bonus: known >= 8 ? 50 : 25 });
    }
  };

  if (gameOver) {
    return (
      <GameWrapper
        title="Flashcard Sprint"
        score={known}
        maxScore={known + studyAgain}
        gameComplete
        onNext={handleComplete}
      >
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {known >= cards.length * 0.8 ? '🚀' : known >= cards.length * 0.5 ? '👍' : '📚'}
          </motion.div>
          <h3 className="text-2xl font-bold text-dark mb-4">Time's Up!</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{known}</p>
              <p className="text-sm text-dark-300">Known</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-terracotta-500">{studyAgain}</p>
              <p className="text-sm text-dark-300">Study Again</p>
            </div>
          </div>
        </div>
      </GameWrapper>
    );
  }

  const card = cards[currentIndex];

  return (
    <GameWrapper
      title="Flashcard Sprint"
      timed
      timeLimit={60}
      score={known}
      maxScore={cards.length}
    >
      {/* Card counter */}
      <div className="text-center mb-4">
        <p className="text-sm text-dark-300">
          Card {currentIndex + 1} of {cards.length}
        </p>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center mb-8">
        <motion.div
          onClick={() => setFlipped(!flipped)}
          className="relative w-72 h-44 cursor-pointer perspective-1000"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={flipped ? 'back' : 'front'}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute inset-0 rounded-2xl shadow-lg flex flex-col items-center justify-center p-6
                ${flipped
                  ? 'bg-gradient-to-br from-gold-300 to-gold-400 text-dark'
                  : 'bg-gradient-to-br from-teal-500 to-teal-400 text-white'
                }
              `}
            >
              {flipped ? (
                <>
                  <p className="text-sm opacity-70 mb-2">English</p>
                  <p className="text-2xl font-bold">{card.back}</p>
                </>
              ) : (
                <>
                  <p className="text-sm opacity-70 mb-2">Darija</p>
                  <ScriptText
                    arabic={card.front_arabic}
                    latin={card.front_latin}
                    className="text-2xl font-bold"
                  />
                </>
              )}
              <p className="text-xs mt-3 opacity-60">Tap to flip</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStudyAgain}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-terracotta-50 hover:bg-terracotta-100 transition-colors"
        >
          <ThumbsDown size={28} className="text-terracotta-500" />
          <span className="text-xs font-medium text-terracotta-500">Study Again</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFlipped(!flipped)}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-sand-100 hover:bg-sand-200 transition-colors"
        >
          <RotateCcw size={28} className="text-dark-400" />
          <span className="text-xs font-medium text-dark-400">Flip</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleKnow}
          className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors"
        >
          <ThumbsUp size={28} className="text-green-500" />
          <span className="text-xs font-medium text-green-500">Know It</span>
        </motion.button>
      </div>
    </GameWrapper>
  );
}
