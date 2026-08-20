/**
 * @file departmentService.js
 * @description Service layer for Department Head Portal.
 * Simulates async API endpoints with delay and mock data responses.
 */

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

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const fetchDepartmentDashboard = async () => {
  await delay(400);
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
  let list = [...deptSupervisors];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.track.toLowerCase().includes(q)
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
  let list = [...deptInterns];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.track.toLowerCase().includes(q) ||
        i.supervisorName.toLowerCase().includes(q)
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
  let list = [...deptApprovals];

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
  return {
    success: true,
    requestId,
    status: 'approved',
    reviewedBy: 'Dr. Arinola Coker',
    reviewedAt: new Date().toISOString().split('T')[0],
    comment,
  };
};

export const rejectDepartmentRequest = async (requestId, comment = '') => {
  await delay(600);
  return {
    success: true,
    requestId,
    status: 'rejected',
    reviewedBy: 'Dr. Arinola Coker',
    reviewedAt: new Date().toISOString().split('T')[0],
    comment,
  };
};

// ── Announcements ──────────────────────────────────────────────────────────────

export const fetchDepartmentAnnouncements = async (params = {}) => {
  await delay(400);
  let list = [...deptAnnouncements];

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
  const newAnn = {
    id: `ann-dept-${Date.now()}`,
    ...data,
    authorName: 'Dr. Arinola Coker',
    authorRole: 'Department Head',
    datePosted: new Date().toISOString(),
    viewCount: 0,
    likes: 0,
    status: data.status || 'published',
  };
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
  let list = [...deptTasks];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.internName.toLowerCase().includes(q) ||
        t.supervisorName.toLowerCase().includes(q) ||
        t.track.toLowerCase().includes(q)
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

  return { data: list, stats: deptTaskStats, total: list.length };
};

// ── Reviews ────────────────────────────────────────────────────────────────────

export const fetchDepartmentReviews = async (params = {}) => {
  await delay(420);
  let list = [...deptReviews];

  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.internName.toLowerCase().includes(q) ||
        r.supervisorName.toLowerCase().includes(q) ||
        r.track.toLowerCase().includes(q) ||
        r.reviewType.toLowerCase().includes(q)
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

  return { data: list, stats: deptReviewStats, total: list.length };
};
