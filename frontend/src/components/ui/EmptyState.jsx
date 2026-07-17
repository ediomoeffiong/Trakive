/**
 * @file EmptyState.jsx
 * @description Centered empty state layout with icon, title, description, and optional action.
 */

import { motion } from 'framer-motion';

/**
 * @param {object}          props
 * @param {React.ReactNode} [props.icon]        Icon element (rendered in circular container)
 * @param {string}          props.title         Primary heading
 * @param {string}          [props.description] Supporting description text
 * @param {React.ReactNode} [props.action]      Action button or link
 * @param {string}          [props.className]   Extra class names
 */
const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
      }}
    >
      {/* Icon container */}
      {icon && (
        <span
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            background: 'var(--color-neutral-100)',
            color: 'var(--color-neutral-400)',
            fontSize: '2rem',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}

      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'var(--color-neutral-800)',
          lineHeight: 1.4,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: '0.875rem',
            color: 'var(--color-neutral-500)',
            maxWidth: '32ch',
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
