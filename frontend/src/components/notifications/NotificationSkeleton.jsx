/**
 * @file NotificationSkeleton.jsx
 * @description Skeleton loaders for notifications UI — list items, drawer,
 * detail panel, announcement cards, and reminder cards.
 */

import Skeleton from '../ui/Skeleton';

// ── Notification list item skeleton ─────────────────────────────────────────
export function NotificationItemSkeleton({ compact = false }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: compact ? '0.75rem' : '1rem',
        padding: compact ? '0.75rem 1rem' : '1rem 1.25rem',
        borderBottom: '1px solid var(--color-neutral-100)',
        alignItems: 'flex-start',
      }}
      aria-hidden
    >
      {/* Avatar */}
      <Skeleton width={40} height={40} borderRadius="50%" />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <Skeleton width="55%" height="0.875rem" style={{ marginBottom: '0.4rem' }} />
        <Skeleton width="90%" height="0.75rem" style={{ marginBottom: '0.25rem' }} />
        {!compact && <Skeleton width="70%" height="0.75rem" style={{ marginBottom: '0.4rem' }} />}
        <Skeleton width="30%" height="0.65rem" />
      </div>
    </div>
  );
}

// ── Notification list (multiple items) ──────────────────────────────────────
export function NotificationListSkeleton({ count = 5, compact = false }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <NotificationItemSkeleton key={i} compact={compact} />
      ))}
    </div>
  );
}

// ── Drawer skeleton ──────────────────────────────────────────────────────────
export function DrawerSkeleton() {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--color-neutral-100)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        aria-hidden
      >
        <Skeleton width={120} height="0.875rem" />
        <Skeleton width={60} height="0.75rem" />
      </div>
      <NotificationListSkeleton count={4} compact />
    </div>
  );
}

// ── Detail panel skeleton ────────────────────────────────────────────────────
export function DetailPanelSkeleton() {
  return (
    <div style={{ padding: '1.5rem' }} aria-hidden>
      {/* Header */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <Skeleton width={48} height={48} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height="1rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="40%" height="0.75rem" />
        </div>
      </div>
      {/* Body */}
      <Skeleton width="100%" height="0.875rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="100%" height="0.875rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="80%" height="0.875rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="90%" height="0.875rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="60%" height="0.875rem" style={{ marginBottom: '1.5rem' }} />
      {/* Meta */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Skeleton width="30%" height="0.75rem" />
        <Skeleton width="25%" height="0.75rem" />
      </div>
      {/* Action button */}
      <Skeleton width={120} height={36} borderRadius="0.5rem" style={{ marginTop: '1.5rem' }} />
    </div>
  );
}

// ── Announcement card skeleton ───────────────────────────────────────────────
export function AnnouncementCardSkeleton() {
  return (
    <div
      style={{
        padding: '1.25rem',
        borderRadius: '0.875rem',
        border: '1px solid var(--color-neutral-200)',
        background: '#fff',
        marginBottom: '1rem',
      }}
      aria-hidden
    >
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
        <Skeleton width={36} height={36} borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="50%" height="0.875rem" style={{ marginBottom: '0.3rem' }} />
          <Skeleton width="35%" height="0.7rem" />
        </div>
        <Skeleton width={60} height={20} borderRadius="999px" />
      </div>
      <Skeleton width="80%" height="1rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="100%" height="0.8rem" style={{ marginBottom: '0.3rem' }} />
      <Skeleton width="75%" height="0.8rem" />
    </div>
  );
}

// ── Reminder card skeleton ───────────────────────────────────────────────────
export function ReminderCardSkeleton() {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: '0.875rem',
        border: '1px solid var(--color-neutral-200)',
        background: '#fff',
        marginBottom: '0.75rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
      }}
      aria-hidden
    >
      <Skeleton width={44} height={44} borderRadius="0.625rem" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="0.875rem" style={{ marginBottom: '0.35rem' }} />
        <Skeleton width="85%" height="0.75rem" />
      </div>
      <Skeleton width={80} height={32} borderRadius="0.5rem" />
    </div>
  );
}

export default NotificationItemSkeleton;
