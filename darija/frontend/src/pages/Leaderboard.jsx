import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import { leaderboardAPI } from '../services/api';
import { transformLeaderboard } from '../utils/dataTransform';

const periods = [
  { id: 'weekly', label: 'This Week' },
  { id: 'monthly', label: 'This Month' },
  { id: 'alltime', label: 'All Time' },
];

const podiumColors = {
  1: { bg: 'bg-gradient-to-br from-yellow-300 to-yellow-400', text: 'text-yellow-700', ring: 'ring-yellow-300', height: 'h-28' },
  2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', text: 'text-gray-600', ring: 'ring-gray-300', height: 'h-24' },
  3: { bg: 'bg-gradient-to-br from-amber-500 to-amber-600', text: 'text-amber-700', ring: 'ring-amber-300', height: 'h-20' },
};

export default function Leaderboard() {
  const [activePeriod, setActivePeriod] = useState('weekly');
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = async (period) => {
    setIsLoading(true);
    try {
      const response = await leaderboardAPI.get(period);
      const transformed = transformLeaderboard(response.data, user?.id);
      setData(transformed);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activePeriod);
  }, [activePeriod]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard(activePeriod);
    }, 30000);
    return () => clearInterval(interval);
  }, [activePeriod]);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">Leaderboard</h1>
        <p className="text-dark-400">See how you rank among fellow Darija learners.</p>
      </div>

      {/* Period Tabs */}
      <div className="flex items-center gap-2 mb-8">
        {periods.map((period) => (
          <button
            key={period.id}
            onClick={() => setActivePeriod(period.id)}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${activePeriod === period.id
                ? 'bg-teal-500 text-white shadow-md'
                : 'bg-white text-dark-400 border border-sand-200 hover:bg-sand-50'
              }
            `}
          >
            {period.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSpinner size="lg" text="Loading leaderboard..." />
      ) : data.length === 0 ? (
        <Card>
          <p className="text-dark-400 text-center py-8">No leaderboard data available yet. Start learning to appear here!</p>
        </Card>
      ) : (
        <>
          {/* Podium */}
          <motion.div
            key={activePeriod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-end justify-center gap-3 mb-4">
              {podiumOrder.map((entry, displayIndex) => {
                if (!entry) return null;
                const rank = entry.rank;
                const colors = podiumColors[rank];
                if (!colors) return null;

                return (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: displayIndex * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    {/* Avatar */}
                    <div className="relative mb-2">
                      <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center ring-4 ${colors.ring}`}>
                        <span className="text-xl font-bold text-white">{entry.avatar}</span>
                      </div>
                      {rank === 1 && (
                        <Crown size={20} className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm font-bold text-dark truncate max-w-[90px]">{entry.name}</p>
                    <p className="text-xs text-dark-300 font-medium">{entry.xp.toLocaleString()} XP</p>

                    {/* Podium block */}
                    <div className={`${colors.height} w-24 ${colors.bg} rounded-t-xl mt-2 flex items-center justify-center`}>
                      <span className="text-2xl font-extrabold text-white">{rank}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Rest of rankings */}
          {rest.length > 0 && (
            <Card>
              <div className="space-y-1">
                {rest.map((entry, index) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-xl
                      transition-colors duration-200
                      ${entry.isCurrentUser
                        ? 'bg-teal-50 border border-teal-200'
                        : 'hover:bg-sand-50'
                      }
                    `}
                  >
                    <span className={`w-8 text-center text-sm font-bold ${
                      entry.isCurrentUser ? 'text-teal-500' : 'text-dark-300'
                    }`}>
                      #{entry.rank}
                    </span>

                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${entry.isCurrentUser
                        ? 'bg-gradient-to-br from-teal-400 to-teal-600'
                        : 'bg-gradient-to-br from-dark-400 to-dark-600'
                      }
                    `}>
                      {entry.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${entry.isCurrentUser ? 'text-teal-600 font-bold' : 'text-dark'}`}>
                        {entry.name}
                        {entry.isCurrentUser && <span className="ml-2 text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded">You</span>}
                      </p>
                    </div>

                    <span className={`text-sm font-bold ${entry.isCurrentUser ? 'text-teal-500' : 'text-dark-400'}`}>
                      {entry.xp.toLocaleString()} XP
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </AppLayout>
  );
}
