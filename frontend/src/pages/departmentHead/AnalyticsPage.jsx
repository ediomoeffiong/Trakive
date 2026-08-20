/**
 * @file AnalyticsPage.jsx
 * @description Department Head — Department Analytics & Reports.
 * Performance trends, task velocity, review statistics, internship completion
 * cohort tracking, and supervisor turnaround metrics — all built with Recharts.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import { RiBarChartGroupedLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const tooltipStyle = {
  backgroundColor: '#fff',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '0.8125rem',
};

const TABS = [
  { id: 'performance', label: 'Performance' },
  { id: 'tasks',       label: 'Task Velocity' },
  { id: 'reviews',     label: 'Review Stats' },
  { id: 'cohorts',     label: 'Cohort Completion' },
];

// ── Chart Card ─────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    style={{
      background: '#fff', borderRadius: '1rem', padding: '1.5rem',
      border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    }}
  >
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{title}</h3>
      {subtitle && <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

// ── Metric Row ─────────────────────────────────────────────────────────────────
const MetricRow = ({ label, value, sub, isGood }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--color-neutral-50)' }}>
    <div>
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{label}</p>
      {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{sub}</p>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <span style={{ fontSize: '1rem', fontWeight: 900, color: isGood === undefined ? 'var(--color-neutral-900)' : isGood ? '#059669' : '#dc2626' }}>{value}</span>
      {isGood !== undefined && (isGood ? <RiArrowUpLine style={{ color: '#059669' }} /> : <RiArrowDownLine style={{ color: '#dc2626' }} />)}
    </div>
  </div>
);

// ── Performance Tab ────────────────────────────────────────────────────────────
const PerformanceTab = ({ data }) => {
  const { performanceTrends, deptMetricsOverview } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <ChartCard title="Monthly Performance Trend" subtitle="Average score vs 80% department benchmark" delay={0}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrends} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="technical" name="Technical" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="softSkills" name="Soft Skills" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Department Health Metrics" subtitle="Key operational performance indicators" delay={0.05}>
          <div>
            <MetricRow label="Active Projects" value={deptMetricsOverview?.activeProjects} sub="Cross-track engineering initiatives" />
            <MetricRow label="Total Mentorship Hours" value={`${deptMetricsOverview?.totalMentorshipHours}h`} sub="Supervisor mentoring logged this cohort" isGood />
            <MetricRow label="Avg Attendance Rate" value={`${deptMetricsOverview?.averageAttendanceRate}%`} sub="Across all active interns" isGood />
            <MetricRow label="Hire Conversion Eligibility" value={`${deptMetricsOverview?.hireConversionEligibility}%`} sub="Interns eligible for full-time offer" isGood />
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

// ── Task Velocity Tab ──────────────────────────────────────────────────────────
const TaskTab = ({ data }) => {
  const { taskCompletionCharts } = data;
  const { byStatus = [], byCategory = [], weeklyVelocity = [] } = taskCompletionCharts ?? {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <ChartCard title="Task Status Distribution" subtitle="Live breakdown across all department tasks">
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value">
                  {byStatus.map((entry, i) => <Cell key={`c-${i}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Task Velocity" subtitle="Tasks created vs completed per week" delay={0.05}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyVelocity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                <Bar dataKey="created" name="Created" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Task Completion by Engineering Track" subtitle="Completed, in-progress, and delayed tasks per track" delay={0.1}>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" name="Delayed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
};

// ── Review Stats Tab ───────────────────────────────────────────────────────────
const ReviewTab = ({ data }) => {
  const { reviewStatistics } = data;
  if (!reviewStatistics) return null;
  const { ratingDistribution = [], supervisorTurnaround = [] } = reviewStatistics;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <ChartCard title="Review Rating Distribution" subtitle="Score bands across all completed intern reviews">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ratingDistribution.map((r, i) => (
              <div key={r.grade}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>{r.grade}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{r.count} ({r.percentage})</span>
                </div>
                <div style={{ height: 8, background: 'var(--color-neutral-100)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: r.percentage }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ height: '100%', background: ['#10b981', '#6366f1', '#f59e0b', '#ef4444'][i] ?? '#4f46e5', borderRadius: 99 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1.25rem' }}>
            {[
              { label: 'Total Reviews', value: reviewStatistics.totalReviews },
              { label: 'On-Time %', value: `${reviewStatistics.onTimePercentage}%` },
              { label: 'Avg Turnaround', value: `${reviewStatistics.avgTurnaroundHours}h` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center', background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: 'var(--color-neutral-900)' }}>{value}</p>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Supervisor Review Turnaround" subtitle="Reviews completed and avg hours per supervisor" delay={0.05}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Supervisor', 'Reviews', 'Avg Hours', 'On-Time'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-neutral-100)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supervisorTurnaround.map((s, i) => (
                  <motion.tr key={s.supervisor} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid var(--color-neutral-50)' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{s.supervisor}</td>
                    <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>{s.reviewsDone}</td>
                    <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>{s.avgHours}h</td>
                    <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: s.onTime >= 95 ? '#059669' : s.onTime >= 85 ? '#d97706' : '#dc2626' }}>{s.onTime}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

// ── Cohort Completion Tab ──────────────────────────────────────────────────────
const CohortTab = ({ data }) => {
  const { internshipCompletionTrends } = data;
  if (!internshipCompletionTrends) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <ChartCard title="Cohort Completion Rate Over Time" subtitle="Pass rate and distinction rate per historical cohort">
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={internshipCompletionTrends} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="cohort" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
              <Bar dataKey="passRate" name="Pass Rate %" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="distinctionRate" name="Distinction Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Cohort Enrollment vs Completion" subtitle="Enrolled interns vs completed per cohort" delay={0.05}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-neutral-50)' }}>
                {['Cohort', 'Enrolled', 'Completed', 'Pass Rate', 'Distinction Rate'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {internshipCompletionTrends.map((c, i) => (
                <motion.tr key={c.cohort} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{c.cohort}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-neutral-700)' }}>{c.enrolled}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: 'var(--color-neutral-700)' }}>{c.completed}</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: c.passRate >= 95 ? '#059669' : '#d97706' }}>{c.passRate}%</td>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: c.distinctionRate >= 50 ? '#059669' : 'var(--color-neutral-700)' }}>{c.distinctionRate}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const { analytics, loading, errors, fetchAnalytics } = useDepartmentStore();

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading.analytics && !analytics) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ height: 280, background: '#e2e8f0', borderRadius: '1rem', animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  if (errors.analytics) {
    return <EmptyState icon={<RiBarChartGroupedLine />} title="Failed to load analytics" description={errors.analytics} />;
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
          Department Analytics
        </span>
        <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Analytics & Reports</h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
          Deep performance insights, task velocity, review throughput, and cohort completion trends.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--color-neutral-100)', gap: 0 }} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.625rem 1.125rem', fontSize: '0.875rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
              background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: -2,
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.span
                layoutId="analytics-tab-indicator"
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, borderRadius: '2px 2px 0 0', background: 'var(--color-primary-600)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      {analytics && (
        <>
          {activeTab === 'performance' && <PerformanceTab data={analytics} />}
          {activeTab === 'tasks' && <TaskTab data={analytics} />}
          {activeTab === 'reviews' && <ReviewTab data={analytics} />}
          {activeTab === 'cohorts' && <CohortTab data={analytics} />}
        </>
      )}
    </motion.div>
  );
};

export default AnalyticsPage;
