import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import XPBar from '../components/progress/XPBar';
import StreakCounter from '../components/progress/StreakCounter';
import BadgeGrid from '../components/progress/BadgeGrid';
import SkillRadar from '../components/progress/SkillRadar';
import useProgressStore from '../store/progressStore';
import { formatXP, getLevelFromXP } from '../utils/xpHelpers';

export default function Progress() {
  const { xp, streak, badges, skills, xpHistory, weaknesses, lessonsCompleted, gamesPlayed } = useProgressStore();
  const level = getLevelFromXP(xp);

  const overallStats = [
    { label: 'Total XP', value: formatXP(xp), color: 'text-gold-500' },
    { label: 'Level', value: level, color: 'text-teal-500' },
    { label: 'Streak', value: `${streak} days`, color: 'text-terracotta-500' },
    { label: 'Lessons', value: lessonsCompleted, color: 'text-dark' },
    { label: 'Games', value: gamesPlayed, color: 'text-dark' },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">Your Progress</h1>
        <p className="text-dark-400">Track your learning journey and see how far you've come.</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {overallStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="text-center">
              <p className={`text-xl md:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-dark-300">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* XP + Streak */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <XPBar xp={xp} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StreakCounter streak={streak} />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* XP History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-teal-500" />
              <h3 className="font-bold text-dark">XP History (Last 14 Days)</h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={xpHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F4E8C1" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9e9eb7' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9e9eb7' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #F4E8C1',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="xp"
                    stroke="#2A9D8F"
                    strokeWidth={2.5}
                    dot={{ fill: '#2A9D8F', r: 4 }}
                    activeDot={{ fill: '#2A9D8F', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SkillRadar skills={skills} />
        </motion.div>
      </div>

      {/* Weaknesses */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-terracotta-500" />
            <h3 className="font-bold text-dark">Areas to Improve</h3>
          </div>
          <div className="space-y-3">
            {weaknesses.map((weakness, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-sand-50 rounded-xl">
                <div className="flex-shrink-0">
                  <AlertTriangle size={18} className="text-terracotta-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-dark">{weakness.area}</span>
                    <span className="text-sm font-bold text-terracotta-500">{weakness.score}%</span>
                  </div>
                  <div className="h-1.5 bg-sand-200 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-terracotta-400 rounded-full"
                      style={{ width: `${weakness.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-300">{weakness.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <h3 className="font-bold text-dark mb-4">Badge Collection</h3>
          <BadgeGrid badges={badges} />
        </Card>
      </motion.div>
    </AppLayout>
  );
}
