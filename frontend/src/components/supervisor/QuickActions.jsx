/**
 * @file QuickActions.jsx
 * @description Reusable Quick Actions panel for the Supervisor Dashboard.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiTaskLine,
  RiStarLine,
  RiCalendarEventLine,
  RiCheckboxMultipleLine,
  RiMegaphoneLine,
} from 'react-icons/ri';
import { ROUTES } from '../../constants';

const ACTIONS = [
  {
    id: 'assign-task',
    title: 'Assign New Task',
    description: 'Create and assign a task to an intern',
    icon: RiTaskLine,
    color: '#4f46e5',
    bg: '#eef2ff',
    route: `${ROUTES.SUPERVISOR_TASKS}?action=new`,
  },
  {
    id: 'review-submission',
    title: 'Review Submission',
    description: 'Inspect pending intern submissions',
    icon: RiStarLine,
    color: '#059669',
    bg: '#ecfdf5',
    route: `${ROUTES.SUPERVISOR_REVIEWS}?action=review`,
  },
  {
    id: 'schedule-review',
    title: 'Schedule Review',
    description: 'Set up 1-on-1 performance checks',
    icon: RiCalendarEventLine,
    color: '#7c3aed',
    bg: '#faf5ff',
    route: `${ROUTES.SUPERVISOR_REVIEWS}?action=schedule`,
  },
  {
    id: 'approve-onboarding',
    title: 'Approve Onboarding',
    description: 'Sign off on completed onboarding steps',
    icon: RiCheckboxMultipleLine,
    color: '#d97706',
    bg: '#fffbeb',
    route: `${ROUTES.SUPERVISOR_ONBOARDING}?action=approve`,
  },
  {
    id: 'send-announcement',
    title: 'Send Announcement',
    description: 'Broadcast updates to your intern team',
    icon: RiMegaphoneLine,
    color: '#dc2626',
    bg: '#fef2f2',
    route: `${ROUTES.SUPERVISOR_NOTIFICATIONS}?action=announce`,
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    toast.success(`Opening ${action.title}...`);
    navigate(action.route);
  };

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
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Quick Actions
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          Frequently used supervisor controls and shortcuts
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
        {ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-neutral-200)',
                background: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
              }}
              className="quick-action-card"
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '0.625rem',
                  backgroundColor: action.bg,
                  color: action.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  flexShrink: 0,
                }}
              >
                <Icon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {action.title}
                </p>
                <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {action.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
