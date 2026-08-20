/**
 * @file ActivityFeed.jsx
 * @description Supervisor Recent Activity Feed timeline component.
 */

import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import EmptyStates from './EmptyStates';
import {
  RiTaskLine,
  RiCheckboxCircleLine,
  RiStarLine,
  RiUserAddLine,
} from 'react-icons/ri';

const TYPE_ICONS = {
  submission: RiTaskLine,
  approval: RiCheckboxCircleLine,
  review: RiStarLine,
  assignment: RiUserAddLine,
};


const BADGE_COLORS = {
  blue: { bg: '#e0e7ff', text: '#3730a3' },
  green: { bg: '#dcfce7', text: '#166534' },
  purple: { bg: '#f3e8ff', text: '#6b21a8' },
  amber: { bg: '#fef3c7', text: '#92400e' },
};

const ActivityFeed = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return <EmptyStates type="no-activity" message="No recent supervisor activities recorded yet." />;
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Recent Activity Timeline
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          Real-time updates on intern submissions, reviews, and assignments
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
        {/* Vertical Timeline Bar */}
        <div
          style={{
            position: 'absolute',
            left: '18px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            backgroundColor: 'var(--color-neutral-200)',
            zIndex: 0,
          }}
        />

        {activities.map((act, index) => {
          const Icon = TYPE_ICONS[act.type] || RiTaskLine;
          const badgeStyle = BADGE_COLORS[act.badgeColor] || BADGE_COLORS.blue;

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <Avatar name={act.user} src={act.avatar} size="sm" />
              </div>

              <div
                style={{
                  flex: 1,
                  background: 'var(--color-neutral-50)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--color-neutral-900)' }}>
                      {act.user}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '0.375rem',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.text,
                      }}
                    >
                      {act.title}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {act.time}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.4 }}>
                  {act.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
