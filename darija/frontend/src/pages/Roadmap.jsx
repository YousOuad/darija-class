import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { lessonsAPI, progressAPI } from '../services/api';
import { groupLessonsByModule } from '../utils/dataTransform';

export default function Roadmap() {
  const [expandedModule, setExpandedModule] = useState(null);
  const [modules, setModules] = useState([]);
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

        let allModules = [];
        if (lessonsRes.status === 'fulfilled') {
          const lessons = lessonsRes.value.data.lessons || [];
          const grouped = groupLessonsByModule(lessons);
          // Flatten all levels into a single roadmap path
          for (const level of ['A2', 'B1', 'B2']) {
            const levelModules = grouped[level] || [];
            allModules = allModules.concat(
              levelModules.map((m) => ({ ...m, level }))
            );
          }
        }

        let completed = new Set();
        if (progressRes.status === 'fulfilled') {
          const ids = progressRes.value.data.completed_lesson_ids || [];
          completed = new Set(ids);
        }

        setModules(allModules);
        setCompletedIds(completed);

        // Auto-expand the first module that has uncompleted lessons
        const currentIdx = allModules.findIndex((m) =>
          m.lessons.some((l) => !completed.has(l.id))
        );
        if (currentIdx >= 0) {
          setExpandedModule(allModules[currentIdx].id);
        }
      } catch (error) {
        console.error('Failed to load roadmap:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getModuleStatus = (module) => {
    const allCompleted = module.lessons.every((l) => completedIds.has(l.id));
    const someCompleted = module.lessons.some((l) => completedIds.has(l.id));
    if (allCompleted) return 'completed';
    if (someCompleted) return 'current';
    // Check if previous module in the list is completed
    const idx = modules.indexOf(module);
    if (idx === 0) return 'current';
    const prevModule = modules[idx - 1];
    const prevAllCompleted = prevModule.lessons.every((l) => completedIds.has(l.id));
    return prevAllCompleted ? 'current' : 'locked';
  };

  const getNodeStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-gradient-to-br from-green-400 to-green-500',
          border: 'border-green-300',
          line: 'bg-green-400',
          text: 'text-dark',
        };
      case 'current':
        return {
          bg: 'bg-gradient-to-br from-teal-400 to-teal-500',
          border: 'border-teal-300',
          line: 'bg-teal-300',
          text: 'text-dark',
        };
      case 'locked':
        return {
          bg: 'bg-dark-100',
          border: 'border-dark-100',
          line: 'bg-dark-100',
          text: 'text-dark-300',
        };
      default:
        return {
          bg: 'bg-dark-100',
          border: 'border-dark-100',
          line: 'bg-dark-100',
          text: 'text-dark-300',
        };
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'A2':
        return 'bg-teal-100 text-teal-600';
      case 'B1':
        return 'bg-terracotta-100 text-terracotta-600';
      case 'B2':
        return 'bg-gold-300/30 text-gold-500';
      default:
        return 'bg-sand-200 text-dark-400';
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSpinner size="lg" text="Loading roadmap..." />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">Learning Path</h1>
        <p className="text-dark-400">Follow the roadmap to master Moroccan Darija step by step.</p>
      </div>

      <div className="max-w-xl mx-auto">
        {modules.map((module, index) => {
          const status = getModuleStatus(module);
          const styles = getNodeStyles(status);
          const isExpanded = expandedModule === module.id;
          const completedLessons = module.lessons.filter((l) => completedIds.has(l.id)).length;
          const isLast = index === modules.length - 1;

          return (
            <div key={module.id} className="relative">
              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-14 bottom-0 w-0.5 ${styles.line}`}
                  style={{ zIndex: 0 }}
                />
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="relative z-10 mb-4"
              >
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md border border-sand-100 hover:shadow-lg transition-all text-left"
                >
                  {/* Node circle */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${styles.bg} shadow-sm
                    ${status === 'current' ? 'animate-pulse-slow' : ''}
                  `}>
                    {status === 'completed' ? (
                      <CheckCircle2 size={24} className="text-white" />
                    ) : status === 'locked' ? (
                      <Lock size={24} className="text-dark-300" />
                    ) : (
                      <BookOpen size={24} className="text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getLevelBadge(module.level)}`}>
                        {module.level}
                      </span>
                      {status === 'current' && (
                        <span className="text-xs font-medium text-teal-500 bg-teal-50 px-2 py-0.5 rounded">
                          In Progress
                        </span>
                      )}
                    </div>
                    <h3 className={`font-bold truncate ${styles.text}`}>{module.title}</h3>
                    <p className="text-xs text-dark-300">
                      {completedLessons}/{module.lessons.length} lessons
                    </p>
                  </div>

                  {status !== 'locked' && (
                    <div className="text-dark-300">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  )}
                </button>

                {/* Expanded lessons */}
                <AnimatePresence>
                  {isExpanded && status !== 'locked' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 pl-8 border-l-2 border-sand-200 mt-2 space-y-1"
                    >
                      {module.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          to={`/lesson/${lesson.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sand-50 transition-colors"
                        >
                          {completedIds.has(lesson.id) ? (
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-sand-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${completedIds.has(lesson.id) ? 'text-dark-300' : 'text-dark font-medium'}`}>
                            {lesson.title}
                          </span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
