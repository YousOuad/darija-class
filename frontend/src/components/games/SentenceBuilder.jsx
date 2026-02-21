import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Check, X } from 'lucide-react';
import GameWrapper from './GameWrapper';
import useScript from '../../hooks/useScript';
import Button from '../common/Button';

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SentenceBuilder({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0 || !data.correct_order_latin) {
    return (
      <GameWrapper
        title="Sentence Builder"
        score={0}
        maxScore={0}
        gameComplete
        onNext={() => onComplete?.({ correct: false, score: 0, total: 0 })}
      >
        <div className="text-center py-8">
          <p className="text-dark-400">No game data available.</p>
        </div>
      </GameWrapper>
    );
  }

  const gameData = data?.correct_order_latin ? data : {};
  const { scriptMode } = useScript();

  const correctOrder = scriptMode === 'arabic'
    ? gameData.correct_order_arabic
    : gameData.correct_order_latin;

  const [availableWords, setAvailableWords] = useState(() => shuffleArray(correctOrder));
  const [placedWords, setPlacedWords] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleWordClick = useCallback((word, index) => {
    if (checked) return;
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    setPlacedWords((prev) => [...prev, word]);
  }, [checked]);

  const handleRemoveWord = useCallback((word, index) => {
    if (checked) return;
    setPlacedWords((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
  }, [checked]);

  const handleCheck = () => {
    const correct = placedWords.join(' ') === correctOrder.join(' ');
    setIsCorrect(correct);
    setChecked(true);
  };

  const handleReset = () => {
    setAvailableWords(shuffleArray(correctOrder));
    setPlacedWords([]);
    setChecked(false);
    setIsCorrect(false);
  };

  const handleNext = () => {
    if (onComplete) {
      onComplete({ correct: isCorrect, score: isCorrect ? 1 : 0, total: 1 });
    }
  };

  return (
    <GameWrapper
      title="Sentence Builder"
      score={isCorrect ? 1 : 0}
      maxScore={1}
      showNextButton={checked}
      onNext={handleNext}
    >
      {/* English sentence */}
      <div className="bg-sand-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-dark-300 mb-1">Build this sentence in Darija:</p>
        <p className="text-lg font-bold text-dark">{gameData.english}</p>
      </div>

      {/* Drop zone */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Your sentence:</p>
        <div
          className={`
            min-h-[60px] rounded-xl border-2 border-dashed p-3 flex flex-wrap gap-2 items-center
            transition-colors duration-200
            ${checked && isCorrect ? 'border-green-400 bg-green-50' : ''}
            ${checked && !isCorrect ? 'border-red-400 bg-red-50' : ''}
            ${!checked ? 'border-sand-300 bg-white' : ''}
          `}
        >
          <AnimatePresence mode="popLayout">
            {placedWords.length === 0 && (
              <p className="text-dark-300 text-sm w-full text-center">Tap words below to build your sentence</p>
            )}
            {placedWords.map((word, index) => (
              <motion.button
                key={`placed-${index}-${word}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleRemoveWord(word, index)}
                disabled={checked}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm
                  transition-colors duration-200
                  ${scriptMode === 'arabic' ? 'font-arabic' : ''}
                  ${checked && isCorrect ? 'bg-green-200 text-green-800' : ''}
                  ${checked && !isCorrect ? 'bg-red-200 text-red-800' : ''}
                  ${!checked ? 'bg-teal-100 text-teal-700 hover:bg-teal-200 cursor-pointer' : ''}
                `}
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>

          {checked && (
            <div className="ml-auto">
              {isCorrect ? <Check size={20} className="text-green-500" /> : <X size={20} className="text-red-500" />}
            </div>
          )}
        </div>
      </div>

      {/* Available words */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">Available words:</p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {availableWords.map((word, index) => (
              <motion.button
                key={`available-${index}-${word}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleWordClick(word, index)}
                disabled={checked}
                className={`
                  px-4 py-2 rounded-lg border-2 border-sand-200 bg-white
                  font-medium text-sm text-dark hover:border-teal-300 hover:bg-teal-50
                  transition-colors duration-200 cursor-pointer
                  ${scriptMode === 'arabic' ? 'font-arabic' : ''}
                  ${checked ? 'opacity-50' : ''}
                `}
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Feedback */}
      {checked && !isCorrect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-50 rounded-lg"
        >
          <p className="text-sm text-red-600">
            Correct answer:{' '}
            <span className={`font-bold ${scriptMode === 'arabic' ? 'font-arabic' : ''}`}>
              {correctOrder.join(' ')}
            </span>
          </p>
        </motion.div>
      )}

      {/* Actions */}
      {!checked && (
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleCheck}
            disabled={placedWords.length !== correctOrder.length}
          >
            Check Sentence
          </Button>
        </div>
      )}
    </GameWrapper>
  );
}
