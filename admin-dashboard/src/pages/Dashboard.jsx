import { motion } from 'framer-motion';
import { BookOpen, Stethoscope, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getStats, getUsers } from '../api/services';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

const monthlyData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 180 },
  { month: 'Mar', users: 240 },
  { month: 'Apr', users: 210 },
  { month: 'May', users: 290 },
  { month: 'Jun', users: 350 },
];

const goalData = [
  { name: 'Weight Loss', value: 450 },
  { name: 'Muscle Gain', value: 280 },
  { name: 'Maintenance', value: 220 },
];

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Emma Wilson', email: 'emma@example.com', status: 'Active' },
  {
    id: 3,
    name: 'Alex Martinez',
    email: 'alex@example.com',
    status: 'Inactive',
  },
  { id: 4, name: 'Lisa Chen', email: 'lisa@example.com', status: 'Active' },
  {
    id: 5,
    name: 'Michael Johnson',
    email: 'michael@example.com',
    status: 'Active',
  },
];

const chartColors = ['#22c55e', '#14b8a6', '#f59e0b'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, usersRes] = await Promise.all([getStats(), getUsers()]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  const overviewStats = [
    {
      title: 'Total Users',
      value: stats?.total_users || 1245,
      icon: Users,
      change: 14,
      color: 'primary',
    },
    {
      title: 'Total Dietitians',
      value: stats?.total_dietitians || 28,
      icon: Stethoscope,
      change: 9,
      color: 'blue',
    },
    {
      title: 'Active Plans',
      value: stats?.total_plans || 856,
      icon: BookOpen,
      change: 11,
      color: 'purple',
    },
    {
      title: 'Success Rate',
      value: 87,
      icon: TrendingUp,
      change: 6,
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back, Admin"
        description="Track member growth, active plans, and platform performance at a glance."
      />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              change={card.change}
              color={card.color}
            />
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Monthly User Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#cbd5e1"
                opacity={0.45}
              />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="users" fill="#22c55e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Goal Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={goalData}
                dataKey="value"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {goalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass-panel p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Recent Users
        </h3>
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="py-3 px-4 text-slate-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {user.email}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
