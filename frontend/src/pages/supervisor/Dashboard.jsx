/**
 * @file Dashboard.jsx
 * @description Supervisor Dashboard page combining KPIs, Quick Actions, Intern Table, Analytics, Activity, Deadlines, and Widgets.
 */

import { useEffect } from 'react';
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
  PendingApprovalsWidget,
  ReviewRemindersWidget,
  RecentlyAssignedWidget,
  OrgAnnouncementsWidget,
  TeamPerformanceSummaryWidget,
  DashboardSkeleton,
} from '../../components/supervisor';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const SupervisorDashboardPage = () => {
  const user = useCurrentUser();
  const {
    kpis,
    interns,
    analytics,
    activities,
    deadlines,
    widgets,
    isLoading,
    loadSupervisorDashboard,
  } = useSupervisorStore();

  useEffect(() => {
    loadSupervisorDashboard();
  }, [loadSupervisorDashboard]);

  if (isLoading && kpis.length === 0) {
    return (
      <div style={{ padding: '1.5rem 0' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  const supervisorName = user?.name?.split(' ')[0] ?? 'Supervisor';
  const pendingReviewsCount = kpis.find((k) => k.id === 'pending-reviews')?.value ?? '0';
  const reviewsDueCount = kpis.find((k) => k.id === 'reviews-due')?.value ?? '0';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}
    >
      {/* Welcome Banner */}
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
            }}
          >
            SUPERVISOR OVERVIEW
          </span>
          <h2 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 800 }}>
            Welcome back, {supervisorName}! 👋
          </h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#c7d2fe', maxWidth: '550px' }}>
            You have <strong style={{ color: '#ffffff' }}>{pendingReviewsCount} pending task reviews</strong> and{' '}
            <strong style={{ color: '#ffffff' }}>{reviewsDueCount} reviews due</strong> this week.
          </p>
        </div>
      </div>



      {/* 1. KPI Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {kpis.map((card, idx) => (
            <KPICard key={card.id} card={card} index={idx} />
          ))}
        </div>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
          <PerformanceTrendChart data={analytics.performanceTrend} />
          <TaskDistributionChart data={analytics.taskDistribution} />
          <ReviewStatusDonutChart data={analytics.reviewStatus} />
          <OnboardingProgressChart data={analytics.onboardingProgress} />
        </div>
      </section>

      {/* 5. Recent Activity & Deadlines Grid */}
      <section aria-label="Activity and Deadlines">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
          <ActivityFeed activities={activities} />
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </section>

      {/* 6. Supervisor Widgets Grid */}
      <section aria-label="Supervisor Widgets">
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            Operational Widgets
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <PendingApprovalsWidget approvals={widgets.pendingApprovals} />
          <ReviewRemindersWidget reminders={widgets.reviewReminders} />
          <RecentlyAssignedWidget interns={widgets.recentlyAssigned} />
          <OrgAnnouncementsWidget announcements={widgets.announcements} />
          <TeamPerformanceSummaryWidget summary={widgets.teamSummary} />
        </div>
      </section>
    </motion.div>
  );
};

export default SupervisorDashboardPage;
