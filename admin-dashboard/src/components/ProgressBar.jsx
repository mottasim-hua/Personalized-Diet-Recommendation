import { motion } from 'framer-motion';

/**
 * Progress bar component
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label = null,
  color = 'primary',
  size = 'md',
  showPercentage = true,
  animated = true,
}) {
  const percentage = (value / max) * 100;

  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-900">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-600">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizes[size]}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }
          }
          className={`${colors[color]} h-full rounded-full transition-all`}
        />
      </div>
    </div>
  );
}
