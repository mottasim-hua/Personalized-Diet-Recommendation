import { motion } from 'framer-motion';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { getDietitians, createDietitian, updateDietitian, deleteDietitian } from '../api/services';

const mockDietitians = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    email: 'sarah@example.com',
    specialization: 'Weight Management',
    phone: '+1-234-567-8901',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Dr. Mike Thompson',
    email: 'mike@example.com',
    specialization: 'Sports Nutrition',
    phone: '+1-234-567-8902',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Dr. John Anderson',
    email: 'john@example.com',
    specialization: 'Clinical Nutrition',
    phone: '+1-234-567-8903',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Dr. Emma Wilson',
    email: 'emma.w@example.com',
    specialization: 'Plant-Based Diets',
    phone: '+1-234-567-8904',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Dr. Robert Lee',
    email: 'robert@example.com',
    specialization: 'Diabetes Management',
    phone: '+1-234-567-8905',
    status: 'Inactive',
  },
];

export default function ManageDietitians() {
  const [dietitians, setDietitians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    phone: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch dietitians from PHP backend
  useEffect(() => {
    fetchDietitians();
  }, []);

  const fetchDietitians = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDietitians();
      if (response.success && response.data) {
        setDietitians(response.data);
      } else {
        setError('Failed to load dietitians');
      }
    } catch (err) {
      console.error('Error fetching dietitians:', err);
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
        await updateDietitian(editingId, formData);
      } else {
        await createDietitian(formData);
      }
      await fetchDietitians();
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        specialization: '',
        phone: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error saving dietitian:', err);
      setError('Failed to save dietitian');
    }
  };

  const handleEdit = (dietitian) => {
    setFormData(dietitian);
    setEditingId(dietitian.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dietitian?')) {
      try {
        await deleteDietitian(id);
        await fetchDietitians();
      } catch (err) {
        console.error('Error deleting dietitian:', err);
        setError('Failed to delete dietitian');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dietitians...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Dietitians"
        description="View and manage dietitian profiles"
      />

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <motion.div

  const handleSave = () => {
    if (!formData.name || !formData.email) return;

    if (editingId) {
      setDietitians(
        dietitians.map((d) => (d.id === editingId ? { ...d, ...formData } : d)),
      );
    } else {
      setDietitians([
        ...dietitians,
        {
          id: Math.max(...dietitians.map((d) => d.id), 0) + 1,
          ...formData,
          status: 'Active',
        },
      ]);
    }

    setShowModal(false);
    setFormData({ name: '', email: '', specialization: '', phone: '' });
    setEditingId(null);
  };

  const handleEdit = (dietitian) => {
    setFormData(dietitian);
    setEditingId(dietitian.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDietitians(dietitians.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Dietitians"
        description="View and manage dietitian profiles"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <button
          onClick={() => {
            setFormData({ name: '', email: '', specialization: '', phone: '' });
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
        >
          <Plus size={20} /> Add Dietitian
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
                  Specialization
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Phone
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
              {dietitians.map((dietitian) => (
                <tr
                  key={dietitian.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                    {dietitian.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {dietitian.email}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {dietitian.specialization}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {dietitian.phone}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        dietitian.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {dietitian.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(dietitian)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition text-blue-600 dark:text-blue-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(dietitian.id)}
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
                {editingId ? 'Edit Dietitian' : 'Add Dietitian'}
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
                type="text"
                placeholder="Specialization"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
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
