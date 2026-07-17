/**
 * @file ReviewTimeline.jsx
 * @description Animated vertical timeline showing the review cycle steps.
 */

import { motion } from 'framer-motion';
import {
  RiFileEditLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiShareBoxLine,
} from 'react-icons/ri';

// ── Icon map ───────────────────────────────────────────────────────────────────

const ICON_MAP = {
  self:       <RiFileEditLine />,
  scheduled:  <RiCalendarEventLine />,
  evaluation: <RiCheckboxCircleLine />,
  published:  <RiShareBoxLine />,
};

const STATUS_STYLES = {
  completed: {
    nodeBg:     'var(--color-primary-600)',
    nodeColor:  '#fff',
    labelColor: 'var(--color-neutral-900)',
    lineBg:     'var(--color-primary-300)',
  },
  pending: {
    nodeBg:     'var(--color-warning-400)',
    nodeColor:  '#fff',
    labelColor: 'var(--color-neutral-700)',
    lineBg:     'var(--color-neutral-200)',
  },
  upcoming: {
    nodeBg:     'var(--color-neutral-200)',
    nodeColor:  'var(--color-neutral-400)',
    labelColor: 'var(--color-neutral-500)',
    lineBg:     'var(--color-neutral-100)',
  },
};

const formatTimestamp = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Main Component ─────────────────────────────────────────────────────────────

const ReviewTimeline = ({ events = [] }) => {
  if (!events.length) return null;

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.75rem',
      }}
    >
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 1.75rem 0' }}>
        🗓️ Review Timeline
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {events.map((event, i) => {
          const isLast = i === events.length - 1;
          const styles = STATUS_STYLES[event.status] ?? STATUS_STYLES.upcoming;
          const icon = ICON_MAP[event.icon] ?? ICON_MAP.self;
          const ts = formatTimestamp(event.timestamp);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              style={{ display: 'flex', gap: '1.25rem', alignItems: 'stretch' }}
            >
              {/* Left column — icon + vertical line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 + 0.15, type: 'spring', stiffness: 400, damping: 25 }}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    background: styles.nodeBg,
                    color: styles.nodeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {icon}
                </motion.div>
                {!isLast && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.3, transformOrigin: 'top' }}
                    style={{
                      width: '2px',
                      flex: 1,
                      minHeight: '2.5rem',
                      background: styles.lineBg,
                      margin: '0.25rem 0',
                    }}
                  />
                )}
              </div>

              {/* Right column — text content */}
              <div style={{ paddingBottom: isLast ? 0 : '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: styles.labelColor }}>
                    {event.event}
                  </span>
                  {ts && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
                      {ts}
                    </span>
                  )}
                  {!ts && event.status !== 'completed' && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: event.status === 'pending' ? 'var(--color-warning-600)' : 'var(--color-neutral-400)',
                        background: event.status === 'pending' ? 'var(--color-warning-50)' : 'var(--color-neutral-100)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                      }}
                    >
                      {event.status === 'pending' ? 'Action Required' : 'Upcoming'}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0.25rem 0 0', lineHeight: 1.55 }}>
                  {event.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ReviewTimeline;
