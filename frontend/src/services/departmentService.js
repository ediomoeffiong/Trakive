/**
 * @file departmentService.js
 * @description Service layer for Department Head Portal.
 * Simulates async API endpoints with delay and mock data responses.
 */

import api from './api';
import {
  departmentKPICards,
  departmentSummary,
  currentInternshipBatches,
  teamStructure,
  departmentStats,
  departmentRecentActivities,
  performanceTrends,
  taskCompletionCharts,
  reviewStatistics,
  internshipCompletionTrends,
  deptMetricsOverview,
  deptSupervisors,
  deptInterns,
  deptApprovals,
  deptAnnouncements,
  deptTasks,
  deptTaskStats,
  deptReviews,
  deptReviewStats,
} from '../data';
import { useAppStore } from '../store/useAppStore';

// Helper to determine if current session is a demo user account
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

// Helper for fetching stored items from localStorage
const getStoredItems = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const fetchDepartmentDashboard = async () => {
  await delay(400);

  if (!isDemoUser()) {
    const tasks = getStoredItems('trakive_tasks');
    const reviews = getStoredItems('trakive_reviews');
    const interns = getStoredItems('trakive_intern_profiles');
    const customUsers = getStoredItems('trakive_custom_users');
    const supervisors = customUsers.filter((u) => u.role === 'supervisor');

    const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
    const pendingReviews = tasks.filter((t) => t.status === 'pending_review' || t.status === 'submitted').length;
    const avgScore = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
      : '0.0';

    return {
      kpis: [
        { title: 'Total Active Interns', value: String(interns.length), trend: '+0', positive: true, icon: 'RiUserFollowLine', color: 'indigo' },
        { title: 'Active Supervisors', value: String(supervisors.length), trend: '+0', positive: true, icon: 'RiTeamLine', color: 'cyan' },
        { title: 'Tasks Completed', value: String(completedTasks), trend: '0%', positive: true, icon: 'RiTaskLine', color: 'emerald' },
        { title: 'Avg Performance Score', value: `${avgScore}/5`, trend: '0%', positive: true, icon: 'RiAwardLine', color: 'amber' },
      ],
      summary: {
        totalInterns: interns.length,
        totalSupervisors: supervisors.length,
        pendingApprovals: pendingReviews,
        overallAvgRating: avgScore,
      },
      batches: [],
      teamStructure: [],
      stats: {
        totalTasksAssigned: tasks.length,
        completedTasks,
        pendingReviews,
        avgReviewScore: avgScore,
      },
      recentActivities: [],
    };
  }

  return {
    kpis: departmentKPICards,
    summary: departmentSummary,
    batches: currentInternshipBatches,
    teamStructure: teamStructure,
    stats: departmentStats,
    recentActivities: departmentRecentActivities,
  };
};

// ── Analytics ──────────────────────────────────────────────────────────────────

export const fetchDepartmentAnalytics = async () => {
  await delay(450);

  if (!isDemoUser()) {
    const tasks = getStoredItems('trakive_tasks');
    const reviews = getStoredItems('trakive_reviews');

    const completedCount = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
    const pendingCount = tasks.filter((t) => t.status === 'pending_review' || t.status === 'submitted').length;
    const delayedCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved').length;

    const avgScoreNum = reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1))
      : 0;

    return {
      performanceTrends: [
        { month: 'Current', avgScore: avgScoreNum, technical: avgScoreNum, softSkills: avgScoreNum, benchmark: 80.0 },
      ],
      taskCompletionCharts: {
        byStatus: [
          { name: 'Completed', value: completedCount, color: '#10b981' },
          { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
          { name: 'Under Review', value: pendingCount, color: '#f59e0b' },
          { name: 'Delayed / Behind', value: delayedCount, color: '#ef4444' },
        ],
        byCategory: [],
        weeklyVelocity: [
          { week: 'Current', created: tasks.length, completed: completedCount },
        ],
      },
      reviewStatistics: {
        totalReviews: reviews.length,
        onTimePercentage: reviews.length > 0 ? 100 : 0,
        avgTurnaroundHours: 0,
        ratingDistribution: [
          { grade: 'Exceeds Expectations (90-100%)', count: reviews.filter((r) => r.rating >= 4.5).length, percentage: '0%' },
          { grade: 'Meets Expectations (75-89%)', count: reviews.filter((r) => r.rating >= 3.5 && r.rating < 4.5).length, percentage: '0%' },
          { grade: 'Needs Improvement (60-74%)', count: reviews.filter((r) => r.rating >= 2.5 && r.rating < 3.5).length, percentage: '0%' },
          { grade: 'Unsatisfactory (<60%)', count: reviews.filter((r) => r.rating < 2.5).length, percentage: '0%' },
        ],
        supervisorTurnaround: [],
      },
      internshipCompletionTrends: [],
      metricsOverview: {
        activeProjects: tasks.length,
        totalMentorshipHours: 0,
        averageAttendanceRate: 100,
        hireConversionEligibility: 0,
      },
    };
  }

  return {
    performanceTrends,
    taskCompletionCharts,
    reviewStatistics,
    internshipCompletionTrends,
    metricsOverview: deptMetricsOverview,
  };
};

