/**
 * @file ActivityTimeline.jsx
 * @description Detailed activity timeline for an intern profile.
 * Displays tasks assigned/submitted, reviews, onboarding, profile updates, documents, logins.
 * Extends the existing ActivityFeed pattern from the Supervisor Dashboard.
 */

import { motion } from 'framer-motion';
import {
  RiTaskLine,
  RiCheckboxCircleLine,
  RiStarLine,
  RiFileTextLine,
  RiUser3Line,
  RiLoginCircleLine,
  RiUserAddLine,
} from 'react-icons/ri';
import InternEmptyState from './InternEmptyStates';
import { InternTimelineLoader } from './InternSkeletonLoaders';

const TYPE_CONFIG = {
  task_submitted: { icon: RiTaskLine, color: '#4f46e5', bg: '#eef2ff', badgeText: 'Submitted' },
  task_assigned: { icon: RiUserAddLine, color: '#7c3aed', bg: '#faf5ff', badgeText: 'Assigned' },
  review_received: { icon: RiStarLine, color: '#059669', bg: '#ecfdf5', badgeText: 'Review' },
  onboarding_approved: { icon: RiCheckboxCircleLine, color: '#10b981', bg: '#d1fae5', badgeText: 'Onboarding' },
  document_uploaded: { icon: RiFileTextLine, color: '#d97706', bg: '#fffbeb', badgeText: 'Document' },
  profile_update: { icon: RiUser3Line, color: '#64748b', bg: '#f1f5f9', badgeText: 'Profile' },
  login: { icon: RiLoginCircleLine, color: '#94a3b8', bg: '#f8fafc', badgeText: 'Login' },
};

const ActivityTimeline = ({ activities = [], isLoading = false }) => {
  if (isLoading) return <InternTimelineLoader />;

  if (!activities || activities.length === 0) {
    return <InternEmptyState type="no-activity" />;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Activity Timeline
        </h4>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          {activities.length} event{activities.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Vertical timeline bar */}
        <div
          style={{
            position: 'absolute',
            left: '17px',
            top: '24px',
            bottom: '8px',
            width: '2px',
            background: 'linear-gradient(to bottom, #4f46e5, #e0e7ff)',
            borderRadius: '99px',
            zIndex: 0,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activities.map((act, index) => {
            const config = TYPE_CONFIG[act.type] || TYPE_CONFIG.task_submitted;
            const Icon = config.icon;

            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Timeline Icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: config.bg,
                    color: config.color,
                    border: `2px solid ${config.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px #ffffff`,
                  }}
                >
                  <Icon />
                </div>

                {/* Event Content */}
                <div
                  style={{
                    flex: 1,
                    background: 'var(--color-neutral-50)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--color-neutral-200)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.4rem',
                          borderRadius: '0.375rem',
                          background: config.bg,
                          color: config.color,
                        }}
                      >
                        {act.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
                      {act.timeAgo}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
                    {act.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;
