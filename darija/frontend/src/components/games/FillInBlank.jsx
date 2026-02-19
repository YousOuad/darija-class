import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Check, X } from 'lucide-react';
import GameWrapper from './GameWrapper';
import ScriptText from '../common/ScriptText';
import Button from '../common/Button';

const MOCK_QUESTIONS = [
  {
    sentence_arabic: 'أنا _____ من المغرب',
    sentence_latin: 'Ana _____ men lMaghrib',
    english: 'I am _____ from Morocco',
    answer: { arabic: 'جاي', latin: 'jay' },
    hint: 'j',
  },
  {
    sentence_arabic: 'بغيت _____ أتاي عافاك',
    sentence_latin: 'Bghit _____ atay 3afak',
    english: 'I want _____ tea please',
    answer: { arabic: 'واحد', latin: 'wahd' },
    hint: 'w',
  },
  {
    sentence_arabic: 'هاد _____ مزيان بزاف',
    sentence_latin: 'Had _____ mezyan bzzaf',
    english: 'This _____ is very good',
    answer: { arabic: 'الماكلة', latin: 'lmakla' },
    hint: 'l',
  },
];

export default function FillInBlank({ data, onComplete }) {
  const questions = data?.sentence_latin ? [data] : MOCK_QUESTIONS;
  const [currentQ, setCurrentQ] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const question = questions[currentQ];

  const checkAnswer = () => {
    const answer = question.answer;
    const normalizedInput = userInput.trim().toLowerCase();
    const correct =
      normalizedInput === answer.latin?.toLowerCase() ||
      normalizedInput === answer.arabic;
    setIsCorrect(correct);
    setChecked(true);
    if (correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setUserInput('');
      setShowHint(false);
      setChecked(false);
      setIsCorrect(false);
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

  return (
    <GameWrapper
      title="Fill in the Blank"
      score={score}
      maxScore={questions.length}
      showNextButton={checked}
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

      {/* Sentence with blank */}
      <div className="bg-sand-50 rounded-xl p-6 mb-6">
        <p className="text-sm text-dark-300 mb-2">Complete the sentence:</p>
        <p className="text-lg font-medium text-dark mb-2">
          {question.english}
        </p>
        <ScriptText
          arabic={question.sentence_arabic}
          latin={question.sentence_latin}
          className="text-dark-400 text-base"
        />
      </div>

      {/* Input */}
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

        {/* Feedback */}
        {checked && !isCorrect && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-500"
          >
            Correct answer:{' '}
            <ScriptText
              arabic={question.answer.arabic}
              latin={question.answer.latin}
              className="font-bold"
            />
          </motion.p>
        )}

        {checked && isCorrect && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-green-500 font-medium"
          >
            Correct! Well done!
          </motion.p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {!checked && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(true)}
              disabled={showHint}
            >
              <Lightbulb size={16} className="mr-1" />
              Hint
            </Button>
            <Button
              variant="primary"
              onClick={checkAnswer}
              disabled={!userInput.trim()}
            >
              Check Answer
            </Button>
          </>
        )}
      </div>

      {/* Hint */}
      {showHint && !checked && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-gold-300/20 rounded-lg"
        >
          <p className="text-sm text-dark-400">
            <Lightbulb size={14} className="inline mr-1 text-gold-500" />
            The word starts with: <strong>{question.hint}</strong>
          </p>
        </motion.div>
      )}
    </GameWrapper>
  );
}
