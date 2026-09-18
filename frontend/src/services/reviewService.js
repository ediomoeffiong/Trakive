/**
 * @file reviewService.js
 * @description Service layer for both the intern Performance Reviews module
 * and the Supervisor Reviews & Approvals module.
 */

import api from './api';
import {
  mockSupervisorSubmissions,
  mockOnboardingApprovals,
  mockReviewHistory,
  mockReviewSchedule,
} from '../data';
import { useAppStore } from '../store/useAppStore';

// Helper to simulate API delay
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));
const SCHEDULED_REVIEWS_KEY = 'trakive_scheduled_reviews';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getStoredScheduledReviews = () =>
  safeParse(localStorage.getItem(SCHEDULED_REVIEWS_KEY), []);

const saveStoredScheduledReviews = (reviews) => {
  localStorage.setItem(SCHEDULED_REVIEWS_KEY, JSON.stringify(reviews));
};

const getCurrentUser = () => {
  try {
    return useAppStore.getState()?.user || null;
  } catch {
    return null;
  }
};

const sameUser = (left, right) =>
  Boolean(left && right && String(left).toLowerCase() === String(right).toLowerCase());

const toInternReview = (schedule) => ({
  id: schedule.id,
  period: schedule.type === 'formal-review' ? 'Performance Review' : 'Check-in',
  title: schedule.title || 'Scheduled Review',
  status: schedule.status === 'completed' ? 'published' : 'scheduled',
  overallScore: schedule.score ?? null,
  reviewerName: schedule.reviewerName || schedule.scheduledByName || 'Supervisor',
  reviewerRole: 'Supervisor',
  reviewDate: schedule.scheduledAt,
  summary: schedule.notes || '',
  strengths: [],
  scheduledAt: schedule.scheduledAt,
  nextReviewDate: schedule.status === 'upcoming' ? schedule.scheduledAt : null,
});

// ── Intern-side review methods ─────────────────────────────────────────────────

export const reviewService = {
  /**
   * Fetch all reviews for the current intern.
   */
  getReviews: async () => {
    const response = await api.get('/reviews');
    const data = response?.data?.data ?? response?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  /**
   * Fetch detailed data for a single review by ID.
   */
  getReviewById: async (reviewId) => {
    try {
      const response = await api.get(`/reviews/${reviewId}`);
      const detail = response?.data?.data || response?.data;
      if (detail) return detail;
    } catch (e) {
      console.warn('Backend API call for review detail failed', e);
    }
    throw new Error(`Review with ID "${reviewId}" not found.`);
  },

  /**
   * Submit the intern's self-assessment form.
   */
  submitSelfAssessment: async (reviewId, formData) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/self-assessment`, formData);
      return response?.data?.data || response?.data;
    } catch (e) {
      console.warn('Backend API call for self-assessment failed', e);
      throw new Error(`Review with ID "${reviewId}" not found.`);
    }
  },

  /**
   * Fetch performance trend data for charts.
   */
  getPerformanceTrends: async () => {
    try {
      const response = await api.get('/reviews/performance-trends');
      const data = response?.data?.data || response?.data;
      return {
        trends: Array.isArray(data?.trends) ? data.trends : [],
        radarData: Array.isArray(data?.radarData) ? data.radarData : [],
        summary: data?.summary || null,
      };
    } catch (e) {
      console.warn('Backend API call for review performance trends failed', e);
      return { trends: [], radarData: [], summary: null };
    }
  },

  /**
   * Fetch the intern's development goals.
   */
  getDevelopmentGoals: async () => {
    try {
      const response = await api.get('/reviews/development-goals');
      const data = response?.data?.data || response?.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
    } catch (e) {
      console.warn('Backend API call for development goals failed', e);
    }
    return [];
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
    try {
      const response = await api.get('/onboarding/supervisor/queue');
      const list = response?.data?.data || response?.data;
      if (Array.isArray(list)) {
        return list.map((item) => ({
          ...item,
          internId: item.internId || item.intern_id || item.user_id,
          intern_id: item.intern_id || item.internId || item.user_id,
          internName: item.internName || item.intern_name || item.name || 'Intern',
          department: item.department || 'Department',
          steps: item.steps || item.documents || [],
          documents: item.documents || item.steps || [],
        }));
      }
    } catch (e) {
      console.warn('Backend API call for onboarding queue failed', e);
    }
    return mockOnboardingApprovals || [];
  },

  /**
   * Approve or reject an onboarding step / document.
   * @param {string} internId
   * @param {string} documentId
   * @param {'approved' | 'rejected' | 'resubmission_required'} decision
   * @param {string} notes
   */
  updateOnboardingStep: async (internId, documentId, decision, notes = '') => {
    if (String(documentId).startsWith('detail:')) {
      const section = String(documentId).slice('detail:'.length);
      const response = await api.patch(`/onboarding/details/${internId}/${section}/review`, {
        status: decision,
        notes,
      });
      return response.data || { success: true };
    }

    const response = await api.patch(`/onboarding/documents/${documentId}/review`, {
      status: decision,
      notes,
    });
    return response.data || { success: true };
  },

  /**
   * Schedule a new performance review.
   * @param {{ internId: string, type: string, title: string, scheduledAt: string, durationMins: number, location: string, meetingLink: string, notes: string }} scheduleData
   */
  scheduleReview: async (scheduleData) => {
    await delay(800);
    const currentUser = getCurrentUser();
    const newReview = {
      success: true,
      id: `sched-${Date.now()}`,
      status: 'upcoming',
      reminderSent: false,
      createdAt: new Date().toISOString(),
      scheduledById: currentUser?.id,
      scheduledByName: currentUser?.name,
      ...scheduleData,
    };
    saveStoredScheduledReviews([newReview, ...getStoredScheduledReviews()]);
    return newReview;
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
    saveStoredScheduledReviews(getStoredScheduledReviews().filter((review) => review.id !== scheduleId));
    return { success: true, scheduleId, cancelledAt: new Date().toISOString() };
  },

  /**
   * Fetch all upcoming and past scheduled reviews.
   */
  fetchScheduledReviews: async () => {
    await delay(600);
    return [
      ...getStoredScheduledReviews(),
      ...JSON.parse(JSON.stringify(mockReviewSchedule)),
    ];
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