// ── Supervisors ────────────────────────────────────────────────────────────────

export const fetchDepartmentSupervisors = async (params = {}) => {
  await delay(400);
  let list = isDemoUser() ? [...deptSupervisors] : getStoredItems('trakive_custom_users').filter((u) => u.role === 'supervisor');

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        (s.track && s.track.toLowerCase().includes(q))
    );
  }

  if (params.track && params.track !== 'all') {
    list = list.filter((s) => s.track === params.track);
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((s) => s.status === params.status);
  }

  return { data: list, total: list.length };
};

// ── Interns ────────────────────────────────────────────────────────────────────

export const fetchDepartmentInterns = async (params = {}) => {
  await delay(400);
  let list = isDemoUser() ? [...deptInterns] : getStoredItems('trakive_intern_profiles');

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.name?.toLowerCase().includes(q) ||
        i.email?.toLowerCase().includes(q) ||
        (i.track && i.track.toLowerCase().includes(q)) ||
        (i.supervisorName && i.supervisorName.toLowerCase().includes(q))
    );
  }

  if (params.supervisorId && params.supervisorId !== 'all') {
    list = list.filter((i) => i.supervisorId === params.supervisorId);
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((i) => i.status === params.status);
  }

  if (params.track && params.track !== 'all') {
    list = list.filter((i) => i.track === params.track);
  }

  return { data: list, total: list.length };
};

// ── Approvals ──────────────────────────────────────────────────────────────────

export const fetchDepartmentApprovals = async (params = {}) => {
  await delay(400);
  let list = isDemoUser() ? [...deptApprovals] : getStoredItems('trakive_approvals');

  if (params.status && params.status !== 'all') {
    list = list.filter((a) => a.status === params.status);
  }

  if (params.type && params.type !== 'all') {
    list = list.filter((a) => a.type === params.type);
  }

  if (params.priority && params.priority !== 'all') {
    list = list.filter((a) => a.priority === params.priority);
  }

  return { data: list, total: list.length };
};

export const approveDepartmentRequest = async (requestId, comment = '') => {
  await delay(600);
  const user = useAppStore.getState()?.user;
  return {
    success: true,
    requestId,
    status: 'approved',
    reviewedBy: user?.name || 'Department Head',
    reviewedAt: new Date().toISOString().split('T')[0],
    comment,
  };
};

export const rejectDepartmentRequest = async (requestId, comment = '') => {
  await delay(600);
  const user = useAppStore.getState()?.user;
  return {
    success: true,
    requestId,
    status: 'rejected',
    reviewedBy: user?.name || 'Department Head',
    reviewedAt: new Date().toISOString().split('T')[0],
    comment,
  };
};

// ── Announcements ──────────────────────────────────────────────────────────────

export const fetchDepartmentAnnouncements = async (params = {}) => {
  await delay(400);
  let list = isDemoUser() ? [...deptAnnouncements] : getStoredItems('trakive_announcements');

  if (params.category && params.category !== 'all') {
    list = list.filter((a) => a.category === params.category);
  }

  if (params.audience && params.audience !== 'all') {
    list = list.filter((a) => a.audience === params.audience);
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((a) => a.status === params.status);
  }

  return { data: list, total: list.length };
};

