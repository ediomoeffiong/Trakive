/**
 * @file Dashboard.jsx
 * @description Highly visual, premium Intern Dashboard matching Trakive's design system.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiBarChartLine,
  RiUploadCloud2Line,
  RiFeedbackLine,
  RiCheckboxMultipleLine,
  RiUser3Line,
  RiBellLine,
  RiEyeLine,
  RiArrowRightLine,
  RiFolderShieldLine,
  RiHistoryLine,
  RiTaskLine,
  RiFolderLine,
  RiCalendarCheckLine,
  RiStarLine,
} from 'react-icons/ri';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

import {
  Card,
  Badge,
  Button,
  ProgressBar,
  CircularProgress,
  Skeleton,
} from '../components/ui';
import { useCurrentUser, useOnboardingStatus } from '../store';
import { useDashboardStore } from '../store/useDashboardStore';
import { ROUTES } from '../constants';
import { projectService } from '../services/projectService';
import { weeklyPlanService } from '../services/weeklyPlanService';
import { TodayAttendanceCard } from '../components/attendance';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0];
}

// ── Projects & Weekly Tasks Dashboard Summary ─────────────────────────────────
function ProjectWeeklySummary({ navigate }) {
  const [projectStats, setProjectStats] = useState({ active: 0, pending: 0 });
  const [weeklyStats, setWeeklyStats] = useState({ total: 0, completed: 0, planStatus: 'open' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const weekStart = getMondayOfWeek();
    Promise.all([
      projectService.listProjects({ limit: 100 }).catch(() => ({ data: [] })),
      weeklyPlanService.getWeeklyPlan(weekStart).catch(() => ({ data: null })),
    ]).then(([projectsRes, weekRes]) => {
      const projects = projectsRes.data || [];
      setProjectStats({
        active:  projects.filter((p) => p.status === 'active').length,
        pending: projects.filter((p) => p.status === 'pending_approval').length,
      });
      const weekData = weekRes?.data || {};
      const tasks = weekData.tasks || [];
      setWeeklyStats({
        total:     tasks.length,
        completed: tasks.filter((t) => t.end_of_week_status === 'completed').length,
        planStatus: weekData.plan?.status || 'open',
      });
      setLoading(false);
    });
  }, []);

  const PLAN_LABEL = {
    open: 'Open', submitted: 'Submitted', reviewed: 'Reviewed', requires_changes: 'Changes Needed',
  };
  const PLAN_COLOR = {
    open: 'var(--color-neutral-500)', submitted: 'var(--color-primary-600)',
    reviewed: 'var(--color-success-600)', requires_changes: '#d97706',
  };
  const PLAN_BG = {
    open: 'var(--color-neutral-100)', submitted: 'var(--color-primary-50)',
    reviewed: 'var(--color-success-50)', requires_changes: '#fef3c7',
  };

  if (loading) {
    return (
      <div className="dashboard-mini-grid">
        <Skeleton height="90px" borderRadius="0.75rem" />
        <Skeleton height="90px" borderRadius="0.75rem" />
      </div>
    );
  }

  return (
    <div className="dashboard-mini-grid">

      {/* Projects card */}
      <Card
        style={{ padding: '1rem 1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
        onClick={() => navigate(ROUTES.PROJECTS)}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', fontSize: '1rem', flexShrink: 0 }}>
              <RiFolderLine />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>My Projects</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {projectStats.active} active
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {projectStats.pending > 0 && (
              <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: '#d97706', background: '#fef3c7' }}>
                {projectStats.pending} pending
              </span>
            )}
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
              View <RiArrowRightLine />
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly tasks card */}
      <Card
        style={{ padding: '1rem 1.25rem', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
        onClick={() => navigate(ROUTES.TASKS)}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-success-50)', color: 'var(--color-success-600)', fontSize: '1rem', flexShrink: 0 }}>
              <RiCalendarCheckLine />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>This Week</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                {weeklyStats.completed}/{weeklyStats.total} tasks
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: PLAN_COLOR[weeklyStats.planStatus] || 'var(--color-neutral-500)', background: PLAN_BG[weeklyStats.planStatus] || 'var(--color-neutral-100)' }}>
              {PLAN_LABEL[weeklyStats.planStatus] || 'Open'}
            </span>
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', color: 'var(--color-success-600)', fontWeight: 600 }}>
              View <RiArrowRightLine />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


