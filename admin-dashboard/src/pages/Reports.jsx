import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../components/PageHeader';

const monthlyData = [
  { month: 'Jan', registrations: 120 },
  { month: 'Feb', registrations: 180 },
  { month: 'Mar', registrations: 240 },
  { month: 'Apr', registrations: 210 },
  { month: 'May', registrations: 290 },
  { month: 'Jun', registrations: 350 },
];

const dailyCalories = [
  { day: 'Mon', calories: 2100 },
  { day: 'Tue', calories: 2050 },
  { day: 'Wed', calories: 2200 },
  { day: 'Thu', calories: 2000 },
  { day: 'Fri', calories: 2150 },
  { day: 'Sat', calories: 2300 },
  { day: 'Sun', calories: 2100 },
];

const goalData = [
  { name: 'Weight Loss', value: 450 },
  { name: 'Muscle Gain', value: 280 },
  { name: 'Maintenance', value: 220 },
];

const chartColors = ['#22c55e', '#14b8a6', '#f59e0b'];

export default function Reports() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports & Analytics"
        description="View system performance metrics and insights"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Top Dietitian
          </h3>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            Dr. Mike Thompson
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            15 patients assigned
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Top Plan
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            Rapid Fat Loss
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            45 users enrolled
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Avg User BMI
          </h3>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            24.3
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Healthy range
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Monthly User Registrations
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
              <Bar
                dataKey="registrations"
                fill="#22c55e"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
            Daily Calorie Intake
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyCalories}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#cbd5e1"
                opacity={0.45}
              />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-6"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
          Goal Distribution
        </h3>
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 flex justify-center">
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
          </div>

          <div className="w-full lg:w-1/2 space-y-4">
            {goalData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
