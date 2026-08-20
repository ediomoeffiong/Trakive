/**
 * @file ReviewHistoryView.jsx
 * @description Timeline of completed supervisor reviews with filter controls.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCheckboxCircleLine,
  RiRefreshLine,
  RiCloseCircleLine,
  RiFilter3Line,
  RiStarLine,
  RiSearchLine,
  RiHistoryLine,
} from 'react-icons/ri';
import { HistoryTimelineSkeleton } from './ReviewSkeletonLoaders';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const getInitialsBg = (initials = 'XX') => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#059669'];
  return colors[initials.charCodeAt(0) % colors.length];
};

const DECISION_CONFIG = {
  approved:         { label: 'Approved',       bg: '#ecfdf5', color: '#059669', icon: RiCheckboxCircleLine, border: '#a7f3d0' },
  'needs-revision': { label: 'Needs Revision', bg: '#fffbeb', color: '#d97706', icon: RiRefreshLine,        border: '#fcd34d' },
  rejected:         { label: 'Rejected',        bg: '#fef2f2', color: '#dc2626', icon: RiCloseCircleLine,   border: '#fca5a5' },
};

const RECOMMENDATION_COLORS = {
  'Exceeds Expectations': '#059669',
  'Meets Expectations':   '#4f46e5',
  'Needs Coaching':       '#d97706',
  'Unsatisfactory':       '#dc2626',
};

// ── Rubric Bar ────────────────────────────────────────────────────────────────
const RubricBar = ({ label, value }) => {
  const color = value >= 90 ? '#10b981' : value >= 70 ? '#4f46e5' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', width: '100px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '9999px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color, width: '28px', textAlign: 'right' }}>{value}</span>
    </div>
  );
};

// ── History Card ──────────────────────────────────────────────────────────────
const HistoryCard = ({ review, index }) => {
  const decision = DECISION_CONFIG[review.decision] || DECISION_CONFIG.approved;
  const DecisionIcon = decision.icon;
  const recColor = RECOMMENDATION_COLORS[review.recommendation] || '#64748b';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: `1px solid ${decision.border}`,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* Top stripe */}
      <div style={{ height: '4px', background: decision.color, opacity: 0.7 }} />

      <div style={{ padding: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getInitialsBg(review.internInitials), color: '#fff', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              {review.internInitials}
            </div>
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{review.internName}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{review.internDepartment}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: decision.bg, color: decision.color, fontSize: '0.75rem', fontWeight: 700 }}>
              <DecisionIcon style={{ fontSize: '0.875rem' }} />
              {decision.label}
            </span>
            {review.score != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <RiStarLine style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                <span style={{ fontSize: '1.0625rem', fontWeight: 900, color: review.score >= 90 ? '#059669' : review.score >= 70 ? '#4f46e5' : '#d97706' }}>{review.score}</span>
              </div>
            )}
          </div>
        </div>

        {/* Task */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-neutral-700)' }}>Task:</span> {review.taskTitle}
        </div>

        {/* Meta row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)', marginBottom: '1rem' }}>
          <span>Reviewed {fmt(review.reviewedAt)} by {review.reviewerName}</span>
          {review.recommendation && (
            <span style={{ fontWeight: 700, color: recColor }}>● {review.recommendation}</span>
          )}
        </div>

        {/* Rubric */}
        {review.rubric && (
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <RubricBar label="Quality" value={review.rubric.quality} />
            <RubricBar label="Timeliness" value={review.rubric.timeliness} />
            <RubricBar label="Communication" value={review.rubric.communication} />
            <RubricBar label="Tech. Depth" value={review.rubric.technicalDepth} />
          </div>
        )}

        {/* Feedback */}
        <div style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.7, marginBottom: '0.875rem' }}>
          {review.feedback}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
          {review.strengths?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {review.strengths.map((s) => (
                <span key={s} style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#ecfdf5', color: '#059669', fontSize: '0.6875rem', fontWeight: 700 }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
          {review.areasForImprovement?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {review.areasForImprovement.map((a) => (
                <span key={a} style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#fffbeb', color: '#d97706', fontSize: '0.6875rem', fontWeight: 700 }}>
                  ↑ {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ReviewHistoryView = ({
  history = [],
  isLoading = false,
  filters = {},
  onFilterChange,
  onClearFilters,
}) => {
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (isLoading) return <HistoryTimelineSkeleton count={5} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search by intern */}
          <div style={{ position: 'relative', flex: '1', minWidth: '180px' }}>
            <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', fontSize: '1rem' }} />
            <input
              type="text"
              placeholder="Search intern…"
              value={filters.internSearch || ''}
              onChange={(e) => onFilterChange?.('internSearch', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.875rem 0.5rem 2.25rem',
                borderRadius: '0.75rem',
                border: '1.5px solid var(--color-neutral-200)',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-neutral-200)')}
            />
          </div>

          {/* Department */}
          <select
            value={filters.department || ''}
            onChange={(e) => onFilterChange?.('department', e.target.value)}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">All Departments</option>
            <option value="Frontend Engineering">Frontend Engineering</option>
            <option value="Backend Engineering">Backend Engineering</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Data Science">Data Science</option>
            <option value="DevOps">DevOps</option>
            <option value="Product Management">Product Management</option>
          </select>

          {/* Decision */}
          <select
            value={filters.decision || ''}
            onChange={(e) => onFilterChange?.('decision', e.target.value)}
            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">All Decisions</option>
            <option value="approved">Approved</option>
            <option value="needs-revision">Needs Revision</option>
            <option value="rejected">Rejected</option>
          </select>

          {activeFiltersCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClearFilters}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear ({activeFiltersCount})
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)' }}>
          <RiHistoryLine style={{ fontSize: '3rem', color: 'var(--color-neutral-300)', marginBottom: '1rem' }} />
          <h3 style={{ margin: 0, color: 'var(--color-neutral-500)', fontWeight: 700 }}>No Review History</h3>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
            {activeFiltersCount > 0 ? 'No reviews match the current filters.' : 'Completed reviews will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>
            {history.length} review{history.length !== 1 ? 's' : ''} found
          </div>
          <AnimatePresence>
            {history.map((review, i) => (
              <HistoryCard key={review.id} review={review} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ReviewHistoryView;
