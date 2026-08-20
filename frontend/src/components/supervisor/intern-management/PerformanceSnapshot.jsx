/**
 * @file PerformanceSnapshot.jsx
 * @description Reusable performance section for the intern profile.
 * Displays average score, strengths, improvement areas, competency bars,
 * recent reviews, and a trend sparkline chart.
 */

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  RiStarFill,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSubtractLine,
  RiCheckboxCircleLine,
  RiTimeLine,
} from 'react-icons/ri';
import { InternTabsLoader } from './InternSkeletonLoaders';

// ── Review Status styles ──────────────────────────────────────────────────────
const REVIEW_STATUS = {
  Completed: { bg: '#dcfce7', text: '#15803d' },
  Scheduled: { bg: '#e0e7ff', text: '#3730a3' },
  Pending: { bg: '#fef3c7', text: '#b45309' },
};

// ── Score Display ─────────────────────────────────────────────────────────────
const ScoreDisplay = ({ score, maxScore = 5, trend, trendDelta }) => {
  const pct = Math.round((score / maxScore) * 100);
  const TrendIcon = trend === 'up' ? RiArrowUpLine : trend === 'down' ? RiArrowDownLine : RiSubtractLine;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6366f1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>
            AVERAGE PERFORMANCE SCORE
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: '1rem', color: '#94a3b8' }}>/ {maxScore}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <RiStarFill style={{ fontSize: '2.5rem', color: '#fbbf24' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '99px',
              background: `${trendColor}20`,
              color: trendColor,
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <TrendIcon />
            {trendDelta}
          </div>
        </div>
      </div>

      {/* Score bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          <span>Score progress</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '99px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #818cf8, #a5f3fc)',
              borderRadius: '99px',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ── Competency Bars ───────────────────────────────────────────────────────────
const CompetencyBars = ({ competencies }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
    }}
  >
    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
      Competency Breakdown
    </h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {competencies.map((c, idx) => (
        <div key={c.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{c.name}</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{c.score}/5</span>
          </div>
          <div style={{ height: '7px', background: 'var(--color-neutral-100)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(c.score / 5) * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 + idx * 0.07 }}
              style={{
                height: '100%',
                background: c.score >= 4.5
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : c.score >= 4.0
                  ? 'linear-gradient(90deg, #4f46e5, #818cf8)'
                  : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                borderRadius: '99px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Custom Tooltip for trend chart ────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.875rem',
        color: '#fff',
        fontSize: '0.8125rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <p style={{ margin: 0, color: '#94a3b8' }}>{label}</p>
      <p style={{ margin: '0.1rem 0 0 0', fontWeight: 700 }}>⭐ {payload[0].value}</p>
    </div>
  );
};

// ── Recent Review Card ────────────────────────────────────────────────────────
const ReviewCard = ({ review, index }) => {
  const statusStyle = REVIEW_STATUS[review.status] || REVIEW_STATUS.Pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06 }}
      style={{
        padding: '1rem',
        borderRadius: '0.75rem',
        background: 'var(--color-neutral-50)',
        border: '1px solid var(--color-neutral-200)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {review.status === 'Completed' ? (
            <RiCheckboxCircleLine style={{ color: '#10b981', fontSize: '1rem' }} />
          ) : (
            <RiTimeLine style={{ color: '#6366f1', fontSize: '1rem' }} />
          )}
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-neutral-900)' }}>
            {review.period}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {review.score !== null && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, color: 'var(--color-neutral-800)', fontSize: '0.875rem' }}>
              <RiStarFill style={{ color: '#f59e0b', fontSize: '0.875rem' }} />
              {review.score}
            </span>
          )}
          <span
            style={{
              padding: '0.15rem 0.5rem',
              borderRadius: '99px',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {review.status}
          </span>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
        Reviewer: {review.reviewer} · {review.date}
      </p>
      {review.summary && (
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
          "{review.summary}"
        </p>
      )}
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PerformanceSnapshot = ({ performance, isLoading }) => {
  if (isLoading) return <InternTabsLoader />;
  if (!performance) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Row: Score + Competencies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <ScoreDisplay
          score={performance.averageScore}
          maxScore={performance.maxScore}
          trend={performance.trend}
          trendDelta={performance.trendDelta}
        />
        <CompetencyBars competencies={performance.competencies} />
      </div>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          style={{
            background: '#f0fdf4',
            borderRadius: '1rem',
            padding: '1.25rem',
            border: '1px solid #bbf7d0',
          }}
        >
          <h4 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#15803d' }}>
            ✅ Strengths
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {performance.strengths.map((s, i) => (
              <span
                key={i}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '99px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: '#dcfce7',
                  color: '#166534',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Areas for Improvement */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          style={{
            background: '#fffbeb',
            borderRadius: '1rem',
            padding: '1.25rem',
            border: '1px solid #fde68a',
          }}
        >
          <h4 style={{ margin: '0 0 0.875rem 0', fontSize: '0.9375rem', fontWeight: 700, color: '#b45309' }}>
            🎯 Areas for Improvement
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {performance.areasForImprovement.map((a, i) => (
              <span
                key={i}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '99px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: '#fef3c7',
                  color: '#92400e',
                }}
              >
                {a}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Trend Chart */}
      {performance.trendData && performance.trendData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '1.25rem',
            border: '1px solid var(--color-neutral-200)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Performance Trend
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={performance.trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={4.0} stroke="#e0e7ff" strokeDasharray="4 2" />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ fill: '#4f46e5', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Reviews */}
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          Review History
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {performance.recentReviews.map((review, idx) => (
            <ReviewCard key={review.id} review={review} index={idx} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSnapshot;
