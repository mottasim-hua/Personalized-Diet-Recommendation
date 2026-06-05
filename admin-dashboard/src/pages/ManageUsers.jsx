import { motion } from 'framer-motion';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createUser, deleteUser, getUsers, updateUser } from '../api/services';
import PageHeader from '../components/PageHeader';

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 28,
    weight: 85,
    height: 180,
    goal: 'Weight Loss',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Emma Wilson',
    email: 'emma@example.com',
    age: 34,
    weight: 72,
    height: 168,
    goal: 'Maintenance',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Alex Martinez',
    email: 'alex@example.com',
    age: 31,
    weight: 92,
    height: 185,
    goal: 'Muscle Gain',
    status: 'Inactive',
  },
  {
    id: 4,
    name: 'Lisa Chen',
    email: 'lisa@example.com',
    age: 26,
    weight: 65,
    height: 165,
    goal: 'Weight Loss',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Michael Johnson',
    email: 'michael@example.com',
    age: 45,
    weight: 88,
    height: 182,
    goal: 'Weight Loss',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Sarah Davis',
    email: 'sarah@example.com',
    age: 29,
    weight: 70,
    height: 170,
    goal: 'Maintenance',
    status: 'Active',
  },
  {
    id: 7,
    name: 'James Brown',
    email: 'james@example.com',
    age: 52,
    weight: 95,
    height: 188,
    goal: 'Weight Loss',
    status: 'Inactive',
  },
  {
    id: 8,
    name: 'Rachel Garcia',
    email: 'rachel@example.com',
    age: 23,
    weight: 62,
    height: 162,
    goal: 'Muscle Gain',
    status: 'Active',
  },
];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    weight: '',
    height: '',
    goal: 'Weight Loss',
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch users from PHP backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    try {
      if (editingId) {
        await updateUser(editingId, formData);
      } else {
        await createUser(formData);
      }
      await fetchUsers();
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        age: '',
        weight: '',
        height: '',
        goal: 'Weight Loss',
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setFormData(user);
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        await fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="View and manage all user accounts in the system"
      />

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              age: '',
              weight: '',
              height: '',
              goal: 'Weight Loss',
            });
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
        >
          <Plus size={20} /> Add User
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Age
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Weight
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Goal
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {user.age}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {user.weight} kg
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {user.goal}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition text-blue-600 dark:text-blue-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingId ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Height (cm)"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <select
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
              </select>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
