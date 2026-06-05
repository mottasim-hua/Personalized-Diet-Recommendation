import { motion } from 'framer-motion';

/**
 * Badge component for labels and status indicators
 */
export default function Badge({
  label,
  variant = 'primary',
  size = 'md',
  onClick = null,
  icon: Icon = null,
  removable = false,
  onRemove = null,
}) {
  const variants = {
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full font-medium ${variants[variant]} ${sizes[size]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {Icon && <Icon size={16} />}
      <span>{label}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 hover:opacity-70 transition-opacity"
        >
          ×
        </button>
      )}
    </motion.div>
  );
}
