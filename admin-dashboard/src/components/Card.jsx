import { motion } from 'framer-motion';

/**
 * Card component for grouping content
 */
export default function Card({
  children,
  className = '',
  hoverable = false,
  onClick = null,
  header = null,
  footer = null,
  padding = 'p-6',
}) {
  return (
    <motion.div
      whileHover={
        hoverable ? { y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } : {}
      }
      onClick={onClick}
      className={`
        bg-white rounded-lg border border-gray-100 shadow-sm
        transition-all ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {header && (
        <div className="border-b border-gray-100 px-6 py-4">{header}</div>
      )}

      <div className={padding}>{children}</div>

      {footer && (
        <div className="border-t border-gray-100 px-6 py-4">{footer}</div>
      )}
    </motion.div>
  );
}
