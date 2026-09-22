/**
 * @file dashboardService.js
 * @description Intern dashboard data from live APIs (tasks, weekly plans, onboarding, notifications).
 */

import api from './api';
import { useAppStore } from '../store/useAppStore';
import { weeklyPlanService } from './weeklyPlanService';
import { projectService } from './projectService';
import { getInternOnboardingProgress } from '../utils/onboardingProgress';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const unwrapList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.items)) return body.data.items;
  if (Array.isArray(body?.items)) return body.items;
  return [];
};

const unwrapData = (response) => response?.data?.data || response?.data || {};

const toDateKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const formatDisplayDate = (value) => {
  const key = toDateKey(value);
  if (!key) return 'No due date';
  const date = new Date(`${key}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'No due date';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatRelativeTime = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0];
};

const unwrapWeeklyPlan = (result) => {
  const payload = result?.data?.tasks ? result.data : (result?.data || result || {});
  return {
    plan: payload.plan || null,
    tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
  };
};

const isWeeklyTaskCompleted = (task) => String(task?.end_of_week_status || '').toLowerCase() === 'completed';

const isMilestoneCompleted = (milestone) => {
  const status = String(milestone?.status || '').toLowerCase();
  const progress = Number(milestone?.progress || 0);
  const totalTasks = Number(milestone?.total_tasks || 0);
  const completedTasks = Number(milestone?.completed_tasks || 0);
  return status === 'completed' || status === 'done' || progress >= 100 || (totalTasks > 0 && completedTasks >= totalTasks);
};

const monthBounds = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

const shiftDays = (dateKey, days) => {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};

const daysBetween = (startKey, endKey) => {
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
};

const mapUiStatus = (rawStatus) => {
  const status = String(rawStatus || 'todo').toLowerCase().replace(/-/g, '_');
  if (['completed', 'approved', 'reviewed'].includes(status)) return 'completed';
  if (['in_progress', 'ongoing'].includes(status)) return 'in-progress';
  if (['submitted', 'in_review', 'under_review', 'pending_review'].includes(status)) return 'under-review';
  return 'pending';
};

const isCompletedTask = (task) => {
  const status = String(task.status || '').toLowerCase();
  const weekStatus = String(task.end_of_week_status || '').toLowerCase();
  return status === 'completed' || weekStatus === 'completed';
};

const completionDateKey = (task) => {
  if (!isCompletedTask(task)) return '';
  return toDateKey(task.completed_at || task.updated_at || task.due_date || task.created_at);
};

const normalizeTask = (raw = {}) => {
  const dueKey = toDateKey(raw.due_date || raw.dueDate);
  const status = mapUiStatus(raw.status);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = dueKey ? new Date(`${dueKey}T00:00:00`) : null;
  const remainingDays = due && !Number.isNaN(due.getTime())
    ? Math.ceil((due.getTime() - today.getTime()) / 86400000)
    : null;

  return {
    id: String(raw.id || raw.task_id || ''),
    title: raw.title || 'Untitled task',
    dueDate: dueKey ? formatDisplayDate(dueKey) : 'No due date',
    dueDateKey: dueKey,
    remainingDays,
    priority: String(raw.priority || 'medium').toLowerCase(),
    status,
    rawStatus: raw.status,
    endOfWeekStatus: raw.end_of_week_status || null,
    weekStart: toDateKey(raw.week_start),
    createdAt: raw.created_at || raw.createdAt || null,
    updatedAt: raw.updated_at || raw.updatedAt || null,
    completedAt: raw.completed_at || null,
    completed: isCompletedTask(raw) || status === 'completed',
  };
};

const mergeTasks = (assigned = [], weekly = []) => {
  const byId = new Map();
  [...assigned, ...weekly].forEach((task) => {
    if (!task?.id) return;
    byId.set(String(task.id), { ...byId.get(String(task.id)), ...task });
  });
  return Array.from(byId.values());
};

const getOnboardingProgress = (user, documentsPayload) => getInternOnboardingProgress(user, documentsPayload);

const buildProductivity = (tasks, weekStart) => {
  const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
  tasks.forEach((task) => {
    const key = completionDateKey(task);
    if (!key || key < weekStart || key > shiftDays(weekStart, 4)) return;
    const weekday = new Date(`${key}T00:00:00Z`).getUTCDay();
    const label = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' }[weekday];
    if (label) counts[label] += 1;
  });
  return DAY_LABELS.map((day) => ({ day, tasks: counts[day] }));
};

const buildDistribution = (tasks) => {
  const buckets = [
    { name: 'Completed', key: 'completed', color: '#10b981' },
    { name: 'In Progress', key: 'in-progress', color: '#00b4d8' },
    { name: 'Under Review', key: 'under-review', color: '#f59e0b' },
    { name: 'Pending', key: 'pending', color: '#64748b' },
  ];
  return buckets
    .map((bucket) => ({
      name: bucket.name,
      value: tasks.filter((task) => task.status === bucket.key).length,
      color: bucket.color,
    }))
    .filter((bucket) => bucket.value > 0);
};

const buildMonthly = (tasks, weekStart) => {
  const weeks = [3, 2, 1, 0].map((offset) => {
    const start = shiftDays(weekStart, -offset * 7);
    const end = shiftDays(start, 6);
    const inWeek = tasks.filter((task) => {
      const due = task.dueDateKey || toDateKey(task.createdAt);
      const completedOn = completionDateKey(task);
      return (due && due >= start && due <= end) || (completedOn && completedOn >= start && completedOn <= end);
    });
    const completed = inWeek.filter((task) => task.completed).length;
    const progress = inWeek.length ? Math.round((completed / inWeek.length) * 100) : 0;
    return {
      week: `Week ${4 - offset}`,
      weekStart: start,
      progress,
      completed,
      total: inWeek.length,
    };
  });
  return weeks;
};

const buildActivities = (notifications, tasks) => {
  const fromNotifications = notifications.slice(0, 8).map((item) => ({
    id: item.id,
    type: item.type || 'system',
    title: item.title || 'Update',
    description: item.message || item.shortDescription || '',
    timestamp: formatRelativeTime(item.created_at || item.date),
    sortAt: item.created_at || item.date || '',
  }));

  if (fromNotifications.length > 0) {
    return fromNotifications.sort((a, b) => String(b.sortAt).localeCompare(String(a.sortAt)));
  }

  return [...tasks]
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')))
    .slice(0, 6)
    .map((task) => ({
      id: `task-activity-${task.id}`,
      type: task.completed ? 'task_submitted' : task.status === 'under-review' ? 'review_received' : 'profile_updated',
      title: task.completed ? 'Task completed' : task.status === 'under-review' ? 'Task submitted for review' : 'Task updated',
      description: task.title,
      timestamp: formatRelativeTime(task.updatedAt || task.createdAt),
    }));
};

const percentTrend = (current, previous) => {
  if (previous === 0) return { trend: current > 0 ? `+${current}` : '0', trendUp: current >= 0 };
  const delta = Math.round(((current - previous) / previous) * 100);
  return { trend: `${delta >= 0 ? '+' : ''}${delta}%`, trendUp: delta >= 0 };
};

let snapshotPromise = null;

const loadDashboardSnapshot = async () => {
  const user = useAppStore.getState()?.user;
  const thisMonday = getMondayOfWeek();
  const lastMonday = shiftDays(thisMonday, -7);
  const weekStarts = [0, 1, 2, 3].map((offset) => shiftDays(thisMonday, -offset * 7));

  const [tasksRes, analyticsRes, notificationsRes, documentsRes, projectsRes, trendsRes, ...weekResults] = await Promise.all([
    api.get('/tasks', { params: { page: 1, limit: 100, sort: 'due_date:asc' } }).catch(() => null),
    api.get('/analytics/dashboard').catch(() => null),
    api.get('/notifications').catch(() => null),
    api.get('/onboarding/documents').catch(() => null),
    projectService.listProjects({ limit: 100 }).catch(() => ({ data: [] })),
    api.get('/reviews/performance-trends').catch(() => null),
    ...weekStarts.map((weekStart) => weeklyPlanService.getWeeklyPlan(weekStart).catch(() => ({ data: { tasks: [] } }))),
  ]);

  const assignedTasks = unwrapList(tasksRes);
  const weeklyPlans = weekResults.map(unwrapWeeklyPlan);
  const weeklyTasks = weeklyPlans.flatMap((plan) => plan.tasks);
  const currentWeekTasks = weeklyPlans[0]?.tasks || [];
  const lastWeekTasks = weeklyPlans[1]?.tasks || [];
  const projects = unwrapList(projectsRes);

  const mergedRaw = mergeTasks(assignedTasks, weeklyTasks);
  const tasks = mergedRaw.map(normalizeTask);
  const analytics = unwrapData(analyticsRes);
  const notifications = unwrapList(notificationsRes);
  const documentsPayload = unwrapData(documentsRes);
  const onboarding = getOnboardingProgress(user, documentsPayload);
  const trendsPayload = unwrapData(trendsRes);
  const reviewTrends = trendsPayload?.summary || null;

  const completedCount = analytics?.tasks?.completed ?? tasks.filter((task) => task.completed).length;
  const pendingCount = analytics?.tasks?.pending_in_progress
    ?? tasks.filter((task) => !task.completed).length;
  const upcoming = tasks
    .filter((task) => !task.completed && task.dueDateKey)
    .sort((a, b) => String(a.dueDateKey).localeCompare(String(b.dueDateKey)));

  // Calculate high-level performance metrics for Intern Dashboard
  let perfScore = '4.8';
  let perfTrend = '+0%';
  let perfTrendUp = true;
  if (reviewTrends?.overallScore != null && reviewTrends.overallScore !== '—') {
    const rawScore = Number(reviewTrends.overallScore);
    if (!Number.isNaN(rawScore) && rawScore > 0) {
      perfScore = rawScore <= 5 ? rawScore.toFixed(1) : (rawScore / 20).toFixed(1);
    }
  } else if (analytics?.performance_overview?.average_task_rating) {
    const rating = Number(analytics.performance_overview.average_task_rating);
    perfScore = rating <= 5 ? rating.toFixed(1) : (rating / 20).toFixed(1);
  }
  if (reviewTrends?.trendDelta && reviewTrends.trendDelta !== '—') {
    perfTrend = `${String(reviewTrends.trendDelta).startsWith('+') || String(reviewTrends.trendDelta).startsWith('-') ? '' : '+'}${reviewTrends.trendDelta}%`;
    perfTrendUp = reviewTrends.trend !== 'down';
  }

  // Attendance summary rate
  const attTotal = analytics?.attendance?.total_logged ?? 0;
  const attPresent = analytics?.attendance?.present ?? 0;
  const attRateRaw = analytics?.attendance?.attendance_rate;
  const attendanceRate = attRateRaw != null
    ? Math.round(Number(attRateRaw))
    : (attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 100);

  const startDate = onboarding.info.start_date || user?.startDate || user?.start_date || '';
  const endDate = onboarding.info.end_date || user?.endDate || user?.end_date || '';
  const todayKey = toDateKey(new Date());
  let internshipPct = 0;
  let durationText = 'Internship dates not set';
  if (startDate && endDate) {
    const total = Math.max(daysBetween(startDate, endDate), 1);
    const elapsed = Math.min(Math.max(daysBetween(startDate, todayKey), 0), total);
    internshipPct = Math.round((elapsed / total) * 100);
    durationText = `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
  }

  const thisWeekCompleted = currentWeekTasks.filter(isWeeklyTaskCompleted).length;
  const thisWeekTotal = currentWeekTasks.length;
  const lastWeekCompleted = lastWeekTasks.filter(isWeeklyTaskCompleted).length;
  const lastWeekTotal = lastWeekTasks.length;
  const weeklyPct = thisWeekTotal ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0;

  const { start: monthStart, end: monthEnd } = monthBounds();
  const milestoneResults = await Promise.all(
    projects.map((project) => projectService.getMilestones(project.id).catch(() => ({ data: [] }))),
  );
  const allMilestones = milestoneResults.flatMap((result) => {
    const list = unwrapList(result);
    return Array.isArray(list) ? list : [];
  });
  const dueThisMonth = allMilestones.filter((milestone) => {
    const due = toDateKey(milestone.due_date);
    return due && due >= monthStart && due <= monthEnd;
  });
  const monthMilestones = dueThisMonth.length > 0 ? dueThisMonth : allMilestones;
  const monthCompleted = monthMilestones.filter(isMilestoneCompleted).length;
  const monthlyPct = monthMilestones.length ? Math.round((monthCompleted / monthMilestones.length) * 100) : 0;

  const lastWeekUpcoming = tasks.filter((task) => {
    if (task.completed || !task.dueDateKey) return false;
    return task.dueDateKey >= lastMonday && task.dueDateKey < thisMonday;
  }).length;

  const profileValue = user?.profileCompleted ? 100 : Math.max(onboarding.info.is_saved ? 55 : 20, onboarding.value > 0 ? 40 : 20);

  const productivity = buildProductivity(mergedRaw, thisMonday);
  const distribution = buildDistribution(tasks);
  const monthly = buildMonthly(tasks, thisMonday);
  const activities = buildActivities(notifications, tasks);

  return {
    stats: {
      overallPerformance: {
        label: 'Overall Performance',
        value: perfScore,
        suffix: ' / 5.0',
        trend: perfTrend,
        trendUp: perfTrendUp,
      },
      tasksCompleted: {
        label: 'Tasks Completed',
        value: completedCount,
        ...percentTrend(thisWeekCompleted, lastWeekCompleted),
      },
      attendanceRate: {
        label: 'Attendance Rate',
        value: attendanceRate,
        suffix: '%',
        trend: attTotal > 0 ? `${attPresent}d present` : '100% on-track',
        trendUp: attendanceRate >= 80,
      },
      internshipProgress: {
        label: 'Overall Internship Progress',
        value: internshipPct,
        suffix: '%',
        trend: startDate && endDate ? `${Math.max(daysBetween(todayKey, endDate), 0)}d left` : '0%',
        trendUp: internshipPct > 0,
      },
      upcomingDeadlines: {
        label: 'Upcoming Deadlines',
        value: upcoming.length,
        ...percentTrend(upcoming.length, lastWeekUpcoming),
      },
    },
    reviewSummary: {
      overallScore: perfScore,
      rating: reviewTrends?.averageRating || (Number(perfScore) * 20),
      completedReviews: reviewTrends?.completedReviews || 0,
      nextReviewDate: reviewTrends?.nextReviewDate || null,
      trend: reviewTrends?.trend || 'stable',
      trendDelta: reviewTrends?.trendDelta || '0',
    },
    tasks,
    activities,
    notifications: notifications.map((item) => ({
      id: item.id,
      title: item.title,
      unread: !item.is_read,
    })),
    progress: {
      profileCompletion: { value: profileValue, label: 'Profile Details Setup' },
      onboarding,
      weeklyGoal: {
        value: weeklyPct,
        completedTasks: thisWeekCompleted,
        totalTasks: thisWeekTotal,
      },
      monthlyCompletion: {
        value: monthlyPct,
        completedTasks: monthCompleted,
        totalTasks: monthMilestones.length,
      },
      internship: { durationText, startDate, endDate },
    },
    chartData: {
      productivity,
      distribution,
      monthly,
      hasProductivityData: productivity.some((point) => point.tasks > 0),
      hasDistributionData: distribution.length > 0,
      hasMonthlyData: monthly.some((week) => week.total > 0),
    },
  };
};

export const dashboardService = {
  getDashboard: async () => {
    if (!snapshotPromise) {
      snapshotPromise = loadDashboardSnapshot().finally(() => {
        snapshotPromise = null;
      });
    }
    return snapshotPromise;
  },

  getStats: async () => (await dashboardService.getDashboard()).stats,
  getTasks: async () => (await dashboardService.getDashboard()).tasks,
  getActivities: async () => (await dashboardService.getDashboard()).activities,
  getNotifications: async () => (await dashboardService.getDashboard()).notifications,
  getProgress: async () => (await dashboardService.getDashboard()).progress,
  getChartData: async () => (await dashboardService.getDashboard()).chartData,
};
