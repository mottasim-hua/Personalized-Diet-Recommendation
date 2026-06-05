import { motion } from 'framer-motion';

/**
 * Empty state component.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  image,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/70 px-4 py-16 dark:border-slate-700 dark:bg-slate-900/40"
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="mb-6 h-48 w-48 object-contain opacity-70"
        />
      ) : Icon ? (
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
          <Icon size={32} className="text-slate-400" />
        </div>
      ) : null}

      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-center text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}

      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
