/**
 * @file ProfileEmptyState.jsx
 * @description Reusable empty state component for profile sections.
 */

import { motion } from 'framer-motion';

const ProfileEmptyState = ({
  icon = '📭',
  title = 'Nothing here yet',
  description = 'Get started by adding some information.',
  actionLabel,
  onAction,
  compact = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}
  >
    {icon && (
      <div
        style={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          borderRadius: '50%',
          background: 'var(--color-neutral-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '1.5rem' : '2rem',
          marginBottom: '1rem',
        }}
      >
        {icon}
      </div>
    )}

    <h3
      style={{
        fontSize: compact ? '0.9375rem' : '1.0625rem',
        fontWeight: 600,
        color: 'var(--color-neutral-700)',
        marginBottom: '0.375rem',
      }}
    >
      {title}
    </h3>

    <p
      style={{
        fontSize: '0.875rem',
        color: 'var(--color-neutral-500)',
        maxWidth: '320px',
        lineHeight: 1.6,
        marginBottom: onAction ? '1.25rem' : 0,
      }}
    >
      {description}
    </p>

    {onAction && (
      <button className="btn btn-primary btn-sm" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </motion.div>
);

export default ProfileEmptyState;
