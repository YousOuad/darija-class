import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Check, X } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';

export default function FillInBlank({ data, onComplete }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400">No game data available.</p>
      </div>
    );
  }

  // Handle both array format {questions: [...]} and single object format
  const questions = data?.questions || (data?.sentence_latin ? [data] : []);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-dark-400">No game data available.</p>
      </div>
    );
  }

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
      setShowHint(false);
      setAnswered(false);
    } else {
      setGameOver(true);
      if (onComplete) {
        onComplete({ correct: score >= questions.length / 2, score, total: questions.length });
      }
    }
  };

  if (gameOver) {
    return (
      <GameWrapper
        title="Fill in the Blank"
        score={score}
        maxScore={questions.length}
        gameComplete
        onNext={onComplete ? () => onComplete({ correct: score >= questions.length / 2, score, total: questions.length }) : undefined}
      >
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {score === questions.length ? '🎉' : '💪'}
          </motion.div>
          <h3 className="text-2xl font-bold text-dark mb-2">
            {score === questions.length ? 'Perfect!' : 'Good Effort!'}
          </h3>
          <p className="text-dark-300">{score} out of {questions.length} correct</p>
        </div>
      </GameWrapper>
    );
  }

  // Build options: use backend-provided options or fall back to legacy text input
  const options = question.options || [];

  return (
    <GameWrapper
      title="Fill in the Blank"
      score={score}
      maxScore={questions.length}
      showNextButton={answered}
      onNext={handleNext}
    >
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < currentQ ? 'bg-teal-500' : i === currentQ ? 'bg-teal-300' : 'bg-sand-200'
            }`}
          />
        ))}
      </div>

      {/* English meaning / clue */}
      <div className="bg-sand-50 rounded-xl p-5 mb-6">
        <p className="text-sm text-dark-300 mb-2">Fill in the missing word:</p>
        <p className="text-base font-medium text-dark mb-3">
          {question.english}
        </p>
        <div className="bg-white rounded-lg p-3 border border-sand-200">
          <ScriptText
            arabic={question.sentence_arabic}
            latin={question.sentence_latin}
            className="text-lg font-semibold text-dark"
          />
        </div>
      </div>

      {/* Choice options */}
      {options.length > 0 ? (
        <div className="grid gap-3">
          {options.map((option) => {
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
      ) : (
        /* Fallback: legacy text input for old data without options */
        <LegacyTextInput question={question} onAnswered={(correct) => {
          setAnswered(true);
          if (correct) setScore((prev) => prev + 1);
        }} answered={answered} />
      )}

      {/* Hint button */}
      {!answered && (
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setShowHint(true)}
            disabled={showHint}
            className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark transition-colors disabled:opacity-40"
          >
            <Lightbulb size={16} />
            Hint
          </button>
        </div>
      )}

      {/* Hint */}
      {showHint && !answered && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-gold-300/20 rounded-lg"
        >
          <p className="text-sm text-dark-400">
            <Lightbulb size={14} className="inline mr-1 text-gold-500" />
            {question.hint}
          </p>
        </motion.div>
      )}
    </GameWrapper>
  );
}

/* Fallback component for data without pre-built options */
function LegacyTextInput({ question, onAnswered, answered }) {
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    const answer = question.answer;
    const normalizedInput = userInput.trim().toLowerCase();
    const correct =
      normalizedInput === answer.latin?.toLowerCase() ||
      normalizedInput === answer.arabic;
    setIsCorrect(correct);
    setChecked(true);
    onAnswered(correct);
  };

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !checked && checkAnswer()}
          disabled={checked}
          placeholder="Type your answer..."
          className={`
            w-full px-4 py-3 rounded-xl border-2 text-lg font-medium
            focus:outline-none focus:ring-2 focus:ring-offset-1
            transition-all duration-200
            ${checked && isCorrect ? 'border-green-400 bg-green-50 focus:ring-green-300' : ''}
            ${checked && !isCorrect ? 'border-red-400 bg-red-50 focus:ring-red-300' : ''}
            ${!checked ? 'border-sand-200 focus:border-teal-400 focus:ring-teal-300' : ''}
          `}
        />
        {checked && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? <Check size={20} /> : <X size={20} />}
          </div>
        )}
      </div>
      {checked && !isCorrect && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-red-500">
          Correct answer:{' '}
          <ScriptText arabic={question.answer.arabic} latin={question.answer.latin} className="font-bold" />
        </motion.p>
      )}
      {!checked && (
        <button
          onClick={checkAnswer}
          disabled={!userInput.trim()}
          className="mt-3 px-6 py-2 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors disabled:opacity-40"
        >
          Check Answer
        </button>
      )}
    </div>
  );
}
