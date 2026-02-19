import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuth from '../hooks/useAuth';
import { lessonsAPI, progressAPI } from '../services/api';
import { groupLessonsByModule } from '../utils/dataTransform';

const levelTabs = [
  { id: 'A2', label: 'A2 Elementary', color: 'teal' },
  { id: 'B1', label: 'B1 Intermediate', color: 'terracotta' },
  { id: 'B2', label: 'B2 Upper Intermediate', color: 'gold' },
];

export default function Lessons() {
  const { user } = useAuth();
  const [activeLevel, setActiveLevel] = useState((user?.level || 'a2').toUpperCase());
  const [modulesByLevel, setModulesByLevel] = useState({});
  const [completedIds, setCompletedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [lessonsRes, progressRes] = await Promise.allSettled([
          lessonsAPI.list(),
          progressAPI.getSummary(),
        ]);

        if (lessonsRes.status === 'fulfilled') {
          const lessons = lessonsRes.value.data.lessons || [];
          setModulesByLevel(groupLessonsByModule(lessons));
        }

        if (progressRes.status === 'fulfilled') {
          const completed = progressRes.value.data.completed_lesson_ids || [];
          setCompletedIds(new Set(completed));
        }
      } catch (error) {
        console.error('Failed to load lessons:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const modules = modulesByLevel[activeLevel] || [];

  const getLessonStatus = (lesson, moduleIndex, lessonIndex) => {
    if (completedIds.has(lesson.id)) return 'completed';
    // First uncompleted lesson in the module is available
    const moduleLessons = modules[moduleIndex]?.lessons || [];
    const firstUncompletedIndex = moduleLessons.findIndex((l) => !completedIds.has(l.id));
    if (lessonIndex === firstUncompletedIndex) return 'available';
    if (lessonIndex < firstUncompletedIndex || firstUncompletedIndex === -1) return 'completed';
    return 'available'; // unlock all for now since backend doesn't enforce order
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={18} className="text-green-500" />;
      case 'available':
        return <BookOpen size={18} className="text-teal-500" />;
      case 'locked':
        return <Lock size={18} className="text-dark-200" />;
      default:
        return null;
    }
  };

  const getModuleProgress = (module) => {
    const completed = module.lessons.filter((l) => completedIds.has(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner size="lg" text="Loading lessons..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">Lessons</h1>
        <p className="text-dark-400">Browse and complete lessons to earn XP and level up.</p>
      </div>

      {/* Level Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {levelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLevel(tab.id)}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
              transition-all duration-200
              ${
                activeLevel === tab.id
                  ? tab.color === 'teal'
                    ? 'bg-teal-500 text-white shadow-md'
                    : tab.color === 'terracotta'
                    ? 'bg-terracotta-500 text-white shadow-md'
                    : 'bg-gold-300 text-dark shadow-md'
                  : 'bg-white text-dark-400 border border-sand-200 hover:bg-sand-50'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {modules.length === 0 ? (
          <Card>
            <p className="text-dark-400 text-center py-8">No lessons available for this level yet.</p>
          </Card>
        ) : (
          modules.map((module, moduleIndex) => {
            const progress = getModuleProgress(module);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
              >
                <Card>
                  {/* Module header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-dark">{module.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-sm font-bold text-teal-500">{progress}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-sand-200 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: moduleIndex * 0.1 }}
                    />
                  </div>

                  {/* Lessons list */}
                  <div className="space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const status = getLessonStatus(lesson, moduleIndex, lessonIndex);
                      return (
                        <Link
                          key={lesson.id}
                          to={status !== 'locked' ? `/lesson/${lesson.id}` : '#'}
                          className={`
                            flex items-center gap-3 px-3 py-3 rounded-xl
                            transition-colors duration-200
                            ${status === 'locked'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-sand-50 cursor-pointer'
                            }
                          `}
                        >
                          {getStatusIcon(status)}
                          <span className={`flex-1 text-sm font-medium ${
                            status === 'locked' ? 'text-dark-300' : 'text-dark'
                          }`}>
                            {lesson.title}
                          </span>
                          <span className="text-xs text-dark-300">{lesson.xp} XP</span>
                          {status !== 'locked' && (
                            <ChevronRight size={16} className="text-dark-300" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
