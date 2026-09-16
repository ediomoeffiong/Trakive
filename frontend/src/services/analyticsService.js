/**
 * @file analyticsService.js
 * @description Service layer for fetching analytics metrics, chart data, reports, and AI insights.
 * Prefers live API data and falls back to local/mock datasets.
 */

import {
  mockDashboardMetrics,
  mockSummaryReportCards,
  mockFilterOptions,
  mockTasks,
  mockReviews,
  mockSavedReports,
  mockExportHistory,
  mockInsights,
} from '../data';
import { useAppStore } from '../store/useAppStore';
import api from './api';

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@thefifthlab.com', 'supervisor@thefifthlab.com', 'hr@thefifthlab.com', 'head@thefifthlab.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
};

const unwrap = (res) => res?.data?.data ?? res?.data ?? {};

const rateToScore = (value, fallback = '0.0') => {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  if (n <= 5) return n.toFixed(1);
  return Math.min(5, n / 20).toFixed(1);
};

const onboardingRateFromStatus = (status, completionRate) => {
  if (status === 'completed' || status === 'active') return '100%';
  if (completionRate != null && completionRate !== '') return `${Math.round(Number(completionRate) || 0)}%`;
  if (status === 'onboarding') return '33%';
  return '0%';
};

const fetchLiveDashboardMetrics = async () => {
  const [dashboardRes, taskRes, performanceRes] = await Promise.all([
    api.get('/analytics/dashboard'),
    api.get('/analytics/tasks').catch(() => null),
    api.get('/analytics/performance').catch(() => null),
  ]);

  const data = unwrap(dashboardRes);
  const tasks = unwrap(taskRes) || {};
  const performance = unwrap(performanceRes) || {};
  const user = useAppStore.getState()?.user;
  const internPerf = Array.isArray(performance.interns) ? performance.interns[0] : null;

  const completedTasks = tasks.completed ?? data.tasks?.completed ?? 0;
  const tasksInProgress = tasks.in_progress ?? data.tasks?.pending_in_progress ?? data.tasks?.pending ?? 0;
  const pendingReviews = tasks.submitted ?? data.leave?.pending ?? 0;
  const overdueCount = tasks.overdue ?? data.tasks?.overdue ?? 0;
  const completionRate = tasks.completion_percentage ?? data.tasks?.completion_rate ?? 0;
  const avgRating = internPerf?.average_task_rating
    ?? data.performance_overview?.average_task_rating
    ?? rateToScore(completionRate);

  const activeInterns = data.assigned_interns
    ?? data.users?.active_interns
    ?? data.users?.total_interns
    ?? (data.role === 'intern' ? 1 : 0);

  const onboardingCompletionRate = data.role === 'intern'
    ? onboardingRateFromStatus(data.internship_progress?.profile_status, completionRate)
    : `${Math.round(Number(completionRate) || 0)}%`;

  const bestIntern = internPerf && data.role !== 'intern'
    ? {
        badge: 'Top Performer',
        name: internPerf.name || 'Active Intern',
        role: 'Intern',
        department: internPerf.department_name || user?.department || 'FifthLab',
        avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        metricLabel: 'Overall Score',
        metricValue: `${internPerf.overall_score ?? internPerf.task_completion_rate ?? 0}`,
      }
    : null;

  return {
    metrics: {
      overallPerformanceScore: rateToScore(avgRating),
      performanceScoreTrend: '+0%',
      performanceScorePositive: true,
      activeInterns,
      activeInternsTrend: '0',
      activeInternsPositive: true,
      completedTasks,
      completedTasksTrend: '0%',
      completedTasksPositive: true,
      tasksInProgress,
      tasksInProgressTrend: '0',
      tasksInProgressPositive: true,
      pendingReviews,
      pendingReviewsTrend: '0',
      pendingReviewsPositive: pendingReviews === 0,
      completedReviews: 0,
      completedReviewsTrend: '0%',
      completedReviewsPositive: true,
      onboardingCompletionRate,
      onboardingCompletionTrend: '0%',
      onboardingCompletionPositive: true,
      averagePerformanceRating: rateToScore(avgRating),
      averagePerformanceRatingTrend: '0',
      averagePerformanceRatingPositive: true,
      organizationHealthScore: '100/100',
      organizationHealthTrend: 'Good',
      organizationHealthPositive: true,
    },
    summaryCards: {
      bestPerformingIntern: bestIntern,
      mostImprovedIntern: null,
      supervisorPerformance: null,
      highestPerformingDept: {
        badge: 'Lead Department',
        name: data.department_statistics?.[0]?.department_name || user?.department || user?.department_name || 'FifthLab',
        lead: user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Department Head',
        internCount: activeInterns,
        metricLabel: 'Completion Rate',
        metricValue: `${Math.round(Number(completionRate) || 0)}%`,
      },
      upcomingReviewDeadlines: [],
      overdueTasks: overdueCount > 0
        ? [{ id: 'overdue-summary', title: `${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}`, daysOverdue: 1, assignee: user?.name || 'You', dept: user?.department || 'FifthLab' }]
        : [],
    },
    filterOptions: {
      ...mockFilterOptions,
      departments: ['All Departments', user?.department || user?.department_name || 'FifthLab'],
      supervisors: ['All Supervisors', user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Supervisor'],
    },
  };
};

const fetchLiveChartData = async () => {
  const [dashboardRes, taskRes] = await Promise.all([
    api.get('/analytics/dashboard'),
    api.get('/analytics/tasks').catch(() => null),
  ]);

  const data = unwrap(dashboardRes);
  const tasks = unwrap(taskRes) || {};
  const user = useAppStore.getState()?.user;

  const completedTasks = tasks.completed ?? data.tasks?.completed ?? 0;
  const tasksInProgress = tasks.in_progress ?? data.tasks?.pending_in_progress ?? data.tasks?.pending ?? 0;
  const pendingReviews = tasks.submitted ?? 0;
  const overdueTasks = tasks.overdue ?? data.tasks?.overdue ?? 0;
  const completionRate = Number(tasks.completion_percentage ?? data.tasks?.completion_rate ?? 0);
  const score = Number(rateToScore(data.performance_overview?.average_task_rating ?? completionRate));

  const taskStatus = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'In Progress', value: tasksInProgress, color: '#3b82f6' },
    { name: 'Pending Review', value: pendingReviews, color: '#f59e0b' },
    { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
  ];

  let deptTaskCompletion = [];
  if (Array.isArray(data.department_statistics) && data.department_statistics.length > 0) {
    deptTaskCompletion = data.department_statistics.map((d) => ({
      department: d.department_name || 'Department',
      completed: d.task_count || 0,
      inProgress: 0,
      pendingReview: 0,
    }));
  } else {
    deptTaskCompletion = [{
      department: user?.department || user?.department_name || 'My Work',
      completed: completedTasks,
      inProgress: tasksInProgress,
      pendingReview: pendingReviews,
    }];
  }

  const weeklyTrend = [1, 2, 3, 4, 5, 6, 7, 8].map((wk) => ({
    period: `Week ${wk}`,
    avgScore: score,
    targetScore: 4.2,
    topPerformerScore: Math.min(5, Number((score + 0.3).toFixed(1))),
  }));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const recentMonths = [];
  for (let i = 6; i >= 0; i--) {
    recentMonths.push(monthNames[(currentMonthIdx - i + 12) % 12]);
  }

  const productivityGrowth = recentMonths.map((m, idx) => {
    const progressFactor = (idx + 1) / recentMonths.length;
    return {
      month: m,
      velocity: Math.round((completedTasks + 5) * 15 * progressFactor),
      velocityBenchmark: 100 + idx * 10,
      commits: Math.round((completedTasks + tasksInProgress + 10) * 25 * progressFactor),
    };
  });

  const ratio = Math.min(1, (completionRate || 0) / 100);
  const skillMatrix = [
    { subject: 'Communication', internScore: Number((4.0 + ratio * 0.8).toFixed(1)), deptAverage: Number((3.7 + ratio * 0.8).toFixed(1)), maxMark: 5.0 },
    { subject: 'Technical Skills', internScore: Number((4.2 + ratio * 0.7).toFixed(1)), deptAverage: Number((3.8 + ratio * 0.7).toFixed(1)), maxMark: 5.0 },
    { subject: 'Teamwork', internScore: Number((4.1 + ratio * 0.7).toFixed(1)), deptAverage: Number((3.8 + ratio * 0.7).toFixed(1)), maxMark: 5.0 },
    { subject: 'Initiative', internScore: Number((3.9 + ratio * 0.8).toFixed(1)), deptAverage: Number((3.4 + ratio * 0.8).toFixed(1)), maxMark: 5.0 },
    { subject: 'Quality of Work', internScore: Number((4.3 + ratio * 0.6).toFixed(1)), deptAverage: Number((4.0 + ratio * 0.6).toFixed(1)), maxMark: 5.0 },
    { subject: 'Attendance', internScore: Number((data.attendance?.attendance_rate ? data.attendance.attendance_rate / 20 : 4.7).toFixed(1)), deptAverage: 4.5, maxMark: 5.0 },
    { subject: 'Punctuality', internScore: Number((4.5 + ratio * 0.4).toFixed(1)), deptAverage: Number((4.2 + ratio * 0.4).toFixed(1)), maxMark: 5.0 },
  ];

  const now = new Date();
  const heatmapData = [];
  for (let i = 181; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    heatmapData.push({ date: d.toISOString().split('T')[0], count: 0, level: 0 });
  }

  return {
    weeklyTrend,
    monthlyTrend: productivityGrowth.map((p) => ({ month: p.month, performance: p.velocity, completionRate: p.velocity, satisfaction: 100 })),
    deptTaskCompletion,
    performanceComparison: deptTaskCompletion.map((d) => ({
      entity: d.department,
      score: Math.min(5.0, Number((4.0 + (d.completed / Math.max(d.completed + d.inProgress + d.pendingReview, 1)) * 1.0).toFixed(1))),
      taskSpeed: Math.round((d.completed / Math.max(d.completed + d.inProgress + d.pendingReview, 1)) * 100),
      reviewQuality: 95,
    })),
    taskStatus,
    reviewStatus: [
      { name: 'Completed', value: completedTasks, color: '#10b981' },
      { name: 'In Progress', value: tasksInProgress, color: '#6366f1' },
      { name: 'Pending Approval', value: pendingReviews, color: '#f59e0b' },
      { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
    ],
    onboardingCompletion: [
      { name: 'Phase 1: Setup', value: data.internship_progress?.profile_status ? 100 : 0, color: '#10b981' },
      { name: 'Phase 2: Fundamentals', value: Math.round(completionRate), color: '#3b82f6' },
      { name: 'Phase 3: Core Tasks', value: Math.round(completionRate * 0.7), color: '#8b5cf6' },
      { name: 'Phase 4: Final Capstone', value: Math.round(completionRate * 0.3), color: '#f59e0b' },
    ],
    productivityGrowth,
    skillMatrix,
    heatmapData,
  };
};

// Helper for fetching stored items from localStorage
const getStoredItems = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Helper for retrieving all active tasks across mock and local storage
const getAllTasks = () => {
  const map = new Map();
  if (Array.isArray(mockTasks)) {
    mockTasks.forEach((t) => map.set(t.id, t));
  }
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key === 'trakive_tasks' || key.startsWith('trakive_user_tasks_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) {
            list.forEach((t) => map.set(t.id, t));
          }
        }
      }
    }
  } catch {}
  return Array.from(map.values());
};

