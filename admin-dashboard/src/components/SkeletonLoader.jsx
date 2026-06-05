import { motion } from 'framer-motion';

/**
 * Skeleton loader component for loading states.
 */
export default function SkeletonLoader({ count = 1, type = 'card' }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0.5 },
    show: { opacity: 1 },
  };

  if (type === 'card') {
    return (
      <motion.div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {[...Array(count)].map((_, i) => (
          <motion.div key={i} variants={item}>
            <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
