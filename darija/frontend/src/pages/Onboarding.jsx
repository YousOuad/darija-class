import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Award, ArrowRight, Check } from 'lucide-react';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const levels = [
  {
    id: 'A2',
    name: 'Elementary',
    icon: BookOpen,
    color: 'from-teal-400 to-teal-600',
    borderColor: 'border-teal-300',
    bgColor: 'bg-teal-50',
    description: 'I know some basic Arabic or French words',
    topics: [
      'Basic greetings and introductions',
      'Numbers, colors, and everyday objects',
      'Simple phrases for shopping and eating',
      'Common expressions and courtesies',
    ],
  },
  {
    id: 'B1',
    name: 'Intermediate',
    icon: GraduationCap,
    color: 'from-terracotta-400 to-terracotta-600',
    borderColor: 'border-terracotta-300',
    bgColor: 'bg-terracotta-50',
    description: 'I can hold basic conversations in Darija',
    topics: [
      'Extended conversations and storytelling',
      'Verb conjugation and sentence structure',
      'Cultural topics and traditions',
      'Expressing opinions and preferences',
    ],
  },
  {
    id: 'B2',
    name: 'Upper Intermediate',
    icon: Award,
    color: 'from-gold-300 to-gold-400',
    borderColor: 'border-gold-300',
    bgColor: 'bg-gold-300/10',
    description: 'I want to refine my Darija and learn nuances',
    topics: [
      'Complex grammar and advanced vocabulary',
      'Idioms, proverbs, and slang',
      'Formal vs informal register',
      'Regional dialect variations',
    ],
  },
];

export default function Onboarding() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = () => {
    // In a real app, save the level to the user's profile
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-sand-50 px-4 py-12 moroccan-pattern">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark mb-4">
            Welcome{user?.display_name ? `, ${user.display_name}` : ''}!
          </h1>
          <p className="text-lg text-dark-400 max-w-xl mx-auto">
            Let's find the right starting point for you. What's your current level of Moroccan Darija?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedLevel(level.id)}
              className={`
                relative cursor-pointer rounded-2xl border-2 p-6
                transition-all duration-300 hover:shadow-lg
                ${
                  selectedLevel === level.id
                    ? `${level.borderColor} ${level.bgColor} shadow-lg`
                    : 'border-sand-200 bg-white hover:border-sand-300'
                }
              `}
            >
              {selectedLevel === level.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}

              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4`}>
                <level.icon size={28} className="text-white" />
              </div>

              <div className="mb-4">
                <span className="text-xs font-bold text-dark-300 uppercase tracking-wider">{level.id}</span>
                <h3 className="text-xl font-bold text-dark">{level.name}</h3>
                <p className="text-sm text-dark-400 mt-1">{level.description}</p>
              </div>

              <ul className="space-y-2">
                {level.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-dark-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    {topic}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
            disabled={!selectedLevel}
          >
            Continue
            <ArrowRight size={18} className="ml-2" />
          </Button>
          <p className="text-xs text-dark-300 mt-3">
            You can change your level later in Settings
          </p>
        </motion.div>
      </div>
    </div>
  );
}
