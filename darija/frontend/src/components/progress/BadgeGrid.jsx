import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Footprints, Flame, BookOpen, Trophy, Compass, Crown,
  MessageCircle, PenTool, Zap, Brain, ArrowUpCircle, Star,
  HelpCircle,
} from 'lucide-react';
import Modal from '../common/Modal';

const iconMap = {
  footprints: Footprints,
  flame: Flame,
  'book-open': BookOpen,
  trophy: Trophy,
  compass: Compass,
  crown: Crown,
  'message-circle': MessageCircle,
  'pen-tool': PenTool,
  zap: Zap,
  brain: Brain,
  'arrow-up-circle': ArrowUpCircle,
  star: Star,
};

export default function BadgeGrid({ badges = [] }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {badges.map((badge, index) => {
          const IconComponent = iconMap[badge.icon] || Star;

          return (
            <motion.button
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedBadge(badge)}
              className={`
                flex flex-col items-center gap-2 p-3 rounded-xl
                transition-all duration-200
                ${
                  badge.earned
                    ? 'bg-white shadow-md border border-gold-300/30 hover:shadow-lg hover:-translate-y-1'
                    : 'bg-sand-100 border border-sand-200 opacity-60 hover:opacity-80'
                }
              `}
            >
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${
                    badge.earned
                      ? 'bg-gradient-to-br from-gold-300 to-gold-400 shadow-sm'
                      : 'bg-dark-100'
                  }
                `}
              >
                {badge.earned ? (
                  <IconComponent size={24} className="text-white" />
                ) : (
                  <HelpCircle size={24} className="text-dark-300" />
                )}
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight ${
                  badge.earned ? 'text-dark' : 'text-dark-300'
                }`}
              >
                {badge.earned ? badge.name : '???'}
              </span>
            </motion.button>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        title={selectedBadge?.earned ? selectedBadge.name : 'Locked Badge'}
        size="sm"
      >
        {selectedBadge && (
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className={`
                w-20 h-20 rounded-2xl flex items-center justify-center
                ${
                  selectedBadge.earned
                    ? 'bg-gradient-to-br from-gold-300 to-gold-400 shadow-lg'
                    : 'bg-dark-100'
                }
              `}
            >
              {(() => {
                const Icon = iconMap[selectedBadge.icon] || Star;
                return selectedBadge.earned ? (
                  <Icon size={40} className="text-white" />
                ) : (
                  <HelpCircle size={40} className="text-dark-300" />
                );
              })()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-dark mb-1">
                {selectedBadge.earned ? selectedBadge.name : 'Keep Learning!'}
              </h3>
              <p className="text-dark-300 text-sm">{selectedBadge.description}</p>
            </div>
            {selectedBadge.earned && selectedBadge.earned_at && (
              <p className="text-xs text-dark-300">
                Earned on {new Date(selectedBadge.earned_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
