/**
 * @file InternEmptyStates.jsx
 * @description Reusable empty state components for the Intern Management module.
 * Extends the existing EmptyStates pattern from the Supervisor Dashboard.
 */

import { motion } from 'framer-motion';
import {
  RiUserSearchLine,
  RiFileTextLine,
  RiHistoryLine,
  RiStickyNoteLine,
  RiSearchLine,
} from 'react-icons/ri';

const CONFIGS = {
  'no-interns': {
    icon: RiUserSearchLine,
    title: 'No Interns Found',
    message: 'No interns are assigned to you yet, or none match your current search and filter criteria.',
    color: '#4f46e5',
  },
  'no-search-results': {
    icon: RiSearchLine,
    title: 'No Search Results',
    message: 'No interns matched your search query. Try adjusting your keywords or clearing filters.',
    color: '#64748b',
  },
  'no-documents': {
    icon: RiFileTextLine,
    title: 'No Documents',
    message: 'This intern has not uploaded any documents yet. Documents will appear here once submitted.',
    color: '#7c3aed',
  },
  'no-activity': {
    icon: RiHistoryLine,
    title: 'No Activity Yet',
    message: 'The activity timeline will populate as this intern submits work, completes reviews, and logs in.',
    color: '#64748b',
  },
  'no-notes': {
    icon: RiStickyNoteLine,
    title: 'No Notes Yet',
    message: 'You have not added any private notes for this intern. Click "Add Note" to get started.',
    color: '#d97706',
  },
};

const InternEmptyState = ({ type = 'no-interns', title, message, action }) => {
  const config = CONFIGS[type] || CONFIGS['no-interns'];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: `${config.color}15`,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.25rem',
        }}
      >
        <Icon />
      </div>

      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
        {title || config.title}
      </h4>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)', maxWidth: '340px', lineHeight: 1.5 }}>
        {message || config.message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
          style={{ marginTop: '1.5rem', fontSize: '0.8125rem' }}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

export default InternEmptyState;
