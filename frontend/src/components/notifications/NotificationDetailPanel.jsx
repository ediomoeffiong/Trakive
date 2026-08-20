/**
 * @file NotificationDetailPanel.jsx
 * @description Full-detail view for a selected notification.
 * On desktop: renders as a side panel.
 * On mobile: slides up as a bottom sheet.
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiTaskLine, RiEdit2Line, RiTimeLine, RiCheckboxCircleLine,
  RiStarLine, RiMapLine, RiMegaphoneLine, RiAlarmLine,
  RiSettings3Line, RiUser3Line, RiBellLine, RiCloseLine,
  RiArrowRightLine, RiMailUnreadLine, RiCheckLine,
  RiArchiveLine, RiDeleteBinLine,
} from 'react-icons/ri';
import { getCategoryConfig } from '../../data/notificationCategories';
import Avatar from '../ui/Avatar';
import { useNotificationStore } from '../../store';

const ICON_MAP = {
  RiTaskLine, RiEdit2Line, RiTimeLine, RiCheckboxCircleLine,
  RiStarLine, RiMapLine, RiMegaphoneLine, RiAlarmLine,
  RiSettings3Line, RiUser3Line, RiBellLine,
};

const PRIORITY_META = {
  urgent: { label: 'Urgent', bg: '#fef2f2', color: '#ef4444' },
  high:   { label: 'High',   bg: '#fff7ed', color: '#f97316' },
  normal: { label: 'Normal', bg: '#f0f4ff', color: '#6366f1' },
  low:    { label: 'Low',    bg: '#f9fafb', color: '#9ca3af' },
};

/**
 * @param {object}   props
 * @param {object}   [props.notification]     Currently-selected notification (null → hidden)
 * @param {function} [props.onClose]
 * @param {boolean}  [props.isMobile=false]   Render as bottom sheet on mobile
 */
const NotificationDetailPanel = ({ notification, onClose, isMobile = false }) => {
  const navigate = useNavigate();
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAsUnread = useNotificationStore((s) => s.markAsUnread);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const archiveNotification = useNotificationStore((s) => s.archiveNotification);

  if (!notification) return null;

  const {
    id, category, title, message, timestamp, date, isRead,
    priority, sender, relatedModule, actionLabel, actionRoute,
  } = notification;

  const catConfig = getCategoryConfig(category);
  const IconComponent = ICON_MAP[catConfig.icon] ?? RiBellLine;
  const priorityMeta = PRIORITY_META[priority] ?? PRIORITY_META.normal;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : timestamp;

  const panelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-neutral-100)',
        }}
      >
        {/* Category icon */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: catConfig.bgColor,
            color: catConfig.color,
            fontSize: '1.375rem',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <IconComponent />
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: '0 0 0.25rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: catConfig.color,
            }}
          >
            {catConfig.label}
          </p>
          <h3
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              lineHeight: 1.35,
            }}
          >
            {title}
          </h3>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-icon"
          aria-label="Close notification detail"
          style={{ fontSize: '1.125rem', color: 'var(--color-neutral-400)', flexShrink: 0 }}
        >
          <RiCloseLine />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
        {/* Message */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-neutral-700)',
            lineHeight: 1.75,
            whiteSpace: 'pre-line',
            margin: '0 0 1.5rem',
          }}
        >
          {message}
        </p>

        {/* Meta grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.875rem',
            padding: '1rem',
            background: 'var(--color-neutral-50)',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-neutral-100)',
          }}
        >
          {/* Sender */}
          {sender && (
            <div>
              <p style={{ margin: '0 0 0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                From
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Avatar name={sender.name} size="xs" />
                <div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                    {sender.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-500)' }}>
                    {sender.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Module */}
          <div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Module
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', textTransform: 'capitalize' }}>
              {relatedModule ?? 'General'}
            </p>
          </div>

          {/* Timestamp */}
          <div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Received
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>
              {formattedDate}
            </p>
          </div>

          {/* Priority */}
          <div>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Priority
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: priorityMeta.bg,
                color: priorityMeta.color,
                textTransform: 'capitalize',
              }}
            >
              {priorityMeta.label}
            </span>
          </div>
        </div>

        {/* Quick action strip */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <button
            onClick={() => isRead ? markAsUnread(id) : markAsRead(id)}
            className="btn btn-ghost"
            style={{
              fontSize: '0.8125rem',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              color: 'var(--color-neutral-600)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '0.5rem',
            }}
          >
            {isRead ? <RiMailUnreadLine /> : <RiCheckLine />}
            {isRead ? 'Mark Unread' : 'Mark Read'}
          </button>
          <button
            onClick={() => { archiveNotification(id); onClose?.(); }}
            className="btn btn-ghost"
            style={{
              fontSize: '0.8125rem',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              color: 'var(--color-neutral-600)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '0.5rem',
            }}
          >
            <RiArchiveLine />
            Archive
          </button>
          <button
            onClick={() => { deleteNotification(id); onClose?.(); }}
            className="btn btn-ghost"
            style={{
              fontSize: '0.8125rem',
              gap: '0.375rem',
              padding: '0.375rem 0.875rem',
              color: 'var(--color-danger-600)',
              border: '1px solid var(--color-danger-100)',
              borderRadius: '0.5rem',
            }}
          >
            <RiDeleteBinLine />
            Delete
          </button>
        </div>
      </div>

      {/* CTA Footer */}
      {actionLabel && actionRoute && (
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-neutral-100)',
            background: 'var(--color-neutral-50)',
          }}
        >
          <button
            onClick={() => { navigate(actionRoute); onClose?.(); }}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
          >
            {actionLabel}
            <RiArrowRightLine />
          </button>
        </div>
      )}
    </div>
  );

  // ── Desktop side panel ─────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.22 }}
        style={{
          width: 380,
          flexShrink: 0,
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '1rem',
          background: '#fff',
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
        aria-label="Notification detail"
        role="complementary"
      >
        {panelContent}
      </motion.aside>
    );
  }

  // ── Mobile bottom sheet ────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
        }}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 301,
          background: '#fff',
          borderRadius: '1.25rem 1.25rem 0 0',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Notification detail"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
          <span style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-neutral-200)' }} />
        </div>
        {panelContent}
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationDetailPanel;
