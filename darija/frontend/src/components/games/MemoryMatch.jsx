import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, RotateCcw } from 'lucide-react';
import GameWrapper from './GameWrapper';

const MOCK_PAIRS = [
  { darija: 'Salam', english: 'Hello' },
  { darija: 'Choukran', english: 'Thank you' },
  { darija: 'Bslama', english: 'Goodbye' },
  { darija: 'Wakha', english: 'Okay' },
  { darija: 'Mezyan', english: 'Good' },
  { darija: 'Lma', english: 'Water' },
  { darija: 'Khobz', english: 'Bread' },
  { darija: 'Atay', english: 'Tea' },
];

function createCards(pairs) {
  const cards = [];
  pairs.forEach((pair, pairIndex) => {
    cards.push({ id: `d-${pairIndex}`, text: pair.darija, pairId: pairIndex, type: 'darija' });
    cards.push({ id: `e-${pairIndex}`, text: pair.english, pairId: pairIndex, type: 'english' });
  });
  // Shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatch({ data, onComplete }) {
  const pairs = MOCK_PAIRS;
  const [cards] = useState(() => createCards(pairs));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (matched.length === pairs.length) {
      setGameOver(true);
    }
  }, [matched, pairs.length]);

  const handleCardClick = useCallback((card) => {
    if (disabled || flipped.includes(card.id) || matched.includes(card.pairId)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setDisabled(true);

      const [first, second] = newFlipped.map((id) => cards.find((c) => c.id === id));

      if (first.pairId === second.pairId && first.type !== second.type) {
        setMatched((prev) => [...prev, first.pairId]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  }, [flipped, matched, disabled, cards]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({
        correct: matched.length === pairs.length,
        score: matched.length,
        total: pairs.length,
        bonus: seconds < 60 ? 50 : 25,
      });
    }
  };

  if (gameOver) {
    return (
      <GameWrapper
        title="Memory Match"
        score={matched.length}
        maxScore={pairs.length}
        gameComplete
        onNext={handleComplete}
      >
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {moves <= pairs.length + 4 ? '🏆' : '🎉'}
          </motion.div>
          <h3 className="text-2xl font-bold text-dark mb-4">All Matched!</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-teal-500">{moves}</p>
              <p className="text-sm text-dark-300">Moves</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-terracotta-500">{formatTime(seconds)}</p>
              <p className="text-sm text-dark-300">Time</p>
            </div>
          </div>
        </div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper title="Memory Match" score={matched.length} maxScore={pairs.length}>
      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex items-center gap-1.5 text-sm text-dark-400">
          <RotateCcw size={16} />
          <span className="font-medium">{moves} moves</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-dark-400">
          <Clock size={16} />
          <span className="font-mono font-medium">{formatTime(seconds)}</span>
        </div>
        <div className="text-sm text-teal-500 font-medium">
          {matched.length}/{pairs.length} pairs
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id);
          const isMatched = matched.includes(card.pairId);

          return (
            <motion.button
              key={card.id}
              whileHover={!isFlipped && !isMatched ? { scale: 1.05 } : {}}
              whileTap={!isFlipped && !isMatched ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card)}
              className={`
                aspect-square rounded-xl flex items-center justify-center p-2
                text-xs sm:text-sm font-bold transition-all duration-300
                ${isMatched
                  ? 'bg-green-100 border-2 border-green-300 text-green-600'
                  : isFlipped
                  ? card.type === 'darija'
                    ? 'bg-teal-50 border-2 border-teal-400 text-teal-600'
                    : 'bg-terracotta-50 border-2 border-terracotta-400 text-terracotta-600'
                  : 'bg-gradient-to-br from-teal-500 to-teal-600 text-white cursor-pointer hover:from-teal-400 hover:to-teal-500 shadow-md'
                }
              `}
            >
              {isFlipped || isMatched ? (
                <motion.span
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  className="text-center leading-tight"
                >
                  {card.text}
                </motion.span>
              ) : (
                <span className="text-lg">?</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </GameWrapper>
  );
}
