/**
 * @file AnalyticsDashboardPage.jsx
 * @description Central Reports & Analytics Dashboard landing page.
 * Supports role-based analytics views for Intern, Supervisor, HR Administrator, and Department Head.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiSettings4Line,
  RiAddLine,
  RiFolderChartLine,
  RiArrowRightUpLine,
  RiArrowRightDownLine,
} from 'react-icons/ri';

import {
  useAnalyticsStore,
  useCurrentUser,
} from '../../store';
import { USER_ROLES } from '../../constants';
import {
  AnalyticsFilters,
  PerformanceLineChart,
  TaskCompletionBarChart,
  StatusDonutChart,
  ProductivityAreaChart,
  SkillsRadarChart,
  ActivityHeatmap,
  ReportSummaryGrid,
  DashboardCustomizer,
  AnalyticsDashboardSkeleton,
} from '../../components/analytics';


const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function AnalyticsDashboardPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const {
    metrics,
    summaryCards,
    chartData,
    dashboardLayout,
    isLoading,
    loadAnalyticsData,
    filters,
  } = useAnalyticsStore();


  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Effective role based on the logged-in user's role
  const effectiveRole = currentUser?.role || USER_ROLES.SUPERVISOR;

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData, filters, effectiveRole]);


  if (isLoading && !metrics) {
    return (
      <div style={{ padding: '1.5rem 0' }}>
        <AnalyticsDashboardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}
    >
      {/* ── Top Header Banner & Role Preview Switcher ─────────────────────────── */}
      <div
        style={{
          background: '#00b4d8',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '0.25rem 0.625rem',
                borderRadius: '99px',
              }}
            >
              CENTRAL ANALYTICS ENGINE
            </span>
          </div>

          <h2 style={{ margin: '0.25rem 0', fontSize: '1.75rem', fontWeight: 800 }}>
            Reports & Performance Intelligence
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.9)', maxWidth: '600px' }}>
            Executive dashboards, productivity metrics, 7-skill evaluations, and AI automated insights.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard/reports/builder')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.5rem',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '0.8125rem',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <RiAddLine /> Build Report
          </button>
          <button
            onClick={() => navigate('/dashboard/reports/saved')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8125rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            }}
          >
            <RiFolderChartLine /> Saved Reports
          </button>
          <button
            onClick={() => setCustomizerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8125rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
            }}
          >
            <RiSettings4Line /> Customize
          </button>
        </div>
      </div>


      {/* ── Filter Controls ─────────────────────────────────────────────────── */}
      {effectiveRole !== USER_ROLES.INTERN && <AnalyticsFilters />}

      {/* ── Dynamic Layout Renderer ─────────────────────────────────────────── */}
      {dashboardLayout.map((widget) => {
        if (!widget.visible) return null;

        switch (widget.id) {
          case 'kpis':
            return (
              <section key={widget.id} aria-label="Key Performance Indicators">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <KPICardItem
                    title="Overall Performance Score"
                    value={metrics?.overallPerformanceScore ? `${metrics.overallPerformanceScore} / 5.0` : '4.6 / 5.0'}
                    trend={metrics?.performanceScoreTrend}
                    positive={metrics?.performanceScorePositive}
                  />
                  {effectiveRole !== USER_ROLES.INTERN && (
                    <KPICardItem
                      title="Active Interns"
                      value={metrics?.activeInterns || 48}
                      trend={metrics?.activeInternsTrend}
                      positive={metrics?.activeInternsPositive}
                    />
                  )}
                  <KPICardItem
                    title="Completed Tasks"
                    value={metrics?.completedTasks || 342}
                    trend={metrics?.completedTasksTrend}
                    positive={metrics?.completedTasksPositive}
                  />
                  <KPICardItem
                    title="Onboarding Completion"
                    value={metrics?.onboardingCompletionRate || '88%'}
                    trend={metrics?.onboardingCompletionTrend}
                    positive={metrics?.onboardingCompletionPositive}
                  />
                </div>
              </section>
            );

          case 'insights':
            // Removed per user request
            return null;

          case 'reports':
            return (
              <section key={widget.id} aria-label="Summary Report Cards">
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                    Executive Summary Cards
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                    Highlights of top performers, SLA velocity, and overdue items
                  </p>
                </div>
                <ReportSummaryGrid summaryCards={summaryCards} />
              </section>
            );

          case 'charts':
            return (
              <section key={widget.id} aria-label="Analytics Charts">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  <PerformanceLineChart data={chartData?.weeklyTrend} />
                  <TaskCompletionBarChart
                    data={chartData?.deptTaskCompletion}
                    title={effectiveRole === USER_ROLES.INTERN ? 'Task Completion in My Department' : 'Task Completion by Department'}
                    description={effectiveRole === USER_ROLES.INTERN ? 'Benchmarked task status distribution within your department cohort' : 'Breakdown of tasks completed, active, and in review'}
                  />
                  <StatusDonutChart data={chartData?.taskStatus} />
                  <ProductivityAreaChart data={chartData?.productivityGrowth} />
                  <SkillsRadarChart data={chartData?.skillMatrix} />
                </div>
              </section>
            );


          case 'heatmap':
            return <ActivityHeatmap key={widget.id} data={chartData?.heatmapData} />;

          default:
            return null;
        }
      })}

      {/* ── Customizer Slide-over ───────────────────────────────────────────── */}
      <DashboardCustomizer isOpen={customizerOpen} onClose={() => setCustomizerOpen(false)} />
    </motion.div>
  );
}

function KPICardItem({ title, value, trend, positive }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      }}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
        {title}
      </span>
      <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
        {value}
      </h3>
      {trend && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: positive ? 'var(--color-success-600)' : 'var(--color-danger-600)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
          }}
        >
          {positive ? <RiArrowRightUpLine /> : <RiArrowRightDownLine />} {trend}
        </span>
      )}
    </motion.div>
  );
}
