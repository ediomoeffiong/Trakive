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
  variant = 'centered',
}) => {
  const isWide = variant === 'wide';

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: isWide ? 'row' : 'column',
        alignItems: isWide ? 'flex-start' : 'center',
        justifyContent: isWide ? 'flex-start' : 'center',
        textAlign: isWide ? 'left' : 'center',
        padding: isWide ? '1.5rem' : '3rem 1.5rem',
        gap: isWide ? '1.25rem' : '1rem',
        width: '100%',
        boxSizing: 'border-box',
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

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: isWide ? 'flex-start' : 'center', gap: '0.5rem', width: '100%' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.0625rem',
            fontWeight: 600,
            color: 'var(--color-neutral-800)',
            lineHeight: 1.4,
            width: '100%',
          }}
        >
          {title}
        </h3>

        {description && (
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--color-neutral-500)',
              maxWidth: isWide ? 'none' : '40ch',
              lineHeight: 1.6,
              width: '100%',
            }}
          >
            {description}
          </p>
        )}

        {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
      </div>
    </motion.div>
  );
};

export default EmptyState;
