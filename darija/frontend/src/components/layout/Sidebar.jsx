import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Map,
  Gamepad2,
  BarChart3,
  Trophy,
  Settings,
  PenSquare,
  Layers,
  MessageCircle,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lessons', label: 'Lessons', icon: BookOpen },
  { to: '/roadmap', label: 'Roadmap', icon: Map },
  { to: '/session', label: 'Games', icon: Gamepad2 },
  { to: '/flashcards', label: 'Flash Cards', icon: Layers },
  { to: '/conversation', label: 'Conversation', icon: MessageCircle },
  { to: '/progress', label: 'Progress', icon: BarChart3 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  const allNavItems = isTeacherOrAdmin
    ? [...navItems, { to: '/curriculum-editor', label: 'Curriculum', icon: PenSquare }]
    : navItems;

  const sidebarContent = (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {allNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-dark-400 hover:bg-sand-100 hover:text-dark'
            }`
          }
        >
          <item.icon size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-60 bg-white border-r border-sand-100 overflow-y-auto">
        {sidebarContent}
        <div className="mt-auto px-4 py-4 border-t border-sand-100">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white">
            <p className="text-sm font-semibold mb-1">Daily Goal</p>
            <p className="text-xs opacity-80">Complete your session to earn bonus XP!</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-dark/40 backdrop-blur-sm z-30"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-40 overflow-y-auto pt-20"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
