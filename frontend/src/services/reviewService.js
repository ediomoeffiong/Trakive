/**
 * @file reviewService.js
 * @description Mock service layer for both the intern Performance Reviews module
 * and the Supervisor Reviews & Approvals module.
 * Simulates network requests with Promises and artificial delays.
 * Structured for easy replacement with real API calls.
 */

import {
  mockReviews,
  mockReviewDetails,
  mockPerformanceTrends,
  mockRadarData,
  mockPerformanceSummary,
  mockDevelopmentGoals,
  mockReviewTimelines,
  mockSupervisorSubmissions,
  mockOnboardingApprovals,
  mockReviewHistory,
  mockReviewSchedule,
} from '../data';
import { useAppStore } from '../store/useAppStore';

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@trakive.com', 'supervisor@trakive.com', 'hr@trakive.com', 'head@trakive.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
};

// Helper to simulate API delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ── Intern-side review methods ─────────────────────────────────────────────────

export const reviewService = {
  /**
   * Fetch all reviews for the current intern.
   */
  getReviews: async () => {
    await delay(350);
    if (!isDemoUser()) {
      return [];
    }
    return JSON.parse(JSON.stringify(mockReviews));
  },

  /**
   * Fetch detailed data for a single review by ID.
   */
  getReviewById: async (reviewId) => {
    await delay(800);
    const detail = mockReviewDetails[reviewId];
    if (!detail) {
      throw new Error(`Review with ID "${reviewId}" not found.`);
    }
    const timeline = mockReviewTimelines[reviewId] ?? [];
    return {
      ...JSON.parse(JSON.stringify(detail)),
      timeline: JSON.parse(JSON.stringify(timeline)),
    };
  },

  /**
   * Submit the intern's self-assessment form.
   */
  submitSelfAssessment: async (reviewId, formData) => {
    await delay(1000);
    return {
      success: true,
      reviewId,
      submittedAt: new Date().toISOString(),
      data: formData,
    };
  },

  /**
   * Fetch performance trend data for charts.
   */
  getPerformanceTrends: async () => {
    await delay(600);
    return {
      trends: JSON.parse(JSON.stringify(mockPerformanceTrends)),
      radarData: JSON.parse(JSON.stringify(mockRadarData)),
      summary: JSON.parse(JSON.stringify(mockPerformanceSummary)),
    };
  },

  /**
   * Fetch the intern's development goals.
   */
  getDevelopmentGoals: async () => {
    await delay(500);
    return JSON.parse(JSON.stringify(mockDevelopmentGoals));
  },

  // ── Supervisor Reviews & Approvals methods ───────────────────────────────────

  /**
   * Fetch the supervisor's submission queue with optional filters.
   * @param {{ search?: string, status?: string, priority?: string, department?: string, sortBy?: string, sortDir?: string, page?: number, pageSize?: number }} params
   */
  fetchSubmissionsQueue: async (params = {}) => {
    await delay(700);
    let data = JSON.parse(JSON.stringify(mockSupervisorSubmissions));

    const { search = '', status = 'all', priority = 'all', department = 'all' } = params;

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          s.internName.toLowerCase().includes(q) ||
          s.taskTitle.toLowerCase().includes(q) ||
          s.taskCategory.toLowerCase().includes(q)
      );
    }
    if (status !== 'all') data = data.filter((s) => s.status === status);
    if (priority !== 'all') data = data.filter((s) => s.priority === priority);
    if (department !== 'all') data = data.filter((s) => s.internDepartment === department);

    const sortBy = params.sortBy || 'submittedAt';
    const sortDir = params.sortDir || 'desc';
    data.sort((a, b) => {
      let av = a[sortBy];
      let bv = b[sortBy];
      if (sortBy === 'submittedAt') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }
      if (av == null) return 1;
      if (bv == null) return -1;
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const total = data.length;
    const start = (page - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  /**
   * Fetch a single submission by ID.
   */
  fetchSubmissionById: async (submissionId) => {
    await delay(600);
    const sub = mockSupervisorSubmissions.find((s) => s.id === submissionId);
    if (!sub) throw new Error(`Submission "${submissionId}" not found.`);
    return JSON.parse(JSON.stringify(sub));
  },

  /**
   * Submit a review for a task submission.
   * @param {string} submissionId
   * @param {{ score: number, feedback: string, strengths: string[], areasForImprovement: string[], recommendation: string, decision: string }} reviewData
   */
  submitTaskReview: async (submissionId, reviewData) => {
    await delay(900);
    return {
      success: true,
      submissionId,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Marcus Rodriguez',
      ...reviewData,
    };
  },

  /**
   * Save a review draft (does not submit).
   */
  saveReviewDraft: async (submissionId, draftData) => {
    await delay(400);
    return { success: true, submissionId, savedAt: new Date().toISOString(), draft: draftData };
  },

  /**
   * Fetch onboarding approval records for all interns.
   */
  fetchOnboardingApprovals: async () => {
    await delay(700);
    return JSON.parse(JSON.stringify(mockOnboardingApprovals));
  },

  /**
   * Approve or reject an onboarding step.
   * @param {string} internId
   * @param {string} stepId
   * @param {'approved' | 'rejected'} decision
   * @param {string} notes
   */
  updateOnboardingStep: async (internId, stepId, decision, notes = '') => {
    await delay(700);
    return {
      success: true,
      internId,
      stepId,
      decision,
      notes,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Marcus Rodriguez',
    };
  },

  /**
   * Schedule a new performance review.
   * @param {{ internId: string, type: string, title: string, scheduledAt: string, durationMins: number, location: string, meetingLink: string, notes: string }} scheduleData
   */
  scheduleReview: async (scheduleData) => {
    await delay(800);
    return {
      success: true,
      id: `sched-${Date.now()}`,
      status: 'upcoming',
      reminderSent: false,
      createdAt: new Date().toISOString(),
      ...scheduleData,
    };
  },

  /**
   * Update an existing scheduled review.
   */
  updateScheduledReview: async (scheduleId, updates) => {
    await delay(600);
    return { success: true, scheduleId, updatedAt: new Date().toISOString(), ...updates };
  },

  /**
   * Cancel a scheduled review.
   */
  cancelScheduledReview: async (scheduleId) => {
    await delay(500);
    return { success: true, scheduleId, cancelledAt: new Date().toISOString() };
  },

  /**
   * Fetch all upcoming and past scheduled reviews.
   */
  fetchScheduledReviews: async () => {
    await delay(600);
    return JSON.parse(JSON.stringify(mockReviewSchedule));
  },

  /**
   * Fetch completed review history with optional filters.
   * @param {{ internId?: string, department?: string, decision?: string, dateFrom?: string, dateTo?: string }} filters
   */
  fetchReviewHistory: async (filters = {}) => {
    await delay(650);
    let data = JSON.parse(JSON.stringify(mockReviewHistory));

    const { internId, department, decision } = filters;
    if (internId) data = data.filter((r) => r.internId === internId);
    if (department) data = data.filter((r) => r.internDepartment === department);
    if (decision) data = data.filter((r) => r.decision === decision);

    return data.sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
  },

  /**
   * Perform bulk actions on multiple submissions.
   * @param {'approve' | 'reject' | 'request-revision' | 'export'} action
   * @param {string[]} submissionIds
   */
  bulkSubmissionAction: async (action, submissionIds) => {
    await delay(900);
    return {
      success: true,
      action,
      processedIds: submissionIds,
      processedAt: new Date().toISOString(),
      count: submissionIds.length,
    };
  },

  /**
   * Fetch review KPI summary for supervisor dashboard.
   */
  fetchReviewKPIs: async () => {
    await delay(500);
    const submissions = mockSupervisorSubmissions;
    const pending = submissions.filter((s) => s.status === 'pending-review').length;
    const approved = submissions.filter((s) => s.status === 'approved').length;
    const needsRevision = submissions.filter((s) => s.status === 'needs-revision').length;
    const rejected = submissions.filter((s) => s.status === 'rejected').length;
    const upcoming = mockReviewSchedule.filter((s) => s.status === 'upcoming').length;
    const overdue = submissions.filter((s) => s.isLate && s.status === 'pending-review').length;

    return { pending, approved, needsRevision, rejected, reviewsDue: upcoming, overdue };
  },
};
