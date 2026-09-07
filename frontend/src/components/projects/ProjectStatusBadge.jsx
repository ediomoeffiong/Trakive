/**
 * @file ProjectStatusBadge.jsx
 * @description Reusable badge for project status values.
 */
import { Badge } from '../ui';

const STATUS_CONFIG = {
  draft:            { label: 'Draft',            color: 'var(--color-neutral-500)',   bg: 'var(--color-neutral-100)' },
  pending_approval: { label: 'Pending Approval', color: 'var(--color-warning-600)',   bg: 'var(--color-warning-50)'  },
  active:           { label: 'Active',           color: 'var(--color-success-600)',   bg: 'var(--color-success-50)'  },
  on_hold:          { label: 'On Hold',          color: '#d97706',                   bg: '#fef3c7'                  },
  completed:        { label: 'Completed',        color: 'var(--color-primary-600)',   bg: 'var(--color-primary-50)'  },
  cancelled:        { label: 'Cancelled',        color: 'var(--color-danger-600)',    bg: 'var(--color-danger-50)'   },
};

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
  medium: { label: 'Medium', color: '#d97706',                  bg: '#fef3c7'                  },
  high:   { label: 'High',   color: 'var(--color-danger-500)',  bg: 'var(--color-danger-50)'   },
  urgent: { label: 'Urgent', color: '#fff',                     bg: 'var(--color-danger-600)'  },
};

export function ProjectStatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.2rem 0.6rem' : '0.3rem 0.75rem',
        borderRadius: '999px',
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: cfg.color,
        background: cfg.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

export function ProjectPriorityBadge({ priority, size = 'sm' }) {
  const cfg = PRIORITY_CONFIG[priority] || { label: priority, color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '0.2rem 0.6rem' : '0.3rem 0.75rem',
        borderRadius: '999px',
        fontSize: size === 'sm' ? '0.72rem' : '0.8rem',
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