// Helper for retrieving all active reviews across mock and local storage
const getAllReviews = () => {
  const map = new Map();
  if (Array.isArray(mockReviews)) {
    mockReviews.forEach((r) => map.set(r.id, r));
  }
  try {
    const stored = localStorage.getItem('trakive_reviews');
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list)) {
        list.forEach((r) => map.set(r.id, r));
      }
    }
  } catch {}
  return Array.from(map.values());
};

// Helper for simulating async API delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  /**
   * Fetch main analytics dashboard metrics and KPI cards.
   * @param {object} filters
   */
  async getDashboardMetrics(filters = {}) {
    try {
      const live = await fetchLiveDashboardMetrics();
      if (live) return live;
    } catch {
      // Fall through to local/mock data so intern analytics still renders.
    }

    await delay(300);

    const user = useAppStore.getState()?.user;
    const allTasks = getAllTasks();
    const allReviews = getAllReviews();
    const interns = getStoredItems('trakive_intern_profiles');
    const customUsers = getStoredItems('trakive_custom_users');

    const completedTasks = allTasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
    const tasksInProgress = allTasks.filter((t) => t.status === 'in_progress' || t.status === 'in-progress' || t.status === 'assigned').length;
    const pendingReviews = allTasks.filter((t) => t.status === 'pending_review' || t.status === 'submitted' || t.status === 'pending').length;
    const completedReviews = allReviews.filter((r) => r.status === 'completed').length;

    const overdueTaskList = allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved');

    const ratings = allReviews.map((r) => Number(r.rating)).filter((r) => !isNaN(r) && r > 0);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r, 0) / ratings.length).toFixed(1)
      : (completedTasks > 0 ? '4.5' : '0.0');

    const activeInternsCount = interns.length || customUsers.filter((u) => u.role === 'intern').length || 1;

    // Dynamic Summary Cards
    let bestInternCard = null;
    if (interns.length > 0) {
      const top = interns[0];
      bestInternCard = {
        badge: 'Top Performer',
        name: top.name || top.fullName || 'Active Intern',
        role: top.track || top.role || 'Intern',
        department: user?.department || 'FifthLab',
        avatar: top.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        metricLabel: 'Tasks Completed',
        metricValue: `${completedTasks} tasks`,
      };
    }

    let supervisorCard = null;
    const supervisors = customUsers.filter((u) => u.role === 'supervisor');
    if (supervisors.length > 0) {
      const sup = supervisors[0];
      supervisorCard = {
        badge: 'Top Supervisor',
        name: sup.name || 'Supervisor',
        role: sup.department || 'Supervisor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        assignedCount: activeInternsCount,
        reviewVelocity: `${completedReviews} reviews`,
      };
    }

    let highestDeptCard = {
      badge: 'Lead Department',
      name: user?.department || 'FifthLab',
      lead: user?.name || 'Department Head',
      internCount: activeInternsCount,
      metricLabel: 'Completion Rate',
      metricValue: allTasks.length > 0 ? `${Math.round((completedTasks / allTasks.length) * 100)}%` : '0%',
    };

    return {
      metrics: {
        overallPerformanceScore: avgRating,
        performanceScoreTrend: '+0%',
        performanceScorePositive: true,
        activeInterns: activeInternsCount,
        activeInternsTrend: '0',
        activeInternsPositive: true,
        completedTasks: completedTasks,
        completedTasksTrend: '0%',
        completedTasksPositive: true,
        tasksInProgress: tasksInProgress,
        tasksInProgressTrend: '0',
        tasksInProgressPositive: true,
        pendingReviews: pendingReviews,
        pendingReviewsTrend: '0',
        pendingReviewsPositive: false,
        completedReviews: completedReviews,
        completedReviewsTrend: '0%',
        completedReviewsPositive: true,
        onboardingCompletionRate: `${allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0}%`,
        onboardingCompletionTrend: '0%',
        onboardingCompletionPositive: true,
        averagePerformanceRating: avgRating,
        averagePerformanceRatingTrend: '0',
        averagePerformanceRatingPositive: true,
        organizationHealthScore: '100/100',
        organizationHealthTrend: 'Good',
        organizationHealthPositive: true,
      },
      summaryCards: {
        bestPerformingIntern: bestInternCard,
        mostImprovedIntern: null,
        supervisorPerformance: supervisorCard,
        highestPerformingDept: highestDeptCard,
        upcomingReviewDeadlines: [],
        overdueTasks: overdueTaskList.map((t) => ({
          id: t.id,
          title: t.title,
          daysOverdue: Math.max(1, Math.floor((new Date() - new Date(t.dueDate)) / (1000 * 60 * 60 * 24))),
          assignee: t.internName || 'Assigned Intern',
          dept: user?.department || 'FifthLab',
        })),
      },
      filterOptions: {
        ...mockFilterOptions,
        departments: ['All Departments', user?.department || 'FifthLab'],
        supervisors: ['All Supervisors', user?.name || 'Supervisor'],
      },
    };
  },

  /**
   * Fetch chart data filtered by period, department, etc.
   * @param {object} filters
   */
  async getChartData(filters = {}) {
    try {
      const live = await fetchLiveChartData();
      if (live) return live;
    } catch {
      // Fall through to local/mock data so intern analytics still renders.
    }

    await delay(350);

    const user = useAppStore.getState()?.user;
    const allTasks = getAllTasks();
    const allReviews = getAllReviews();

    const completedTasks = allTasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
    const tasksInProgress = allTasks.filter((t) => t.status === 'in_progress' || t.status === 'in-progress' || t.status === 'assigned').length;
    const pendingReviews = allTasks.filter((t) => t.status === 'pending_review' || t.status === 'submitted' || t.status === 'pending').length;
    const overdueTasks = allTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved').length;

    // 1. Task Status Distribution (Donut Chart)
    const taskStatusData = [
      { name: 'Completed', value: completedTasks, color: '#10b981' },
      { name: 'In Progress', value: tasksInProgress, color: '#3b82f6' },
      { name: 'Pending Review', value: pendingReviews, color: '#f59e0b' },
      { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
    ];

    // 2. Task Completion by Department / Track (Bar Chart)
    const deptMap = {};
    allTasks.forEach((t) => {
      const dept = t.department || t.category || t.track || user?.department || 'Engineering';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, completed: 0, inProgress: 0, pendingReview: 0 };
      }
      if (t.status === 'completed' || t.status === 'approved') {
        deptMap[dept].completed += 1;
      } else if (t.status === 'in_progress' || t.status === 'in-progress' || t.status === 'assigned') {
        deptMap[dept].inProgress += 1;
      } else if (t.status === 'pending_review' || t.status === 'submitted' || t.status === 'pending') {
        deptMap[dept].pendingReview += 1;
      }
    });

    let deptTaskCompletion = Object.values(deptMap);
    if (deptTaskCompletion.length === 0) {
      deptTaskCompletion = [
        { department: user?.department || 'FifthLab', completed: completedTasks, inProgress: tasksInProgress, pendingReview: pendingReviews },
      ];
    }

    // 3. Weekly Performance Trend (Line Chart)
    const now = new Date();
    const weeklyTrend = [1, 2, 3, 4, 5, 6, 7, 8].map((wk) => {
      const weekStart = new Date(now.getTime() - (9 - wk) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - (8 - wk) * 7 * 24 * 60 * 60 * 1000);

      const weekTasks = allTasks.filter((t) => {
        const d = new Date(t.updatedAt || t.createdAt || now);
        return d >= weekStart && d <= weekEnd;
      });

      const weekReviews = allReviews.filter((r) => {
        const d = new Date(r.createdAt || now);
        return d >= weekStart && d <= weekEnd;
      });

      const weekRatings = weekReviews.map((r) => Number(r.rating)).filter((r) => !isNaN(r) && r > 0);
      let score = 0;
      if (weekRatings.length > 0) {
        score = Number((weekRatings.reduce((a, b) => a + b, 0) / weekRatings.length).toFixed(1));
      } else if (weekTasks.length > 0) {
        const done = weekTasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
        score = Number((3.5 + (done / Math.max(weekTasks.length, 1)) * 1.5).toFixed(1));
      } else {
        const base = Math.min(4.8, 3.8 + (wk * 0.1) + (completedTasks * 0.05));
        score = Number(base.toFixed(1));
      }

      return {
        period: `Week ${wk}`,
        avgScore: score,
        targetScore: 4.2,
        topPerformerScore: Math.min(5.0, Number((score + 0.3).toFixed(1))),
      };
    });

    // 4. Productivity Growth (Area Chart)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = now.getMonth();
    const recentMonths = [];
    for (let i = 6; i >= 0; i--) {
      const mIdx = (currentMonthIdx - i + 12) % 12;
      recentMonths.push(monthNames[mIdx]);
    }

    const productivityGrowth = recentMonths.map((m, idx) => {
      const progressFactor = (idx + 1) / recentMonths.length;
      const velocityVal = Math.round((completedTasks + 5) * 15 * progressFactor);
      const commitsVal = Math.round((allTasks.length + allReviews.length + 10) * 25 * progressFactor);
      return {
        month: m,
        velocity: velocityVal,
        velocityBenchmark: 100 + idx * 10,
        commits: commitsVal,
      };
    });

    // 5. 7-Skill Evaluation Matrix (Radar Chart)
    let commRating = 4.2, techRating = 4.4, teamRating = 4.3, initRating = 4.0, qualRating = 4.5, attRating = 4.8, puncRating = 4.6;
    if (allReviews.length > 0) {
      const valid = allReviews.filter((r) => r.rating);
      if (valid.length > 0) {
        commRating = valid.reduce((acc, r) => acc + (Number(r.communicationRating || r.rating) || 0), 0) / valid.length;
        techRating = valid.reduce((acc, r) => acc + (Number(r.technicalRating || r.rating) || 0), 0) / valid.length;
        teamRating = valid.reduce((acc, r) => acc + (Number(r.teamworkRating || r.rating) || 0), 0) / valid.length;
        initRating = valid.reduce((acc, r) => acc + (Number(r.initiativeRating || r.rating) || 0), 0) / valid.length;
        qualRating = valid.reduce((acc, r) => acc + (Number(r.qualityRating || r.rating) || 0), 0) / valid.length;
        attRating = valid.reduce((acc, r) => acc + (Number(r.attendanceRating || r.rating) || 0), 0) / valid.length;
        puncRating = valid.reduce((acc, r) => acc + (Number(r.punctualityRating || r.rating) || 0), 0) / valid.length;
      }
    } else if (completedTasks > 0) {
      const ratio = completedTasks / Math.max(allTasks.length, 1);
      commRating = 4.0 + ratio * 0.8;
      techRating = 4.2 + ratio * 0.7;
      teamRating = 4.1 + ratio * 0.7;
      initRating = 3.9 + ratio * 0.8;
      qualRating = 4.3 + ratio * 0.6;
      attRating = 4.7 + ratio * 0.3;
      puncRating = 4.5 + ratio * 0.4;
    }

    const skillMatrix = [
      { subject: 'Communication', internScore: Number(commRating.toFixed(1)), deptAverage: Number((commRating - 0.3).toFixed(1)), maxMark: 5.0 },
      { subject: 'Technical Skills', internScore: Number(techRating.toFixed(1)), deptAverage: Number((techRating - 0.4).toFixed(1)), maxMark: 5.0 },
      { subject: 'Teamwork', internScore: Number(teamRating.toFixed(1)), deptAverage: Number((teamRating - 0.3).toFixed(1)), maxMark: 5.0 },
      { subject: 'Initiative', internScore: Number(initRating.toFixed(1)), deptAverage: Number((initRating - 0.5).toFixed(1)), maxMark: 5.0 },
      { subject: 'Quality of Work', internScore: Number(qualRating.toFixed(1)), deptAverage: Number((qualRating - 0.3).toFixed(1)), maxMark: 5.0 },
      { subject: 'Attendance', internScore: Number(attRating.toFixed(1)), deptAverage: Number((attRating - 0.2).toFixed(1)), maxMark: 5.0 },
      { subject: 'Punctuality', internScore: Number(puncRating.toFixed(1)), deptAverage: Number((puncRating - 0.3).toFixed(1)), maxMark: 5.0 },
    ];

    // 6. 182-day Activity Contribution Heatmap
    const heatmapData = [];
    const activityMap = {};

    [...allTasks, ...allReviews].forEach((item) => {
      const rawDate = item.updatedAt || item.createdAt || item.completedAt;
      if (rawDate) {
        const dateStr = new Date(rawDate).toISOString().split('T')[0];
        activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      }
    });

    for (let i = 181; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      let level = 0;
      if (count >= 4) level = 4;
      else if (count === 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;

      heatmapData.push({ date: dateStr, count, level });
    }

    return {
      weeklyTrend,
      monthlyTrend: productivityGrowth.map((p) => ({ month: p.month, performance: p.velocity, completionRate: p.velocity, satisfaction: 100 })),
      deptTaskCompletion,
      performanceComparison: deptTaskCompletion.map((d) => ({
        entity: d.department,
        score: Math.min(5.0, Number((4.0 + (d.completed / Math.max(d.completed + d.inProgress + d.pendingReview, 1)) * 1.0).toFixed(1))),
        taskSpeed: Math.round((d.completed / Math.max(d.completed + d.inProgress + d.pendingReview, 1)) * 100),
        reviewQuality: 95,
      })),
      taskStatus: taskStatusData,
      reviewStatus: [
        { name: 'Completed', value: allReviews.filter((r) => r.status === 'completed').length, color: '#10b981' },
        { name: 'In Progress', value: allReviews.filter((r) => r.status === 'in_progress').length, color: '#6366f1' },
        { name: 'Pending Approval', value: allReviews.filter((r) => r.status === 'pending').length, color: '#f59e0b' },
        { name: 'Overdue', value: 0, color: '#ef4444' },
      ],
      onboardingCompletion: [
        { name: 'Phase 1: Setup', value: 100, color: '#10b981' },
        { name: 'Phase 2: Fundamentals', value: 85, color: '#3b82f6' },
        { name: 'Phase 3: Core Tasks', value: 60, color: '#8b5cf6' },
        { name: 'Phase 4: Final Capstone', value: 25, color: '#f59e0b' },
      ],
      productivityGrowth,
      skillMatrix,
      heatmapData,
    };
  },

  /**
   * Fetch saved reports list and export history.
   */
  async getSavedReports() {
    await delay(300);
    if (!isDemoUser()) {
      const saved = getStoredItems('trakive_saved_reports');
      const exports = getStoredItems('trakive_export_history');
      return {
        savedReports: saved,
        exportHistory: exports,
      };
    }
    return {
      savedReports: mockSavedReports,
      exportHistory: mockExportHistory,
    };
  },

  /**
   * Fetch automated AI system insights.
   */
  async getAIInsights(filters = {}) {
    await delay(300);
    if (!isDemoUser()) {
      const tasks = getStoredItems('trakive_tasks');
      const completed = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

      const dynamicInsights = [
        {
          id: 'insight-1',
          title: 'Analytics Engine Live',
          description: 'Your central performance intelligence dashboard is active and synced with real workspace activities.',
          type: 'positive',
          category: 'Overview',
          timestamp: 'Just now',
          metric: 'Active',
          impact: 'Low Impact',
        },
      ];

      if (overdue === 0) {
        dynamicInsights.push({
          id: 'insight-2',
          title: 'Deadline Status Clear',
          description: 'No overdue tasks detected in your department pipeline.',
          type: 'positive',
          category: 'Deadlines',
          timestamp: 'Just now',
          metric: '0 Overdue',
          impact: 'Low Impact',
        });
      } else {
        dynamicInsights.push({
          id: 'insight-2',
          title: 'Overdue Task Alert',
          description: `${overdue} task(s) currently require attention to meet upcoming deadlines.`,
          type: 'warning',
          category: 'Deadlines',
          timestamp: 'Just now',
          metric: `${overdue} Overdue`,
          impact: 'Critical Alert',
        });
      }

      if (completed > 0) {
        dynamicInsights.push({
          id: 'insight-3',
          title: 'Task Completion Logged',
          description: `${completed} task(s) successfully completed in your workspace.`,
          type: 'positive',
          category: 'Productivity',
          timestamp: 'Today',
          metric: `${completed} Done`,
          impact: 'Medium Impact',
        });
      }

      return dynamicInsights;
    }

    return mockInsights;
  },

  /**
   * Save a new or edited report configuration.
   * @param {object} reportConfig
   */
  async saveReport(reportConfig) {
    await delay(400);
    const newReport = {
      id: `report-${Date.now()}`,
      title: reportConfig.title || 'Untitled Custom Report',
      description: reportConfig.description || 'Custom generated report layout.',
      lastGenerated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      owner: reportConfig.owner || 'Current User',
      ownerRole: reportConfig.ownerRole || 'Supervisor',
      tags: reportConfig.tags || ['Custom'],
      isFavorite: false,
      reportType: reportConfig.reportType || 'Performance',
      period: reportConfig.period || 'This Month',
      metricsCount: reportConfig.metrics?.length || 4,
    };

    if (!isDemoUser()) {
      const current = getStoredItems('trakive_saved_reports');
      localStorage.setItem('trakive_saved_reports', JSON.stringify([newReport, ...current]));
    }

    return newReport;
  },

  /**
   * Simulate report generation & export process with progress updates callback.
   * @param {object} exportConfig
   * @param {function} onProgress
   */
  async generateExport(exportConfig, onProgress) {
    onProgress?.(15);
    await delay(200);
    onProgress?.(45);
    await delay(300);
    onProgress?.(80);
    await delay(200);
    onProgress?.(100);

    const format = exportConfig.format || 'PDF';
    const newExportRecord = {
      id: `exp-${Date.now()}`,
      fileName: exportConfig.fileName || `Analytics_Report_${Date.now()}.${format.toLowerCase()}`,
      format: format,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      status: 'Completed',
    };

    if (!isDemoUser()) {
      const current = getStoredItems('trakive_export_history');
      localStorage.setItem('trakive_export_history', JSON.stringify([newExportRecord, ...current]));
    }

    return newExportRecord;
  },
};
