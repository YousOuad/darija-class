import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const MOCK_PATH = [
  {
    id: 'm1',
    title: 'Greetings & Basics',
    level: 'A2',
    status: 'completed',
    lessons: [
      { id: 1, title: 'Hello & Goodbye', completed: true },
      { id: 2, title: 'Introducing Yourself', completed: true },
      { id: 3, title: 'How Are You?', completed: true },
    ],
  },
  {
    id: 'm2',
    title: 'Numbers & Shopping',
    level: 'A2',
    status: 'current',
    lessons: [
      { id: 5, title: 'Numbers 1-20', completed: true },
      { id: 6, title: 'At the Market', completed: false },
      { id: 7, title: 'How Much?', completed: false },
      { id: 8, title: 'Colors & Sizes', completed: false },
    ],
  },
  {
    id: 'm3',
    title: 'Food & Drink',
    level: 'A2',
    status: 'locked',
    lessons: [
      { id: 9, title: 'At the Cafe', completed: false },
      { id: 10, title: 'Restaurant Phrases', completed: false },
      { id: 11, title: 'Moroccan Dishes', completed: false },
    ],
  },
  {
    id: 'm4',
    title: 'Family & People',
    level: 'A2',
    status: 'locked',
    lessons: [
      { id: 12, title: 'Family Members', completed: false },
      { id: 13, title: 'Describing People', completed: false },
    ],
  },
  {
    id: 'm5',
    title: 'Daily Routines',
    level: 'B1',
    status: 'locked',
    lessons: [
      { id: 14, title: 'My Morning', completed: false },
      { id: 15, title: 'At Work/School', completed: false },
      { id: 16, title: 'Evening & Weekend', completed: false },
    ],
  },
  {
    id: 'm6',
    title: 'Getting Around',
    level: 'B1',
    status: 'locked',
    lessons: [
      { id: 17, title: 'Asking for Directions', completed: false },
      { id: 18, title: 'Taking a Taxi', completed: false },
      { id: 19, title: 'City Landmarks', completed: false },
    ],
  },
  {
    id: 'm7',
    title: 'Advanced Conversation',
    level: 'B2',
    status: 'locked',
    lessons: [
      { id: 20, title: 'Sharing Opinions', completed: false },
      { id: 21, title: 'Debating Topics', completed: false },
    ],
  },
];

export default function Roadmap() {
  const [expandedModule, setExpandedModule] = useState('m2');

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

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">Learning Path</h1>
        <p className="text-dark-400">Follow the roadmap to master Moroccan Darija step by step.</p>
      </div>

      <div className="max-w-xl mx-auto">
        {MOCK_PATH.map((module, index) => {
          const styles = getNodeStyles(module.status);
          const isExpanded = expandedModule === module.id;
          const completedLessons = module.lessons.filter((l) => l.completed).length;
          const isLast = index === MOCK_PATH.length - 1;

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
                    ${module.status === 'current' ? 'animate-pulse-slow' : ''}
                  `}>
                    {module.status === 'completed' ? (
                      <CheckCircle2 size={24} className="text-white" />
                    ) : module.status === 'locked' ? (
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
                      {module.status === 'current' && (
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

                  {module.status !== 'locked' && (
                    <div className="text-dark-300">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  )}
                </button>

                {/* Expanded lessons */}
                <AnimatePresence>
                  {isExpanded && module.status !== 'locked' && (
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
                          {lesson.completed ? (
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-sand-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${lesson.completed ? 'text-dark-300' : 'text-dark font-medium'}`}>
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
