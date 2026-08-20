/**
 * @file useHRStore.js
 * @description Zustand store for the HR Administrator Portal.
 * Manages: dashboard, interns, supervisors, departments, batches, announcements, users.
 */

import { create } from 'zustand';
import {
  fetchHRDashboard,
  fetchHRInterns,
  assignSupervisorToIntern,
  updateInternStatus,
  fetchHRSupervisors,
  createSupervisor,
  updateSupervisor,
  assignDepartmentToSupervisor,
  fetchHRDepartments,
  createDepartment,
  updateDepartment,
  fetchHRBatches,
  createBatch,
  assignInternsToBatch,
  createAnnouncement,
  updateAnnouncement,
  togglePublishAnnouncement,
  deleteAnnouncement,
  fetchHRUsers,
  toggleUserStatus,
  resetUserPassword,
} from '../services/hrService';

// ── Initial announcement data ──────────────────────────────────────────────────
const initialAnnouncements = [
  {
    id: 'ann-001',
    title: 'Q3 2026 Performance Review Period — Important Dates',
    content:
      'The Q3 performance review period will run from July 28 to August 15, 2026. All supervisors are required to complete mid-term evaluations by August 10. Interns will receive self-assessment forms via email.',
    status: 'published',
    targetAudience: ['All'],
    pinned: true,
    author: 'HR Admin',
    category: 'Performance',
    createdAt: '2026-07-31T08:00:00Z',
    updatedAt: '2026-07-31T08:00:00Z',
    viewCount: 124,
  },
  {
    id: 'ann-002',
    title: 'Batch 2026-B4 Onboarding Completion Reminder',
    content:
      'Interns in Batch 2026-B4 are reminded to complete all pending onboarding steps before August 1, 2026. Pending steps include ID Verification and Contract Signing. Please contact HR for support.',
    status: 'published',
    targetAudience: ['Interns'],
    pinned: false,
    author: 'HR Admin',
    category: 'Onboarding',
    createdAt: '2026-07-29T10:00:00Z',
    updatedAt: '2026-07-29T10:00:00Z',
    viewCount: 87,
  },
  {
    id: 'ann-003',
    title: 'Updated Internship Policy — Remote Work Guidelines',
    content:
      'Effective August 1, 2026, interns may work remotely up to 2 days per week with supervisor approval. Please review the updated Remote Work Policy document in the portal.',
    status: 'draft',
    targetAudience: ['Interns', 'Supervisors'],
    pinned: false,
    author: 'HR Admin',
    category: 'Policy',
    createdAt: '2026-07-28T14:30:00Z',
    updatedAt: '2026-07-30T09:00:00Z',
    viewCount: 0,
  },
  {
    id: 'ann-004',
    title: 'Supervisor Training Workshop — August 5, 2026',
    content:
      'A mandatory training workshop for all supervisors will be held on August 5, 2026 from 10:00 AM – 1:00 PM (WAT). The session will cover performance evaluation best practices and the new review rubric. Zoom link to follow.',
    status: 'published',
    targetAudience: ['Supervisors'],
    pinned: true,
    author: 'HR Admin',
    category: 'Training',
    createdAt: '2026-07-25T11:00:00Z',
    updatedAt: '2026-07-25T11:00:00Z',
    viewCount: 56,
  },
  {
    id: 'ann-005',
    title: 'New Benefits Package — Health Insurance Update',
    content:
      'We are pleased to announce that effective August 2026, all active interns will be covered under the company HMO health insurance plan. Enrollment forms will be distributed by HR shortly.',
    status: 'published',
    targetAudience: ['All'],
    pinned: false,
    author: 'HR Admin',
    category: 'Benefits',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
    viewCount: 210,
  },
];

// ── Store ──────────────────────────────────────────────────────────────────────

