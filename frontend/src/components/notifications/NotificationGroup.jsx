/**
 * @file NotificationGroup.jsx
 * @description Renders a labelled group of notifications (Today / Yesterday / This Week / Older)
 * with animated list items.
 */

import { motion, AnimatePresence } from 'framer-motion';
import NotificationItem from './NotificationItem';

/**
 * @param {object}   props
 * @param {string}   props.label            Group label ("Today", "Yesterday", etc.)
 * @param {Array}    props.notifications     Notification items in this group
 * @param {string}   [props.selectedId]      ID of the currently-selected notification
 * @param {function} [props.onSelect]
 * @param {function} [props.onMarkRead]
 * @param {function} [props.onMarkUnread]
 * @param {function} [props.onDelete]
 * @param {function} [props.onArchive]
 */
const NotificationGroup = ({
  label,
  notifications = [],
  selectedId,
  onSelect,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onArchive,
}) => {
  if (notifications.length === 0) return null;

  return (
    <section aria-label={`${label} notifications`}>
      {/* Group header */}
      <div
        style={{
          padding: '0.5rem 1.25rem',
          background: 'var(--color-neutral-50)',
          borderBottom: '1px solid var(--color-neutral-100)',
          borderTop: '1px solid var(--color-neutral-100)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-neutral-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            padding: '1px 7px',
            borderRadius: '999px',
            background: 'var(--color-neutral-200)',
            color: 'var(--color-neutral-600)',
          }}
        >
          {notifications.length}
        </span>
      </div>

      {/* Notification list */}
      <motion.ul
        layout
        role="list"
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <motion.li key={notification.id} layout>
              <NotificationItem
                notification={notification}
                selected={selectedId === notification.id}
                onClick={onSelect}
                onMarkRead={onMarkRead}
                onMarkUnread={onMarkUnread}
                onDelete={onDelete}
                onArchive={onArchive}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
};

export default NotificationGroup;
