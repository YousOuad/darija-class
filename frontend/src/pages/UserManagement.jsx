import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, Users, Shield, GraduationCap, Crown, X } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import useAuth from '../hooks/useAuth';
import { authAPI } from '../services/api';

const roleIcons = {
  student: GraduationCap,
  teacher: Shield,
  admin: Crown,
};

const roleColors = {
  student: { bg: 'bg-teal-100', text: 'text-teal-600' },
  teacher: { bg: 'bg-purple-100', text: 'text-purple-600' },
  admin: { bg: 'bg-red-100', text: 'text-red-600' },
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const fetchUsers = async () => {
    try {
      const res = await authAPI.listUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await authAPI.createUser(formData);
      setSuccess(`User "${formData.display_name}" created successfully. Temporary password: ${formData.password}`);
      setFormData({ display_name: '', email: '', password: '', role: 'student' });
      setShowCreateForm(false);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await authAPI.deleteUser(userId);
      setDeleteConfirm(null);
      setSuccess('User deleted successfully');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const availableRoles = isAdmin
    ? ['student', 'teacher', 'admin']
    : ['student', 'teacher'];

  return (
    <AppLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">User Management</h1>
          <p className="text-dark-400">Create and manage user accounts.</p>
        </div>
        <Button variant="primary" onClick={() => { setShowCreateForm(true); setError(''); setSuccess(''); }}>
          <UserPlus size={16} className="mr-2" />
          New User
        </Button>
      </div>

      {/* Success message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start justify-between"
          >
            <p className="text-sm text-green-700 whitespace-pre-wrap">{success}</p>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600 ml-3">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between"
          >
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create user form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserPlus size={20} className="text-teal-500" />
                  <h3 className="text-lg font-bold text-dark">Create New User</h3>
                </div>
                <button onClick={() => setShowCreateForm(false)} className="text-dark-300 hover:text-dark">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      required
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="user@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30 text-sm"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Temporary Password</label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-3 rounded-xl border border-sand-200
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-300/30 text-sm"
                    />
                    <p className="text-xs text-dark-300 mt-1">Write this down and share it with the user.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-400 mb-1.5">Role</label>
                    <div className="flex gap-2">
                      {availableRoles.map((role) => {
                        const RoleIcon = roleIcons[role];
                        const colors = roleColors[role];
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setFormData({ ...formData, role })}
                            className={`
                              flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 transition-all text-sm font-medium
                              ${formData.role === role
                                ? `border-teal-400 ${colors.bg} ${colors.text}`
                                : 'border-sand-200 text-dark-400 hover:border-sand-300'
                              }
                            `}
                          >
                            <RoleIcon size={16} />
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowCreateForm(false)} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" loading={creating}>
                    <UserPlus size={16} className="mr-2" />
                    Create User
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users list */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-teal-500" />
          <h3 className="text-lg font-bold text-dark">All Users ({users.length})</h3>
        </div>

        {loading ? (
          <div className="text-center py-8 text-dark-300">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-dark-300">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sand-200">
                  <th className="text-left py-3 px-4 font-semibold text-dark-400">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-400">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-400">Role</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-400">Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark-400">XP</th>
                  <th className="text-right py-3 px-4 font-semibold text-dark-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const RoleIcon = roleIcons[u.role] || GraduationCap;
                  const colors = roleColors[u.role] || roleColors.student;
                  const isCurrentUser = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-sand-100 hover:bg-sand-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {u.display_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="font-medium text-dark">
                            {u.display_name}
                            {isCurrentUser && <span className="text-dark-300 text-xs ml-1">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-dark-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text}`}>
                          <RoleIcon size={12} />
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded text-xs font-bold">
                          {(u.level || 'a2').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-dark-400">{u.xp}</td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrentUser && (u.role !== 'admin' || isAdmin) && (
                          deleteConfirm === u.id ? (
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-3 py-1.5 bg-sand-200 text-dark-400 text-xs font-medium rounded-lg hover:bg-sand-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(u.id)}
                              className="p-2 text-dark-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
