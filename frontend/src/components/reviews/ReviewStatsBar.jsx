/**
 * @file ReviewStatsBar.jsx
 * @description Summary statistics banner displayed at the top of the Reviews Overview page.
 */

import { motion } from 'framer-motion';
import {
  RiBarChartLine,
  RiCheckboxCircleLine,
  RiCalendarEventLine,
  RiStarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSubtractLine,
} from 'react-icons/ri';

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TrendIcon = ({ trend }) => {
  if (trend === 'up')     return <RiArrowUpLine style={{ color: 'var(--color-success-500)' }} />;
  if (trend === 'down')   return <RiArrowDownLine style={{ color: 'var(--color-danger-500)' }} />;
  return <RiSubtractLine style={{ color: 'var(--color-neutral-400)' }} />;
};

const StatCard = ({ icon, label, value, sub, accent, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.08 }}
    style={{
      flex: '1 1 160px',
      background: 'var(--color-surface)',
      borderRadius: '0.875rem',
      border: '1px solid var(--color-border)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}
  >
    <div
      style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '0.625rem',
        background: accent ?? 'var(--color-primary-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        color: 'var(--color-primary-600)',
        marginBottom: '0.25rem',
      }}
    >
      {icon}
    </div>
    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </span>
    <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1 }}>
      {value}
    </span>
    {sub && (
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {sub}
      </span>
    )}
  </motion.div>
);

const ReviewStatsBar = ({ summary, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              flex: '1 1 160px',
              height: '7.5rem',
              borderRadius: '0.875rem',
              background: 'var(--color-neutral-100)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  const safeSummary = summary || {
    overallScore: '—',
    completedReviews: 0,
    nextReviewDate: null,
    averageRating: '—',
    trend: 'stable',
    trendDelta: '—',
  };

  const stats = [
    {
      icon: <RiBarChartLine />,
      label: 'Overall Score',
      value: safeSummary.overallScore,
      sub: summary ? (
        <>
          <TrendIcon trend={safeSummary.trend} />
          <span style={{ color: safeSummary.trend === 'up' ? 'var(--color-success-600)' : safeSummary.trend === 'down' ? 'var(--color-danger-600)' : 'var(--color-neutral-500)', fontWeight: 600 }}>
            {safeSummary.trendDelta}
          </span>
          &nbsp;vs last period
        </>
      ) : 'no published reviews',
      accent: 'var(--color-primary-50)',
    },
    {
      icon: <RiCheckboxCircleLine />,
      label: 'Completed',
      value: safeSummary.completedReviews,
      sub: 'reviews published',
      accent: 'var(--color-success-50)',
    },
    {
      icon: <RiCalendarEventLine />,
      label: 'Next Review',
      value: formatDate(safeSummary.nextReviewDate),
      sub: safeSummary.nextReviewDate ? 'scheduled' : 'not scheduled',
      accent: 'var(--color-warning-50)',
    },
    {
      icon: <RiStarLine />,
      label: 'Avg Rating',
      value: safeSummary.averageRating,
      sub: 'across all criteria',
      accent: 'var(--color-primary-50)',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {stats.map((s, i) => (
        <StatCard key={s.label} {...s} index={i} />
      ))}
    </div>
  );
};

export default ReviewStatsBar;
