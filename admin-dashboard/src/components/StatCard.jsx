import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

/**
 * Statistics card component.
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'up',
  color = 'primary',
  bgColor,
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-300',
    blue: 'bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300',
    red: 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
    purple: 'bg-violet-100 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
  };

  const formatValue = (val) => {
    if (typeof val === 'number' && val > 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] backdrop-blur hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900/85 ${bgColor || ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-400 via-emerald-400 to-teal-500 opacity-70" />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {formatValue(value)}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  changeType === 'up'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(change)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className={`${colorClasses[color]} rounded-2xl p-3.5 shadow-inner`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
