/**
 * @file SubmissionMonitoringView.jsx
 * @description Visual submission dashboard for supervisor: status breakdowns,
 * progress rings, and individual submission evaluation cards.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCheckboxCircleLine,
  RiLoader3Line,
  RiTimeLine,
  RiCloseCircleLine,
  RiEyeLine,
  RiStarLine,
  RiFileUploadLine,
  RiRefreshLine,
} from 'react-icons/ri';
import { useSupervisorTaskStore } from '../../../store/useSupervisorTaskStore';
import { SubmissionMonitoringSkeleton } from './TaskSkeletonLoaders';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  submitted:      { label: 'Submitted',      color: '#3b82f6', bg: '#dbeafe', icon: RiFileUploadLine },
  pending:        { label: 'Pending',        color: '#f59e0b', bg: '#fef3c7', icon: RiTimeLine },
  late:           { label: 'Late',           color: '#ef4444', bg: '#fee2e2', icon: RiCloseCircleLine },
  'not-started':  { label: 'Not Started',    color: '#94a3b8', bg: '#f1f5f9', icon: RiLoader3Line },
  reviewed:       { label: 'Reviewed',       color: '#10b981', bg: '#d1fae5', icon: RiCheckboxCircleLine },
  'needs-revision': { label: 'Needs Revision', color: '#f97316', bg: '#ffedd5', icon: RiRefreshLine },
};

// ── Circular progress ring ────────────────────────────────────────────────────
const ProgressRing = ({ value, max, color, size = 60, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
};

// ── Status summary card ───────────────────────────────────────────────────────
const StatusSummaryCard = ({ statusKey, count, total, onClick, isActive }) => {
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(statusKey)}
      style={{
        background: isActive ? config.bg : '#fff',
        borderRadius: '0.875rem',
        padding: '1rem',
        border: isActive ? `1.5px solid ${config.color}40` : '1px solid var(--color-neutral-200)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ProgressRing value={count} max={total} color={config.color} />
        <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color, fontSize: '1rem' }}>
          <Icon />
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '1.375rem', fontWeight: 900, color: config.color, lineHeight: 1 }}>{count}</p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {config.label}
        </p>
      </div>
    </motion.div>
  );
};

// ── Submission card ───────────────────────────────────────────────────────────
const SubmissionCard = ({ submission }) => {
  const STATUS_COLORS = {
    submitted: '#3b82f6', reviewed: '#10b981', 'needs-revision': '#ef4444', late: '#f59e0b',
  };
  const statusColor = STATUS_COLORS[submission.status] || '#94a3b8';

  const handleReview = () => {
    toast.success(`Opening review for ${submission.internName}...`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        borderRadius: '0.875rem',
        padding: '1rem 1.125rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {submission.internInitials}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              {submission.internName}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
              Attempt #{submission.attemptNumber} ·{' '}
              {new Date(submission.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              {submission.isLate && <span style={{ color: '#ef4444', fontWeight: 700 }}> · Late</span>}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {submission.score !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', fontWeight: 800, color: '#4f46e5' }}>
              <RiStarLine style={{ color: '#f59e0b' }} /> {submission.score}/100
            </span>
          )}
          <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30`, textTransform: 'capitalize' }}>
            {submission.status?.replace(/-/g, ' ')}
          </span>
        </div>
      </div>

      {/* Task title */}
      <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#4f46e5', background: '#eef2ff', padding: '0.25rem 0.625rem', borderRadius: '0.375rem', display: 'inline-block', alignSelf: 'flex-start' }}>
        {submission.taskTitle}
      </p>

      {/* Note */}
      {submission.submissionNote && (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>
          {submission.submissionNote}
        </p>
      )}

      {/* Links */}
      {submission.links?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {submission.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none', background: '#eef2ff', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #c7d2fe' }}
            >
              🔗 {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Feedback */}
      {submission.feedback && (
        <div style={{ background: '#f0fdf4', borderRadius: '0.625rem', padding: '0.75rem', border: '1px solid #bbf7d0' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#15803d' }}>Your Feedback:</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#166534', lineHeight: 1.5 }}>{submission.feedback}</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#4ade80' }}>by {submission.reviewedBy}</p>
        </div>
      )}

      {/* Review action */}
      {submission.status === 'submitted' && (
        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RiEyeLine /> Review Submission
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SubmissionMonitoringView = () => {
  const { submissions, loading, fetchSubmissions } = useSupervisorTaskStore();
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const statusCounts = {
    submitted:        submissions.filter((s) => s.status === 'submitted').length,
    pending:          0,
    late:             submissions.filter((s) => s.isLate).length,
    'not-started':    0,
    reviewed:         submissions.filter((s) => s.status === 'reviewed').length,
    'needs-revision': submissions.filter((s) => s.status === 'needs-revision').length,
  };
  const total = submissions.length;

  const filtered = activeFilter
    ? submissions.filter((s) => {
        if (activeFilter === 'needs-revision') return s.status === 'needs-revision';
        if (activeFilter === 'late') return s.isLate;
        return s.status === activeFilter;
      })
    : submissions;

  if (loading.submissions) return <SubmissionMonitoringSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* Status Summary Grid */}
      <div>
        <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
          Submission Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <StatusSummaryCard
              key={status}
              statusKey={status}
              count={count}
              total={Math.max(total, 1)}
              isActive={activeFilter === status}
              onClick={(s) => setActiveFilter(activeFilter === s ? null : s)}
            />
          ))}
        </div>
        {activeFilter && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setActiveFilter(null)}
            style={{ marginTop: '0.625rem', background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0' }}
          >
            ✕ Clear filter
          </motion.button>
        )}
      </div>

      {/* Submission list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
            {activeFilter ? `${STATUS_CONFIG[activeFilter]?.label || activeFilter} Submissions` : 'All Submissions'}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
              ({filtered.length})
            </span>
          </h3>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchSubmissions()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: '#fff', fontSize: '0.8125rem', color: 'var(--color-neutral-600)', fontWeight: 600, cursor: 'pointer' }}
          >
            <RiRefreshLine /> Refresh
          </motion.button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-200)', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
            No submissions match the selected filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <AnimatePresence>
              {filtered.map((sub) => (
                <SubmissionCard key={sub.id} submission={sub} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubmissionMonitoringView;