// ── Skeletons ─────────────────────────────────────────────────────────────────
const StatsSkeleton = () => (
  <div className="dashboard-kpi-grid">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="0.875rem" />
            <Skeleton width="45%" height="2rem" style={{ marginTop: '0.5rem' }} />
            <Skeleton width="80%" height="0.75rem" style={{ marginTop: '0.75rem' }} />
          </div>
          <Skeleton width="40px" height="40px" borderRadius="10px" />
        </div>
      </Card>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <Card style={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton width="40%" height="1.25rem" />
      <Skeleton width="20%" height="1rem" />
    </div>
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
      {[...Array(7)].map((_, i) => (
        <Skeleton key={i} width="100%" height={`${20 + Math.random() * 60}%`} borderRadius="4px" />
      ))}
    </div>
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <Skeleton width="30%" height="0.75rem" />
      <Skeleton width="20%" height="0.75rem" />
    </div>
  </Card>
);

const ListSkeleton = ({ rows = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
    {[...Array(rows)].map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '1rem' }}>
        <Skeleton width="24px" height="24px" borderRadius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="70%" height="0.9rem" />
          <Skeleton width="40%" height="0.75rem" style={{ marginTop: '0.375rem' }} />
        </div>
        <Skeleton width="60px" height="20px" borderRadius="10px" />
      </div>
    ))}
  </div>
);

// ── Motion Animation Variants ───────────────────────────────────────────────
const cardHover = {
  hover: {
    y: -4,
    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.25, ease: 'easeOut' }
  }
};

