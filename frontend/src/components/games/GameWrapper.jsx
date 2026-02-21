import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export default function GameWrapper({
  title,
  children,
  timed = false,
  timeLimit = 60,
  score = 0,
  maxScore = 100,
  onComplete,
  showNextButton = false,
  onNext,
  gameComplete = false,
}) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timerActive, setTimerActive] = useState(timed);

  useEffect(() => {
    if (!timerActive || !timed) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timed, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-sand-100 overflow-hidden"
    >
      {/* Header bar */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-4 flex items-center justify-between">
        <h3 className="text-white font-bold text-lg">{title}</h3>
        <div className="flex items-center gap-4">
          {timed && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 ${timeLeft < 10 ? 'animate-pulse' : ''}`}>
              <Clock size={16} className="text-white" />
              <span className="text-white font-mono font-bold text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20">
            <Star size={16} className="text-white" />
            <span className="text-white font-bold text-sm">{score}/{maxScore}</span>
          </div>
        </div>
      </div>

      {/* Game content */}
      <div className="p-6">{children}</div>

      {/* Footer with next button */}
      {(showNextButton || gameComplete) && (
        <div className="px-6 pb-6">
          <Button
            onClick={onNext}
            variant="primary"
            fullWidth
            size="lg"
          >
            {gameComplete ? 'Continue' : 'Next'}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
