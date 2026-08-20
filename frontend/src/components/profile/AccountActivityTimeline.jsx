/**
 * @file AccountActivityTimeline.jsx
 * @description Vertical timeline showing login history, profile updates,
 * document uploads, skill additions, and other account events.
 */

import { motion } from 'framer-motion';
import { useProfileStore } from '../../store/useProfileStore';
import ProfileEmptyState from './ProfileEmptyState';
import { ActivityTimelineSkeleton } from './ProfileSkeletons';

const timeAgo = (str) => {
  if (!str) return '';
  const diff = Date.now() - new Date(str).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatFull = (str) => {
  if (!str) return '';
  try {
    return new Date(str).toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return str;
  }
};

const ActivityItem = ({ activity, index, isLast }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.06 }}
    style={{ display: 'flex', gap: '0.875rem', position: 'relative' }}
  >
    {/* Timeline connector */}
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
      {/* Icon bubble */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: activity.iconBg,
          border: `2px solid ${activity.iconColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          flexShrink: 0,
          zIndex: 1,
        }}
      >
        {activity.icon}
      </div>
      {/* Vertical line */}
      {!isLast && (
        <div
          style={{
            width: 2,
            flex: 1,
            background: 'var(--color-neutral-200)',
            marginTop: 4,
            minHeight: 20,
          }}
        />
      )}
    </div>

    {/* Content */}
    <div style={{ flex: 1, paddingBottom: isLast ? 0 : '1.5rem' }}>
      <div
        style={{
          background: activity.status === 'warning' ? 'var(--color-warning-50)' : 'var(--color-neutral-50)',
          border: `1px solid ${activity.status === 'warning' ? 'var(--color-warning-200)' : 'var(--color-neutral-200)'}`,
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
              {activity.title}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginTop: 2 }}>
              {activity.description}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
              {timeAgo(activity.timestamp)}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: 1 }}>
              {formatFull(activity.timestamp)}
            </p>
          </div>
        </div>

        {/* Device + IP */}
        {(activity.device || activity.ip) && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {activity.device && (
              <span style={{ fontSize: '0.73rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {activity.device}
              </span>
            )}
            {activity.ip && activity.ip !== '—' && (
              <span style={{ fontSize: '0.73rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {activity.ip}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const AccountActivityTimeline = () => {
  const { activities, loadingActivities } = useProfileStore();

  if (loadingActivities) {
    return (
      <div className="card p-6">
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 36, height: 36, background: 'var(--color-neutral-100)', borderRadius: '0.625rem' }} />
          <div>
            <div style={{ width: 160, height: '1rem', background: 'var(--color-neutral-100)', borderRadius: '0.5rem', marginBottom: 4 }} />
            <div style={{ width: 100, height: '0.75rem', background: 'var(--color-neutral-100)', borderRadius: '0.5rem' }} />
          </div>
        </div>
        <ActivityTimelineSkeleton />
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Account Activity</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
            {activities.length} event{activities.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <ProfileEmptyState
          icon=""
          title="No activity yet"
          description="Your account activity will appear here as you use Trakive."
          compact
        />
      ) : (
        <div>
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              index={index}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountActivityTimeline;
