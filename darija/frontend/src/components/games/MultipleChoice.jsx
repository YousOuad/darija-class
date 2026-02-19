import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';

export default function MultipleChoice({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400">No game data available.</p>
      </div>
    );
  }

  const questions = data?.options ? [data] : [];
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const question = questions[currentQ];

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option.id);
    setAnswered(true);
    if (option.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setGameOver(true);
      if (onComplete) {
        onComplete({ correct: score === questions.length, score, total: questions.length });
      }
    }
  };

  if (gameOver) {
    return (
      <GameWrapper
        title="Quick Quiz"
        score={score}
        maxScore={questions.length}
        gameComplete
        onNext={onComplete ? () => onComplete({ correct: score >= questions.length / 2, score, total: questions.length }) : undefined}
      >
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl mb-4"
          >
            {score === questions.length ? '🎉' : score >= questions.length / 2 ? '👍' : '💪'}
          </motion.div>
          <h3 className="text-2xl font-bold text-dark mb-2">
            {score === questions.length ? 'Perfect Score!' : score >= questions.length / 2 ? 'Well Done!' : 'Keep Practicing!'}
          </h3>
          <p className="text-dark-300">
            You got {score} out of {questions.length} correct
          </p>
        </div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper
      title="Quick Quiz"
      score={score}
      maxScore={questions.length}
      showNextButton={answered}
      onNext={handleNext}
    >
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentQ ? 'bg-teal-500' : i === currentQ ? 'bg-teal-300' : 'bg-sand-200'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-sm text-dark-300 mb-2">Question {currentQ + 1} of {questions.length}</p>
        <h4 className="text-xl font-bold text-dark mb-1">
          {question.english || ''}
        </h4>
        <ScriptText
          arabic={question.question?.arabic}
          latin={question.question?.latin}
          className="text-dark-400 text-base"
        />
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {(question.options || []).map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = option.correct;
          let borderColor = 'border-sand-200 hover:border-teal-300';
          let bgColor = 'bg-white hover:bg-teal-50/50';

          if (answered) {
            if (isCorrect) {
              borderColor = 'border-green-400';
              bgColor = 'bg-green-50';
            } else if (isSelected && !isCorrect) {
              borderColor = 'border-red-400';
              bgColor = 'bg-red-50';
            } else {
              borderColor = 'border-sand-200';
              bgColor = 'bg-sand-50 opacity-60';
            }
          } else if (isSelected) {
            borderColor = 'border-teal-400';
            bgColor = 'bg-teal-50';
          }

          return (
            <motion.button
              key={option.id}
              whileHover={!answered ? { scale: 1.01 } : {}}
              whileTap={!answered ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`
                flex items-center gap-3 p-4 rounded-xl border-2 text-left
                transition-all duration-200 ${borderColor} ${bgColor}
              `}
            >
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                  ${answered && isCorrect ? 'bg-green-500 text-white' : ''}
                  ${answered && isSelected && !isCorrect ? 'bg-red-500 text-white' : ''}
                  ${!answered ? 'bg-sand-200 text-dark-400' : ''}
                  ${answered && !isSelected && !isCorrect ? 'bg-sand-200 text-dark-300' : ''}
                `}
              >
                {answered && isCorrect ? <Check size={16} /> : ''}
                {answered && isSelected && !isCorrect ? <X size={16} /> : ''}
                {!answered ? option.id.toUpperCase() : ''}
                {answered && !isSelected && !isCorrect ? option.id.toUpperCase() : ''}
              </div>
              <ScriptText
                arabic={option.arabic}
                latin={option.latin}
                className="font-medium text-dark"
              />
            </motion.button>
          );
        })}
      </div>
    </GameWrapper>
  );
}
