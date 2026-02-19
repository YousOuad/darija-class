import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Lock, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';

const MOCK_MODULES = {
  A2: [
    {
      id: 'a2-m1',
      title: 'Greetings & Basics',
      description: 'Essential greetings, introductions, and basic expressions.',
      lessons: [
        { id: 1, title: 'Hello & Goodbye', status: 'completed', xp: 50 },
        { id: 2, title: 'Introducing Yourself', status: 'completed', xp: 50 },
        { id: 3, title: 'How Are You?', status: 'available', xp: 50 },
        { id: 4, title: 'Please & Thank You', status: 'locked', xp: 50 },
      ],
    },
    {
      id: 'a2-m2',
      title: 'Numbers & Shopping',
      description: 'Learn numbers, prices, and basic shopping vocabulary.',
      lessons: [
        { id: 5, title: 'Numbers 1-20', status: 'completed', xp: 50 },
        { id: 6, title: 'At the Market', status: 'available', xp: 50 },
        { id: 7, title: 'How Much?', status: 'locked', xp: 50 },
        { id: 8, title: 'Colors & Sizes', status: 'locked', xp: 50 },
      ],
    },
    {
      id: 'a2-m3',
      title: 'Food & Drink',
      description: 'Order food, talk about meals, and learn food vocabulary.',
      lessons: [
        { id: 9, title: 'At the Cafe', status: 'locked', xp: 50 },
        { id: 10, title: 'Restaurant Phrases', status: 'locked', xp: 50 },
        { id: 11, title: 'Moroccan Dishes', status: 'locked', xp: 50 },
      ],
    },
  ],
  B1: [
    {
      id: 'b1-m1',
      title: 'Daily Routines',
      description: 'Describe your day, habits, and daily activities.',
      lessons: [
        { id: 12, title: 'My Morning', status: 'available', xp: 75 },
        { id: 13, title: 'At Work/School', status: 'locked', xp: 75 },
        { id: 14, title: 'Evening & Weekend', status: 'locked', xp: 75 },
      ],
    },
    {
      id: 'b1-m2',
      title: 'Getting Around',
      description: 'Directions, transportation, and navigating cities.',
      lessons: [
        { id: 15, title: 'Asking for Directions', status: 'locked', xp: 75 },
        { id: 16, title: 'Taking a Taxi', status: 'locked', xp: 75 },
        { id: 17, title: 'City Landmarks', status: 'locked', xp: 75 },
      ],
    },
  ],
  B2: [
    {
      id: 'b2-m1',
      title: 'Conversations & Opinions',
      description: 'Express opinions, debate, and have deeper conversations.',
      lessons: [
        { id: 18, title: 'Sharing Opinions', status: 'locked', xp: 100 },
        { id: 19, title: 'Agreeing & Disagreeing', status: 'locked', xp: 100 },
        { id: 20, title: 'Current Events', status: 'locked', xp: 100 },
      ],
    },
  ],
};

const levelTabs = [
  { id: 'A2', label: 'A2 Elementary', color: 'teal' },
  { id: 'B1', label: 'B1 Intermediate', color: 'terracotta' },
  { id: 'B2', label: 'B2 Upper Intermediate', color: 'gold' },
];

export default function Lessons() {
  const [activeLevel, setActiveLevel] = useState('A2');

  const modules = MOCK_MODULES[activeLevel] || [];

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
    const completed = module.lessons.filter((l) => l.status === 'completed').length;
    return Math.round((completed / module.lessons.length) * 100);
  };

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
        {modules.map((module, moduleIndex) => {
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
                    <p className="text-sm text-dark-400 mt-0.5">{module.description}</p>
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
                  {module.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      to={lesson.status !== 'locked' ? `/lesson/${lesson.id}` : '#'}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-xl
                        transition-colors duration-200
                        ${lesson.status === 'locked'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-sand-50 cursor-pointer'
                        }
                      `}
                    >
                      {getStatusIcon(lesson.status)}
                      <span className={`flex-1 text-sm font-medium ${
                        lesson.status === 'locked' ? 'text-dark-300' : 'text-dark'
                      }`}>
                        {lesson.title}
                      </span>
                      <span className="text-xs text-dark-300">{lesson.xp} XP</span>
                      {lesson.status !== 'locked' && (
                        <ChevronRight size={16} className="text-dark-300" />
                      )}
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}
