/**
 * @file ReviewCard.jsx
 * @description Reusable card component for displaying a performance review summary.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiCalendarEventLine,
  RiUser3Line,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFileEditLine,
} from 'react-icons/ri';
import { Badge } from '../ui';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  published: {
    label: 'Published',
    color: 'success',
    icon: <RiCheckboxCircleLine />,
  },
  scheduled: {
    label: 'Scheduled',
    color: 'primary',
    icon: <RiTimeLine />,
  },
  'pending-self-assessment': {
    label: 'Self-Assessment Due',
    color: 'warning',
    icon: <RiFileEditLine />,
  },
};

const getScoreColor = (score) => {
  if (score === null || score === undefined) return 'var(--color-neutral-400)';
  if (score >= 88) return 'var(--color-success-500)';
  if (score >= 75) return 'var(--color-primary-500)';
  return 'var(--color-warning-500)';
};

const getScoreBg = (score) => {
  if (score === null || score === undefined) return 'var(--color-neutral-100)';
  if (score >= 88) return 'var(--color-success-50)';
  if (score >= 75) return 'var(--color-primary-50)';
  return 'var(--color-warning-50)';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ── Component ──────────────────────────────────────────────────────────────────

const ReviewCard = ({ review, index = 0 }) => {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.scheduled;
  const scoreColor = getScoreColor(review.overallScore);
  const scoreBg = getScoreBg(review.overallScore);

  const handleViewDetails = () => {
    navigate(`/dashboard/reviews/${review.id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
      onClick={review.status === 'published' ? handleViewDetails : undefined}
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '1.5rem',
        cursor: review.status === 'published' ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Period badge + status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-primary-600)',
                background: 'var(--color-primary-50)',
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
              }}
            >
              {review.period}
            </span>
            <Badge variant={statusConfig.color} size="sm">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </Badge>
          </div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-neutral-900)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {review.title}
          </h3>
        </div>

        {/* Score circle */}
        {review.overallScore !== null ? (
          <div
            style={{
              flexShrink: 0,
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: scoreBg,
              border: `2px solid ${scoreColor}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
              {review.overallScore}
            </span>
            <span style={{ fontSize: '0.55rem', color: scoreColor, fontWeight: 600 }}>/ 100</span>
          </div>
        ) : (
          <div
            style={{
              flexShrink: 0,
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'var(--color-neutral-100)',
              border: '2px dashed var(--color-neutral-300)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '0.65rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>TBD</span>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}
        >
          <RiUser3Line style={{ fontSize: '0.95rem' }} />
          {review.reviewerName}
        </span>
        <span
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}
        >
          <RiCalendarEventLine style={{ fontSize: '0.95rem' }} />
          {formatDate(review.reviewDate)}
        </span>
      </div>

      {/* Summary excerpt */}
      {review.summary && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-neutral-600)',
            margin: 0,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {review.summary}
        </p>
      )}

      {/* Strengths chips */}
      {review.strengths && review.strengths.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {review.strengths.slice(0, 3).map((s) => (
            <span
              key={s}
              style={{
                fontSize: '0.7rem',
                fontWeight: 500,
                color: 'var(--color-success-700)',
                background: 'var(--color-success-50)',
                padding: '0.2rem 0.6rem',
                borderRadius: '99px',
                border: '1px solid var(--color-success-200)',
              }}
            >
              ✓ {s}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      {review.status === 'published' && (
        <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
          <button
            onClick={handleViewDetails}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-primary-600)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.375rem 0',
              transition: 'gap 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.gap = '0.625rem';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.gap = '0.375rem';
            }}
          >
            View Details <RiArrowRightLine />
          </button>
        </div>
      )}

      {review.status === 'pending-self-assessment' && (
        <div style={{ marginTop: 'auto', paddingTop: '0.25rem' }}>
          <button
            onClick={() => navigate(`/dashboard/reviews/${review.id}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-warning-600)',
              background: 'var(--color-warning-50)',
              border: '1px solid var(--color-warning-200)',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              transition: 'background 0.15s ease',
            }}
          >
            <RiFileEditLine /> Submit Self-Assessment
          </button>
        </div>
      )}
    </motion.article>
  );
};

export default ReviewCard;
