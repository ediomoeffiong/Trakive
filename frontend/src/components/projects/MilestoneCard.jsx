/**
 * @file MilestoneCard.jsx
 * @description Compact milestone display card with progress and task stats.
 */
import { RiCheckboxCircleLine, RiTimeLine, RiCalendarLine } from 'react-icons/ri';
import { ProgressBar } from '../ui';

const STATUS_STYLES = {
  not_started: { color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)', label: 'Not Started' },
  ongoing:     { color: '#d97706',                  bg: '#fef3c7',                  label: 'In Progress' },
  completed:   { color: 'var(--color-success-600)', bg: 'var(--color-success-50)',  label: 'Completed'   },
  overdue:     { color: 'var(--color-danger-600)',  bg: 'var(--color-danger-50)',   label: 'Overdue'     },
};

export function MilestoneCard({ milestone, onClick }) {
  const cfg = STATUS_STYLES[milestone.status] || STATUS_STYLES.not_started;
  const total = parseInt(milestone.total_tasks || 0, 10);
  const completed = parseInt(milestone.completed_tasks || 0, 10);
  const progress = total > 0 ? Math.round((completed / total) * 100) : parseFloat(milestone.progress || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      style={{
        border: '1px solid var(--color-neutral-200)',
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        background: 'var(--color-neutral-0, #fff)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = 'var(--color-primary-300)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-neutral-900)', margin: 0, flex: 1 }}>
          {milestone.title}
        </p>
        <span style={{
          display: 'inline-flex', padding: '0.15rem 0.55rem', borderRadius: '999px',
          fontSize: '0.7rem', fontWeight: 600, color: cfg.color, background: cfg.bg, flexShrink: 0,
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      {milestone.description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.4 }}>
          {milestone.description}
        </p>
      )}

      {/* Progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
            {completed}/{total} tasks
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
            {progress}%
          </span>
        </div>
        <ProgressBar value={progress} max={100} />
      </div>

      {/* Due date */}
      {milestone.due_date && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          <RiCalendarLine />
          <span>Due {formatDate(milestone.due_date)}</span>
        </div>
      )}
    </div>
  );
}
