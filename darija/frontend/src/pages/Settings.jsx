import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Globe, Check, Save } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ScriptText from '../components/common/ScriptText';
import useAuth from '../hooks/useAuth';
import useScript from '../hooks/useScript';

export default function Settings() {
  const { user } = useAuth();
  const { scriptMode, setScriptMode } = useScript();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSaveProfile = () => {
    // In real app, call API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    // In real app, call API
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const scriptOptions = [
    {
      value: 'arabic',
      label: 'Arabic Script',
      sublabel: 'عربي',
      preview: { arabic: 'كيفاش داير؟', latin: null },
      description: 'Show Darija text in Arabic script only',
    },
    {
      value: 'latin',
      label: 'Latin Script',
      sublabel: 'Latin',
      preview: { arabic: null, latin: 'Kifach dayr?' },
      description: 'Show Darija text in Latin/romanized script only',
    },
    {
      value: 'hybrid',
      label: 'Both Scripts',
      sublabel: 'Both',
      preview: { arabic: 'كيفاش داير؟', latin: 'Kifach dayr?' },
      description: 'Show both Arabic and Latin scripts together',
    },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">Settings</h1>
        <p className="text-dark-400">Manage your account and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Script Preference */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-teal-500" />
              <h3 className="text-lg font-bold text-dark">Script Preference</h3>
            </div>
            <p className="text-sm text-dark-400 mb-4">
              Choose how Darija text is displayed throughout the app.
            </p>

            <div className="space-y-3">
              {scriptOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setScriptMode(option.value)}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                    ${scriptMode === option.value
                      ? 'border-teal-400 bg-teal-50'
                      : 'border-sand-200 bg-white hover:border-sand-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-dark">{option.label}</span>
                      <span className="text-dark-300 text-sm ml-2">({option.sublabel})</span>
                    </div>
                    {scriptMode === option.value && (
                      <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-dark-300 mb-2">{option.description}</p>
                  <div className="bg-sand-50 rounded-lg p-2">
                    <p className="text-sm text-dark-400">
                      Preview:{' '}
                      <span className={`font-medium ${option.value === 'arabic' ? 'font-arabic' : ''}`}>
                        {option.value === 'arabic' && option.preview.arabic}
                        {option.value === 'latin' && option.preview.latin}
                        {option.value === 'hybrid' && `${option.preview.arabic} (${option.preview.latin})`}
                      </span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-teal-500" />
              <h3 className="text-lg font-bold text-dark">Profile</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={user?.email || 'user@demo.com'}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-sand-200 bg-sand-50
                    text-sm text-dark-300 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1.5">Current Level</label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-teal-50 text-teal-600 rounded-lg text-sm font-bold">
                    {user?.level || 'B1'}
                  </span>
                  <span className="text-sm text-dark-300">Intermediate</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleSaveProfile}
              >
                <Save size={16} className="mr-2" />
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Lock size={20} className="text-teal-500" />
              <h3 className="text-lg font-bold text-dark">Change Password</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 rounded-xl border border-sand-200
                    focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30
                    text-sm"
                />
              </div>

              <Button
                variant="secondary"
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
              >
                {passwordSaved ? 'Password Updated!' : 'Update Password'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
