import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Brain, BarChart3, Globe, ArrowRight, Star, Flame, Users } from 'lucide-react';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

const features = [
  {
    icon: Gamepad2,
    title: 'Interactive Mini-Games',
    description: 'Learn through 10+ engaging game types including word matching, sentence building, memory games, and more.',
    color: 'from-teal-400 to-teal-600',
  },
  {
    icon: Brain,
    title: 'Adaptive Learning',
    description: 'Our system identifies your weak areas and creates personalized sessions to help you improve faster.',
    color: 'from-terracotta-400 to-terracotta-600',
  },
  {
    icon: BarChart3,
    title: 'Track Your Progress',
    description: 'Earn XP, level up, collect badges, and maintain streaks as you master Moroccan Darija.',
    color: 'from-gold-300 to-gold-400',
  },
  {
    icon: Globe,
    title: 'Cultural Immersion',
    description: 'Learn not just the language but the culture. Discover Moroccan traditions, cuisine, and customs.',
    color: 'from-dark-600 to-dark-800',
  },
];

const stats = [
  { value: '500+', label: 'Vocabulary Words', icon: Star },
  { value: '50+', label: 'Lessons', icon: Globe },
  { value: '10+', label: 'Game Types', icon: Gamepad2 },
];

export default function Landing() {
  const { isAuthenticated, mockLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    mockLogin('Youssef');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-sand-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold">
            <span className="text-teal-500">Ta</span>
            <span className="text-terracotta-500">gine</span>
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden moroccan-pattern">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 rounded-full mb-6">
                <span className="text-teal-600 font-semibold text-sm">New: AI Conversation Practice</span>
                <ArrowRight size={14} className="text-teal-500" />
              </div>

              <h1 className="text-5xl md:text-6xl font-extrabold text-dark leading-tight mb-6">
                Learn{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-400">
                  Moroccan Darija
                </span>
                <br />
                the Fun Way
              </h1>

              <p className="text-xl text-dark-400 mb-8 leading-relaxed">
                Master the language spoken by 30+ million people through gamified lessons,
                interactive mini-games, and AI-powered conversations.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button variant="primary" size="lg">
                    Start Learning Free
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={handleDemoLogin}>
                  Try Demo
                </Button>
              </div>

              {/* Mini stats */}
              <div className="flex items-center gap-8 mt-10">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <p className="text-2xl font-bold text-dark">{stat.value}</p>
                    <p className="text-xs text-dark-300">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Decorative right side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Mock phone/app preview */}
                <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm mx-auto border border-sand-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                        <Star size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-dark">Level 3</p>
                        <p className="text-xs text-dark-300">1,250 XP</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-terracotta-50 rounded-lg">
                      <Flame size={16} className="text-terracotta-500" />
                      <span className="text-sm font-bold text-terracotta-500">7</span>
                    </div>
                  </div>

                  <div className="h-2 bg-sand-200 rounded-full mb-6">
                    <div className="h-full w-1/2 bg-gradient-to-r from-teal-500 to-teal-400 rounded-full" />
                  </div>

                  <div className="bg-sand-50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-dark-300 mb-2">Today's Lesson</p>
                    <p className="font-bold text-dark mb-1">Greetings & Introductions</p>
                    <p className="text-sm text-dark-400">Learn essential Darija phrases</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-teal-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-teal-600 font-arabic">سلام</p>
                      <p className="text-xs text-dark-300">Salam</p>
                    </div>
                    <div className="bg-terracotta-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-terracotta-600 font-arabic">شكرا</p>
                      <p className="text-xs text-dark-300">Choukran</p>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-gold-300 text-dark px-4 py-2 rounded-xl shadow-lg text-sm font-bold"
                >
                  +25 XP
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-xl shadow-lg text-sm flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                  <span className="font-medium text-dark">Lesson Complete!</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-dark mb-4">
              Everything You Need to Master Darija
            </h2>
            <p className="text-lg text-dark-400 max-w-2xl mx-auto">
              Our platform combines proven language learning methods with gamification
              to make learning Moroccan Darija engaging and effective.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-sand-50 rounded-2xl p-6 border border-sand-100 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">{feature.title}</h3>
                <p className="text-dark-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-2xl font-extrabold mb-2">
            <span className="text-teal-400">Ta</span>
            <span className="text-terracotta-400">gine</span>
          </p>
          <p className="text-dark-200 text-sm">
            Made with love for the Moroccan Darija language and culture.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Check({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
