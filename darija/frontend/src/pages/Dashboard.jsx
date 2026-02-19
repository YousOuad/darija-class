import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Gamepad2, BookOpen, TrendingUp, Clock, ArrowRight,
  Target,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import XPBar from '../components/progress/XPBar';
import StreakCounter from '../components/progress/StreakCounter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import useProgressStore from '../store/progressStore';
import { lessonsAPI, progressAPI } from '../services/api';
import { transformActivity } from '../utils/dataTransform';

export default function Dashboard() {
  const { user } = useAuth();
  const { xp, streak, lessonsCompleted, gamesPlayed, fetchProgress } = useProgressStore();

  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedLesson, setRecommendedLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchProgress();
        const [activityRes, recommendedRes] = await Promise.allSettled([
          progressAPI.getRecentActivity(5),
          lessonsAPI.getRecommended(),
        ]);
        if (activityRes.status === 'fulfilled') {
          setRecentActivity(transformActivity(activityRes.value.data || []));
        }
        if (recommendedRes.status === 'fulfilled') {
          setRecommendedLesson(recommendedRes.value.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const quickStats = [
    { label: 'Lessons Done', value: lessonsCompleted, icon: BookOpen, color: 'text-teal-500' },
    { label: 'Games Played', value: gamesPlayed, icon: Gamepad2, color: 'text-terracotta-500' },
    { label: 'Current Level', value: `Lv.${Math.floor(xp / 500) + 1}`, icon: TrendingUp, color: 'text-gold-500' },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark">
          Welcome back, {user?.display_name || 'Learner'}!
        </h1>
        <p className="text-dark-400 mt-1">Ready for today's Darija practice?</p>
      </motion.div>

      {/* Daily Session CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link to="/session">
          <div className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-6 md:p-8 mb-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target size={20} className="text-white/80" />
                  <span className="text-teal-100 text-sm font-medium">Daily Session</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                  Start Today's Session
                </h2>
                <p className="text-teal-100 text-sm md:text-base">
                  6 mini-games tailored to your level. Earn up to 150 XP!
                </p>
              </div>
              <motion.div
                className="hidden md:flex items-center"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight size={32} className="text-white" />
                </div>
              </motion.div>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
          </div>
        </Link>
      </motion.div>

      {/* XP + Streak Row */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <XPBar xp={xp} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StreakCounter streak={streak} />
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.05 }}
          >
            <Card className="text-center">
              <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-dark">{stat.value}</p>
              <p className="text-xs text-dark-300">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recommended Lesson */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={18} className="text-teal-500" />
              <h3 className="font-bold text-dark">Recommended Lesson</h3>
            </div>
            {recommendedLesson ? (
              <>
                <div className="bg-sand-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-teal-500 bg-teal-50 px-2 py-0.5 rounded">
                      {(recommendedLesson.level || '').toUpperCase()}
                    </span>
                    <span className="text-xs text-dark-300">{recommendedLesson.module}</span>
                  </div>
                  <h4 className="font-bold text-dark mb-1">{recommendedLesson.title}</h4>
                </div>
                <Link to={`/lesson/${recommendedLesson.id}`}>
                  <Button variant="primary" fullWidth>
                    Start Lesson
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-sm text-dark-400">No lessons available yet.</p>
            )}
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <h3 className="font-bold text-dark mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-sand-50 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activity.type === 'lesson' ? 'bg-teal-50' : 'bg-terracotta-50'
                    }`}>
                      {activity.type === 'lesson' ? (
                        <BookOpen size={16} className="text-teal-500" />
                      ) : (
                        <Gamepad2 size={16} className="text-terracotta-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{activity.title}</p>
                      <p className="text-xs text-dark-300">{activity.time}</p>
                    </div>
                    <span className="text-xs font-bold text-gold-500">+{activity.xp} XP</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-400">No activity yet. Start a lesson or game session!</p>
            )}
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
