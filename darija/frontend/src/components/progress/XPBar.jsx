import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { getLevelFromXP, getProgressPercentage, getXPForNextLevel, formatXP, getLevelTitle } from '../../utils/xpHelpers';

export default function XPBar({ xp = 0, showDetails = true, compact = false }) {
  const level = getLevelFromXP(xp);
  const progress = getProgressPercentage(xp);
  const xpNeeded = getXPForNextLevel(xp);
  const title = getLevelTitle(level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star size={14} className="text-gold-300" />
          <span className="text-xs font-bold text-dark">Lv.{level}</span>
        </div>
        <div className="flex-1 h-2 bg-sand-200 rounded-full overflow-hidden min-w-[60px]">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-sand-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 to-gold-400 flex items-center justify-center shadow-sm">
            <Star size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-dark">Level {level}</p>
            <p className="text-xs text-dark-300">{title}</p>
          </div>
        </div>
        {showDetails && (
          <div className="text-right">
            <p className="font-bold text-teal-500">{formatXP(xp)} XP</p>
            <p className="text-xs text-dark-300">{formatXP(xpNeeded)} to next level</p>
          </div>
        )}
      </div>

      <div className="h-3 bg-sand-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-teal-300 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </div>
      <p className="text-xs text-dark-300 mt-1.5 text-center">{progress}% complete</p>
    </div>
  );
}
