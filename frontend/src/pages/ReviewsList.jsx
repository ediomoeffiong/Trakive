/**
 * @file ReviewsList.jsx
 * @description Performance Reviews & Analytics overview page for Trakive interns.
 * Displays stats summary, primary view tabs (Reviews vs Performance Trends & Analytics),
 * filter tabs, review cards, and detailed performance visualizations.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFileEditLine,
  RiRefreshLine,
  RiLineChartLine,
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
  PerformanceTrendCharts,
} from '../components/reviews';

import {
  ProductivityAreaChart,
  SkillsRadarChart,
  ActivityHeatmap,
} from '../components/analytics';

import { analyticsService } from '../services/analyticsService';

// ── Filter Tab Config ──────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',                       label: 'All Reviews',         icon: <RiFileTextLine /> },
  { key: 'published',                  label: 'Published',           icon: <RiCheckboxCircleLine /> },
  { key: 'scheduled',                  label: 'Scheduled',           icon: <RiTimeLine /> },
  { key: 'pending-self-assessment',    label: 'Self-Assessment Due',  icon: <RiFileEditLine /> },
];

const deriveSummaryFromReviews = (reviews = []) => {
  if (!reviews.length) return null;

  const completed = reviews.filter((review) => review.status === 'published' || review.status === 'completed');
  const scheduled = reviews
    .map((review) => review.nextReviewDate || review.scheduledAt || review.reviewDate)
    .filter(Boolean)
    .map((date) => new Date(date))
    .filter((date) => !Number.isNaN(date.getTime()) && date.getTime() >= Date.now())
    .sort((a, b) => a - b);
  const scores = completed
    .map((review) => Number(review.overallScore ?? review.score ?? review.rating))
    .filter((score) => Number.isFinite(score));
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;

  return {
    overallScore: averageScore ?? '—',
    completedReviews: completed.length,
    nextReviewDate: scheduled[0]?.toISOString() || null,
    averageRating: averageScore ?? '—',
    trend: 'stable',
    trendDelta: '—',
  };
};

// ── Page Component ─────────────────────────────────────────────────────────────

export default function ReviewsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('tab') === 'analytics' ? 'analytics' : 'reviews';
  const [viewMode, setViewMode] = useState(initialView);

  const [chartData, setChartData] = useState(null);
  const [loadingCharts, setLoadingCharts] = useState(false);

  const {
    reviews,
    statusFilter,
    setStatusFilter,
    loadingReviews,
    loadingTrends,
    performanceTrends,
    radarData,
    performanceSummary,
    error,
    fetchReviews,
    fetchPerformanceTrends,
  } = useReviewStore();

  const filteredReviews = useMemo(
    () => getFilteredReviews({ reviews, statusFilter }),
    [reviews, statusFilter]
  );
  const actualSummary = useMemo(
    () => performanceSummary || deriveSummaryFromReviews(reviews),
    [performanceSummary, reviews]
  );

  // Sync tab state with URL search param
  const handleViewChange = (mode) => {
    setViewMode(mode);
    if (mode === 'analytics') {
      setSearchParams({ tab: 'analytics' });
    } else {
      setSearchParams({});
    }
  };

  // Keep viewMode synced if search params change externally
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'analytics' && viewMode !== 'analytics') {
      setViewMode('analytics');
    } else if (!tab && viewMode !== 'reviews') {
      setViewMode('reviews');
    }
  }, [searchParams, viewMode]);

  // Load review & chart data
  const loadData = useCallback(() => {
    fetchReviews();
    fetchPerformanceTrends();
    setLoadingCharts(true);
    analyticsService.getChartData()
      .then((data) => setChartData(data))
      .catch((err) => console.error('Failed to load chart data:', err))
      .finally(() => setLoadingCharts(false));
  }, [fetchReviews, fetchPerformanceTrends]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Effective trend data for charts, falling back to weekly/skills data if reviews are empty
  const effectiveTrends = useMemo(() => {
    if (performanceTrends && performanceTrends.length > 0) {
      return performanceTrends;
    }
    if (chartData?.weeklyTrend && chartData.weeklyTrend.length > 0) {
      return chartData.weeklyTrend.map((w) => {
        const score = Math.round((w.avgScore || 4.0) * 20);
        return {
          period: w.period,
          overall: score,
          productivity: score,
          quality: Math.min(100, score + 2),
          communication: Math.max(0, score - 3),
          initiative: score,
          teamwork: Math.min(100, score + 4),
        };
      });
    }
    return [];
  }, [performanceTrends, chartData?.weeklyTrend]);

  const effectiveRadar = useMemo(() => {
    if (radarData && radarData.length > 0) {
      return radarData;
    }
    if (chartData?.skillMatrix && chartData.skillMatrix.length > 0) {
      return chartData.skillMatrix.map((s) => ({
        subject: s.subject,
        score: Math.round((s.internScore || 4.0) * 20),
        fullMark: 100,
      }));
    }
    return [];
  }, [radarData, chartData?.skillMatrix]);

  const isLoading = loadingReviews || (viewMode === 'analytics' && loadingCharts);

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
            Performance &amp; Reviews
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Track your evaluation history, supervisor feedback, performance trends, and growth trajectory.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadData}
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
        <ReviewStatsBar summary={actualSummary} loading={loadingTrends} />
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

      {/* ── Primary View Switcher Tabs ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--color-neutral-200)',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          id="reviews-view-tab"
          onClick={() => handleViewChange('reviews')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9375rem',
            fontWeight: viewMode === 'reviews' ? 700 : 500,
            color: viewMode === 'reviews' ? '#00b4d8' : 'var(--color-neutral-500)',
            cursor: 'pointer',
            borderBottom: viewMode === 'reviews' ? '3px solid #00b4d8' : '3px solid transparent',
            marginBottom: '-0.25rem',
            transition: 'all 0.15s ease',
          }}
        >
          <RiFileTextLine style={{ fontSize: '1.1rem' }} />
          Reviews &amp; Evaluations
          {filteredReviews.length > 0 && (
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '99px',
                background: viewMode === 'reviews' ? 'rgba(0, 180, 216, 0.12)' : 'var(--color-neutral-100)',
                color: viewMode === 'reviews' ? '#00b4d8' : 'var(--color-neutral-600)',
                fontWeight: 700,
              }}
            >
              {filteredReviews.length}
            </span>
          )}
        </button>

        <button
          id="analytics-view-tab"
          onClick={() => handleViewChange('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.5rem 0.5rem 0 0',
            border: 'none',
            background: 'transparent',
            fontSize: '0.9375rem',
            fontWeight: viewMode === 'analytics' ? 700 : 500,
            color: viewMode === 'analytics' ? '#00b4d8' : 'var(--color-neutral-500)',
            cursor: 'pointer',
            borderBottom: viewMode === 'analytics' ? '3px solid #00b4d8' : '3px solid transparent',
            marginBottom: '-0.25rem',
            transition: 'all 0.15s ease',
          }}
        >
          <RiLineChartLine style={{ fontSize: '1.1rem' }} />
          Performance Trends &amp; Analytics
        </button>
      </div>

      {/* ── View 1: Reviews & Evaluations List ─────────────────────────────────── */}
      {viewMode === 'reviews' && (
        <section>
          {/* Status Filter tabs */}
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
                  background: statusFilter === tab.key ? '#00b4d8' : 'var(--color-surface)',
                  color: statusFilter === tab.key ? '#fff' : 'var(--color-neutral-600)',
                  borderColor: statusFilter === tab.key ? '#00b4d8' : 'var(--color-border)',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card grid */}
          {loadingReviews ? (
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
      )}

      {/* ── View 2: Performance Trends & Analytics ───────────────────────────── */}
      {viewMode === 'analytics' && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Multi-category performance trend charts */}
          <PerformanceTrendCharts
            trends={effectiveTrends}
            radarData={effectiveRadar}
          />

          {/* Side-by-Side: Productivity Growth & Competency Skills Matrix */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
              gap: '1.5rem',
            }}
          >
            <ProductivityAreaChart
              data={chartData?.productivityGrowth || []}
              title="Productivity Growth & Output"
              description="Monthly task completion throughput and velocity trend"
            />
            <SkillsRadarChart
              data={chartData?.skillMatrix || []}
              title="Competency & Rubric Matrix"
              description="Evaluation ratings across core engineering rubrics"
            />
          </div>

          {/* Activity Heatmap */}
          <ActivityHeatmap
            data={chartData?.heatmapData || []}
            title="Internship Contribution & Activity Heatmap"
            description="Daily task submissions, completions, and review logs over the past 26 weeks"
          />
        </section>
      )}
    </div>
  );
}
