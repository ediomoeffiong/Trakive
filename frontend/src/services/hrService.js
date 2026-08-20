/**
 * @file hrService.js
 * @description Mock HR Administrator service layer.
 * Simulates async API calls with realistic delays using mock data.
 */

import {
  hrKPICards,
  hrDeptDistribution,
  hrBatchTrend,
  hrPendingApprovals,
  hrRecentActivity,
  mockSupervisors,
  mockDepartments,
  mockBatches,
  mockUserDirectory,
} from '../data';

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ── Dashboard ──────────────────────────────────────────────────────────────────

export const fetchHRDashboard = async () => {
  await delay(500);
  return {
    kpis: hrKPICards,
    deptDistribution: hrDeptDistribution,
    batchTrend: hrBatchTrend,
    pendingApprovals: hrPendingApprovals,
    recentActivity: hrRecentActivity,
  };
};

// ── Interns ────────────────────────────────────────────────────────────────────

export const fetchHRInterns = async (params = {}) => {
  await delay(600);
  // interns are users with role === 'Intern'
  let interns = mockUserDirectory.filter((u) => u.role === 'Intern');
  if (params.search) {
    const q = params.search.toLowerCase();
    interns = interns.filter(
      (i) => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q)
    );
  }
  if (params.department) {
    interns = interns.filter((i) => i.department === params.department);
  }
  if (params.status) {
    interns = interns.filter((i) => i.status === params.status);
  }
  if (params.batchId) {
    interns = interns.filter((i) => i.batchId === params.batchId);
  }
  return { data: interns, total: interns.length };
};

export const assignSupervisorToIntern = async (internId, supervisorId) => {
  await delay(700);
  return { success: true, internId, supervisorId };
};

export const updateInternStatus = async (internId, status) => {
  await delay(600);
  return { success: true, internId, status };
};

// ── Supervisors ────────────────────────────────────────────────────────────────

export const fetchHRSupervisors = async (params = {}) => {
  await delay(600);
  let supervisors = [...mockSupervisors];
  if (params.search) {
    const q = params.search.toLowerCase();
    supervisors = supervisors.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }
  if (params.department) {
    supervisors = supervisors.filter((s) => s.department === params.department);
  }
  if (params.status) {
    supervisors = supervisors.filter((s) => s.status === params.status);
  }
  return { data: supervisors, total: supervisors.length };
};

export const createSupervisor = async (data) => {
  await delay(800);
  const newSupervisor = {
    id: `sup-${Date.now()}`,
    ...data,
    internCount: 0,
    rating: 0,
    completedCycles: 0,
    joinedAt: new Date().toISOString().split('T')[0],
    status: 'active',
  };
  return { success: true, data: newSupervisor };
};

export const updateSupervisor = async (supervisorId, data) => {
  await delay(700);
  return { success: true, supervisorId, data };
};

export const assignDepartmentToSupervisor = async (supervisorId, departmentId) => {
  await delay(600);
  return { success: true, supervisorId, departmentId };
};

// ── Departments ────────────────────────────────────────────────────────────────

export const fetchHRDepartments = async (params = {}) => {
  await delay(500);
  let departments = [...mockDepartments];
  if (params.search) {
    const q = params.search.toLowerCase();
    departments = departments.filter((d) => d.name.toLowerCase().includes(q));
  }
  return { data: departments, total: departments.length };
};

export const createDepartment = async (data) => {
  await delay(800);
  const newDept = { id: `dept-${Date.now()}`, ...data, status: 'active', internCount: 0, supervisorCount: 0, completionRate: 0 };
  return { success: true, data: newDept };
};

export const updateDepartment = async (departmentId, data) => {
  await delay(700);
  return { success: true, departmentId, data };
};

// ── Batches ────────────────────────────────────────────────────────────────────

export const fetchHRBatches = async (params = {}) => {
  await delay(600);
  let batches = [...mockBatches];
  if (params.status) {
    batches = batches.filter((b) => b.status === params.status);
  }
  return { data: batches, total: batches.length };
};

export const createBatch = async (data) => {
  await delay(800);
  const newBatch = {
    id: `batch-${Date.now()}`,
    ...data,
    status: 'upcoming',
    totalInterns: 0,
    completedInterns: 0,
    completionRate: 0,
    supervisorCount: 0,
  };
  return { success: true, data: newBatch };
};

export const assignInternsToBatch = async (batchId, internIds) => {
  await delay(900);
  return { success: true, batchId, internIds, assignedCount: internIds.length };
};

// ── Announcements ──────────────────────────────────────────────────────────────

export const fetchHRAnnouncements = async (params = {}) => {
  await delay(500);
  return { data: [], total: 0 }; // fetched fresh from store state
};

export const createAnnouncement = async (data) => {
  await delay(800);
  const now = new Date().toISOString();
  const newAnnouncement = {
    id: `ann-${Date.now()}`,
    ...data,
    createdAt: now,
    updatedAt: now,
    author: 'HR Admin',
    viewCount: 0,
  };
  return { success: true, data: newAnnouncement };
};

export const updateAnnouncement = async (announcementId, data) => {
  await delay(700);
  return { success: true, announcementId, data };
};

export const togglePublishAnnouncement = async (announcementId, currentStatus) => {
  await delay(500);
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  return { success: true, announcementId, status: newStatus };
};

export const deleteAnnouncement = async (announcementId) => {
  await delay(600);
  return { success: true, announcementId };
};

// ── Users ──────────────────────────────────────────────────────────────────────

export const fetchHRUsers = async (params = {}) => {
  await delay(600);
  let users = [...mockUserDirectory];
  if (params.search) {
    const q = params.search.toLowerCase();
    users = users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  if (params.role && params.role !== 'all') {
    users = users.filter((u) => u.role === params.role);
  }
  if (params.status) {
    users = users.filter((u) => u.status === params.status);
  }
  return { data: users, total: users.length };
};

export const toggleUserStatus = async (userId, currentStatus) => {
  await delay(700);
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  return { success: true, userId, status: newStatus };
};

export const resetUserPassword = async (userId) => {
  await delay(800);
  return { success: true, userId, message: 'Password reset email sent.' };
};
