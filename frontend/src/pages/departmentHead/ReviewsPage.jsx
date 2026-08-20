/**
 * @file ReviewsPage.jsx
 * @description Department Head — Review Overview.
 * Read-only view of all intern reviews across department supervisors.
 * Shows review stats, filterable list with status/supervisor filters,
 * and a detail drawer with scores and supervisor summary.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiStarLine, RiSearchLine, RiCloseLine, RiAlarmWarningLine,
  RiCheckboxCircleLine, RiTimeLine, RiCalendarLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_CONFIG = {
  completed: { variant: 'success', label: 'Completed' },
  pending:   { variant: 'warning', label: 'Pending' },
  upcoming:  { variant: 'neutral', label: 'Upcoming' },
};

// ── Star Rating ────────────────────────────────────────────────────────────────
const StarRating = ({ rating }) => {
  if (!rating) return <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>Not rated</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: '0.9rem', color: s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginLeft: '0.25rem' }}>{rating.toFixed(1)}</span>
    </div>
  );
};

// ── Review Detail Drawer ───────────────────────────────────────────────────────
const ReviewDrawer = ({ review, onClose }) => {
  if (!review) return null;
  const status = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.upcoming;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, backdropFilter: 'blur(2px)' }} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 460, background: '#fff', zIndex: 501, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-neutral-900)' }}>Review Details</h3>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '0.375rem', border: 'none', background: 'var(--color-neutral-100)', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-500)' }}><RiCloseLine /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
            <Avatar name={review.internName} src={review.internAvatar} size="lg" />
            <h4 style={{ margin: '0.875rem 0 0.25rem', fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{review.internName}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>{review.track}</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Badge variant={status.variant}>{status.label}</Badge>
              {review.requiresAttention && <Badge variant="danger" dot>Needs Attention</Badge>}
            </div>
          </div>

          {/* Review Metadata */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Review Type', value: review.reviewType },
              { label: 'Cycle', value: review.reviewCycle },
              { label: 'Supervisor', value: review.supervisorName },
              { label: 'Due Date', value: review.dueDate },
              { label: 'Completed', value: review.completedDate ?? 'Pending' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>{label}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Scores */}
          {review.score && (
            <div>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>Evaluation Scores</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  { label: 'Overall Score', value: review.score, max: 100, color: '#4f46e5' },
                  { label: 'Star Rating', value: review.rating * 20, max: 100, color: '#f59e0b', display: `${review.rating}/5` },
                ].map(({ label, value, max, color, display }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>{label}</span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color }}>{display ?? `${value}%`}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ height: '100%', background: color, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {review.summary && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.875rem', padding: '0.875rem 1rem' }}>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>Supervisor Summary</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.6, fontStyle: 'italic' }}>"{review.summary}"</p>
            </div>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Review Card ────────────────────────────────────────────────────────────────
const ReviewCard = ({ review, onView, index }) => {
  const status = STATUS_CONFIG[review.status] ?? STATUS_CONFIG.upcoming;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      onClick={() => onView(review)}
      style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: review.requiresAttention ? '1px solid #fca5a5' : '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.875rem', position: 'relative' }}
    >
      {review.requiresAttention && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <RiAlarmWarningLine style={{ color: '#dc2626', fontSize: '1.125rem' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Avatar name={review.internName} src={review.internAvatar} size="sm" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.internName}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{review.track}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <Badge variant={status.variant}>{status.label}</Badge>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{review.reviewType}</span>
      </div>

      {review.score ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <StarRating rating={review.rating} />
          <span style={{ fontSize: '1rem', fontWeight: 900, color: review.score >= 90 ? '#059669' : review.score >= 75 ? '#d97706' : '#dc2626' }}>{review.score}%</span>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
          {review.status === 'upcoming' ? `Due ${review.dueDate}` : 'Awaiting completion...'}
        </p>
      )}

      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
        By <strong style={{ color: 'var(--color-neutral-700)' }}>{review.supervisorName}</strong>
      </p>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ReviewsPage = () => {
  const { reviews, reviewStats, supervisors, filters, loading, errors, fetchReviews, fetchSupervisors, setFilter, setSelectedReview, selectedReview } = useDepartmentStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReviews();
    if (!supervisors.length) fetchSupervisors();
  }, [fetchReviews, fetchSupervisors]);

  const handleSearch = (val) => {
    setSearch(val);
    setFilter('reviewSearch', val);
    setTimeout(() => fetchReviews(), 0);
  };

  const handleFilter = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchReviews(), 0);
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
          Review Oversight
        </span>
        <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Department Reviews</h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
          Monitor <strong style={{ color: '#fff' }}>{reviewStats?.total ?? reviews.length} intern reviews</strong> across all supervisors.
          {reviewStats?.requiresAttention > 0 && (
            <> <strong style={{ color: '#fca5a5' }}>{reviewStats.requiresAttention} require your attention.</strong></>
          )}
        </p>
      </div>

      {/* Stats */}
      {reviewStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total', value: reviewStats.total, color: '#6d28d9' },
            { label: 'Completed', value: reviewStats.completed, color: '#10b981' },
            { label: 'Pending', value: reviewStats.pending, color: '#f59e0b' },
            { label: 'Upcoming', value: reviewStats.upcoming, color: '#0ea5e9' },
            { label: 'Needs Attention', value: reviewStats.requiresAttention, color: '#dc2626' },
          ].map(({ label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search intern, supervisor, review type..." value={search} onChange={(e) => handleSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', height: '38px', width: '100%' }} />
        </div>
        <select value={filters.reviewStatus} onChange={(e) => handleFilter('reviewStatus', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <select value={filters.reviewSupervisor} onChange={(e) => handleFilter('reviewSupervisor', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Supervisors</option>
          {supervisors.map(sv => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      {loading.reviews ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ height: 200, background: '#e2e8f0', borderRadius: '1rem', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : errors.reviews ? (
        <EmptyState icon={<RiStarLine />} title="Failed to load reviews" description={errors.reviews} />
      ) : reviews.length === 0 ? (
        <EmptyState icon={<RiStarLine />} title="No reviews found" description="Try adjusting your filters." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {reviews.map((r, i) => <ReviewCard key={r.id} review={r} onView={setSelectedReview} index={i} />)}
        </div>
      )}

      <ReviewDrawer review={selectedReview} onClose={() => setSelectedReview(null)} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
};

export default ReviewsPage;
