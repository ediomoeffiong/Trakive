/**
 * @file useOnboardingStatus.js
 * @description Centralized Zustand store for Intern Onboarding contextual status and navigation visibility.
 * Source of truth: Backend /api/v1/onboarding/documents.
 */

import { create } from 'zustand';
import api from '../services/api';
import { useAppStore } from './useAppStore';

const REQUIRED_COUNT = 3;

export const useOnboardingStatus = create((set, get) => ({
  status: 'not_started', // 'not_started' | 'in_progress' | 'pending' | 'action_required' | 'completed'
  isCompleted: false,
  shouldShowOnboarding: true,
  badgeText: 'Action Required',
  badgeVariant: 'warning', // 'danger' | 'warning' | 'neutral'
  actionMessage: null,
  rejectionReason: null,
  approvedCount: 0,
  totalRequired: REQUIRED_COUNT,
  checklist: [],
  documents: [],
  internshipRecordId: null,
  internshipNumber: 1,
  isLoading: false,
  error: null,

  fetchStatus: async (explicitInternshipRecordId = null) => {
    const user = useAppStore.getState()?.user;
    if (!user || user.role !== 'Intern') {
      set({ shouldShowOnboarding: false, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (explicitInternshipRecordId) {
        params.internship_record_id = explicitInternshipRecordId;
      }
      const res = await api.get('/onboarding/documents', { params });
      const payload = res?.data?.data || res?.data || {};
      const checklist = payload.checklist || [];
      const approvedCount = payload.approved_count ?? checklist.filter((item) => item.review_status === 'approved').length;
      const totalRequired = payload.total_required ?? REQUIRED_COUNT;
      const submittedCount = checklist.filter((item) => item.submitted).length;
      const missingCount = Math.max(0, totalRequired - submittedCount);

      const rejectedItems = checklist.filter(
        (item) => item.review_status === 'rejected' || item.review_status === 'resubmission_required'
      );
      const hasRejection = rejectedItems.length > 0;
      const allSubmitted = checklist.length > 0 && checklist.every((item) => item.submitted);
      const allApproved = approvedCount >= totalRequired && totalRequired > 0;

      // Determine standard 5 onboarding states
      let computedStatus = payload.status;
      if (!computedStatus) {
        if (allApproved) computedStatus = 'completed';
        else if (hasRejection) computedStatus = 'action_required';
        else if (allSubmitted) computedStatus = 'pending';
        else if (submittedCount > 0) computedStatus = 'in_progress';
        else computedStatus = 'not_started';
      }

      const isCompleted = computedStatus === 'completed';
      const shouldShowOnboarding = !isCompleted;

      let badgeText = null;
      let badgeVariant = 'neutral';
      let actionMessage = null;

      if (hasRejection) {
        badgeText = 'Action Required';
        badgeVariant = 'danger';
        const firstRejected = rejectedItems[0];
        const notes = firstRejected.document?.review_notes ? `: "${firstRejected.document.review_notes}"` : '';
        actionMessage = `${firstRejected.title} rejected${notes} — resubmission required`;
      } else if (computedStatus === 'pending') {
        badgeText = 'Pending';
        badgeVariant = 'warning';
        actionMessage = 'All documents submitted — pending supervisor review';
      } else if (!isCompleted) {
        badgeText = 'Action Required';
        badgeVariant = 'warning';
        if (missingCount > 0) {
          actionMessage = `${missingCount} document${missingCount > 1 ? 's' : ''} awaiting submission`;
        } else {
          actionMessage = 'Complete your onboarding requirements';
        }
      }

      set({
        status: computedStatus,
        isCompleted,
        shouldShowOnboarding,
        badgeText,
        badgeVariant,
        actionMessage,
        rejectionReason: payload.rejection_reason || (hasRejection ? rejectedItems[0].document?.review_notes : null),
        approvedCount,
        totalRequired,
        checklist,
        documents: payload.documents || [],
        internshipRecordId: payload.internship_record_id || null,
        internshipNumber: payload.internship_number || 1,
        isLoading: false,
      });
    } catch (err) {
      // Fallback: keep previous or default to show Onboarding so user is never locked out
      set({ isLoading: false, error: err.message });
    }
  },
}));
