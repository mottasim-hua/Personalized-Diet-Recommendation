import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal component.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  actions = [],
}) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 z-50 mx-4 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/70 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-900 ${sizes[size]}`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>

            {actions.length > 0 && (
              <div className="flex justify-end gap-3 border-t border-slate-100 p-6 dark:border-slate-800">
                {actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`rounded-2xl px-4 py-2 font-medium transition-colors ${action.className}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