// ── Dashboard Component ───────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const {
    stats,
    tasks,
    activities,
    notifications,
    progress,
    chartData,
    reviewSummary,
    loadingStats,
    loadingTasks,
    loadingActivities,
    loadingNotifications,
    loadingProgress,
    loadingCharts,
    fetchAllDashboardData,
    markNotificationRead
  } = useDashboardStore();

  const [taskFilter, setTaskFilter] = useState('all');

  const {
    status: onboardingStatus,
    isCompleted: isOnboardingCompleted,
    actionMessage: onboardingActionMessage,
    rejectionReason: onboardingRejectionReason,
    fetchStatus: fetchOnboardingStatus,
  } = useOnboardingStatus();

  useEffect(() => {
    if (!user?.id) return;
    fetchAllDashboardData();
    if (user?.role === 'Intern') {
      fetchOnboardingStatus();
    }
  }, [user?.id, user?.role, fetchAllDashboardData, fetchOnboardingStatus]);

  // Greeting helper
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const CardEmpty = ({ title, description }) => (
    <div style={{ padding: '1.25rem 0.5rem', textAlign: 'center' }}>
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
        {title}
      </p>
      {description ? (
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
          {description}
        </p>
      ) : null}
    </div>
  );

  // Task Filter helper
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'in-progress') return t.status === 'in-progress' || t.status === 'under-review';
    return t.status === taskFilter;
  });

  const upcomingDeadlines = tasks
    .filter((t) => t.status !== 'completed' && t.dueDateKey)
    .sort((a, b) => String(a.dueDateKey).localeCompare(String(b.dueDateKey)))
    .slice(0, 5);

  // KPI icon map
  const getKpiIcon = (label) => {
    switch (label) {
      case 'Overall Performance': return RiStarLine;
      case 'Attendance Rate': return RiCalendarCheckLine;
      case 'Overall Internship Progress': return RiBarChartLine;
      case 'Tasks Completed': return RiCheckboxCircleLine;
      case 'Pending Tasks': return RiTimeLine;
      case 'Upcoming Deadlines': return RiCalendarEventLine;
      default: return RiTaskLine;
    }
  };

  // Activity Icon Resolver
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_submitted':
        return { icon: RiUploadCloud2Line, bg: 'var(--color-primary-50)', color: 'var(--color-primary-600)' };
      case 'review_received':
        return { icon: RiFeedbackLine, bg: 'var(--color-warning-50)', color: 'var(--color-warning-600)' };
      case 'onboarding_completed':
        return { icon: RiCheckboxMultipleLine, bg: 'var(--color-success-50)', color: 'var(--color-success-600)' };
      case 'profile_updated':
        return { icon: RiUser3Line, bg: 'var(--color-primary-50)', color: 'var(--color-primary-600)' };
      default:
        return { icon: RiBellLine, bg: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' };
    }
  };

  return (
    <div className="dashboard-page">
      
      {/* ── Contextual Onboarding Alert Banner (Auto-clears when onboarding is completed) ── */}
      {!isOnboardingCompleted && (
        <div style={{
          background: onboardingStatus === 'action_required'
            ? 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)'
            : onboardingStatus === 'pending'
            ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)'
            : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: onboardingStatus === 'action_required'
            ? '1px solid #fecaca'
            : onboardingStatus === 'pending'
            ? '1px solid #bfdbfe'
            : '1px solid #fde68a',
          borderRadius: '1.125rem',
          padding: '1.125rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
          boxShadow: onboardingStatus === 'action_required'
            ? '0 4px 12px rgba(239, 68, 68, 0.12)'
            : onboardingStatus === 'pending'
            ? '0 4px 12px rgba(59, 130, 246, 0.12)'
            : '0 4px 12px rgba(245, 158, 11, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
              background: onboardingStatus === 'action_required' ? '#fecaca' : onboardingStatus === 'pending' ? '#bfdbfe' : '#fde68a',
              color: onboardingStatus === 'action_required' ? '#991b1b' : onboardingStatus === 'pending' ? '#1e40af' : '#92400e',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', flexShrink: 0
            }}>
              {onboardingStatus === 'action_required' ? '⚠️' : onboardingStatus === 'pending' ? '⏳' : '📋'}
            </div>
            <div>
              <h4 style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: onboardingStatus === 'action_required' ? '#991b1b' : onboardingStatus === 'pending' ? '#1e40af' : '#92400e',
              }}>
                {onboardingStatus === 'action_required'
                  ? 'Onboarding Action Required — Document Rejected'
                  : onboardingStatus === 'pending'
                  ? 'Onboarding Under Supervisor Review'
                  : 'Intern Onboarding Incomplete'}
              </h4>
              <p style={{
                margin: '0.2rem 0 0 0',
                fontSize: '0.8125rem',
                color: onboardingStatus === 'action_required' ? '#b91c1c' : onboardingStatus === 'pending' ? '#1d4ed8' : '#b45309',
              }}>
                {onboardingStatus === 'action_required'
                  ? (onboardingRejectionReason ? `Supervisor feedback: "${onboardingRejectionReason}". Please upload a corrected PDF.` : (onboardingActionMessage || 'One or more submitted documents require revision.'))
                  : onboardingStatus === 'pending'
                  ? 'Your required onboarding documents have been submitted and are currently awaiting supervisor verification.'
                  : (onboardingActionMessage || 'Please finish your onboarding checklist steps and submit required documents.')}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant={onboardingStatus === 'action_required' ? 'danger' : 'primary'}
              onClick={() => navigate(ROUTES.ONBOARDING)}
            >
              {onboardingStatus === 'action_required'
                ? 'Resubmit Document'
                : onboardingStatus === 'pending'
                ? 'View Onboarding Status'
                : 'Finish Onboarding'}
            </Button>
            {!user?.profileCompleted && (
              <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.PROFILE)}>
                Complete Profile
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── 1. Welcome Section ────────────────────────────────────────────────── */}
      <section className="accent-banner" style={{
        background: '#00b4d8',
        borderRadius: '1.125rem',
        padding: '1.75rem 2rem',
        color: '#ffffff',
        boxShadow: '0 8px 32px rgba(0, 180, 216, 0.22)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#ffffff' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Intern'} 👋
            </h2>
            <p style={{ margin: 0, color: '#ffffff', opacity: 0.95, fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 }}>
              You're making excellent progress this week.
            </p>
          </div>
        </div>

        {progress && (
          <div
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '0.875rem',
              padding: '1rem 1.25rem',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem', fontSize: '0.875rem', color: '#ffffff', fontWeight: 700 }}>
              <span style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 700 }}>Profile Completion</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{progress.profileCompletion?.value}%</span>
            </div>
            {/* Progress track */}
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '99px', overflow: 'hidden' }}>
              {/* Progress bar fill - WHITE */}
              <div style={{ width: `${progress.profileCompletion?.value}%`, height: '100%', background: '#ffffff', borderRadius: '99px', transition: 'width 0.8s ease-out' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.625rem', fontSize: '0.8125rem', color: '#ffffff', fontWeight: 600 }}>
              <span style={{ color: '#ffffff', opacity: 0.95 }}>Active Internship</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>{progress.internship?.durationText}</span>
            </div>
          </div>
        )}
      </section>

      {/* ── 2. KPI Cards ──────────────────────────────────────────────────────── */}
      <section>
        {loadingStats || !stats ? (
          <StatsSkeleton />
        ) : (
          <div className="dashboard-kpi-grid">
            {Object.entries(stats).map(([key, stat]) => {
              const Icon = getKpiIcon(stat.label);
              const isUp = stat.trendUp;
              const isProgress = key === 'internshipProgress';
              
              const kpiRoutes = {
                overallPerformance: ROUTES.REVIEWS,
                attendanceRate: ROUTES.ATTENDANCE,
                internshipProgress: isOnboardingCompleted ? `${ROUTES.PROFILE}?tab=internship` : ROUTES.ONBOARDING,
                tasksCompleted: ROUTES.TASKS,
                pendingTasks: ROUTES.TASKS,
                upcomingDeadlines: ROUTES.TASKS,
              };

              return (
                <motion.div key={key} variants={cardHover} whileHover="hover">
                  <Card
                    interactive
                    style={{ height: '100%' }}
                    onClick={() => navigate(kpiRoutes[key] || ROUTES.TASKS)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(kpiRoutes[key] || ROUTES.TASKS);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-neutral-500)', marginBottom: '0.5rem' }}>
                          {stat.label}
                        </p>
                        <h3 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, lineHeight: 1.1 }}>
                          {stat.value}{stat.suffix || ''}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                          {isUp ? (
                            <RiArrowUpLine style={{ color: 'var(--color-success-500)' }} />
                          ) : (
                            <RiArrowDownLine style={{ color: 'var(--color-danger-500)' }} />
                          )}
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isUp ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
                            {stat.trend}
                          </span>
                          {String(stat.trend).includes('%') || String(stat.trend).startsWith('+') || String(stat.trend) === '0' ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>vs last week</span>
                          ) : null}
                        </div>
                      </div>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: key === 'overallPerformance' ? '#fef3c7' : key === 'attendanceRate' ? 'var(--color-success-50)' : isProgress ? 'var(--color-primary-50)' : 'var(--color-neutral-100)',
                        color: key === 'overallPerformance' ? '#d97706' : key === 'attendanceRate' ? 'var(--color-success-600)' : isProgress ? 'var(--color-primary-600)' : 'var(--color-neutral-600)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                      }}>
                        <Icon />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 2b. Projects & Weekly Summary ──────────────────────────────────────── */}
      <section>
        <ProjectWeeklySummary navigate={navigate} />
      </section>

      <section>
        <TodayAttendanceCard compact />
      </section>

      {/* ── Grid Layout for Main Content ───────────────────────────────────────── */}
      <div className="grid-responsive">
        
        {/* Left Column (8 cols equivalent on desktop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          
          {/* Progress & Circulars */}
          <Card header={<h5 style={{ margin: 0 }}>Progress Overview</h5>}>
            {loadingProgress || !progress ? (
              <ListSkeleton rows={3} />
            ) : (
              <div className="dashboard-progress-circles">
                
                {/* Onboarding progress circular */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CircularProgress
                    value={isOnboardingCompleted ? 100 : (progress.onboarding?.value || 0)}
                    size={90}
                    variant={isOnboardingCompleted ? 'success' : 'primary'}
                  />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: 600 }}>Onboarding Pathway</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {isOnboardingCompleted
                      ? 'All requirements approved ✓'
                      : `${progress.onboarding?.completedSteps || 0} of ${progress.onboarding?.totalSteps || 3} steps completed`}
                  </p>
                </div>

                {/* Weekly Goal progress circular */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CircularProgress value={progress.weeklyGoal?.totalTasks ? progress.weeklyGoal?.value : 0} size={90} variant="success" />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: 600 }}>Weekly Goals</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {progress.weeklyGoal?.totalTasks
                      ? `${progress.weeklyGoal.completedTasks} of ${progress.weeklyGoal.totalTasks} weekly tasks done`
                      : 'No weekly plan tasks yet'}
                  </p>
                </div>

                {/* Monthly completion progress */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CircularProgress value={progress.monthlyCompletion?.totalTasks ? progress.monthlyCompletion?.value : 0} size={90} variant="warning" />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: 600 }}>Monthly Milestones</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {progress.monthlyCompletion?.totalTasks
                      ? `${progress.monthlyCompletion.completedTasks} of ${progress.monthlyCompletion.totalTasks} project milestones`
                      : 'No project milestones yet'}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Productivity line chart & Status distribution */}
          <div className="dashboard-charts-row">
            {/* Weekly Productivity */}
            {loadingCharts || !chartData ? (
              <ChartSkeleton />
            ) : (
              <Card header={<h5 style={{ margin: 0 }}>Weekly Productivity</h5>}>
                {!chartData.hasProductivityData ? (
                  <CardEmpty title="No productivity data this week" description="Completed tasks logged during the week will appear as a daily trend here." />
                ) : (
                  <div style={{ height: '240px', marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.productivity}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-neutral-400)', fontSize: 11 }} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-neutral-400)', fontSize: 11 }} />
                        <ChartTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                        <Line type="monotone" dataKey="tasks" name="Tasks completed" stroke="#00b4d8" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            )}

            {/* Task distribution pie */}
            {loadingCharts || !chartData ? (
              <ChartSkeleton />
            ) : (
              <Card header={<h5 style={{ margin: 0 }}>Task Distribution</h5>}>
                {!chartData.hasDistributionData ? (
                  <CardEmpty title="No tasks to distribute yet" description="Once you have assigned or in-progress work, this chart will show how those tasks are split by status." />
                ) : (
                  <>
                    <div style={{ height: '200px', marginTop: '1rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {chartData.distribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                      {chartData.distribution.map((d) => (
                        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                          <span>{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}
          </div>

          {/* Task Overview Section */}
          <Card
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h5 style={{ margin: 0 }}>Active Tasks</h5>
                <div className="dashboard-task-filters">
                  {['all', 'pending', 'in-progress', 'completed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f)}
                      style={{
                        padding: '0.25rem 0.5rem', fontSize: '0.75rem', border: 'none', background: taskFilter === f ? '#fff' : 'transparent',
                        color: taskFilter === f ? 'var(--color-neutral-900)' : 'var(--color-neutral-500)',
                        fontWeight: taskFilter === f ? 600 : 500, borderRadius: '0.375rem', cursor: 'pointer', boxShadow: taskFilter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            {loadingTasks ? (
              <ListSkeleton rows={4} />
            ) : filteredTasks.length === 0 ? (
              <CardEmpty
                title={taskFilter === 'all' ? 'No active tasks' : 'No tasks match this filter'}
                description={taskFilter === 'all'
                  ? 'Tasks assigned to you will show up here with due dates and status.'
                  : 'Try another status filter, or clear it to see all of your tasks.'}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => navigate(ROUTES.TASK_DETAILS.replace(':taskId', t.id))}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-neutral-100)', cursor: 'pointer', transition: 'background 0.15s ease', borderRadius: '0.5rem' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-neutral-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.priority === 'high' ? 'var(--color-danger-500)' : t.priority === 'medium' ? 'var(--color-warning-500)' : 'var(--color-primary-500)' }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                          {t.title}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                          Due: {t.dueDate}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Badge variant={t.status === 'completed' ? 'success' : t.status === 'in-progress' ? 'primary' : t.status === 'under-review' ? 'warning' : 'neutral'}>
                        {t.status}
                      </Badge>
                      <Button size="sm" variant="ghost" iconOnly id={`task-view-${t.id}`}>
                        <RiArrowRightLine />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

        {/* Right Column (4 cols equivalent on desktop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0, width: '100%' }}>
          
          {/* Quick Actions */}
          <Card header={<h5 style={{ margin: 0 }}>Quick Actions</h5>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
              {[
                { label: 'View All Tasks', to: ROUTES.TASKS, icon: RiTaskLine },
                isOnboardingCompleted
                  ? { label: 'Onboarding & Records', to: `${ROUTES.PROFILE}?tab=internship`, icon: RiFolderShieldLine }
                  : { label: 'Continue Onboarding', to: ROUTES.ONBOARDING, icon: RiCheckboxMultipleLine },
                { label: 'View Attendance Record', to: ROUTES.ATTENDANCE, icon: RiCalendarCheckLine },
                { label: 'View Performance Reviews', to: ROUTES.REVIEWS, icon: RiFeedbackLine },
                { label: 'Edit Profile Settings', to: ROUTES.PROFILE, icon: RiUser3Line }
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(act.to)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', width: '100%',
                      background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)', borderRadius: '0.75rem',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--color-neutral-700)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = 'var(--color-primary-400)';
                      e.currentTarget.style.color = 'var(--color-primary-700)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-neutral-50)';
                      e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
                      e.currentTarget.style.color = 'var(--color-neutral-700)';
                    }}
                  >
                    <Icon style={{ fontSize: '1.1rem', color: 'var(--color-neutral-500)' }} />
                    {act.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Performance & Standing Summary */}
          <Card header={<h5 style={{ margin: 0 }}>Performance & Standing</h5>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.25rem 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                      {reviewSummary?.averageRating ? reviewSummary.averageRating.toFixed(1) : '—'}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>/ 5.0</span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                    {reviewSummary?.totalReviews ? `${reviewSummary.totalReviews} evaluation${reviewSummary.totalReviews > 1 ? 's' : ''}` : 'No reviews recorded yet'}
                  </p>
                </div>
                <Badge variant={reviewSummary?.standingBadge === 'Exceptional' ? 'success' : reviewSummary?.standingBadge === 'On Track' ? 'primary' : reviewSummary?.standingBadge === 'Needs Attention' ? 'warning' : 'neutral'}>
                  {reviewSummary?.standingBadge || 'Pending'}
                </Badge>
              </div>

              {reviewSummary?.recentFeedback && (
                <div style={{ padding: '0.625rem 0.75rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-neutral-600)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    &ldquo;{reviewSummary.recentFeedback}&rdquo;
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate(ROUTES.REVIEWS)}
              >
                View Reviews & Trends <RiArrowRightLine style={{ marginLeft: '0.25rem' }} />
              </Button>
            </div>
          </Card>

          {/* Upcoming Deadlines Widget */}
          <Card header={<h5 style={{ margin: 0 }}>Upcoming Deadlines</h5>}>
            {loadingTasks ? (
              <ListSkeleton rows={3} />
            ) : upcomingDeadlines.length === 0 ? (
              <CardEmpty title="No current deadlines" description="Upcoming task due dates will appear here so you can plan your week." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {upcomingDeadlines.map((t) => {
                  const isOverdue = t.remainingDays < 0;
                  return (
                    <div key={t.id} style={{ padding: '0.75rem', border: '1px solid var(--color-neutral-200)', borderRadius: '0.75rem', background: isOverdue ? 'var(--color-danger-50)' : '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', wordBreak: 'break-word', display: 'block', maxWidth: '80%' }}>
                          {t.title}
                        </span>
                        <Badge variant={t.priority === 'high' || t.priority === 'urgent' ? 'danger' : 'warning'}>
                          {t.priority}
                        </Badge>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                        <span>Due: {t.dueDate}</span>
                        <span style={{ fontWeight: 600, color: isOverdue ? 'var(--color-danger-600)' : '#00b4d8' }}>
                          {isOverdue ? 'Overdue' : t.remainingDays === 0 ? 'Due today' : `${t.remainingDays} days left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Monthly progress chart */}
          {loadingCharts || !chartData ? (
            <ChartSkeleton />
          ) : (
            <Card header={<h5 style={{ margin: 0 }}>Monthly Progress</h5>}>
              {!chartData.hasMonthlyData ? (
                <CardEmpty title="No monthly progress yet" description="Weekly completion percentages will fill this chart as you close out tasks." />
              ) : (
                <div style={{ height: '180px', marginTop: '1rem', width: '100%', minWidth: 0, overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.monthly}>
                      <XAxis dataKey="week" tick={{ fill: 'var(--color-neutral-400)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <ChartTooltip formatter={(value) => [`${value}%`, 'Completion']} />
                      <Bar dataKey="progress" fill="#00b4d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          )}

          {/* Recent Activity Feed */}
          <Card header={<h5 style={{ margin: 0 }}>Recent Activity</h5>}>
            {loadingActivities ? (
              <ListSkeleton rows={3} />
            ) : activities.length === 0 ? (
              <CardEmpty title="No recent activity" description="Submissions, reviews, and task updates will show up in this timeline." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '0.5rem' }}>
                {/* Visual timeline bar */}
                <div style={{ position: 'absolute', left: '16px', top: '10px', bottom: '10px', width: '2px', background: 'var(--color-neutral-200)', zIndex: 0 }} />

                {activities.slice(0, 4).map((act) => {
                  const styleMeta = getActivityIcon(act.type);
                  const Icon = styleMeta.icon;
                  return (
                    <div key={act.id} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', background: styleMeta.bg, color: styleMeta.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', flexShrink: 0
                      }}>
                        <Icon />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                          {act.title}
                        </p>
                        <p style={{ margin: '0.125rem 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                          {act.description}
                        </p>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                          {act.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
