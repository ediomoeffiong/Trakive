/**
 * @file useReviewStore.js
 * @description Zustand store for the Performance Reviews module.
 * Manages review list, review details, performance charts, development goals,
 * self-assessment state, loading flags, and errors.
 */

import { create } from 'zustand';
import { reviewService } from '../services';

export const useReviewStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────────
  reviews: [],
  currentReview: null,
  performanceTrends: [],
  radarData: [],
  performanceSummary: null,
  goals: [],
  selfAssessmentSubmitted: false,

  // ── Active filter ──────────────────────────────────────────────────────────────
  statusFilter: 'all', // 'all' | 'published' | 'scheduled' | 'pending-self-assessment'

  // ── Loading flags ──────────────────────────────────────────────────────────────
  loadingReviews: false,
  loadingReviewDetails: false,
  loadingTrends: false,
  loadingGoals: false,
  submittingSelfAssessment: false,

  // ── Errors ────────────────────────────────────────────────────────────────────
  error: null,
  reviewDetailError: null,

  // ── Setters ───────────────────────────────────────────────────────────────────
  setStatusFilter: (status) => set({ statusFilter: status }),

  clearCurrentReview: () => set({ currentReview: null, reviewDetailError: null }),

  resetSelfAssessment: () => set({ selfAssessmentSubmitted: false }),

  // ── Actions ───────────────────────────────────────────────────────────────────

  /**
   * Fetch all reviews for the intern.
   */
  fetchReviews: async () => {
    set({ loadingReviews: true, error: null });
    try {
      const reviews = await reviewService.getReviews();
      set({ reviews, loadingReviews: false });
    } catch (err) {
      set({ error: err.message, loadingReviews: false });
    }
  },

  /**
   * Fetch a single review by ID, including its timeline.
   */
  fetchReviewDetails: async (reviewId) => {
    set({ loadingReviewDetails: true, reviewDetailError: null, currentReview: null });
    try {
      const review = await reviewService.getReviewById(reviewId);
      set({ currentReview: review, loadingReviewDetails: false });
    } catch (err) {
      set({ reviewDetailError: err.message, loadingReviewDetails: false });
    }
  },

  /**
   * Submit the intern's self-assessment for a given review.
   */
  submitSelfAssessment: async (reviewId, formData) => {
    set({ submittingSelfAssessment: true, error: null });
    try {
      await reviewService.submitSelfAssessment(reviewId, formData);
      set({ submittingSelfAssessment: false, selfAssessmentSubmitted: true });

      // Optimistically update the review status in the list
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === reviewId ? { ...r, status: 'scheduled' } : r
        ),
      }));
    } catch (err) {
      set({ error: err.message, submittingSelfAssessment: false });
      throw err;
    }
  },

  /**
   * Fetch performance trend data for charts.
   */
  fetchPerformanceTrends: async () => {
    set({ loadingTrends: true, error: null });
    try {
      const { trends, radarData, summary } = await reviewService.getPerformanceTrends();
      set({
        performanceTrends: trends,
        radarData,
        performanceSummary: summary,
        loadingTrends: false,
      });
    } catch (err) {
      set({ error: err.message, loadingTrends: false });
    }
  },

  /**
   * Fetch intern development goals.
   */
  fetchDevelopmentGoals: async () => {
    set({ loadingGoals: true, error: null });
    try {
      const goals = await reviewService.getDevelopmentGoals();
      set({ goals, loadingGoals: false });
    } catch (err) {
      set({ error: err.message, loadingGoals: false });
    }
  },
}));

/**
 * Derived selector: returns reviews filtered by the active status filter.
 */
export const getFilteredReviews = (state) => {
  const { reviews, statusFilter } = state;
  if (statusFilter === 'all') return reviews;
  return reviews.filter((r) => r.status === statusFilter);
};
