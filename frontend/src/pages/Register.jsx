import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';

export default function Register() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    try {
      await register(displayName, email, password);
      navigate('/onboarding');
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-sand-50 moroccan-pattern">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold">
            <span className="text-teal-500">Ta</span>
            <span className="text-terracotta-500">gine</span>
          </Link>
          <p className="text-dark-300 mt-2">Create your account and start learning today!</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-sand-100">
          <h2 className="text-2xl font-bold text-dark mb-6">Sign Up</h2>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4"
            >
              <p className="text-sm text-red-600">{displayError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1.5">Display Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => { setDisplayName(e.target.value); clearError(); setLocalError(''); }}
                  placeholder="Your name"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(''); }}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(''); }}
                  placeholder="At least 8 characters"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 hover:text-dark"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }}
                  placeholder="Repeat your password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-dark-300 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-500 font-semibold hover:text-teal-600">
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
