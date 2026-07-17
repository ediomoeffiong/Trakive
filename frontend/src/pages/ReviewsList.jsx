/**
 * @file ReviewsList.jsx
 * @description Performance Reviews overview page for Trakive interns.
 * Displays stats summary, filter tabs, and animated review cards.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFileEditLine,
  RiRefreshLine,
} from 'react-icons/ri';

import {
  useReviewStore,
  getFilteredReviews,
} from '../store';

import {
  ReviewCard,
  ReviewStatsBar,
  ReviewCardListSkeleton,
  ReviewStatsBarSkeleton,
  NoReviewsEmpty,
} from '../components/reviews';

// ── Filter Tab Config ──────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',                       label: 'All Reviews',        icon: <RiFileTextLine /> },
  { key: 'published',                  label: 'Published',          icon: <RiCheckboxCircleLine /> },
  { key: 'scheduled',                  label: 'Scheduled',          icon: <RiTimeLine /> },
  { key: 'pending-self-assessment',    label: 'Self-Assessment Due', icon: <RiFileEditLine /> },
];

// ── Page Component ─────────────────────────────────────────────────────────────

export default function ReviewsList() {
  const {
    statusFilter,
    setStatusFilter,
    loadingReviews,
    loadingTrends,
    performanceSummary,
    error,
    fetchReviews,
    fetchPerformanceTrends,
  } = useReviewStore();

  const filteredReviews = useReviewStore(getFilteredReviews);

  // Load data on mount
  useEffect(() => {
    fetchReviews();
    fetchPerformanceTrends();
  }, [fetchReviews, fetchPerformanceTrends]);

  const isLoading = loadingReviews;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0 0 0.375rem' }}>
            Performance Reviews
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Track your evaluation history, supervisor feedback, and growth trajectory.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={() => { fetchReviews(); fetchPerformanceTrends(); }}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.625rem',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-neutral-600)',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
        >
          <motion.span
            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
            style={{ display: 'inline-flex' }}
          >
            <RiRefreshLine />
          </motion.span>
          Refresh
        </button>
      </motion.div>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      {loadingTrends ? (
        <ReviewStatsBarSkeleton />
      ) : (
        <ReviewStatsBar summary={performanceSummary} loading={loadingTrends} />
      )}

      {/* ── Error Banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'var(--color-danger-50)',
            border: '1px solid var(--color-danger-200)',
            color: 'var(--color-danger-700)',
            fontSize: '0.875rem',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── Filter Tabs + Card Grid ──────────────────────────────────────────── */}
      <section>
        {/* Filter tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              id={`reviews-tab-${tab.key}`}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '0.625rem',
                border: '1.5px solid transparent',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: statusFilter === tab.key ? 'var(--color-primary-600)' : 'var(--color-surface)',
                color: statusFilter === tab.key ? '#fff' : 'var(--color-neutral-600)',
                borderColor: statusFilter === tab.key ? 'var(--color-primary-600)' : 'var(--color-border)',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card grid */}
        {isLoading ? (
          <ReviewCardListSkeleton count={4} />
        ) : filteredReviews.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredReviews.map((review, i) => (
              <ReviewCard key={review.id} review={review} index={i} />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '1rem',
              border: '1px solid var(--color-border)',
            }}
          >
            <NoReviewsEmpty />
          </div>
        )}
      </section>
    </div>
  );
}
