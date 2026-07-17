/**
 * @file EvaluationCriteria.jsx
 * @description Displays the 5 evaluation criteria with animated score bars and feedback.
 */

import { motion } from 'framer-motion';

// ── Rating label lookup ────────────────────────────────────────────────────────

const getRatingLabel = (score) => {
  if (score >= 90) return { label: 'Outstanding', color: 'var(--color-success-600)', bg: 'var(--color-success-50)' };
  if (score >= 80) return { label: 'Exceeds Expectations', color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' };
  if (score >= 70) return { label: 'Meets Expectations', color: 'var(--color-warning-600)', bg: 'var(--color-warning-50)' };
  return { label: 'Needs Improvement', color: 'var(--color-danger-600)', bg: 'var(--color-danger-50)' };
};

const getBarColor = (score) => {
  if (score >= 90) return 'var(--color-success-500)';
  if (score >= 80) return 'var(--color-primary-500)';
  if (score >= 70) return 'var(--color-warning-500)';
  return 'var(--color-danger-500)';
};

// ── Single Criterion Row ───────────────────────────────────────────────────────

const CriterionRow = ({ criterion, index }) => {
  const pct = Math.min(100, Math.max(0, (criterion.score / criterion.maxScore) * 100));
  const rating = getRatingLabel(criterion.score);
  const barColor = getBarColor(criterion.score);

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
          {criterion.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: rating.color,
              background: rating.bg,
              padding: '0.2rem 0.6rem',
              borderRadius: '99px',
            }}
          >
            {rating.label}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: barColor }}>
            {criterion.score}
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-neutral-400)' }}>
              /{criterion.maxScore}
            </span>
          </span>
        </div>
      </div>

      {/* Animated progress bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'var(--color-neutral-100)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={criterion.score}
        aria-valuemin={0}
        aria-valuemax={criterion.maxScore}
        aria-label={`${criterion.label} score: ${criterion.score} out of ${criterion.maxScore}`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          style={{
            height: '100%',
            background: barColor,
            borderRadius: '99px',
          }}
        />
      </div>

      {/* Feedback text */}
      {criterion.feedback && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.6 }}>
          {criterion.feedback}
        </p>
      )}
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const EvaluationCriteria = ({ criteria = [] }) => {
  if (!criteria.length) return null;

  return (
    <section
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.75rem',
      }}
    >
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-neutral-900)',
          margin: '0 0 1.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        📊 Evaluation Criteria
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {criteria.map((criterion, i) => (
          <CriterionRow key={criterion.id} criterion={criterion} index={i} />
        ))}
      </div>
    </section>
  );
};

export default EvaluationCriteria;