const useHRStore = create((set, get) => ({
  // ── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,

  loadDashboard: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    try {
      const data = await fetchHRDashboard();
      set({ dashboard: data, dashboardLoading: false });
    } catch (err) {
      set({ dashboardLoading: false, dashboardError: err.message || 'Failed to load dashboard.' });
    }
  },

  // ── Interns ────────────────────────────────────────────────────────────────
  interns: [],
  internTotal: 0,
  internLoading: false,
  internError: null,
  internFilters: { search: '', department: '', status: '', batchId: '' },
  selectedIntern: null,

  setInternFilters: (filters) => set((s) => ({ internFilters: { ...s.internFilters, ...filters } })),

  loadInterns: async (params) => {
    set({ internLoading: true, internError: null });
    try {
      const merged = { ...get().internFilters, ...params };
      const { data, total } = await fetchHRInterns(merged);
      set({ interns: data, internTotal: total, internLoading: false });
    } catch (err) {
      set({ internLoading: false, internError: err.message || 'Failed to load interns.' });
    }
  },

  setSelectedIntern: (intern) => set({ selectedIntern: intern }),

  assignSupervisor: async (internId, supervisorId) => {
    try {
      await assignSupervisorToIntern(internId, supervisorId);
      return true;
    } catch {
      return false;
    }
  },

  changeInternStatus: async (internId, status) => {
    try {
      await updateInternStatus(internId, status);
      set((s) => ({
        interns: s.interns.map((i) => (i.id === internId ? { ...i, status } : i)),
      }));
      return true;
    } catch {
      return false;
    }
  },

  // ── Supervisors ────────────────────────────────────────────────────────────
  supervisors: [],
  supervisorTotal: 0,
  supervisorLoading: false,
  supervisorError: null,
  supervisorFilters: { search: '', department: '', status: '' },
  selectedSupervisor: null,

  setSupervisorFilters: (filters) =>
    set((s) => ({ supervisorFilters: { ...s.supervisorFilters, ...filters } })),

  loadSupervisors: async (params) => {
    set({ supervisorLoading: true, supervisorError: null });
    try {
      const merged = { ...get().supervisorFilters, ...params };
      const { data, total } = await fetchHRSupervisors(merged);
      set({ supervisors: data, supervisorTotal: total, supervisorLoading: false });
    } catch (err) {
      set({ supervisorLoading: false, supervisorError: err.message || 'Failed to load supervisors.' });
    }
  },

  setSelectedSupervisor: (supervisor) => set({ selectedSupervisor: supervisor }),

  addSupervisor: async (data) => {
    try {
      const result = await createSupervisor(data);
      if (result.success) {
        set((s) => ({ supervisors: [result.data, ...s.supervisors] }));
      }
      return result;
    } catch (err) {
      return { success: false };
    }
  },

  editSupervisor: async (supervisorId, data) => {
    try {
      const result = await updateSupervisor(supervisorId, data);
      if (result.success) {
        set((s) => ({
          supervisors: s.supervisors.map((sup) =>
            sup.id === supervisorId ? { ...sup, ...data } : sup
          ),
        }));
      }
      return result;
    } catch {
      return { success: false };
    }
  },

  reassignSupervisorDept: async (supervisorId, departmentId) => {
    try {
      await assignDepartmentToSupervisor(supervisorId, departmentId);
      return true;
    } catch {
      return false;
    }
  },

  // ── Departments ────────────────────────────────────────────────────────────
  departments: [],
  departmentTotal: 0,
  departmentLoading: false,
  departmentError: null,
  departmentSearch: '',
  selectedDepartment: null,

  setDepartmentSearch: (q) => set({ departmentSearch: q }),
  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),

  loadDepartments: async (params) => {
    set({ departmentLoading: true, departmentError: null });
    try {
      const { data, total } = await fetchHRDepartments({ search: get().departmentSearch, ...params });
      set({ departments: data, departmentTotal: total, departmentLoading: false });
    } catch (err) {
      set({ departmentLoading: false, departmentError: err.message || 'Failed to load departments.' });
    }
  },

  addDepartment: async (data) => {
    try {
      const result = await createDepartment(data);
      if (result.success) {
        set((s) => ({ departments: [...s.departments, result.data] }));
      }
      return result;
    } catch {
      return { success: false };
    }
  },

  editDepartment: async (departmentId, data) => {
    try {
      const result = await updateDepartment(departmentId, data);
      if (result.success) {
        set((s) => ({
          departments: s.departments.map((d) => (d.id === departmentId ? { ...d, ...data } : d)),
        }));
      }
      return result;
    } catch {
      return { success: false };
    }
  },

  // ── Batches ────────────────────────────────────────────────────────────────
  batches: [],
  batchTotal: 0,
  batchLoading: false,
  batchError: null,
  batchStatusFilter: '',
  selectedBatch: null,

  setBatchStatusFilter: (status) => set({ batchStatusFilter: status }),
  setSelectedBatch: (batch) => set({ selectedBatch: batch }),

  loadBatches: async (params) => {
    set({ batchLoading: true, batchError: null });
    try {
      const { data, total } = await fetchHRBatches({ status: get().batchStatusFilter, ...params });
      set({ batches: data, batchTotal: total, batchLoading: false });
    } catch (err) {
      set({ batchLoading: false, batchError: err.message || 'Failed to load batches.' });
    }
  },

  addBatch: async (data) => {
    try {
      const result = await createBatch(data);
      if (result.success) {
        set((s) => ({ batches: [...s.batches, result.data] }));
      }
      return result;
    } catch {
      return { success: false };
    }
  },

  assignInterns: async (batchId, internIds) => {
    try {
      const result = await assignInternsToBatch(batchId, internIds);
      if (result.success) {
        set((s) => ({
          batches: s.batches.map((b) =>
            b.id === batchId ? { ...b, totalInterns: b.totalInterns + result.assignedCount } : b
          ),
        }));
      }
      return result;
    } catch {
      return { success: false };
    }
  },

  // ── Announcements ──────────────────────────────────────────────────────────
  announcements: initialAnnouncements,
  announcementFilter: 'all', // 'all' | 'published' | 'draft'
  announcementSearch: '',
  announcementLoading: false,

  setAnnouncementFilter: (filter) => set({ announcementFilter: filter }),
  setAnnouncementSearch: (q) => set({ announcementSearch: q }),

  addAnnouncement: async (data) => {
    set({ announcementLoading: true });
    try {
      const result = await createAnnouncement(data);
      if (result.success) {
        set((s) => ({ announcements: [result.data, ...s.announcements], announcementLoading: false }));
      }
      return result;
    } catch {
      set({ announcementLoading: false });
      return { success: false };
    }
  },

  editAnnouncement: async (announcementId, data) => {
    set({ announcementLoading: true });
    try {
      const result = await updateAnnouncement(announcementId, data);
      if (result.success) {
        set((s) => ({
          announcements: s.announcements.map((a) =>
            a.id === announcementId ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
          ),
          announcementLoading: false,
        }));
      }
      return result;
    } catch {
      set({ announcementLoading: false });
      return { success: false };
    }
  },

  publishAnnouncement: async (announcementId) => {
    const ann = get().announcements.find((a) => a.id === announcementId);
    if (!ann) return false;
    try {
      const result = await togglePublishAnnouncement(announcementId, ann.status);
      if (result.success) {
        set((s) => ({
          announcements: s.announcements.map((a) =>
            a.id === announcementId ? { ...a, status: result.status } : a
          ),
        }));
      }
      return result.success;
    } catch {
      return false;
    }
  },

  removeAnnouncement: async (announcementId) => {
    try {
      const result = await deleteAnnouncement(announcementId);
      if (result.success) {
        set((s) => ({
          announcements: s.announcements.filter((a) => a.id !== announcementId),
        }));
      }
      return result.success;
    } catch {
      return false;
    }
  },

  togglePinAnnouncement: (announcementId) => {
    set((s) => ({
      announcements: s.announcements.map((a) =>
        a.id === announcementId ? { ...a, pinned: !a.pinned } : a
      ),
    }));
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  users: [],
  userTotal: 0,
  userLoading: false,
  userError: null,
  userFilters: { search: '', role: 'all', status: '' },

  setUserFilters: (filters) => set((s) => ({ userFilters: { ...s.userFilters, ...filters } })),

  loadUsers: async (params) => {
    set({ userLoading: true, userError: null });
    try {
      const merged = { ...get().userFilters, ...params };
      const { data, total } = await fetchHRUsers(merged);
      set({ users: data, userTotal: total, userLoading: false });
    } catch (err) {
      set({ userLoading: false, userError: err.message || 'Failed to load users.' });
    }
  },

  toggleUser: async (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (!user) return false;
    try {
      const result = await toggleUserStatus(userId, user.status);
      if (result.success) {
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, status: result.status } : u)),
        }));
      }
      return result.success;
    } catch {
      return false;
    }
  },

  sendPasswordReset: async (userId) => {
    try {
      const result = await resetUserPassword(userId);
      return result.success;
    } catch {
      return false;
    }
  },
}));

export default useHRStore;

// Named selectors
export const useHRDashboard = () => useHRStore((s) => s.dashboard);
export const useHRInterns = () => useHRStore((s) => s.interns);
export const useHRSupervisors = () => useHRStore((s) => s.supervisors);
export const useHRDepartments = () => useHRStore((s) => s.departments);
export const useHRBatches = () => useHRStore((s) => s.batches);
export const useHRAnnouncements = () => useHRStore((s) => s.announcements);
export const useHRUsers = () => useHRStore((s) => s.users);
