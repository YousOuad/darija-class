import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shuffle } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function WordMatch({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0 || !data.pairs?.length) {
    return (
      <GameWrapper
        title="Word Match"
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

  const pairs = data?.pairs || [];
  const [shuffledEnglish] = useState(() => shuffleArray(pairs));
  const [selectedDarija, setSelectedDarija] = useState(null);
  const [selectedEnglish, setSelectedEnglish] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const isGameComplete = matched.length === pairs.length;

  const handleDarijaClick = useCallback((pair) => {
    if (matched.includes(pair.id)) return;
    setSelectedDarija(pair);
    setWrong(null);

    if (selectedEnglish) {
      setAttempts((prev) => prev + 1);
      if (selectedEnglish.id === pair.id) {
        setMatched((prev) => [...prev, pair.id]);
        setScore((prev) => prev + 1);
        setSelectedDarija(null);
        setSelectedEnglish(null);
      } else {
        setWrong({ darija: pair.id, english: selectedEnglish.id });
        setTimeout(() => {
          setSelectedDarija(null);
          setSelectedEnglish(null);
          setWrong(null);
        }, 800);
      }
    }
  }, [selectedEnglish, matched]);

  const handleEnglishClick = useCallback((pair) => {
    if (matched.includes(pair.id)) return;
    setSelectedEnglish(pair);
    setWrong(null);

    if (selectedDarija) {
      setAttempts((prev) => prev + 1);
      if (selectedDarija.id === pair.id) {
        setMatched((prev) => [...prev, pair.id]);
        setScore((prev) => prev + 1);
        setSelectedDarija(null);
        setSelectedEnglish(null);
      } else {
        setWrong({ darija: selectedDarija.id, english: pair.id });
        setTimeout(() => {
          setSelectedDarija(null);
          setSelectedEnglish(null);
          setWrong(null);
        }, 800);
      }
    }
  }, [selectedDarija, matched]);

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: score >= pairs.length / 2, score, total: pairs.length, bonus: score === pairs.length ? 50 : 25 });
    }
  };

  return (
    <GameWrapper
      title="Word Match"
      score={score}
      maxScore={pairs.length}
      gameComplete={isGameComplete}
      onNext={handleComplete}
    >
      <p className="text-dark-300 text-sm mb-4">
        Tap a Darija word, then tap its English translation to match them.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Darija column */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-teal-500 uppercase tracking-wider mb-2">Darija</p>
          {pairs.map((pair) => {
            const isMatched = matched.includes(pair.id);
            const isSelected = selectedDarija?.id === pair.id;
            const isWrong = wrong?.darija === pair.id;

            return (
              <motion.button
                key={`darija-${pair.id}`}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleDarijaClick(pair)}
                disabled={isMatched}
                className={`
                  w-full p-3 rounded-xl border-2 text-center font-medium transition-all duration-200
                  ${isMatched ? 'bg-green-50 border-green-300 text-green-600 opacity-60' : ''}
                  ${isSelected && !isWrong ? 'bg-teal-50 border-teal-400 text-teal-600' : ''}
                  ${isWrong ? 'bg-red-50 border-red-400 text-red-600 animate-shake' : ''}
                  ${!isMatched && !isSelected && !isWrong ? 'bg-white border-sand-200 text-dark hover:border-teal-300' : ''}
                `}
              >
                <ScriptText arabic={pair.darija_arabic} latin={pair.darija_latin} />
                {isMatched && <Check size={14} className="inline ml-1" />}
              </motion.button>
            );
          })}
        </div>

        {/* English column */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-terracotta-500 uppercase tracking-wider mb-2">English</p>
          {shuffledEnglish.map((pair) => {
            const isMatched = matched.includes(pair.id);
            const isSelected = selectedEnglish?.id === pair.id;
            const isWrong = wrong?.english === pair.id;

            return (
              <motion.button
                key={`english-${pair.id}`}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => handleEnglishClick(pair)}
                disabled={isMatched}
                className={`
                  w-full p-3 rounded-xl border-2 text-center font-medium transition-all duration-200
                  ${isMatched ? 'bg-green-50 border-green-300 text-green-600 opacity-60' : ''}
                  ${isSelected && !isWrong ? 'bg-terracotta-50 border-terracotta-400 text-terracotta-600' : ''}
                  ${isWrong ? 'bg-red-50 border-red-400 text-red-600' : ''}
                  ${!isMatched && !isSelected && !isWrong ? 'bg-white border-sand-200 text-dark hover:border-terracotta-300' : ''}
                `}
              >
                {pair.english}
                {isMatched && <Check size={14} className="inline ml-1" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {isGameComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-dark-300 text-sm">
            Completed in {attempts} attempts
          </p>
        </motion.div>
      )}
    </GameWrapper>
  );
}
