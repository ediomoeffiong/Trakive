/**
 * @file ReminderCard.jsx
 * @description Reusable reminder card for deadlines, onboarding steps,
 * performance reviews, and profile completion.
 * Can be embedded on the Dashboard or the Notifications page.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTimeLine, RiMapLine, RiStarLine, RiUser3Line,
  RiArrowRightLine, RiAlarmLine,
} from 'react-icons/ri';
import ProgressBar from '../ui/ProgressBar';

// ── Icon + colour by reminder type ──────────────────────────────────────────
const TYPE_META = {
  deadline: {
    Icon: RiTimeLine,
    color: 'var(--color-warning-500)',
    bg: 'var(--color-warning-50)',
    border: 'var(--color-warning-100)',
  },
  onboarding: {
    Icon: RiMapLine,
    color: 'var(--color-primary-500)',
    bg: 'var(--color-primary-50)',
    border: 'var(--color-primary-100)',
  },
  review: {
    Icon: RiStarLine,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.25)',
  },
  profile: {
    Icon: RiUser3Line,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)',
  },
};

// ── Urgency border colours ───────────────────────────────────────────────────
const URGENCY_BORDER = {
  critical: '#ef4444',
  overdue:  '#ef4444',
  warning:  '#f97316',
  normal:   'var(--color-neutral-200)',
};

const URGENCY_BADGE = {
  critical: { label: 'Due Today',  bg: 'var(--color-danger-50)', color: 'var(--color-danger-500)' },
  overdue:  { label: 'Overdue',    bg: 'var(--color-danger-50)', color: 'var(--color-danger-500)' },
  warning:  { label: 'Coming Soon',bg: 'var(--color-warning-50)', color: 'var(--color-warning-500)' },
  normal:   { label: null, bg: null, color: null },
};

/**
 * @param {object} props
 * @param {object} props.reminder
 * @param {boolean} [props.compact=false]  Compact layout for dashboard widget
 */
const ReminderCard = ({ reminder, compact = false }) => {
  const navigate = useNavigate();
  const {
    type, title, description, dueDateLabel, urgency,
    actionLabel, actionRoute, progress,
  } = reminder;

  const meta = TYPE_META[type] ?? TYPE_META.deadline;
  const { Icon } = meta;
  const urgencyBadge = URGENCY_BADGE[urgency] ?? URGENCY_BADGE.normal;
  const borderColor = URGENCY_BORDER[urgency] ?? URGENCY_BORDER.normal;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        background: 'var(--surface-primary)',
        border: `1px solid ${borderColor}`,
        borderRadius: '0.875rem',
        padding: compact ? '0.875rem 1rem' : '1rem 1.25rem',
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-start',
        gap: '0.875rem',
        boxShadow: urgency === 'critical' || urgency === 'overdue'
          ? '0 2px 12px rgba(239,68,68,0.15)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s',
      }}
      whileHover={{ scale: 1.01 }}
      aria-label={`Reminder: ${title}`}
    >
      {/* Icon */}
      <span
        aria-hidden
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: compact ? 38 : 44,
          height: compact ? 38 : 44,
          borderRadius: '0.625rem',
          background: meta.bg,
          color: meta.color,
          fontSize: compact ? '1.125rem' : '1.25rem',
          flexShrink: 0,
        }}
      >
        <Icon />
      </span>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <p
            style={{
              margin: '0 0 0.2rem',
              fontSize: compact ? '0.8125rem' : '0.875rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: compact ? 'nowrap' : 'normal',
            }}
          >
            {title}
          </p>

          {/* Urgency badge */}
          {urgencyBadge.label && (
            <span
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
                background: urgencyBadge.bg,
                color: urgencyBadge.color,
              }}
            >
              <RiAlarmLine style={{ fontSize: '0.75rem' }} />
              {urgencyBadge.label}
            </span>
          )}
        </div>

        {!compact && (
          <p
            style={{
              margin: '0 0 0.5rem',
              fontSize: '0.8125rem',
              color: 'var(--color-neutral-500)',
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        )}

        {/* Due date */}
        {dueDateLabel && (
          <p
            style={{
              margin: compact ? 0 : '0 0 0.625rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: urgency === 'overdue' || urgency === 'critical'
                ? '#dc2626'
                : 'var(--color-neutral-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <RiTimeLine />
            {dueDateLabel}
          </p>
        )}

        {/* Progress bar */}
        {progress !== null && progress !== undefined && !compact && (
          <div style={{ marginBottom: '0.625rem' }}>
            <ProgressBar value={progress} max={100} size="sm" />
          </div>
        )}
      </div>

      {/* Action button */}
      {actionLabel && (
        <button
          onClick={() => navigate(actionRoute)}
          className="btn btn-ghost"
          style={{
            flexShrink: 0,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: meta.color,
            border: `1px solid ${meta.border || meta.bg}`,
            borderRadius: '0.5rem',
            padding: '0.375rem 0.75rem',
            gap: '0.25rem',
            whiteSpace: 'nowrap',
          }}
          aria-label={`${actionLabel} for reminder: ${title}`}
        >
          {compact ? <RiArrowRightLine /> : actionLabel}
        </button>
      )}
    </motion.article>
  );
};

export default ReminderCard;
