import { motion } from 'framer-motion';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { getPlans, createPlan, updatePlan, deletePlan } from '../api/services';

const mockPlans = [
  {
    id: 1,
    name: 'Rapid Fat Loss',
    type: 'Weight Loss',
    duration: 12,
    description: 'Intensive 12-week fat loss program',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Muscle Builder Pro',
    type: 'Muscle Gain',
    duration: 16,
    description: 'Advanced muscle building',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Keto Mastery',
    type: 'Keto',
    duration: 8,
    description: 'Complete ketogenic protocol',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Vegan Vitality',
    type: 'Vegan',
    duration: 10,
    description: 'Plant-based excellence',
    status: 'Active',
  },
];

export default function ManagePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Weight Loss',
    duration: '',
    description: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch plans from PHP backend
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        setError('Failed to load plans');
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.duration) {
      setError('Name and duration are required');
      return;
    }

    try {
      if (editingId) {
        await updatePlan(editingId, formData);
      } else {
        await createPlan(formData);
      }
      await fetchPlans();
      setShowModal(false);
      setFormData({
        name: '',
        type: 'Weight Loss',
        duration: '',
        description: '',
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error saving plan:', err);
      setError('Failed to save plan');
    }
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditingId(plan.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(id);
        await fetchPlans();
      } catch (err) {
        console.error('Error deleting plan:', err);
        setError('Failed to delete plan');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Plans"
        description="Create and manage meal plans"
      />

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <motion.div
  const [editingId, setEditingId] = useState(null);

  const handleSave = () => {
    if (!formData.name || !formData.duration) return;

    if (editingId) {
      setPlans(
        plans.map((p) => (p.id === editingId ? { ...p, ...formData } : p)),
      );
    } else {
      setPlans([
        ...plans,
        {
          id: Math.max(...plans.map((p) => p.id), 0) + 1,
          ...formData,
          status: 'Active',
        },
      ]);
    }

    setShowModal(false);
    setFormData({
      name: '',
      type: 'Weight Loss',
      duration: '',
      description: '',
    });
    setEditingId(null);
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditingId(plan.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setPlans(plans.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Plans"
        description="Create and manage meal plans"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <button
          onClick={() => {
            setFormData({
              name: '',
              type: 'Weight Loss',
              duration: '',
              description: '',
            });
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
        >
          <Plus size={20} /> Create Plan
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
                  Plan Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Type
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Duration
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Description
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
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">
                    {plan.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {plan.type}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {plan.duration} weeks
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {plan.description}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-500/20 text-red-700 dark:text-red-300'
                      }`}
                    >
                      {plan.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition text-blue-600 dark:text-blue-400"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
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
                {editingId ? 'Edit Plan' : 'Create Plan'}
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
                placeholder="Plan Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Keto</option>
                <option>Vegan</option>
              </select>
              <input
                type="number"
                placeholder="Duration (weeks)"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                rows="3"
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
