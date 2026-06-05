import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * Alert/Banner component for important notifications
 */
export default function Alert({
  type = 'info',
  title,
  message,
  dismissible = true,
  onDismiss = null,
  actions = [],
}) {
  const [isVisible, setIsVisible] = useState(true);

  const typeStyles = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      message: 'text-green-800',
      button: 'bg-green-600 hover:bg-green-700 text-white',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-600',
      title: 'text-amber-900',
      message: 'text-amber-800',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    danger: {
      bg: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
  };

  const styles = typeStyles[type];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`${styles.bg} border rounded-lg p-4 flex items-start gap-3`}
        >
          <AlertCircle
            size={20}
            className={`${styles.icon} flex-shrink-0 mt-0.5`}
          />

          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`font-semibold ${styles.title}`}>{title}</h3>
            )}
            {message && (
              <p className={`text-sm ${styles.message} mt-1`}>{message}</p>
            )}
          </div>

          <div className="flex gap-2 flex-shrink-0 ml-4">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${action.className}`}
              >
                {action.label}
              </button>
            ))}

            {dismissible && (
              <button
                onClick={handleDismiss}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${styles.button}`}
              >
                Dismiss
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
