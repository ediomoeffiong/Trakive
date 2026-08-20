/**
 * @file useInternManagementStore.js
 * @description Dedicated Zustand store for the Supervisor Intern Management module.
 * Manages intern list, selected intern, profile data, progress, documents, notes,
 * activity, performance, filters, search, pagination, bulk selection, loading, and errors.
 *
 * Architecture note: All async calls are isolated in internManagementService.js.
 * Swapping mock services for real API calls requires only changes in that service file.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { internManagementService } from '../services/internManagementService';

export const useInternManagementStore = create(
  devtools(
    (set, get) => ({
      // ── Intern List ────────────────────────────────────────────────────────
      internList: [],
      kpis: [],
      totalInterns: 0,

      // ── Selected Intern & Profile ──────────────────────────────────────────
      selectedInternId: null,
      internProfile: null,

      // ── Tab Data ──────────────────────────────────────────────────────────
      progress: null,
      documents: [],
      notes: [],
      activity: [],
      performance: null,

      // ── Filters ───────────────────────────────────────────────────────────
      filters: {
        department: 'All',
        status: 'All',
        performanceMin: '',
        performanceMax: '',
        onboardingStatus: 'All',
        reviewStatus: 'All',
        batch: 'All',
      },
      search: '',
      activeFilterChips: [],

      // ── Pagination ────────────────────────────────────────────────────────
      currentPage: 1,
      pageSize: 8,

      // ── Bulk Selection ────────────────────────────────────────────────────
      selectedInterns: [],

      // ── Active Tab ────────────────────────────────────────────────────────
      activeTab: 'overview',

      // ── Loading States ────────────────────────────────────────────────────
      loading: {
        list: false,
        profile: false,
        progress: false,
        documents: false,
        notes: false,
        activity: false,
        performance: false,
        saveNote: false,
      },

      // ── Errors ────────────────────────────────────────────────────────────
      errors: {
        list: null,
        profile: null,
        progress: null,
        documents: null,
        notes: null,
        activity: null,
        performance: null,
      },

      // ── Actions ───────────────────────────────────────────────────────────

      /**
       * Load the intern list with current filters & search applied.
       */
      loadInternList: async () => {
        const { filters, search } = get();
        set((s) => ({ loading: { ...s.loading, list: true }, errors: { ...s.errors, list: null } }));
        try {
          const res = await internManagementService.fetchInternList({ ...filters, search });
          set((s) => ({
            internList: res.interns,
            totalInterns: res.total,
            kpis: res.kpis,
            currentPage: 1,
            loading: { ...s.loading, list: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, list: false },
            errors: { ...s.errors, list: err.message || 'Failed to load interns' },
          }));
        }
      },

      /**
       * Load a single intern's full profile.
       */
      loadInternProfile: async (internId) => {
        set((s) => ({
          selectedInternId: internId,
          internProfile: null,
          loading: { ...s.loading, profile: true },
          errors: { ...s.errors, profile: null },
        }));
        try {
          const res = await internManagementService.fetchInternProfile(internId);
          set((s) => ({
            internProfile: res.profile,
            loading: { ...s.loading, profile: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, profile: false },
            errors: { ...s.errors, profile: err.message || 'Failed to load profile' },
          }));
        }
      },

      /**
       * Load intern progress data for a given intern.
       */
      loadInternProgress: async (internId) => {
        set((s) => ({
          progress: null,
          loading: { ...s.loading, progress: true },
          errors: { ...s.errors, progress: null },
        }));
        try {
          const res = await internManagementService.fetchInternProgress(internId);
          set((s) => ({
            progress: res.progress,
            loading: { ...s.loading, progress: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, progress: false },
            errors: { ...s.errors, progress: err.message },
          }));
        }
      },

      /**
       * Load intern documents.
       */
      loadInternDocuments: async (internId) => {
        set((s) => ({
          documents: [],
          loading: { ...s.loading, documents: true },
          errors: { ...s.errors, documents: null },
        }));
        try {
          const res = await internManagementService.fetchInternDocuments(internId);
          set((s) => ({
            documents: res.documents,
            loading: { ...s.loading, documents: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, documents: false },
            errors: { ...s.errors, documents: err.message },
          }));
        }
      },

      /**
       * Load intern activity timeline.
       */
      loadInternActivity: async (internId) => {
        set((s) => ({
          activity: [],
          loading: { ...s.loading, activity: true },
          errors: { ...s.errors, activity: null },
        }));
        try {
          const res = await internManagementService.fetchInternActivity(internId);
          set((s) => ({
            activity: res.activities,
            loading: { ...s.loading, activity: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, activity: false },
            errors: { ...s.errors, activity: err.message },
          }));
        }
      },

      /**
       * Load intern performance snapshot.
       */
      loadInternPerformance: async (internId) => {
        set((s) => ({
          performance: null,
          loading: { ...s.loading, performance: true },
          errors: { ...s.errors, performance: null },
        }));
        try {
          const res = await internManagementService.fetchInternPerformance(internId);
          set((s) => ({
            performance: res.performance,
            loading: { ...s.loading, performance: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, performance: false },
            errors: { ...s.errors, performance: err.message },
          }));
        }
      },

      /**
       * Load supervisor notes for an intern.
       */
      loadNotes: async (internId) => {
        set((s) => ({
          notes: [],
          loading: { ...s.loading, notes: true },
          errors: { ...s.errors, notes: null },
        }));
        try {
          const res = await internManagementService.fetchSupervisorNotes(internId);
          set((s) => ({
            notes: res.notes,
            loading: { ...s.loading, notes: false },
          }));
        } catch (err) {
          set((s) => ({
            loading: { ...s.loading, notes: false },
            errors: { ...s.errors, notes: err.message },
          }));
        }
      },

      /**
       * Save (create or update) a note.
       */
      saveNote: async (internId, noteData) => {
        set((s) => ({ loading: { ...s.loading, saveNote: true } }));
        try {
          const res = await internManagementService.saveNote(internId, noteData);
          const { note } = res;
          set((s) => {
            const existing = s.notes.find((n) => n.id === note.id);
            const updatedNotes = existing
              ? s.notes.map((n) => (n.id === note.id ? note : n))
              : [note, ...s.notes];
            return { notes: updatedNotes, loading: { ...s.loading, saveNote: false } };
          });
          return { success: true, note };
        } catch (err) {
          set((s) => ({ loading: { ...s.loading, saveNote: false } }));
          return { success: false, error: err.message };
        }
      },

      /**
       * Delete a note.
       */
      deleteNote: async (internId, noteId) => {
        try {
          await internManagementService.deleteNote(internId, noteId);
          set((s) => ({ notes: s.notes.filter((n) => n.id !== noteId) }));
          return { success: true };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      /**
       * Toggle pin state of a note (optimistic update).
       */
      pinNote: async (internId, noteId) => {
        // Optimistic update
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId ? { ...n, isPinned: !n.isPinned } : n,
          ),
        }));
        try {
          await internManagementService.togglePinNote(internId, noteId);
        } catch {
          // Revert on failure
          set((s) => ({
            notes: s.notes.map((n) =>
              n.id === noteId ? { ...n, isPinned: !n.isPinned } : n,
            ),
          }));
        }
      },

      // ── Filter & Search Actions ────────────────────────────────────────────

      setSearch: (search) => {
        set({ search, currentPage: 1 });
        get().loadInternList();
      },

      setFilter: (key, value) => {
        set((s) => ({
          filters: { ...s.filters, [key]: value },
          currentPage: 1,
        }));
        get()._updateActiveFilterChips();
        get().loadInternList();
      },

      clearFilter: (key) => {
        const defaults = {
          department: 'All',
          status: 'All',
          performanceMin: '',
          performanceMax: '',
          onboardingStatus: 'All',
          reviewStatus: 'All',
          batch: 'All',
        };
        set((s) => ({
          filters: { ...s.filters, [key]: defaults[key] },
          currentPage: 1,
        }));
        get()._updateActiveFilterChips();
        get().loadInternList();
      },

      clearAllFilters: () => {
        set({
          filters: {
            department: 'All',
            status: 'All',
            performanceMin: '',
            performanceMax: '',
            onboardingStatus: 'All',
            reviewStatus: 'All',
            batch: 'All',
          },
          search: '',
          activeFilterChips: [],
          currentPage: 1,
        });
        get().loadInternList();
      },

      _updateActiveFilterChips: () => {
        const { filters } = get();
        const chips = [];
        const defaults = {
          department: 'All',
          status: 'All',
          performanceMin: '',
          performanceMax: '',
          onboardingStatus: 'All',
          reviewStatus: 'All',
          batch: 'All',
        };
        const labels = {
          department: 'Dept',
          status: 'Status',
          performanceMin: 'Score ≥',
          performanceMax: 'Score ≤',
          onboardingStatus: 'Onboarding',
          reviewStatus: 'Review',
          batch: 'Batch',
        };
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== defaults[key] && value !== '') {
            chips.push({ key, label: `${labels[key]}: ${value}` });
          }
        });
        set({ activeFilterChips: chips });
      },

      // ── Pagination ────────────────────────────────────────────────────────

      setPage: (page) => set({ currentPage: page }),

      // ── Bulk Selection ────────────────────────────────────────────────────

      toggleSelectIntern: (internId) => {
        set((s) => {
          const isSelected = s.selectedInterns.includes(internId);
          return {
            selectedInterns: isSelected
              ? s.selectedInterns.filter((id) => id !== internId)
              : [...s.selectedInterns, internId],
          };
        });
      },

      selectAllInterns: () => {
        set((s) => ({
          selectedInterns: s.internList.map((i) => i.id),
        }));
      },

      clearSelection: () => set({ selectedInterns: [] }),

      // ── Tab Navigation ────────────────────────────────────────────────────

      setActiveTab: (tab) => set({ activeTab: tab }),

      // ── Reset ─────────────────────────────────────────────────────────────

      resetProfileData: () => {
        set({
          selectedInternId: null,
          internProfile: null,
          progress: null,
          documents: [],
          notes: [],
          activity: [],
          performance: null,
          activeTab: 'overview',
        });
      },
    }),
    { name: 'InternManagementStore' },
  ),
);

export default useInternManagementStore;