export const createDepartmentAnnouncement = async (data) => {
  await delay(650);
  const user = useAppStore.getState()?.user;
  const newAnn = {
    id: `ann-dept-${Date.now()}`,
    ...data,
    authorName: user?.name || 'Department Head',
    authorRole: 'Department Head',
    datePosted: new Date().toISOString(),
    viewCount: 0,
    likes: 0,
    status: data.status || 'published',
  };

  if (!isDemoUser()) {
    const stored = getStoredItems('trakive_announcements');
    stored.unshift(newAnn);
    localStorage.setItem('trakive_announcements', JSON.stringify(stored));
  }

  return { success: true, data: newAnn };
};

export const updateDepartmentAnnouncement = async (announcementId, data) => {
  await delay(600);
  return { success: true, announcementId, data };
};

export const deleteDepartmentAnnouncement = async (announcementId) => {
  await delay(500);
  return { success: true, announcementId };
};

export const togglePublishDepartmentAnnouncement = async (announcementId, currentStatus) => {
  await delay(400);
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  return { success: true, announcementId, status: newStatus };
};

// ── Tasks ──────────────────────────────────────────────────────────────────────

export const fetchDepartmentTasks = async (params = {}) => {
  await delay(420);
  let list = [];
  try {
    const response = await api.get('/tasks', { params: { limit: 100 } });
    const items = response.data?.data || response.data?.items || (Array.isArray(response.data) ? response.data : null);
    if (Array.isArray(items)) {
      list = items.map((t) => ({
        id: String(t.id),
        title: t.title,
        description: t.description,
        priority: String(t.priority || 'medium').toLowerCase(),
        status: t.status === 'todo' ? 'in_progress' : t.status,
        dueDate: t.due_date ? String(t.due_date).slice(0, 10) : '',
        internName: [t.assignee_first_name, t.assignee_last_name].filter(Boolean).join(' ') || 'Intern',
        supervisorName: [t.creator_first_name, t.creator_last_name].filter(Boolean).join(' ') || 'Supervisor',
        track: t.department_name || 'General',
        completionRate: t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 0,
      }));
    }
  } catch {
    list = isDemoUser() ? [...deptTasks] : getStoredItems('trakive_tasks');
  }

  if (list.length === 0 && isDemoUser()) {
    list = [...deptTasks];
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        (t.internName && t.internName.toLowerCase().includes(q)) ||
        (t.supervisorName && t.supervisorName.toLowerCase().includes(q)) ||
        (t.track && t.track.toLowerCase().includes(q))
    );
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((t) => t.status === params.status);
  }

  if (params.priority && params.priority !== 'all') {
    list = list.filter((t) => t.priority === params.priority);
  }

  if (params.supervisor && params.supervisor !== 'all') {
    list = list.filter((t) => t.supervisorId === params.supervisor);
  }

  const completed = list.filter((t) => t.status === 'completed' || t.status === 'approved').length;
  const inProgress = list.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
  const pendingReview = list.filter((t) => t.status === 'pending_review' || t.status === 'submitted').length;
  const overdue = list.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved').length;

  const stats = isDemoUser() ? deptTaskStats : {
    totalTasks: list.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    pendingReviewTasks: pendingReview,
    overdueTasks: overdue,
  };

  return { data: list, stats, total: list.length };
};

// ── Reviews ────────────────────────────────────────────────────────────────────

export const fetchDepartmentReviews = async (params = {}) => {
  await delay(420);
  let list = isDemoUser() ? [...deptReviews] : getStoredItems('trakive_reviews');

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        (r.internName && r.internName.toLowerCase().includes(q)) ||
        (r.supervisorName && r.supervisorName.toLowerCase().includes(q)) ||
        (r.track && r.track.toLowerCase().includes(q)) ||
        (r.reviewType && r.reviewType.toLowerCase().includes(q))
    );
  }

  if (params.status && params.status !== 'all') {
    list = list.filter((r) => r.status === params.status);
  }

  if (params.supervisor && params.supervisor !== 'all') {
    list = list.filter((r) => r.supervisorId === params.supervisor);
  }

  if (params.attention === 'true') {
    list = list.filter((r) => r.requiresAttention);
  }

  const completed = list.filter((r) => r.status === 'completed').length;
  const pending = list.filter((r) => r.status === 'pending').length;

  const stats = isDemoUser() ? deptReviewStats : {
    totalReviews: list.length,
    completedReviews: completed,
    pendingReviews: pending,
  };

  return { data: list, stats, total: list.length };
};
