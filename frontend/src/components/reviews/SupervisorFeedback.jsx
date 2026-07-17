/**
 * @file SupervisorFeedback.jsx
 * @description Supervisor comment section with rich text, strengths, and improvement areas.
 */

import { motion } from 'framer-motion';
import { RiUser3Line, RiTimeLine } from 'react-icons/ri';

const formatTimestamp = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Callout card ──────────────────────────────────────────────────────────────

const CalloutCard = ({ title, items, accent, bgColor, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.08 }}
    style={{
      background: bgColor,
      borderRadius: '0.875rem',
      border: `1px solid ${accent}30`,
      padding: '1.25rem',
      flex: '1 1 280px',
    }}
  >
    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: accent, margin: '0 0 0.875rem 0' }}>
      {title}
    </h4>
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', display: 'block' }}>
              {item.title}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
              {item.description}
            </span>
          </div>
        </li>
      ))}
    </ul>
  </motion.div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const SupervisorFeedback = ({
  reviewerName,
  reviewerRole,
  reviewerAvatar,
  feedback,
}) => {
  if (!feedback) return null;

  const paragraphs = feedback.richText.split('\n\n').filter(Boolean);

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Section heading */}
      <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
        💬 {feedback.heading}
      </h2>

      {/* Reviewer info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {reviewerAvatar ? (
          <img
            src={reviewerAvatar}
            alt={reviewerName}
            style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div
            style={{
              width: '2.75rem',
              height: '2.75rem',
              borderRadius: '50%',
              background: 'var(--color-primary-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <RiUser3Line style={{ fontSize: '1.25rem', color: 'var(--color-primary-600)' }} />
          </div>
        )}
        <div>
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
            {reviewerName}
          </p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            {reviewerRole}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-neutral-400)' }}>
          <RiTimeLine />
          {formatTimestamp(feedback.submittedAt)}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Rich text paragraphs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {paragraphs.map((para, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.06 }}
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-neutral-700)',
              lineHeight: 1.75,
              margin: 0,
            }}
          >
            {para}
          </motion.p>
        ))}
      </div>

      {/* Strengths + Improvements callout cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {feedback.strengths && feedback.strengths.length > 0 && (
          <CalloutCard
            title="✅ Identified Strengths"
            items={feedback.strengths}
            accent="var(--color-success-600)"
            bgColor="var(--color-success-50)"
            index={0}
          />
        )}
        {feedback.improvements && feedback.improvements.length > 0 && (
          <CalloutCard
            title="🎯 Areas for Growth"
            items={feedback.improvements}
            accent="var(--color-warning-600)"
            bgColor="var(--color-warning-50)"
            index={1}
          />
        )}
      </div>
    </section>
  );
};

export default SupervisorFeedback;
