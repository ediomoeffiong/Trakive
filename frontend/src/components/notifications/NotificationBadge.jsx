/**
 * @file NotificationBadge.jsx
 * @description Reusable animated notification count badge.
 * Displays unread count, handles 99+ overflow, and animates on change.
 * Designed to be used on the notification bell, sidebar nav, or any icon.
 */

import { motion, AnimatePresence } from 'framer-motion';

/**
 * @param {object}  props
 * @param {number}  props.count          Unread count to display
 * @param {number}  [props.max=99]       Maximum count before showing "max+"
 * @param {string}  [props.size='md']    'sm' | 'md' | 'lg'
 * @param {string}  [props.color]        Override badge background color
 * @param {boolean} [props.pulse=true]   Animate pulse ring when count > 0
 * @param {string}  [props.className]    Extra class names
 */
const NotificationBadge = ({
  count = 0,
  max = 99,
  size = 'md',
  color = 'var(--color-danger-500)',
  pulse = true,
  className = '',
  style = {},
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : String(count);
  const isOverflow = count > max;

  const sizeMap = {
    sm: { minWidth: 16, height: 16, fontSize: '0.6rem', padding: '0 4px' },
    md: { minWidth: 18, height: 18, fontSize: '0.65rem', padding: '0 5px' },
    lg: { minWidth: 22, height: 22, fontSize: '0.7rem', padding: '0 6px' },
  };
  const dims = sizeMap[size] ?? sizeMap.md;

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={displayCount}
        className={className}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...dims,
          borderRadius: '999px',
          background: color,
          color: '#fff',
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          userSelect: 'none',
          position: 'relative',
          ...style,
        }}
        aria-label={`${count} unread notification${count !== 1 ? 's' : ''}`}
      >
        {/* Pulse ring */}
        {pulse && !isOverflow && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '999px',
              background: color,
              opacity: 0.35,
              animation: 'notif-badge-pulse 2s ease-in-out infinite',
            }}
          />
        )}
        <span style={{ position: 'relative', zIndex: 1 }}>{displayCount}</span>
      </motion.span>
    </AnimatePresence>
  );
};

// Inject pulse keyframes once
if (typeof document !== 'undefined') {
  const id = 'trakive-badge-pulse-keyframes';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes notif-badge-pulse {
        0%, 100% { transform: scale(1); opacity: 0.35; }
        50%       { transform: scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

export default NotificationBadge;
