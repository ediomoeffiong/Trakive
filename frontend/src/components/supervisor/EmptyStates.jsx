/**
 * @file EmptyStates.jsx
 * @description Reusable Empty State component for Supervisor dashboard widgets and table views.
 */

import {
  RiUserSearchLine,
  RiStarLine,
  RiCheckboxCircleLine,
  RiCalendarEventLine,
  RiHistoryLine,
} from 'react-icons/ri';


const EMPTY_CONFIGS = {
  'no-interns': {
    icon: RiUserSearchLine,
    title: 'No Interns Found',
    message: 'There are no interns assigned or matching your filter query.',
    color: '#4f46e5',
  },
  'no-reviews': {
    icon: RiStarLine,
    title: 'No Pending Reviews',
    message: 'Great job! All intern performance evaluations are up to date.',
    color: '#059669',
  },
  'no-approvals': {
    icon: RiCheckboxCircleLine,
    title: 'No Pending Approvals',
    message: 'No onboarding milestones are currently waiting for your sign-off.',
    color: '#7c3aed',
  },
  'no-deadlines': {
    icon: RiCalendarEventLine,
    title: 'No Upcoming Deadlines',
    message: 'Your interns have no immediate task deadlines scheduled.',
    color: '#d97706',
  },
  'no-activity': {
    icon: RiHistoryLine,
    title: 'No Recent Activity',
    message: 'Activity timeline will populate as interns submit work and complete reviews.',
    color: '#64748b',
  },
};

const EmptyStates = ({ type = 'no-interns', title, message }) => {
  const config = EMPTY_CONFIGS[type] || EMPTY_CONFIGS['no-interns'];
  const Icon = config.icon;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: `${config.color}15`,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem',
          marginBottom: '1rem',
        }}
      >
        <Icon />
      </div>

      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
        {title || config.title}
      </h4>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)', maxWidth: '320px', lineHeight: 1.4 }}>
        {message || config.message}
      </p>
    </div>
  );
};

export default EmptyStates;
