/**
 * @file Dashboard.jsx
 * @description Supervisor Dashboard page combining KPIs, Quick Actions, Intern Table, Analytics, Activity, Deadlines, and Widgets.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSupervisorStore, useCurrentUser } from '../../store';
import {
  KPICard,
  InternOverviewTable,
  PerformanceTrendChart,
  TaskDistributionChart,
  ReviewStatusDonutChart,
  OnboardingProgressChart,
  QuickActions,
  ActivityFeed,
  UpcomingDeadlines,
  RecentlyAssignedWidget,
  TeamPerformanceSummaryWidget,
  DashboardSkeleton,
} from '../../components/supervisor';
import { Card, Skeleton } from '../../components/ui';
import { ROUTES } from '../../constants';
import { projectService } from '../../services/projectService';
import { weeklyPlanService } from '../../services/weeklyPlanService';
import { RiFolderLine, RiCalendarCheckLine, RiArrowRightLine } from 'react-icons/ri';

function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0];
}

function SupervisorProjectWeeklySummary({ navigate }) {
  const user = useCurrentUser();
  const [projectCounts, setProjectCounts] = useState({ total: 0, pending: 0, active: 0 });
  const [weeklyCount, setWeeklyCount] = useState({ total: 0, submitted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return undefined;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      projectService.listProjects({ limit: 100 }).catch(() => ({ data: [] })),
      weeklyPlanService.supervisorView({ week_start: getMondayOfWeek(), limit: 100 }).catch(() => ({ data: [] })),
    ]).then(([projectsRes, weeklyRes]) => {
      if (cancelled) return;
      const projects = Array.isArray(projectsRes?.data?.data)
        ? projectsRes.data.data
        : Array.isArray(projectsRes?.data?.items)
          ? projectsRes.data.items
          : Array.isArray(projectsRes?.data)
            ? projectsRes.data
            : [];
      const plans = Array.isArray(weeklyRes?.data?.data)
        ? weeklyRes.data.data
        : Array.isArray(weeklyRes?.data?.items)
          ? weeklyRes.data.items
          : Array.isArray(weeklyRes?.data)
            ? weeklyRes.data
            : [];
      setProjectCounts({
        total: projects.length,
        active: projects.filter((p) => p.status === 'active').length,
        pending: projects.filter((p) => p.status === 'pending_approval').length,
      });
      setWeeklyCount({
        total: plans.length,
        submitted: plans.filter((p) => p.status === 'submitted').length,
      });
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
        <div className="dashboard-mini-grid">
        <Skeleton height="88px" borderRadius="0.75rem" />
        <Skeleton height="88px" borderRadius="0.75rem" />
      </div>
    );
  }

  return (
    <div className="dashboard-mini-grid">
      <Card
        style={{ padding: '1rem 1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
        onClick={() => navigate(ROUTES.SUPERVISOR_PROJECTS)}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', fontSize: '1rem', flexShrink: 0 }}>
              <RiFolderLine />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Projects</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {projectCounts.active} active
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {projectCounts.pending > 0 && (
              <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: '#d97706', background: '#fef3c7' }}>
                {projectCounts.pending} to review
              </span>
            )}
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--color-primary-600)', fontWeight: 600, justifyContent: 'flex-end' }}>
              Manage <RiArrowRightLine />
            </div>
          </div>
        </div>
      </Card>

      <Card
        style={{ padding: '1rem 1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
        onClick={() => navigate(ROUTES.SUPERVISOR_TASKS)}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-success-50)', color: 'var(--color-success-600)', fontSize: '1rem', flexShrink: 0 }}>
              <RiCalendarCheckLine />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>Weekly Reports</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {weeklyCount.total} submitted
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {weeklyCount.submitted > 0 && (
              <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-primary-600)', background: 'var(--color-primary-50)' }}>
                {weeklyCount.submitted} to review
              </span>
            )}
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--color-success-600)', fontWeight: 600, justifyContent: 'flex-end' }}>
              Review <RiArrowRightLine />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const SupervisorDashboardPage = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const {
    kpis,
    banner,
    interns,
    analytics,
    activities,
    deadlines,
    widgets,
    isLoading,
    error,
    loadedForUserId,
    loadSupervisorDashboard,
  } = useSupervisorStore();

  useEffect(() => {
    if (!user?.id) return;
    loadSupervisorDashboard(user.id);
  }, [user?.id, loadSupervisorDashboard]);

  if (error && user?.id && loadedForUserId !== user.id) {
    return (
      <div style={{ padding: '1.5rem 0' }}>
        <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-neutral-900)' }}>
            We could not load your supervisor dashboard.
          </h3>
          <p style={{ margin: '0.5rem 0 1rem', color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => loadSupervisorDashboard(user.id)}
            style={{
              border: 'none',
              borderRadius: '0.5rem',
              background: 'var(--color-primary-600)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              padding: '0.65rem 1rem',
            }}
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (!user?.id || loadedForUserId !== user.id || (isLoading && kpis.length === 0)) {
    return (
      <div style={{ padding: '1.5rem 0' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  const supervisorName = user?.name?.split(' ')[0] ?? 'Supervisor';
  const pendingReviewsCount = Number(banner?.pendingReviews ?? kpis.find((k) => k.id === 'pending-reviews')?.value ?? 0);
  const reviewsDueCount = Number(banner?.reviewsDue ?? kpis.find((k) => k.id === 'reviews-due')?.value ?? 0);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem', minWidth: 0, maxWidth: '100%' }}
    >
      {/* Welcome Banner */}
      <div
        className="accent-banner"
        style={{
          background: '#00b4d8',
          borderRadius: '1.25rem',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 180, 216, 0.22)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.25rem 0.625rem',
              borderRadius: '99px',
              color: '#ffffff',
            }}
          >
            SUPERVISOR OVERVIEW
          </span>
          <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
            Welcome back, {supervisorName}! 👋
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#ffffff', maxWidth: '560px', lineHeight: 1.55 }}>
            You have{' '}
            <strong style={{ color: '#ffffff', fontWeight: 800 }}>
              {pendingReviewsCount} pending task review{pendingReviewsCount === 1 ? '' : 's'}
            </strong>
            {' '}and{' '}
            <strong style={{ color: '#ffffff', fontWeight: 800 }}>
              {reviewsDueCount} review{reviewsDueCount === 1 ? '' : 's'} due
            </strong>
            {' '}this week.
          </p>
        </div>
      </div>



      {/* 1. KPI Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <div className="sup-dash-kpi">
          {kpis.map((card, idx) => (
            <KPICard key={card.id || card.label || idx} card={card} index={idx} />
          ))}
        </div>
      </section>

      {/* 1b. Projects & Weekly Review quick links */}
      <section>
        <SupervisorProjectWeeklySummary navigate={navigate} />
      </section>

      {/* 2. Quick Actions Panel */}
      <section aria-label="Quick Actions">
        <QuickActions />
      </section>

      {/* 3. Intern Overview Table */}
      <section aria-label="Intern Overview Roster">
        <InternOverviewTable interns={interns} isLoading={isLoading} />
      </section>

      {/* 4. Analytics Section */}
      <section aria-label="Supervisor Analytics">
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Supervisor Performance Analytics
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            Track intern productivity, review throughput, and task completion velocity
          </p>
        </div>

        <div className="sup-dash-charts">
          <PerformanceTrendChart data={analytics.performanceTrend} />
          <TaskDistributionChart data={analytics.taskDistribution} />
          <ReviewStatusDonutChart data={analytics.reviewStatus} />
          <OnboardingProgressChart data={analytics.onboardingProgress} />
        </div>
      </section>

      {/* 5. Recent Activity & Deadlines Grid */}
      <section aria-label="Activity and Deadlines">
        <div className="sup-dash-charts">
          <ActivityFeed activities={activities} />
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </section>

      <section aria-label="Team widgets">
        <div className="sup-dash-widgets">
          <RecentlyAssignedWidget interns={widgets.recentlyAssigned} />
          <TeamPerformanceSummaryWidget summary={widgets.teamSummary} />
        </div>
      </section>
    </motion.div>
  );
};

export default SupervisorDashboardPage;
