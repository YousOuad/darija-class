import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Flame,
  Settings,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useScript from '../../hooks/useScript';
import useProgressStore from '../../store/progressStore';
import { formatXP, getLevelFromXP } from '../../utils/xpHelpers';

export default function Header({ onToggleSidebar, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { scriptMode, setScriptMode } = useScript();
  const { xp, streak } = useProgressStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const scriptOptions = [
    { value: 'arabic', label: 'عربي' },
    { value: 'latin', label: 'Latin' },
    { value: 'hybrid', label: 'Both' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-sand-100 shadow-sm">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-sand-100 transition-colors"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold">
              <span className="text-teal-500">Ta</span>
              <span className="text-terracotta-500">gine</span>
            </span>
          </Link>
        </div>

        {/* Center - Script Toggle */}
        <div className="hidden sm:flex items-center bg-sand-100 rounded-xl p-1">
          {scriptOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setScriptMode(option.value)}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${option.value === 'arabic' ? 'font-arabic' : ''}
                ${
                  scriptMode === option.value
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-dark'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* XP Display */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gold-300/20 rounded-xl">
            <span className="text-gold-500 font-bold text-sm">
              {formatXP(xp)} XP
            </span>
            <span className="text-dark-300 text-xs">
              Lv.{getLevelFromXP(xp)}
            </span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-terracotta-500/10 rounded-xl">
            <Flame size={18} className="text-terracotta-500" />
            <span className="text-terracotta-500 font-bold text-sm">{streak}</span>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-sand-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.display_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <ChevronDown size={16} className="hidden sm:block text-dark-300" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-sand-100 py-2 z-50"
                >
                  <div className="px-4 py-3 border-b border-sand-100">
                    <p className="font-semibold text-dark">{user?.display_name || 'User'}</p>
                    <p className="text-sm text-dark-300">{user?.email || 'user@demo.com'}</p>
                  </div>

                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-400 hover:bg-sand-50 transition-colors"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <Link
                    to="/progress"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-400 hover:bg-sand-50 transition-colors"
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  <div className="border-t border-sand-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile script toggle */}
      <div className="sm:hidden flex items-center justify-center pb-2 px-4">
        <div className="flex items-center bg-sand-100 rounded-xl p-1 w-full max-w-xs">
          {scriptOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setScriptMode(option.value)}
              className={`
                flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${option.value === 'arabic' ? 'font-arabic' : ''}
                ${
                  scriptMode === option.value
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-dark-400 hover:text-dark'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
