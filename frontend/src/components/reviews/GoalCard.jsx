/**
 * @file GoalCard.jsx
 * @description Reusable goal card with progress bar, status badge, and target date.
 */

import { motion } from 'framer-motion';
import { RiCalendarEventLine, RiCheckboxCircleLine, RiTimeLine, RiLoader4Line, RiFlagLine } from 'react-icons/ri';
import { ProgressBar } from '../ui';

const STATUS_CONFIG = {
  completed:       { label: 'Completed',       color: 'success', icon: <RiCheckboxCircleLine /> },
  'in-progress':   { label: 'In Progress',     color: 'primary', icon: <RiLoader4Line /> },
  'nearly-complete': { label: 'Almost Done',   color: 'warning', icon: <RiTimeLine /> },
  upcoming:        { label: 'Upcoming',         color: 'neutral', icon: <RiFlagLine /> },
};

const CATEGORY_COLORS = {
  productivity:  { bg: 'var(--color-primary-50)',  color: 'var(--color-primary-600)' },
  quality:       { bg: 'var(--color-success-50)', color: 'var(--color-success-600)' },
  communication: { bg: 'var(--color-warning-50)', color: 'var(--color-warning-600)' },
  initiative:    { bg: '#f5f3ff',                  color: '#7c3aed' },
  teamwork:      { bg: '#fff1f2',                  color: '#e11d48' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const GoalCard = ({ goal, index = 0 }) => {
  const statusConfig = STATUS_CONFIG[goal.status] ?? STATUS_CONFIG['in-progress'];
  const catColor = CATEGORY_COLORS[goal.category] ?? CATEGORY_COLORS.productivity;
  const progressVariant =
    goal.progress === 100 ? 'success' :
    goal.progress >= 75  ? 'primary' :
    goal.progress >= 40  ? 'warning'  : 'danger';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.375rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Category pill */}
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: catColor.color,
              background: catColor.bg,
              padding: '0.2rem 0.55rem',
              borderRadius: '99px',
              marginBottom: '0.5rem',
            }}
          >
            {goal.category}
          </span>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-neutral-900)', margin: 0, lineHeight: 1.3 }}>
            {goal.title}
          </h3>
        </div>

        {/* Status badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: statusConfig.color === 'success' ? 'var(--color-success-600)' :
                   statusConfig.color === 'primary' ? 'var(--color-primary-600)' :
                   statusConfig.color === 'warning' ? 'var(--color-warning-600)' : 'var(--color-neutral-500)',
            background: statusConfig.color === 'success' ? 'var(--color-success-50)' :
                        statusConfig.color === 'primary' ? 'var(--color-primary-50)' :
                        statusConfig.color === 'warning' ? 'var(--color-warning-50)' : 'var(--color-neutral-100)',
            padding: '0.25rem 0.6rem',
            borderRadius: '99px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: 0, lineHeight: 1.6 }}>
        {goal.description}
      </p>

      {/* Progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-neutral-500)' }}>Progress</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
            {goal.progress}%
          </span>
        </div>
        <ProgressBar value={goal.progress} variant={progressVariant} size="sm" animated />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}
        >
          <RiCalendarEventLine />
          Target: {formatDate(goal.targetDate)}
        </span>
        {goal.sourceReviewTitle && (
          <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
            From: {goal.sourceReviewTitle}
          </span>
        )}
      </div>
    </motion.article>
  );
};

export default GoalCard;
