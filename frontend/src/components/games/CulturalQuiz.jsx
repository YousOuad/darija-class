import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Lightbulb, Info } from 'lucide-react';
import GameWrapper from './GameWrapper';

export default function CulturalQuiz({ data, onComplete }) {
  const questions = data?.questions || (data?.question ? [data] : []);

  if (!data || Object.keys(data).length === 0 || questions.length === 0) {
    return (
      <GameWrapper
        title="Cultural Quiz"
        score={0}
        maxScore={0}
        gameComplete
        onNext={() => onComplete?.({ correct: false, score: 0, total: 0 })}
      >
        <div className="text-center py-8">
          <p className="text-dark-400">No quiz questions available.</p>
        </div>
      </GameWrapper>
    );
  }

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const question = questions[currentQ];

  const handleSelect = (option) => {
    if (answered) return;
    setSelected(option.id);
    setAnswered(true);
    if (option.correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setGameOver(true);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ correct: score >= questions.length / 2, score, total: questions.length });
    }
  };

  if (gameOver) {
    return (
      <GameWrapper
        title="Cultural Quiz"
        score={score}
        maxScore={questions.length}
        gameComplete
        onNext={handleComplete}
      >
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {score === questions.length ? '🏛️' : '🌍'}
          </motion.div>
          <h3 className="text-2xl font-bold text-dark mb-2">
            {score === questions.length ? 'Culture Expert!' : 'Keep Exploring!'}
          </h3>
          <p className="text-dark-300">{score} out of {questions.length} correct</p>
        </div>
      </GameWrapper>
    );
  }

  return (
    <GameWrapper
      title="Cultural Quiz"
      score={score}
      maxScore={questions.length}
      showNextButton={answered}
      onNext={handleNext}
    >
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < currentQ ? 'bg-teal-500' : i === currentQ ? 'bg-teal-300' : 'bg-sand-200'}`} />
        ))}
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-terracotta-50 to-sand-50 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta-500/10 flex items-center justify-center flex-shrink-0">
            <Info size={20} className="text-terracotta-500" />
          </div>
          <div>
            <p className="text-sm text-dark-300 mb-1">Question {currentQ + 1} of {questions.length}</p>
            <h4 className="text-lg font-bold text-dark">{question.question}</h4>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid gap-3 mb-4">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = option.correct;
          let styles = 'border-sand-200 bg-white hover:border-teal-300 hover:bg-teal-50/30';

          if (answered) {
            if (isCorrect) {
              styles = 'border-green-400 bg-green-50';
            } else if (isSelected && !isCorrect) {
              styles = 'border-red-400 bg-red-50';
            } else {
              styles = 'border-sand-200 bg-sand-50 opacity-50';
            }
          } else if (isSelected) {
            styles = 'border-teal-400 bg-teal-50';
          }

          return (
            <motion.button
              key={option.id}
              whileHover={!answered ? { scale: 1.01 } : {}}
              onClick={() => handleSelect(option)}
              disabled={answered}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${styles}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                ${answered && isCorrect ? 'bg-green-500 text-white' : ''}
                ${answered && isSelected && !isCorrect ? 'bg-red-500 text-white' : ''}
                ${!answered ? 'bg-sand-200 text-dark-400' : ''}
                ${answered && !isSelected && !isCorrect ? 'bg-sand-200 text-dark-300' : ''}
              `}>
                {answered && isCorrect ? <Check size={16} /> : answered && isSelected && !isCorrect ? <X size={16} /> : option.id.toUpperCase()}
              </div>
              <span className="font-medium text-dark text-sm">{option.text}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation & Fun Fact */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-dark-400">{question.explanation}</p>
            </div>
          </div>

          {question.funFact && (
            <div className="bg-gold-300/20 rounded-xl p-4 border border-gold-300/30">
              <div className="flex items-start gap-2">
                <Lightbulb size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-dark-400 mb-0.5">Fun Fact</p>
                  <p className="text-sm text-dark-400">{question.funFact}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </GameWrapper>
  );
}
