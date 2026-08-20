/**
 * @file useProfileStore.js
 * @description Dedicated Zustand store for Trakive's User Profile & Account Management.
 *
 * Architecture note: All service calls go through profileService so that
 * switching from mock to real API requires only updating that service file.
 */

import { create } from 'zustand';
import { profileService } from '../services/profileService';

// ── Profile Completion Calculator ─────────────────────────────────────────────

/**
 * Calculate profile completion based on filled sections.
 * Returns { percentage, completedItems, missingItems }
 */
const calculateCompletion = (profile, skills, documents) => {
  const items = [
    {
      key: 'avatar',
      label: 'Upload a profile photo',
      done: !!profile?.avatarUrl,
      priority: 'high',
    },
    {
      key: 'personal_info',
      label: 'Complete personal information',
      done: !!(profile?.phone && profile?.address && profile?.city),
      priority: 'high',
    },
    {
      key: 'bio',
      label: 'Write a short bio',
      done: !!(profile?.bio && profile?.bio.length >= 20),
      priority: 'medium',
    },
    {
      key: 'skills',
      label: 'Add at least 3 skills',
      done: skills.length >= 3,
      priority: 'medium',
    },
    {
      key: 'documents',
      label: 'Upload CV/Resume',
      done: documents.some((d) => d.type === 'CV/Resume'),
      priority: 'high',
    },
    {
      key: 'id_document',
      label: 'Upload ID document',
      done: documents.some((d) => d.type === 'ID Card'),
      priority: 'medium',
    },
  ];

  const completed = items.filter((i) => i.done);
  const missing   = items.filter((i) => !i.done);
  const percentage = Math.round((completed.length / items.length) * 100);

  return { percentage, completedItems: completed, missingItems: missing, items };
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useProfileStore = create((set, get) => ({
  // ── Data State ─────────────────────────────────────────────────────────────
  profile:       null,
  internship:    null,
  assignedInterns: null,
  skills:        [],
  achievements:  [],
  documents:     [],
  activities:    [],
  completion:    { percentage: 0, completedItems: [], missingItems: [], items: [] },

  // ── Active Tab ─────────────────────────────────────────────────────────────
  activeTab: 'overview',

  // ── Loading States ─────────────────────────────────────────────────────────
  loadingProfile:       false,
  loadingSkills:        false,
  loadingAchievements:  false,
  loadingDocuments:     false,
  loadingActivities:    false,
  loadingInternship:    false,
  loadingAssignedInterns: false,
  savingProfile:        false,
  uploadingAvatar:      false,
  avatarProgress:       0,
  uploadingDocument:    false,
  documentProgress:     0,

  // ── Error State ─────────────────────────────────────────────────────────────
  error: null,

  // ── UI Modal State ─────────────────────────────────────────────────────────
  avatarModalOpen:    false,
  editProfileOpen:    false,
  addSkillOpen:       false,
  editSkillTarget:    null, // skill object being edited
  uploadDocOpen:      false,

  // ── Initialise All Data ───────────────────────────────────────────────────

  fetchAll: async (role) => {
    const {
      fetchProfile, fetchSkills, fetchAchievements,
      fetchDocuments, fetchActivities, fetchInternship, fetchAssignedInterns,
    } = get();
    const calls = [
      fetchProfile(role),
      fetchDocuments(role),
      fetchActivities(role),
    ];
    if (role === 'Supervisor') {
      calls.push(fetchAssignedInterns());
    } else {
      calls.push(fetchSkills(), fetchAchievements(), fetchInternship());
    }
    await Promise.all(calls);
  },

  fetchProfile: async (role) => {
    set({ loadingProfile: true, error: null });
    try {
      const profile = await profileService.getProfile(role);
      const { skills, documents } = get();
      const completion = calculateCompletion(profile, skills, documents);
      set({ profile, completion, loadingProfile: false });
    } catch (err) {
      set({ error: err.message, loadingProfile: false });
    }
  },

  fetchAssignedInterns: async () => {
    set({ loadingAssignedInterns: true });
    try {
      const assignedInterns = await profileService.getAssignedInterns();
      set({ assignedInterns, loadingAssignedInterns: false });
    } catch (err) {
      set({ error: err.message, loadingAssignedInterns: false });
    }
  },

  fetchInternship: async () => {
    set({ loadingInternship: true });
    try {
      const internship = await profileService.getInternshipInfo();
      set({ internship, loadingInternship: false });
    } catch (err) {
      set({ error: err.message, loadingInternship: false });
    }
  },

  fetchSkills: async () => {
    set({ loadingSkills: true });
    try {
      const skills = await profileService.getSkills();
      const { profile, documents } = get();
      const completion = calculateCompletion(profile, skills, documents);
      set({ skills, completion, loadingSkills: false });
    } catch (err) {
      set({ error: err.message, loadingSkills: false });
    }
  },

  fetchAchievements: async () => {
    set({ loadingAchievements: true });
    try {
      const achievements = await profileService.getAchievements();
      set({ achievements, loadingAchievements: false });
    } catch (err) {
      set({ error: err.message, loadingAchievements: false });
    }
  },

  fetchDocuments: async (role) => {
    set({ loadingDocuments: true });
    try {
      const documents = await profileService.getDocuments(role);
      const { profile, skills } = get();
      const completion = calculateCompletion(profile, skills, documents);
      set({ documents, completion, loadingDocuments: false });
    } catch (err) {
      set({ error: err.message, loadingDocuments: false });
    }
  },

  fetchActivities: async (role) => {
    set({ loadingActivities: true });
    try {
      const activities = await profileService.getAccountActivity(role);
      set({ activities, loadingActivities: false });
    } catch (err) {
      set({ error: err.message, loadingActivities: false });
    }
  },

  // ── Profile Actions ───────────────────────────────────────────────────────

  updateProfile: async (updates) => {
    set({ savingProfile: true });
    try {
      const profile = await profileService.updateProfile(updates);
      const { skills, documents } = get();
      const completion = calculateCompletion(profile, skills, documents);
      set({ profile, completion, savingProfile: false });
      return profile;
    } catch (err) {
      set({ error: err.message, savingProfile: false });
      throw err;
    }
  },

  // ── Avatar Actions ────────────────────────────────────────────────────────

  uploadAvatar: async (file) => {
    set({ uploadingAvatar: true, avatarProgress: 0 });
    try {
      const result = await profileService.uploadAvatar(file, (progress) => {
        set({ avatarProgress: progress });
      });
      set((state) => ({
        profile: { ...state.profile, avatarUrl: result.avatarUrl },
        uploadingAvatar: false,
        avatarProgress: 100,
      }));
      // Recalculate completion
      const { skills, documents } = get();
      const profile = get().profile;
      const completion = calculateCompletion(profile, skills, documents);
      set({ completion });
      return result;
    } catch (err) {
      set({ error: err.message, uploadingAvatar: false });
      throw err;
    }
  },

  removeAvatar: async () => {
    try {
      await profileService.removeAvatar();
      set((state) => ({
        profile: { ...state.profile, avatarUrl: null },
      }));
      const { skills, documents } = get();
      const profile = get().profile;
      const completion = calculateCompletion(profile, skills, documents);
      set({ completion });
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // ── Skills Actions ─────────────────────────────────────────────────────────

  addSkill: async (skillData) => {
    try {
      const skill = await profileService.addSkill(skillData);
      set((state) => {
        const skills = [...state.skills, skill];
        const completion = calculateCompletion(state.profile, skills, state.documents);
        return { skills, completion };
      });
      return skill;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  updateSkill: async (skillId, updates) => {
    try {
      await profileService.updateSkill(skillId, updates);
      set((state) => ({
        skills: state.skills.map((s) => (s.id === skillId ? { ...s, ...updates } : s)),
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  removeSkill: async (skillId) => {
    const prev = get().skills;
    set((state) => ({
      skills: state.skills.filter((s) => s.id !== skillId),
    }));
    try {
      await profileService.removeSkill(skillId);
      const { profile, documents } = get();
      const skills = get().skills;
      const completion = calculateCompletion(profile, skills, documents);
      set({ completion });
    } catch (err) {
      set({ skills: prev, error: err.message });
    }
  },

  // ── Document Actions ───────────────────────────────────────────────────────

  uploadDocument: async (file, type) => {
    set({ uploadingDocument: true, documentProgress: 0 });
    try {
      const doc = await profileService.uploadDocument(file, type, (progress) => {
        set({ documentProgress: progress });
      });
      set((state) => {
        const documents = [...state.documents, doc];
        const completion = calculateCompletion(state.profile, state.skills, documents);
        return { documents, completion, uploadingDocument: false, documentProgress: 100 };
      });
      return doc;
    } catch (err) {
      set({ error: err.message, uploadingDocument: false });
      throw err;
    }
  },

  removeDocument: async (docId) => {
    const prev = get().documents;
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== docId),
    }));
    try {
      await profileService.removeDocument(docId);
      const { profile, skills } = get();
      const documents = get().documents;
      const completion = calculateCompletion(profile, skills, documents);
      set({ completion });
    } catch (err) {
      set({ documents: prev, error: err.message });
    }
  },

  // ── Security Actions ───────────────────────────────────────────────────────

  revokeSession: async (sessionId) => {
    try {
      await profileService.revokeSession(sessionId);
      set((state) => ({
        profile: {
          ...state.profile,
          activeSessions: state.profile.activeSessions.filter((s) => s.id !== sessionId),
        },
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  toggleTwoFactor: async (enabled) => {
    try {
      await profileService.toggleTwoFactor(enabled);
      set((state) => ({
        profile: { ...state.profile, twoFactorEnabled: enabled },
      }));
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  // ── UI Actions ─────────────────────────────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab }),
  setAvatarModalOpen: (open) => set({ avatarModalOpen: open }),
  setEditProfileOpen: (open) => set({ editProfileOpen: open }),
  setAddSkillOpen: (open) => set({ addSkillOpen: open }),
  setEditSkillTarget: (skill) => set({ editSkillTarget: skill }),
  setUploadDocOpen: (open) => set({ uploadDocOpen: open }),
  clearError: () => set({ error: null }),
}));

// ── Convenience Selectors ─────────────────────────────────────────────────────
export const useProfile          = () => useProfileStore((s) => s.profile);
export const useProfileSkills    = () => useProfileStore((s) => s.skills);
export const useProfileAchievements = () => useProfileStore((s) => s.achievements);
export const useProfileDocuments = () => useProfileStore((s) => s.documents);
export const useProfileActivities = () => useProfileStore((s) => s.activities);
export const useProfileCompletion = () => useProfileStore((s) => s.completion);
export const useActiveProfileTab  = () => useProfileStore((s) => s.activeTab);
