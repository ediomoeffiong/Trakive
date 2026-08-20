/**
 * @file TaskEmptyStates.jsx
 * @description Specialized empty state components for the Supervisor Task Management module.
 */

import { motion } from 'framer-motion';
import {
  RiTaskLine,
  RiFileUploadLine,
  RiLayoutGridLine,
  RiSearchLine,
  RiUserAddLine,
  RiAddCircleLine,
} from 'react-icons/ri';

const emptyConfigs = {
  'no-tasks': {
    icon: RiTaskLine,
    color: '#4f46e5',
    bg: '#eef2ff',
    title: 'No Tasks Yet',
    subtitle: 'Create your first task to get started. Assign tasks to interns and track their progress.',
    ctaLabel: 'Create First Task',
  },
  'no-submissions': {
    icon: RiFileUploadLine,
    color: '#0891b2',
    bg: '#ecfeff',
    title: 'No Submissions Yet',
    subtitle: 'No interns have submitted work for this task yet. Check back once the assignment is in progress.',
    ctaLabel: null,
  },
  'no-templates': {
    icon: RiLayoutGridLine,
    color: '#7c3aed',
    bg: '#faf5ff',
    title: 'No Templates Found',
    subtitle: 'Create reusable task templates to speed up your workflow and maintain consistency.',
    ctaLabel: 'Create Template',
  },
  'no-results': {
    icon: RiSearchLine,
    color: '#64748b',
    bg: '#f1f5f9',
    title: 'No Results Found',
    subtitle: 'No tasks match your current search or filter criteria. Try adjusting your filters.',
    ctaLabel: 'Clear Filters',
  },
  'no-assignments': {
    icon: RiUserAddLine,
    color: '#059669',
    bg: '#ecfdf5',
    title: 'No Assignments',
    subtitle: 'This task hasn\'t been assigned to any interns yet. Use the Assign button to get started.',
    ctaLabel: 'Assign Now',
  },
  'no-drafts': {
    icon: RiTaskLine,
    color: '#d97706',
    bg: '#fffbeb',
    title: 'No Drafts',
    subtitle: 'You have no saved draft tasks. Create a task and save it as a draft before publishing.',
    ctaLabel: 'Create Task',
  },
};

const TaskEmptyState = ({ type = 'no-tasks', onCTA, compact = false }) => {
  const config = emptyConfigs[type] || emptyConfigs['no-tasks'];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: compact ? '2.5rem 1.5rem' : '4rem 2rem',
        textAlign: 'center',
        gap: '1rem',
      }}
    >
      {/* Icon with glow */}
      <div
        style={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          borderRadius: '50%',
          background: config.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '1.5rem' : '2rem',
          color: config.color,
          boxShadow: `0 0 0 8px ${config.bg}80`,
          marginBottom: '0.25rem',
        }}
      >
        <Icon />
      </div>

      <div>
        <h3
          style={{
            margin: 0,
            fontSize: compact ? '0.9375rem' : '1.0625rem',
            fontWeight: 700,
            color: 'var(--color-neutral-800)',
            marginBottom: '0.375rem',
          }}
        >
          {config.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: compact ? '0.8125rem' : '0.875rem',
            color: 'var(--color-neutral-500)',
            maxWidth: '360px',
            lineHeight: 1.6,
          }}
        >
          {config.subtitle}
        </p>
      </div>

      {config.ctaLabel && onCTA && (
        <motion.button
          whileHover={{ y: -2, boxShadow: `0 8px 24px ${config.color}30` }}
          whileTap={{ scale: 0.97 }}
          onClick={onCTA}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}cc 100%)`,
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '0.5rem',
          }}
        >
          <RiAddCircleLine />
          {config.ctaLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default TaskEmptyState;
