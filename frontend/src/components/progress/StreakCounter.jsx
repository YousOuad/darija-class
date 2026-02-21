import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakCounter({ streak = 0, compact = false }) {
  // Generate last 7 days
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return {
      label: date.toLocaleDateString('en', { weekday: 'short' }).charAt(0),
      active: i >= 7 - streak,
      isToday: i === 6,
    };
  });

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Flame size={18} className={streak > 0 ? 'text-terracotta-500' : 'text-dark-200'} />
        <span className={`font-bold text-sm ${streak > 0 ? 'text-terracotta-500' : 'text-dark-300'}`}>
          {streak}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-sand-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
              streak > 0
                ? 'bg-gradient-to-br from-terracotta-400 to-terracotta-600'
                : 'bg-dark-100'
            }`}
          >
            <Flame size={22} className="text-white" />
          </motion.div>
          <div>
            <p className="font-bold text-dark">
              {streak} Day{streak !== 1 ? 's' : ''} Streak
            </p>
            <p className="text-xs text-dark-300">
              {streak > 0 ? 'Keep it going!' : 'Start a streak today!'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${
                  day.active
                    ? 'bg-gradient-to-br from-terracotta-400 to-terracotta-500 text-white shadow-sm'
                    : 'bg-sand-200 text-dark-300'
                }
                ${day.isToday ? 'ring-2 ring-terracotta-300 ring-offset-2' : ''}
              `}
            >
              {day.active ? (
                <Flame size={14} />
              ) : (
                <span className="text-[10px]">{day.label}</span>
              )}
            </motion.div>
            <span className="text-[10px] text-dark-300">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
