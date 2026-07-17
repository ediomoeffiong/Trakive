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
  RiTaskLine
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
  EmptyState
} from '../components/ui';
import { useCurrentUser } from '../store';
import { useDashboardStore } from '../store/useDashboardStore';
import { ROUTES } from '../constants';

// ── Skeletons ─────────────────────────────────────────────────────────────────
const StatsSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
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

  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // Greeting helper
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Task Filter helper
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'all') return true;
    return t.status === taskFilter;
  });

  // KPI icon map
  const getKpiIcon = (label) => {
    switch (label) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* ── 1. Welcome Section ────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)', borderRadius: '1.125rem', padding: '2rem', color: '#fff', boxShadow: '0 8px 32px rgba(37,99,235,0.22)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', mdDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Intern'} 👋
            </h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              You're making excellent progress this week.
            </p>
          </div>
          {progress && (
            <div style={{ minWidth: '240px', background: 'rgba(255, 255, 255, 0.08)', padding: '1rem', borderRadius: '0.75rem', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.09)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ opacity: 0.9, fontWeight: 500 }}>Profile Completion</span>
                <span style={{ fontWeight: 700 }}>{progress.profileCompletion?.value}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${progress.profileCompletion?.value}%`, height: '100%', background: 'var(--color-primary-400)', transition: 'width 0.8s ease-out' }} />
              </div>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                {progress.internship?.durationText}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. KPI Cards ──────────────────────────────────────────────────────── */}
      <section>
        {loadingStats || !stats ? (
          <StatsSkeleton />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {Object.entries(stats).map(([key, stat]) => {
              const Icon = getKpiIcon(stat.label);
              const isUp = stat.trendUp;
              const isProgress = key === 'internshipProgress';
              
              return (
                <motion.div key={key} variants={cardHover} whileHover="hover">
                  <Card interactive style={{ height: '100%' }}>
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
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>vs last week</span>
                        </div>
                      </div>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: isProgress ? 'var(--color-primary-50)' : 'var(--color-neutral-100)',
                        color: isProgress ? 'var(--color-primary-600)' : 'var(--color-neutral-600)',
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

      {/* ── Grid Layout for Main Content ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: 'repeat(12, 1fr)', gap: '1.5rem', alignItems: 'start' }} className="grid-responsive">
        
        {/* Left Column (8 cols equivalent on desktop) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 8' }}>
          
          {/* Progress & Circulars */}
          <Card header={<h5 style={{ margin: 0 }}>Progress Overview</h5>}>
            {loadingProgress || !progress ? (
              <ListSkeleton rows={3} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', padding: '0.5rem 0' }}>
                
                {/* Onboarding progress circular */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CircularProgress value={progress.onboarding?.value} size={90} variant="primary" />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: 600 }}>Onboarding Pathway</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {progress.onboarding?.completedSteps} of {progress.onboarding?.totalSteps} steps completed
                  </p>
                </div>

                {/* Weekly Goal progress circular */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CircularProgress value={progress.weeklyGoal?.value} size={90} variant="success" />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: 600 }}>Weekly Goals</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    {progress.weeklyGoal?.completedTasks} of {progress.weeklyGoal?.totalTasks} tasks done
                  </p>
                </div>

                {/* Monthly completion progress */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <CircularProgress value={progress.monthlyCompletion?.value} size={90} variant="warning" />
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', fontWeight: 600 }}>Monthly Milestones</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    Overall target completion
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Productivity line chart & Status distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Weekly Productivity */}
            {loadingCharts || !chartData ? (
              <ChartSkeleton />
            ) : (
              <Card header={<h5 style={{ margin: 0 }}>Weekly Productivity</h5>}>
                <div style={{ height: '240px', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.productivity}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-neutral-400)', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-neutral-400)', fontSize: 11 }} />
                      <ChartTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                      <Line type="monotone" dataKey="tasks" stroke="var(--color-primary-600)" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Task distribution pie */}
            {loadingCharts || !chartData ? (
              <ChartSkeleton />
            ) : (
              <Card header={<h5 style={{ margin: 0 }}>Task Distribution</h5>}>
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
              </Card>
            )}
          </div>

          {/* Task Overview Section */}
          <Card
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h5 style={{ margin: 0 }}>Active Tasks</h5>
                <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--color-neutral-100)', padding: '2px', borderRadius: '0.5rem' }}>
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
              <EmptyState title="No tasks found" description="There are no active tasks matching the selected filter." />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 4' }}>
          
          {/* Quick Actions */}
          <Card header={<h5 style={{ margin: 0 }}>Quick Actions</h5>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
              {[
                { label: 'View All Tasks', to: ROUTES.TASKS, icon: RiTaskLine },
                { label: 'Continue Onboarding', to: ROUTES.ONBOARDING, icon: RiCheckboxMultipleLine },
                { label: 'Upload Weekly Report', to: ROUTES.REPORTS, icon: RiUploadCloud2Line },
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

          {/* Upcoming Deadlines Widget */}
          <Card header={<h5 style={{ margin: 0 }}>Upcoming Deadlines</h5>}>
            {loadingTasks ? (
              <ListSkeleton rows={3} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((t) => {
                  const isOverdue = t.remainingDays < 0;
                  return (
                    <div key={t.id} style={{ padding: '0.75rem', border: '1px solid var(--color-neutral-200)', borderRadius: '0.75rem', background: isOverdue ? 'var(--color-danger-50)' : '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', wordBreak: 'break-word', display: 'block', maxWidth: '80%' }}>
                          {t.title}
                        </span>
                        <Badge variant={t.priority === 'high' ? 'danger' : 'warning'}>
                          {t.priority}
                        </Badge>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                        <span>Due: {t.dueDate}</span>
                        <span style={{ fontWeight: 600, color: isOverdue ? 'var(--color-danger-600)' : 'var(--color-primary-600)' }}>
                          {isOverdue ? 'Overdue' : `${t.remainingDays} days left`}
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
              <div style={{ height: '180px', marginTop: '1rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthly}>
                    <XAxis dataKey="week" tick={{ fill: 'var(--color-neutral-400)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <ChartTooltip />
                    <Bar dataKey="progress" fill="var(--color-primary-600)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Recent Activity Feed */}
          <Card header={<h5 style={{ margin: 0 }}>Recent Activity</h5>}>
            {loadingActivities ? (
              <ListSkeleton rows={3} />
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
