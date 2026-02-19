import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X } from 'lucide-react';
import GameWrapper from './GameWrapper';
import Button from '../common/Button';

function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Make sure it's actually scrambled
  if (arr.join('') === word) {
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
  }
  return arr;
}

export default function WordScramble({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400">No game data available.</p>
      </div>
    );
  }

  const words = data?.words || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambled, setScrambled] = useState(() => scrambleWord(words[0].word));
  const [placed, setPlaced] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const currentWord = words[currentIndex];

  const handleLetterClick = useCallback((letter, index) => {
    if (checked) return;
    setScrambled((prev) => prev.filter((_, i) => i !== index));
    setPlaced((prev) => [...prev, letter]);
  }, [checked]);

  const handleRemoveLetter = useCallback((letter, index) => {
    if (checked) return;
    setPlaced((prev) => prev.filter((_, i) => i !== index));
    setScrambled((prev) => [...prev, letter]);
  }, [checked]);

  const handleCheck = () => {
    const answer = placed.join('');
    const correct = answer === currentWord.word;
    setIsCorrect(correct);
    setChecked(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleClear = () => {
    setScrambled(scrambleWord(currentWord.word));
    setPlaced([]);
    setChecked(false);
    setIsCorrect(false);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setScrambled(scrambleWord(words[nextIndex].word));
      setPlaced([]);
      setChecked(false);
      setIsCorrect(false);
    } else {
      setGameOver(true);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: score >= words.length / 2, score, total: words.length });
    }
  };

  if (gameOver) {
    return (
      <GameWrapper
        title="Word Scramble"
        score={score}
        maxScore={words.length}
        gameComplete
        onNext={handleComplete}
      >
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {score === words.length ? '🎉' : '💪'}
          </motion.div>
          <h3 className="text-2xl font-bold text-dark mb-2">
            {score === words.length ? 'All Unscrambled!' : 'Nice Try!'}
          </h3>
          <p className="text-dark-300">{score} out of {words.length} words</p>
        </div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper
      title="Word Scramble"
      score={score}
      maxScore={words.length}
      showNextButton={checked}
      onNext={handleNext}
    >
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {words.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentIndex ? 'bg-teal-500' : i === currentIndex ? 'bg-teal-300' : 'bg-sand-200'}`} />
        ))}
      </div>

      {/* Clue */}
      <div className="bg-sand-50 rounded-xl p-4 mb-6 text-center">
        <p className="text-sm text-dark-300 mb-1">Unscramble the Darija word:</p>
        <p className="text-lg font-bold text-dark">Meaning: {currentWord.meaning}</p>
        <p className="text-dark-400 font-arabic">{currentWord.arabic}</p>
      </div>

      {/* Answer slots */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Your answer:</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: currentWord.word.length }).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => placed[index] && handleRemoveLetter(placed[index], index)}
              className={`
                w-10 h-12 rounded-lg border-2 flex items-center justify-center
                text-lg font-bold transition-all duration-200
                ${placed[index]
                  ? checked && isCorrect
                    ? 'border-green-400 bg-green-50 text-green-600'
                    : checked && !isCorrect
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-teal-400 bg-teal-50 text-teal-600 cursor-pointer hover:bg-teal-100'
                  : 'border-sand-300 bg-white text-transparent'
                }
              `}
            >
              {placed[index] || '_'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Scrambled letters */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Letters:</p>
        <div className="flex justify-center gap-2 flex-wrap">
          <AnimatePresence mode="popLayout">
            {scrambled.map((letter, index) => (
              <motion.button
                key={`${index}-${letter}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleLetterClick(letter, index)}
                disabled={checked}
                className="w-10 h-12 rounded-lg border-2 border-sand-200 bg-white
                  text-lg font-bold text-dark hover:border-teal-300 hover:bg-teal-50
                  transition-colors duration-200 cursor-pointer"
              >
                {letter}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback */}
      {checked && !isCorrect && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-red-50 rounded-lg text-center">
          <p className="text-sm text-red-600">
            The correct word was: <strong>{currentWord.word}</strong>
          </p>
        </motion.div>
      )}

      {/* Actions */}
      {!checked && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <RotateCcw size={16} className="mr-1" /> Clear
          </Button>
          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={placed.length !== currentWord.word.length}
          >
            <Check size={16} className="mr-1" /> Check
          </Button>
        </div>
      )}
    </GameWrapper>
  );
}
