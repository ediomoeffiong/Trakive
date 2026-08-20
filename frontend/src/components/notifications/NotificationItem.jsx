/**
 * @file NotificationItem.jsx
 * @description A single notification row with icon, content, timestamp,
 * category badge, read/unread indicator, and a context action menu.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiTaskLine, RiEdit2Line, RiTimeLine, RiCheckboxCircleLine,
  RiStarLine, RiMapLine, RiMegaphoneLine, RiAlarmLine,
  RiSettings3Line, RiUser3Line, RiBellLine, RiMoreLine,
  RiCheckLine, RiEyeLine, RiDeleteBinLine, RiArchiveLine,
  RiMailUnreadLine,
} from 'react-icons/ri';
import { getCategoryConfig } from '../../data/notificationCategories';

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP = {
  RiTaskLine, RiEdit2Line, RiTimeLine, RiCheckboxCircleLine,
  RiStarLine, RiMapLine, RiMegaphoneLine, RiAlarmLine,
  RiSettings3Line, RiUser3Line, RiBellLine,
};

function CategoryIcon({ category }) {
  const config = getCategoryConfig(category);
  const IconComponent = ICON_MAP[config.icon] ?? RiBellLine;
  return (
    <span
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: config.bgColor,
        color: config.color,
        fontSize: '1.125rem',
        flexShrink: 0,
      }}
    >
      <IconComponent />
    </span>
  );
}

// ── Priority dot ─────────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  normal: '#6366f1',
  low: '#9ca3af',
};

// ── NotificationItem ─────────────────────────────────────────────────────────
/**
 * @param {object}   props
 * @param {object}   props.notification
 * @param {boolean}  [props.compact=false]        Compact mode (for drawer)
 * @param {boolean}  [props.selected=false]        Highlight as selected
 * @param {function} [props.onClick]              Called when item clicked
 * @param {function} [props.onMarkRead]
 * @param {function} [props.onMarkUnread]
 * @param {function} [props.onDelete]
 * @param {function} [props.onArchive]
 */
const NotificationItem = ({
  notification,
  compact = false,
  selected = false,
  onClick,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onArchive,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { category, title, shortDescription, timestamp, isRead, priority } = notification;
  const catConfig = getCategoryConfig(category);

  const handleItemClick = () => {
    if (onClick) onClick(notification);
    if (!isRead && onMarkRead) onMarkRead(notification.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.22 }}
      role="article"
      aria-label={`${isRead ? 'Read' : 'Unread'} notification: ${title}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: compact ? '0.75rem' : '1rem',
        padding: compact ? '0.75rem 1rem' : '1rem 1.25rem',
        background: selected
          ? 'var(--color-primary-50)'
          : isRead
          ? '#fff'
          : 'linear-gradient(to right, #f0f4ff 0%, #fff 100%)',
        borderBottom: '1px solid var(--color-neutral-100)',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        borderLeft: !isRead ? `3px solid ${catConfig.color}` : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = 'var(--color-neutral-50)';
      }}
      onMouseLeave={(e) => {
        if (!selected)
          e.currentTarget.style.background = isRead
            ? '#fff'
            : 'linear-gradient(to right, #f0f4ff 0%, #fff 100%)';
      }}
      onClick={handleItemClick}
    >
      {/* Category icon */}
      <CategoryIcon category={category} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          {/* Unread dot */}
          {!isRead && (
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: catConfig.color,
                flexShrink: 0,
              }}
            />
          )}
          {/* Title */}
          <p
            style={{
              margin: 0,
              fontSize: compact ? '0.8125rem' : '0.875rem',
              fontWeight: isRead ? 500 : 700,
              color: 'var(--color-neutral-900)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {title}
          </p>
          {/* Priority indicator */}
          {priority && priority !== 'normal' && !compact && (
            <span
              aria-label={`Priority: ${priority}`}
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.normal,
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* Short description */}
        <p
          style={{
            margin: 0,
            fontSize: compact ? '0.75rem' : '0.8125rem',
            color: 'var(--color-neutral-500)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5,
          }}
        >
          {shortDescription}
        </p>

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.35rem',
          }}
        >
          {/* Category badge */}
          {!compact && (
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                padding: '1px 8px',
                borderRadius: '999px',
                background: catConfig.bgColor,
                color: catConfig.color,
                textTransform: 'capitalize',
              }}
            >
              {catConfig.label}
            </span>
          )}
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
            {timestamp}
          </span>
        </div>
      </div>

      {/* Action menu */}
      {!compact && (
        <div
          style={{ position: 'relative', flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Notification options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            style={{ fontSize: '1rem', color: 'var(--color-neutral-400)', padding: '4px' }}
          >
            <RiMoreLine />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: 190,
                    background: '#fff',
                    borderRadius: '0.625rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid var(--color-neutral-200)',
                    zIndex: 101,
                    padding: '0.25rem',
                    overflow: 'hidden',
                  }}
                  role="menu"
                >
                  {[
                    {
                      icon: isRead ? <RiMailUnreadLine /> : <RiCheckLine />,
                      label: isRead ? 'Mark as Unread' : 'Mark as Read',
                      onClick: () => {
                        if (isRead) onMarkUnread?.(notification.id);
                        else onMarkRead?.(notification.id);
                        setMenuOpen(false);
                      },
                    },
                    {
                      icon: <RiArchiveLine />,
                      label: 'Archive',
                      onClick: () => { onArchive?.(notification.id); setMenuOpen(false); },
                    },
                    {
                      icon: <RiDeleteBinLine />,
                      label: 'Delete',
                      danger: true,
                      onClick: () => { onDelete?.(notification.id); setMenuOpen(false); },
                    },
                  ].map((item) => (
                    <button
                      key={item.label}
                      role="menuitem"
                      onClick={item.onClick}
                      className="btn btn-ghost"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8125rem',
                        color: item.danger
                          ? 'var(--color-danger-600)'
                          : 'var(--color-neutral-700)',
                        borderRadius: '0.375rem',
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationItem;
