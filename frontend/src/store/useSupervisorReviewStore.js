/**
 * @file useSupervisorReviewStore.js
 * @description Zustand store for the Supervisor Reviews & Approvals module.
 * Manages submission queue, onboarding approvals, review history, scheduling,
 * modal/drawer states, filters, pagination, bulk selection, loading, and errors.
 */

import { create } from 'zustand';
import { reviewService } from '../services';

// ── Initial filter state ──────────────────────────────────────────────────────
const initialFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  department: 'all',
  sortBy: 'submittedAt',
  sortDir: 'desc',
};

const initialHistoryFilters = {
  internId: '',
  department: '',
  decision: '',
  dateFrom: '',
  dateTo: '',
};

export const useSupervisorReviewStore = create((set, get) => ({
  // ── Active tab ──────────────────────────────────────────────────────────────
  activeTab: 'dashboard', // 'dashboard' | 'submissions' | 'onboarding' | 'schedule' | 'history'

  // ── KPIs ────────────────────────────────────────────────────────────────────
  kpis: {
    pending: 0,
    approved: 0,
    needsRevision: 0,
    rejected: 0,
    reviewsDue: 0,
    overdue: 0,
  },

  // ── Submission Queue ─────────────────────────────────────────────────────────
  submissions: [],
  totalSubmissions: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
  selectedSubmission: null,
  selectedSubmissionIds: [],
  filters: { ...initialFilters },
  activeSort: { key: 'submittedAt', dir: 'desc' },

  // ── Review Form (draft state) ─────────────────────────────────────────────
  reviewDraft: {
    score: 0,
    quality: 0,
    timeliness: 0,
    communication: 0,
    technicalDepth: 0,
    feedback: '',
    strengths: [],
    areasForImprovement: [],
    recommendation: '',
    decision: '',
  },

  // ── Onboarding Approvals ──────────────────────────────────────────────────
  onboardingQueue: [],
  selectedOnboardingIntern: null,
  selectedOnboardingStep: null,

  // ── Review Schedule ────────────────────────────────────────────────────────
  scheduledReviews: [],
  scheduleFormData: {
    internId: '',
    type: 'one-on-one',
    title: '',
    scheduledAt: '',
    durationMins: 30,
    location: 'google-meet',
    meetingLink: '',
    notes: '',
  },

  // ── Review History ─────────────────────────────────────────────────────────
  reviewHistory: [],
  historyFilters: { ...initialHistoryFilters },

  // ── Modal & Drawer State ───────────────────────────────────────────────────
  isDetailsDrawerOpen: false,
  isReviewModalOpen: false,
  isSchedulerModalOpen: false,
  isRejectConfirmOpen: false,
  isApproveConfirmOpen: false,
  confirmTarget: null, // { submissionId, action }

  // ── Loading Flags ──────────────────────────────────────────────────────────
  loading: {
    dashboard: false,
    submissions: false,
    submissionDetail: false,
    onboarding: false,
    schedule: false,
    history: false,
    reviewAction: false,
    onboardingAction: false,
    scheduleAction: false,
    bulkAction: false,
  },

  // ── Errors ────────────────────────────────────────────────────────────────
  errors: {
    submissions: null,
    onboarding: null,
    schedule: null,
    history: null,
    reviewAction: null,
    onboardingAction: null,
    scheduleAction: null,
  },

  // ── Setters ───────────────────────────────────────────────────────────────

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSearch: (search) => {
    set((s) => ({ filters: { ...s.filters, search }, currentPage: 1 }));
    get().fetchSubmissions();
  },

  setFilter: (key, value) => {
    set((s) => ({ filters: { ...s.filters, [key]: value }, currentPage: 1 }));
    get().fetchSubmissions();
  },

  setSort: (key) => {
    set((s) => {
      const dir = s.activeSort.key === key && s.activeSort.dir === 'asc' ? 'desc' : 'asc';
      return {
        activeSort: { key, dir },
        filters: { ...s.filters, sortBy: key, sortDir: dir },
      };
    });
    get().fetchSubmissions();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchSubmissions();
  },

  clearFilters: () => {
    set({ filters: { ...initialFilters }, currentPage: 1 });
    get().fetchSubmissions();
  },

  // ── Selection ─────────────────────────────────────────────────────────────

  toggleSelectSubmission: (id) =>
    set((s) => ({
      selectedSubmissionIds: s.selectedSubmissionIds.includes(id)
        ? s.selectedSubmissionIds.filter((x) => x !== id)
        : [...s.selectedSubmissionIds, id],
    })),

  selectAllSubmissions: () =>
    set((s) => ({ selectedSubmissionIds: s.submissions.map((sub) => sub.id) })),

  clearSelection: () => set({ selectedSubmissionIds: [] }),

  // ── Review Draft ──────────────────────────────────────────────────────────

  setReviewDraft: (field, value) =>
    set((s) => ({ reviewDraft: { ...s.reviewDraft, [field]: value } })),

  resetReviewDraft: () =>
    set({
      reviewDraft: {
        score: 0, quality: 0, timeliness: 0, communication: 0, technicalDepth: 0,
        feedback: '', strengths: [], areasForImprovement: [], recommendation: '', decision: '',
      },
    }),

  // ── Schedule Form ─────────────────────────────────────────────────────────

  setScheduleField: (field, value) =>
    set((s) => ({ scheduleFormData: { ...s.scheduleFormData, [field]: value } })),

  resetScheduleForm: () =>
    set({
      scheduleFormData: {
        internId: '', type: 'one-on-one', title: '', scheduledAt: '',
        durationMins: 30, location: 'google-meet', meetingLink: '', notes: '',
      },
    }),

  // ── History Filters ───────────────────────────────────────────────────────

  setHistoryFilter: (key, value) => {
    set((s) => ({ historyFilters: { ...s.historyFilters, [key]: value } }));
    get().fetchReviewHistory();
  },

  clearHistoryFilters: () => {
    set({ historyFilters: { ...initialHistoryFilters } });
    get().fetchReviewHistory();
  },

  // ── Modals & Drawers ──────────────────────────────────────────────────────

  openDetailsDrawer: (submission) =>
    set({ selectedSubmission: submission, isDetailsDrawerOpen: true }),

  closeDetailsDrawer: () =>
    set({ isDetailsDrawerOpen: false, selectedSubmission: null }),

  openReviewModal: (submission) => {
    set({ selectedSubmission: submission, isReviewModalOpen: true });
    get().resetReviewDraft();
  },

  closeReviewModal: () =>
    set({ isReviewModalOpen: false }),

  openSchedulerModal: (prefill = null) => {
    if (prefill) {
      set((s) => ({
        scheduleFormData: { ...s.scheduleFormData, internId: prefill.internId || '', title: prefill.title || '' },
      }));
    }
    set({ isSchedulerModalOpen: true });
  },

  closeSchedulerModal: () =>
    set({ isSchedulerModalOpen: false }),

  openConfirm: (submissionId, action) =>
    set({
      confirmTarget: { submissionId, action },
      isRejectConfirmOpen: action === 'reject',
      isApproveConfirmOpen: action === 'approve',
    }),

  closeConfirm: () =>
    set({ confirmTarget: null, isRejectConfirmOpen: false, isApproveConfirmOpen: false }),

  selectOnboardingIntern: (intern) =>
    set({ selectedOnboardingIntern: intern }),

  clearOnboardingIntern: () =>
    set({ selectedOnboardingIntern: null, selectedOnboardingStep: null }),

  // ── Async Actions ─────────────────────────────────────────────────────────

  /**
   * Load dashboard KPIs and initial data.
   */
  loadDashboard: async () => {
    set((s) => ({ loading: { ...s.loading, dashboard: true } }));
    try {
      const [kpis] = await Promise.all([
        reviewService.fetchReviewKPIs(),
        get().fetchSubmissions(),
        get().fetchScheduledReviews(),
      ]);
      set((s) => ({ kpis, loading: { ...s.loading, dashboard: false } }));
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, dashboard: false } }));
    }
  },

  /**
   * Fetch submissions queue with current filters.
   */
  fetchSubmissions: async () => {
    const { filters, currentPage, pageSize } = get();
    set((s) => ({ loading: { ...s.loading, submissions: true }, errors: { ...s.errors, submissions: null } }));
    try {
      const result = await reviewService.fetchSubmissionsQueue({
        ...filters,
        page: currentPage,
        pageSize,
      });
      set((s) => ({
        submissions: result.data,
        totalSubmissions: result.total,
        totalPages: result.totalPages,
        loading: { ...s.loading, submissions: false },
      }));
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, submissions: err.message },
        loading: { ...s.loading, submissions: false },
      }));
    }
  },

  /**
   * Submit a review (approve / needs-revision / rejected).
   */
  submitReview: async (submissionId, reviewData) => {
    set((s) => ({ loading: { ...s.loading, reviewAction: true }, errors: { ...s.errors, reviewAction: null } }));
    try {
      await reviewService.submitTaskReview(submissionId, reviewData);
      // Optimistically update the submission status
      set((s) => ({
        submissions: s.submissions.map((sub) =>
          sub.id === submissionId
            ? { ...sub, status: reviewData.decision, score: reviewData.score, reviewedAt: new Date().toISOString() }
            : sub
        ),
        loading: { ...s.loading, reviewAction: false },
        isReviewModalOpen: false,
        isDetailsDrawerOpen: false,
      }));
      // Refresh KPIs
      const kpis = await reviewService.fetchReviewKPIs();
      set({ kpis });
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, reviewAction: err.message },
        loading: { ...s.loading, reviewAction: false },
      }));
      throw err;
    }
  },

  /**
   * Save a review as draft.
   */
  saveReviewDraft: async (submissionId) => {
    const { reviewDraft } = get();
    set((s) => ({ loading: { ...s.loading, reviewAction: true } }));
    try {
      await reviewService.saveReviewDraft(submissionId, reviewDraft);
      set((s) => ({ loading: { ...s.loading, reviewAction: false } }));
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, reviewAction: false } }));
      throw err;
    }
  },

  /**
   * Fetch onboarding approval queue.
   */
  fetchOnboardingApprovals: async () => {
    set((s) => ({ loading: { ...s.loading, onboarding: true }, errors: { ...s.errors, onboarding: null } }));
    try {
      const data = await reviewService.fetchOnboardingApprovals();
      set((s) => ({ onboardingQueue: data, loading: { ...s.loading, onboarding: false } }));
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, onboarding: err.message },
        loading: { ...s.loading, onboarding: false },
      }));
    }
  },

  /**
   * Approve or reject an onboarding step.
   */
  updateOnboardingStep: async (internId, stepId, decision, notes = '') => {
    set((s) => ({ loading: { ...s.loading, onboardingAction: true }, errors: { ...s.errors, onboardingAction: null } }));
    try {
      await reviewService.updateOnboardingStep(internId, stepId, decision, notes);
      const now = new Date().toISOString();
      set((s) => ({
        onboardingQueue: s.onboardingQueue.map((intern) => {
          if (intern.internId !== internId) return intern;
          const updatedSteps = intern.steps.map((step) =>
            step.id === stepId
              ? { ...step, status: decision, reviewedAt: now, reviewedBy: 'Marcus Rodriguez', notes }
              : step
          );
          const totalRequired = updatedSteps.filter((st) => st.required).length;
          const approvedRequired = updatedSteps.filter((st) => st.required && st.status === 'approved').length;
          const progress = totalRequired > 0 ? Math.round((approvedRequired / totalRequired) * 100) : 0;
          const newAuditEntry = {
            id: `log-${Date.now()}`,
            action: decision,
            stepTitle: intern.steps.find((st) => st.id === stepId)?.title || '',
            performedBy: 'Marcus Rodriguez',
            timestamp: now,
            reason: notes || undefined,
          };
          return {
            ...intern,
            steps: updatedSteps,
            overallProgress: progress,
            status: progress === 100 ? 'completed' : 'in-progress',
            auditLog: [newAuditEntry, ...intern.auditLog],
          };
        }),
        loading: { ...s.loading, onboardingAction: false },
        selectedOnboardingStep: null,
      }));
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, onboardingAction: err.message },
        loading: { ...s.loading, onboardingAction: false },
      }));
      throw err;
    }
  },

  /**
   * Fetch upcoming and past scheduled reviews.
   */
  fetchScheduledReviews: async () => {
    set((s) => ({ loading: { ...s.loading, schedule: true }, errors: { ...s.errors, schedule: null } }));
    try {
      const data = await reviewService.fetchScheduledReviews();
      set((s) => ({ scheduledReviews: data, loading: { ...s.loading, schedule: false } }));
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, schedule: err.message },
        loading: { ...s.loading, schedule: false },
      }));
    }
  },

  /**
   * Create a new scheduled review.
   */
  createScheduledReview: async () => {
    const { scheduleFormData } = get();
    set((s) => ({ loading: { ...s.loading, scheduleAction: true }, errors: { ...s.errors, scheduleAction: null } }));
    try {
      const newReview = await reviewService.scheduleReview(scheduleFormData);
      set((s) => ({
        scheduledReviews: [newReview, ...s.scheduledReviews],
        loading: { ...s.loading, scheduleAction: false },
        isSchedulerModalOpen: false,
      }));
      get().resetScheduleForm();
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, scheduleAction: err.message },
        loading: { ...s.loading, scheduleAction: false },
      }));
      throw err;
    }
  },

  /**
   * Cancel a scheduled review.
   */
  cancelScheduledReview: async (scheduleId) => {
    set((s) => ({ loading: { ...s.loading, scheduleAction: true } }));
    try {
      await reviewService.cancelScheduledReview(scheduleId);
      set((s) => ({
        scheduledReviews: s.scheduledReviews.filter((r) => r.id !== scheduleId),
        loading: { ...s.loading, scheduleAction: false },
      }));
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, scheduleAction: false } }));
      throw err;
    }
  },

  /**
   * Fetch review history with current history filters.
   */
  fetchReviewHistory: async () => {
    const { historyFilters } = get();
    set((s) => ({ loading: { ...s.loading, history: true }, errors: { ...s.errors, history: null } }));
    try {
      const data = await reviewService.fetchReviewHistory(historyFilters);
      set((s) => ({ reviewHistory: data, loading: { ...s.loading, history: false } }));
    } catch (err) {
      set((s) => ({
        errors: { ...s.errors, history: err.message },
        loading: { ...s.loading, history: false },
      }));
    }
  },

  /**
   * Perform a bulk action on selected submissions.
   */
  bulkAction: async (action) => {
    const { selectedSubmissionIds } = get();
    if (!selectedSubmissionIds.length) return;

    set((s) => ({ loading: { ...s.loading, bulkAction: true } }));
    try {
      await reviewService.bulkSubmissionAction(action, selectedSubmissionIds);

      if (action !== 'export') {
        const statusMap = {
          approve: 'approved',
          reject: 'rejected',
          'request-revision': 'needs-revision',
        };
        const newStatus = statusMap[action];
        if (newStatus) {
          set((s) => ({
            submissions: s.submissions.map((sub) =>
              s.selectedSubmissionIds.includes(sub.id) ? { ...sub, status: newStatus } : sub
            ),
          }));
        }
      }

      set((s) => ({ loading: { ...s.loading, bulkAction: false }, selectedSubmissionIds: [] }));
      const kpis = await reviewService.fetchReviewKPIs();
      set({ kpis });
    } catch (err) {
      set((s) => ({ loading: { ...s.loading, bulkAction: false } }));
      throw err;
    }
  },
}));
