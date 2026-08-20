/**
 * @file Dashboard.jsx
 * @description Department Head Dashboard — department-level oversight with KPIs,
 * performance analytics, team overview, recent activity, and quick-action panels.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  RiGroupLine,
  RiShieldUserLine,
  RiTaskLine,
  RiTimeLine,
  RiAwardLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiMegaphoneLine,
  RiBuildingLine,
  RiCalendarLine,
  RiAlertLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import { useCurrentUser } from '../../store';
import { ROUTES } from '../../constants';

// ── Animation variants ────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KPICard = ({ icon: Icon, label, value, description, color, trend, index = 0 }) => {
  const COLORS = {
    blue:    { bg: '#eff6ff', iconBg: '#dbeafe', iconColor: '#1d4ed8', border: '#bfdbfe' },
    indigo:  { bg: '#eef2ff', iconBg: '#e0e7ff', iconColor: '#4338ca', border: '#c7d2fe' },
    emerald: { bg: '#ecfdf5', iconBg: '#d1fae5', iconColor: '#047857', border: '#a7f3d0' },
    amber:   { bg: '#fffbeb', iconBg: '#fef3c7', iconColor: '#b45309', border: '#fde68a' },
    purple:  { bg: '#faf5ff', iconBg: '#f3e8ff', iconColor: '#6b21a8', border: '#e9d5ff' },
    teal:    { bg: '#f0fdfa', iconBg: '#ccfbf1', iconColor: '#0f766e', border: '#99f6e4' },
  };
  const theme = COLORS[color] || COLORS.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      style={{
        background: '#fff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${theme.bg} 0%, rgba(255,255,255,0) 70%)`, borderRadius: '50%', transform: 'translate(20px,-20px)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 42, height: 42, borderRadius: '0.75rem', background: theme.iconBg, color: theme.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
          <Icon />
        </div>
        {trend && (
          <span style={{ fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 9999, background: trend.startsWith('+') ? '#d1fae5' : trend.startsWith('-') ? '#fee2e2' : '#f1f5f9', color: trend.startsWith('+') ? '#065f46' : trend.startsWith('-') ? '#991b1b' : '#475569' }}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
        <h2 style={{ margin: '0.2rem 0', fontSize: '1.875rem', fontWeight: 900, color: 'var(--color-neutral-900)', lineHeight: 1 }}>{value}</h2>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{description}</p>
      </div>
    </motion.div>
  );
};

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
    <div>
      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{title}</h3>
      {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Chart Card wrapper ─────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
  >
    <div style={{ marginBottom: '1rem' }}>
      <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{title}</h4>
      {subtitle && <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{subtitle}</p>}
    </div>
    {children}
  </motion.div>
);

// ── Tooltip style ─────────────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: '#fff',
  borderRadius: '0.5rem',
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '0.8125rem',
};

// ── Recent Activity Feed ───────────────────────────────────────────────────────
const ActivityFeed = ({ activities = [] }) => {
  const TYPE_COLORS = {
    review:       { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    approval:     { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    task:         { bg: '#e0e7ff', color: '#3730a3', dot: '#4f46e5' },
    announcement: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  };

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Recent Department Activity</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {activities.map((act, i) => {
          const style = TYPE_COLORS[act.type] || TYPE_COLORS.task;
          return (
            <motion.div key={act.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.dot, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>
                  <strong style={{ color: 'var(--color-neutral-900)' }}>{act.user}</strong>{' '}
                  <span style={{ color: 'var(--color-neutral-500)', fontSize: '0.75rem', fontWeight: 600, background: style.bg, color: style.color, padding: '0.1rem 0.4rem', borderRadius: 4, marginRight: 4 }}>{act.role}</span>{' '}
                  {act.action} <strong style={{ color: 'var(--color-neutral-900)' }}>{act.target}</strong>
                </p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>{act.timestamp}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ── Team Structure Card ───────────────────────────────────────────────────────
const TeamCard = ({ team, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
  >
    <div style={{ flex: 1, minWidth: 160 }}>
      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-neutral-900)' }}>{team.name}</p>
      <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Led by {team.supervisor}</p>
    </div>
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      {[
        { label: 'Interns', value: `${team.internCount}/${team.capacity}` },
        { label: 'Tasks', value: team.activeTasks },
        { label: 'Rating', value: `${team.avgRating}/5` },
      ].map(({ label, value }) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{value}</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>{label}</p>
        </div>
      ))}
    </div>
    <div style={{ width: `${team.internCount / team.capacity * 100}%`, maxWidth: 100, height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden', minWidth: 60, flexShrink: 0 }}>
      <div style={{ width: `${team.internCount / team.capacity * 100}%`, height: '100%', background: team.internCount >= team.capacity ? '#10b981' : '#6366f1', borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  </motion.div>
);

// ── Skeleton ───────────────────────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <div style={{ background: '#e2e8f0', borderRadius: '1.25rem', height: 140, animation: 'pulse 1.5s ease infinite' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
      {[...Array(6)].map((_, i) => <div key={i} style={{ background: '#e2e8f0', borderRadius: '1rem', height: 120, animation: 'pulse 1.5s ease infinite' }} />)}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
      {[...Array(2)].map((_, i) => <div key={i} style={{ background: '#e2e8f0', borderRadius: '1rem', height: 280, animation: 'pulse 1.5s ease infinite' }} />)}
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const DepartmentHeadDashboard = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { dashboard, analytics, loading, errors, fetchDashboard, fetchAnalytics } = useDepartmentStore();

  useEffect(() => {
    fetchDashboard();
    fetchAnalytics();
  }, [fetchDashboard, fetchAnalytics]);

  if ((loading.dashboard || loading.analytics) && !dashboard) {
    return <DashboardSkeleton />;
  }

  if (errors.dashboard) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-danger-600)', fontWeight: 600 }}>Failed to load dashboard: {errors.dashboard}</p>
      </div>
    );
  }

  const headName = user?.name?.split(' ')[0] ?? dashboard?.summary?.headName?.split(' ')[1] ?? 'Head';
  const dept = dashboard?.summary?.name ?? 'FifthLab';
  const pendingApprovals = (dashboard?.kpis ?? []).find((k) => k.id === 'kpi-pending-reviews');

  const KPI_ICONS = {
    'kpi-dept-interns':        { icon: RiGroupLine,          color: 'blue' },
    'kpi-active-supervisors':  { icon: RiShieldUserLine,     color: 'indigo' },
    'kpi-active-tasks':        { icon: RiTaskLine,           color: 'emerald' },
    'kpi-pending-reviews':     { icon: RiTimeLine,           color: 'amber' },
    'kpi-dept-performance':    { icon: RiAwardLine,          color: 'purple' },
    'kpi-completion-rate':     { icon: RiCheckboxCircleLine, color: 'teal' },
  };

  const kpis = dashboard?.kpis ?? [];
  const teamStructure = dashboard?.teamStructure ?? [];
  const activities = dashboard?.recentActivities ?? [];
  const performanceTrend = analytics?.performanceTrends ?? [];
  const taskByCategory = analytics?.taskCompletionCharts?.byCategory ?? [];
  const taskByStatus = analytics?.taskCompletionCharts?.byStatus ?? [];

  const QuickNavButton = ({ label, icon: Icon, to, color = '#4f46e5' }) => (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1rem', borderRadius: '0.625rem',
        border: `1px solid ${color}22`, background: `${color}11`,
        color, fontWeight: 600, fontSize: '0.8125rem',
        cursor: 'pointer', whiteSpace: 'nowrap',
      }}
    >
      <Icon style={{ fontSize: '1rem' }} />
      {label}
    </motion.button>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}
    >
      {/* ── Welcome Banner ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#fff',
          boxShadow: '0 8px 32px rgba(30,64,175,0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
            🏛️ Department Head Portal
          </span>
          <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.75rem', fontWeight: 900 }}>
            Good morning, {headName}! 👋
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd', maxWidth: 520 }}>
            {dept} — {kpis.find(k => k.id === 'kpi-dept-interns')?.value ?? 42} interns active across{' '}
            <strong style={{ color: '#fff' }}>{teamStructure.length} teams</strong>.
            {pendingApprovals && pendingApprovals.value !== '0' && (
              <> You have <strong style={{ color: '#fcd34d' }}>{pendingApprovals.value} items</strong> awaiting your attention.</>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <QuickNavButton label="Approvals" icon={RiCheckboxCircleLine} to={ROUTES.DEPARTMENT_HEAD_APPROVALS} color="#6ee7b7" />
          <QuickNavButton label="Supervisors" icon={RiShieldUserLine} to={ROUTES.DEPARTMENT_HEAD_SUPERVISORS} color="#93c5fd" />
          <QuickNavButton label="Analytics" icon={RiAwardLine} to={ROUTES.DEPARTMENT_HEAD_ANALYTICS} color="#c4b5fd" />
        </div>
      </motion.div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <section aria-label="Department Key Performance Indicators">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {kpis.map((kpi, idx) => {
            const meta = KPI_ICONS[kpi.id] ?? { icon: RiAwardLine, color: 'blue' };
            return (
              <KPICard
                key={kpi.id}
                icon={meta.icon}
                color={meta.color}
                label={kpi.title}
                value={kpi.value}
                description={kpi.description}
                trend={kpi.change}
                index={idx}
              />
            );
          })}
        </div>
      </section>

      {/* ── Analytics Charts ───────────────────────────────────────────────── */}
      <section aria-label="Department Analytics">
        <SectionHeader
          title="Department Performance Analytics"
          subtitle="Performance trends, task velocity, and review throughput at a glance"
          action={
            <button onClick={() => navigate(ROUTES.DEPARTMENT_HEAD_ANALYTICS)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-600)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Full Analytics <RiArrowRightLine />
            </button>
          }
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {/* Performance Trend */}
          <ChartCard title="Performance Score Trend" subtitle="Monthly average score vs 80% benchmark" delay={0}>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrend} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="benchmark" name="Benchmark" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Task by Category */}
          <ChartCard title="Task Completion by Track" subtitle="Completed vs in-progress tasks per engineering track" delay={0.05}>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskByCategory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Task Status Donut */}
          <ChartCard title="Department Task Status" subtitle="Live distribution of all department tasks" delay={0.1}>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {taskByStatus.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </section>

      {/* ── Team Structure & Activity ───────────────────────────────────────── */}
      <section aria-label="Team Structure and Recent Activity">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          {/* Team Structure */}
          <div>
            <SectionHeader
              title="Team Structure"
              subtitle="Department teams, supervisors, and capacity"
              action={
                <button onClick={() => navigate(ROUTES.DEPARTMENT_HEAD_SUPERVISORS)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-600)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  View All <RiArrowRightLine />
                </button>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {teamStructure.slice(0, 4).map((team, i) => (
                <TeamCard key={team.id} team={team} index={i} />
              ))}
            </div>
          </div>

          {/* Recent Activity + Department Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ActivityFeed activities={activities} />

            {/* Quick Stats */}
            {dashboard?.stats && (
              <div style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Department Health Metrics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  {[
                    { label: 'Avg Task Resolution', value: `${dashboard.stats.avgTaskResolutionDays}d`, color: '#4f46e5' },
                    { label: 'Review Turnaround', value: `${dashboard.stats.reviewTurnaroundHours}h`, color: '#0ea5e9' },
                    { label: 'Intern Satisfaction', value: `${dashboard.stats.internSatisfactionRate}%`, color: '#10b981' },
                    { label: 'On-Time Milestones', value: `${dashboard.stats.onTimeMilestonePercentage}%`, color: '#f59e0b' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '0.75rem', background: `${color}0d`, borderRadius: '0.75rem', border: `1px solid ${color}22` }}>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color }}>{value}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </motion.div>
  );
};

export default DepartmentHeadDashboard;
