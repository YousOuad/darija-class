import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw } from 'lucide-react';
import GameWrapper from './GameWrapper';
import Button from '../common/Button';

export default function StoryGapFill({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0 || !data.paragraphs) {
    return (
      <GameWrapper
        title="Story Gap Fill"
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

  const story = data?.paragraphs ? data : {};
  const allGaps = {};
  story.paragraphs.forEach((p) => {
    Object.entries(p.gaps).forEach(([key, val]) => {
      allGaps[key] = val;
    });
  });
  const totalGaps = Object.keys(allGaps).length;

  const [filledGaps, setFilledGaps] = useState({});
  const [selectedGap, setSelectedGap] = useState(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const handleWordSelect = (word) => {
    if (!selectedGap || checked) return;
    setFilledGaps((prev) => ({ ...prev, [selectedGap]: word }));
    setSelectedGap(null);
  };

  const handleGapClick = (gapId) => {
    if (checked) return;
    if (filledGaps[gapId]) {
      // Remove word from gap
      setFilledGaps((prev) => {
        const updated = { ...prev };
        delete updated[gapId];
        return updated;
      });
    }
    setSelectedGap(gapId);
  };

  const handleCheck = () => {
    let correct = 0;
    Object.entries(allGaps).forEach(([key, gap]) => {
      if (filledGaps[key] === gap.answer) correct++;
    });
    setScore(correct);
    setChecked(true);
  };

  const handleReset = () => {
    setFilledGaps({});
    setSelectedGap(null);
    setChecked(false);
    setScore(0);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: score >= totalGaps / 2, score, total: totalGaps });
    }
  };

  const usedWords = Object.values(filledGaps);

  const renderParagraph = (paragraph) => {
    const parts = paragraph.text.split(/(___\d+___)/g);
    return parts.map((part, index) => {
      const gapMatch = part.match(/___(\d+)___/);
      if (gapMatch) {
        const gapId = gapMatch[1];
        const filled = filledGaps[gapId];
        const isSelected = selectedGap === gapId;
        const isCorrect = checked && filled === allGaps[gapId]?.answer;
        const isWrong = checked && filled && filled !== allGaps[gapId]?.answer;

        return (
          <motion.button
            key={index}
            onClick={() => handleGapClick(gapId)}
            className={`
              inline-block min-w-[80px] px-3 py-1 mx-1 rounded-lg border-2 border-dashed
              font-medium text-sm transition-all duration-200
              ${isSelected ? 'border-teal-400 bg-teal-50' : ''}
              ${isCorrect ? 'border-green-400 bg-green-50 text-green-600 border-solid' : ''}
              ${isWrong ? 'border-red-400 bg-red-50 text-red-600 border-solid' : ''}
              ${!filled && !isSelected ? 'border-sand-300 bg-sand-50 text-dark-300' : ''}
              ${filled && !checked && !isSelected ? 'border-teal-300 bg-white text-teal-600 border-solid' : ''}
            `}
          >
            {filled || '________'}
            {isCorrect && <Check size={12} className="inline ml-1" />}
            {isWrong && <X size={12} className="inline ml-1" />}
          </motion.button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <GameWrapper
      title="Story Gap Fill"
      score={checked ? score : 0}
      maxScore={totalGaps}
      gameComplete={checked}
      onNext={handleComplete}
    >
      {/* Story title */}
      <div className="bg-sand-50 rounded-xl p-4 mb-6">
        <h4 className="font-bold text-dark mb-1">{story.title}</h4>
        <p className="text-xs text-dark-300">Fill in the blanks with the correct Darija words</p>
      </div>

      {/* Story paragraphs */}
      <div className="space-y-4 mb-6">
        {story.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-dark leading-relaxed text-base">
            {renderParagraph(paragraph)}
          </p>
        ))}
      </div>

      {/* Feedback for wrong answers */}
      {checked && score < totalGaps && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 bg-red-50 rounded-lg"
        >
          <p className="text-sm text-red-600 font-medium mb-1">Corrections:</p>
          {Object.entries(allGaps).map(([key, gap]) => {
            if (filledGaps[key] !== gap.answer) {
              return (
                <p key={key} className="text-xs text-red-500">
                  Gap {key}: <span className="line-through">{filledGaps[key] || '(empty)'}</span>{' '}
                  → <strong>{gap.answer}</strong>
                </p>
              );
            }
            return null;
          })}
        </motion.div>
      )}

      {/* Word bank */}
      {!checked && (
        <>
          <div className="mb-4">
            <p className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
              Word Bank {selectedGap ? `(filling gap ${selectedGap})` : '(tap a gap first)'}
            </p>
            <div className="flex flex-wrap gap-2">
              {story.wordBank.map((word, index) => {
                const isUsed = usedWords.includes(word);
                return (
                  <motion.button
                    key={index}
                    whileHover={!isUsed && selectedGap ? { scale: 1.05 } : {}}
                    whileTap={!isUsed && selectedGap ? { scale: 0.95 } : {}}
                    onClick={() => handleWordSelect(word)}
                    disabled={isUsed || !selectedGap}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
                      ${isUsed ? 'opacity-30 cursor-not-allowed border-sand-200 bg-sand-100' : ''}
                      ${!isUsed && selectedGap ? 'border-teal-300 bg-white text-dark hover:bg-teal-50 cursor-pointer' : ''}
                      ${!isUsed && !selectedGap ? 'border-sand-200 bg-white text-dark-400' : ''}
                    `}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw size={16} className="mr-1" /> Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleCheck}
              disabled={Object.keys(filledGaps).length < totalGaps}
            >
              Check Story
            </Button>
          </div>
        </>
      )}
    </GameWrapper>
  );
}
