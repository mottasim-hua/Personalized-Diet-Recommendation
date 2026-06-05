import { AlertCircle } from 'lucide-react';
import Modal from './Modal';

/**
 * Confirmation modal component.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  type = 'danger',
}) {
  const typeStyles = {
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    info: 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300',
  };

  const confirmButtonStyles = {
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    warning: 'bg-amber-600 text-white hover:bg-amber-700',
    info: 'bg-sky-600 text-white hover:bg-sky-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={`mb-6 flex gap-4 rounded-2xl p-4 ${typeStyles[type]}`}>
        <AlertCircle size={24} className="mt-1 flex-shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-2xl px-4 py-2 font-medium transition-colors disabled:opacity-50 ${confirmButtonStyles[type]}`}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
