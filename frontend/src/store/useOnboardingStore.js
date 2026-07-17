/**
 * @file useOnboardingStore.js
 * @description Zustand store for intern onboarding state, tracking completion and mock files.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { onboardingService } from '../services/onboardingService';

export const useOnboardingStore = create(
  devtools(
    (set, get) => ({
      steps: [],
      loading: false,
      error: null,
      uploadProgress: {}, // Format: { [stepId]: progressValue }
      celebrated: false,

      // Fetch all steps
      fetchSteps: async () => {
        set({ loading: true, error: null });
        try {
          const checklist = await onboardingService.getChecklist();
          set({ steps: checklist, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      // Update step status
      updateStepStatus: async (stepId, status) => {
        try {
          const updatedStep = await onboardingService.updateStepStatus(stepId, status);
          set((state) => ({
            steps: state.steps.map((s) => (s.id === stepId ? updatedStep : s))
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // Upload file document
      uploadDocument: async (stepId, file) => {
        set((state) => ({
          uploadProgress: { ...state.uploadProgress, [stepId]: 0 }
        }));

        try {
          const { step: updatedStep } = await onboardingService.uploadDocument(
            stepId,
            file,
            (progress) => {
              set((state) => ({
                uploadProgress: { ...state.uploadProgress, [stepId]: progress }
              }));
            }
          );

          // Update store steps and clean up progress
          set((state) => {
            const nextProgress = { ...state.uploadProgress };
            delete nextProgress[stepId];
            return {
              steps: state.steps.map((s) => (s.id === stepId ? updatedStep : s)),
              uploadProgress: nextProgress
            };
          });
        } catch (err) {
          set((state) => {
            const nextProgress = { ...state.uploadProgress };
            delete nextProgress[stepId];
            return {
              error: err.message,
              uploadProgress: nextProgress
            };
          });
          throw err;
        }
      },

      // Remove uploaded document
      removeDocument: async (stepId, docId) => {
        try {
          const updatedStep = await onboardingService.removeDocument(stepId, docId);
          set((state) => ({
            steps: state.steps.map((s) => (s.id === stepId ? updatedStep : s))
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // Simulate supervisor verification (approval/rejection)
      triggerSupervisorVerification: async (stepId, approve = true, notes = "") => {
        // Optimistic / mock loading state handled via step's own status "awaiting_verification"
        try {
          const updatedStep = await onboardingService.verifyStep(stepId, approve, notes);
          set((state) => ({
            steps: state.steps.map((s) => (s.id === stepId ? updatedStep : s))
          }));
        } catch (err) {
          set({ error: err.message });
        }
      },

      // Set celebrated status
      setCelebrated: (celebrated) => set({ celebrated }),

      // Reset onboarding steps
      resetOnboarding: async () => {
        set({ loading: true, error: null, celebrated: false });
        try {
          const checklist = await onboardingService.resetOnboarding();
          set({ steps: checklist, loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
        }
      },

      // Helper selectors (computed states inside store helper)
      getStats: () => {
        const steps = get().steps;
        if (steps.length === 0) {
          return {
            total: 0,
            completed: 0,
            verified: 0,
            remaining: 0,
            percentage: 0,
            estimatedTimeRemaining: 0
          };
        }

        const total = steps.length;
        const completed = steps.filter((s) => s.status === 'completed' || s.status === 'verified').length;
        const verified = steps.filter((s) => s.status === 'verified').length;
        const remaining = total - completed;
        const percentage = Math.round((completed / total) * 100);

        const estimatedTimeRemaining = steps
          .filter((s) => s.status !== 'completed' && s.status !== 'verified')
          .reduce((acc, curr) => acc + (curr.estimatedTime ?? curr.duration ?? 0), 0);

        return {
          total,
          completed,
          verified,
          remaining,
          percentage,
          estimatedTimeRemaining
        };
      }
    }),
    { name: 'TrakiveOnboardingStore' }
  )
);
