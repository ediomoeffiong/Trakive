/**
 * @file UpcomingDeadlines.jsx
 * @description Supervisor Upcoming Deadlines list component with priority badges & overdue styling.
 */

import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import EmptyStates from './EmptyStates';
import { RiTimeLine, RiAlertLine } from 'react-icons/ri';

const PRIORITY_BADGES = {
  High: { bg: '#fee2e2', text: '#991b1b' },
  Medium: { bg: '#fef3c7', text: '#92400e' },
  Low: { bg: '#e0e7ff', text: '#3730a3' },
};

const UpcomingDeadlines = ({ deadlines = [] }) => {
  if (!deadlines || deadlines.length === 0) {
    return <EmptyStates type="no-deadlines" message="No pending task deadlines for your interns." />;
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
          Upcoming Task Deadlines
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          Keep track of pending deliverables and overdue submissions
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {deadlines.map((item, index) => {
          const priorityStyle = PRIORITY_BADGES[item.priority] || PRIORITY_BADGES.Medium;
          const isOverdue = item.isOverdue || item.status === 'Overdue';

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: isOverdue ? '1px solid #fca5a5' : '1px solid var(--color-neutral-200)',
                background: isOverdue ? '#fef2f2' : 'var(--color-neutral-50)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <Avatar name={item.internName} src={item.internAvatar} size="md" />

                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.taskTitle}
                  </p>
                  <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    Assigned to <span style={{ fontWeight: 600, color: 'var(--color-neutral-700)' }}>{item.internName}</span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: priorityStyle.bg,
                    color: priorityStyle.text,
                  }}
                >
                  {item.priority}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: isOverdue ? '#dc2626' : 'var(--color-neutral-600)' }}>
                  {isOverdue ? <RiAlertLine style={{ color: '#dc2626' }} /> : <RiTimeLine />}
                  <span>{item.dueDate}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;
