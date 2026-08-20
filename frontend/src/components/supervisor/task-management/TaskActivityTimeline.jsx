/**
 * @file TaskActivityTimeline.jsx
 * @description Visual step-by-step activity timeline for task lifecycle milestones.
 * Reuses pattern from intern-management/ActivityTimeline.jsx.
 */

import { motion } from 'framer-motion';
import {
  RiAddCircleLine,
  RiUserAddLine,
  RiEdit2Line,
  RiFileUploadLine,
  RiEyeLine,
  RiCheckboxCircleLine,
  RiArchiveLine,
  RiLoader3Line,
} from 'react-icons/ri';

const TYPE_CONFIG = {
  created:    { icon: RiAddCircleLine,       color: '#4f46e5', bg: '#eef2ff',  label: 'Created' },
  assigned:   { icon: RiUserAddLine,          color: '#7c3aed', bg: '#faf5ff',  label: 'Assigned' },
  updated:    { icon: RiEdit2Line,            color: '#0891b2', bg: '#ecfeff',  label: 'Updated' },
  submitted:  { icon: RiFileUploadLine,       color: '#059669', bg: '#ecfdf5',  label: 'Submitted' },
  reviewed:   { icon: RiEyeLine,              color: '#d97706', bg: '#fffbeb',  label: 'Reviewed' },
  approved:   { icon: RiCheckboxCircleLine,   color: '#16a34a', bg: '#f0fdf4',  label: 'Approved' },
  archived:   { icon: RiArchiveLine,          color: '#64748b', bg: '#f1f5f9',  label: 'Archived' },
  progress:   { icon: RiLoader3Line,          color: '#6366f1', bg: '#eef2ff',  label: 'Progress' },
};

const TaskActivityTimeline = ({ timeline = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ height: 12, width: '50%', background: '#f1f5f9', borderRadius: 6 }} />
              <div style={{ height: 10, width: '80%', background: '#f1f5f9', borderRadius: 6 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Vertical line */}
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
        {timeline.map((event, index) => {
          const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.updated;
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: index * 0.05 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', position: 'relative', zIndex: 1 }}
            >
              {/* Icon node */}
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
                  boxShadow: '0 0 0 3px #ffffff',
                }}
              >
                <Icon />
              </div>

              {/* Content card */}
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
                    marginBottom: '0.25rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.375rem',
                        background: config.bg,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'var(--color-neutral-800)',
                      }}
                    >
                      {event.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
                    {event.timeAgo}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
                  {event.description}
                </p>
                {event.actor && (
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    by <strong style={{ color: 'var(--color-neutral-600)' }}>{event.actor}</strong>
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskActivityTimeline;
