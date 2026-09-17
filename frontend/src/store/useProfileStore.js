/**
 * @file useProfileStore.js
 * @description Dedicated Zustand store for Trakive's User Profile & Account Management.
 *
 * Architecture note: All service calls go through profileService so that
 * switching from mock to real API requires only updating that service file.
 */

import { create } from 'zustand';
import { profileService } from '../services/profileService';
import { useNotificationStore } from './useNotificationStore';

// ── Profile Completion Calculator ─────────────────────────────────────────────

/**
 * Calculate profile completion based on filled sections.
 * Returns { percentage, completedItems, missingItems }
 */
const calculateCompletion = (profile, skills = [], documents = [], internship = null) => {
  const isIntern = (profile?.role || '').toLowerCase() === 'intern';
  const items = [
    {
      key: 'avatar',
      label: 'Upload a profile photo',
      done: !!(profile?.avatarUrl && profile?.hasCustomAvatar && !profile.avatarUrl.includes('dicebear')),
      priority: 'high',
    },
    {
      key: 'personal_info',
      label: 'Complete personal information',
      done: !!(profile?.phone && profile?.dateOfBirth && profile?.address && profile?.city),
      priority: 'high',
    },
    {
      key: 'date_of_birth',
      label: 'Add date of birth',
      done: !!profile?.dateOfBirth,
      priority: 'high',
    },
    ...(isIntern ? [{
      key: 'internship_dates',
      label: 'Confirm internship start and end dates',
      done: !!(internship?.startDate && internship?.endDate),
      priority: 'high',
    },
    {
      key: 'supervisor',
      label: 'Have an assigned supervisor',
      done: !!(internship?.supervisor?.name || profile?.supervisorName),
      priority: 'high',
    }] : []),
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
      done: documents.some((d) => d.type === 'CV/Resume' || d.category === 'resume'),
      priority: 'high',
    },
    {
      key: 'id_document',
      label: 'Upload ID document',
      done: documents.some((d) => d.type === 'ID Card' || d.category === 'id_proof'),
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
  profileChangeRequests: [],

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
  loadingChangeRequests: false,
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
      fetchDocuments, fetchActivities, fetchInternship, fetchAssignedInterns, fetchProfileChangeRequests,
    } = get();
    const calls = [
      fetchProfile(role),
      fetchDocuments(role),
      fetchActivities(role),
      fetchProfileChangeRequests(),
    ];
    if (role === 'Supervisor') {
      calls.push(fetchAssignedInterns());
    } else {
      calls.push(fetchSkills(), fetchAchievements(), fetchInternship());
    }
    await Promise.all(calls);
  },

  fetchProfileChangeRequests: async () => {
    set({ loadingChangeRequests: true });
    try {
      const requests = await profileService.getProfileChangeRequests();
      set({ profileChangeRequests: requests, loadingChangeRequests: false });
    } catch (err) {
      set({ loadingChangeRequests: false });
    }
  },

  submitProfileChangeRequest: async (proposedData) => {
    set({ savingProfile: true });
    try {
      const profile = get().profile;
      const newRequest = await profileService.submitProfileChangeRequest(profile, proposedData);
      set((state) => ({
        profileChangeRequests: [newRequest, ...state.profileChangeRequests],
        savingProfile: false,
      }));

      // Notify supervisor
      useNotificationStore.getState().addNotification({
        category: 'profile_update',
        title: 'Profile Change Request Submitted',
        shortDescription: `Change request from ${newRequest.internName} pending approval.`,
        message: `${newRequest.internName} submitted requested profile details update. Review and approve in Onboarding Approvals.`,
        actionLabel: 'Review Request',
        actionRoute: '/supervisor/reviews?tab=onboarding',
      }, 'Supervisor');

      return newRequest;
    } catch (err) {
      set({ error: err.message, savingProfile: false });
      throw err;
    }
  },

  approveProfileChangeRequest: async (requestId) => {
    set({ savingProfile: true });
    try {
      const updatedReq = await profileService.approveProfileChangeRequest(requestId);
      set((state) => ({
        profileChangeRequests: state.profileChangeRequests.map((r) => (r.id === requestId ? updatedReq : r)),
        savingProfile: false,
      }));

      // Update current profile if logged in user is the intern
      const currentProfile = get().profile;
      if (currentProfile && currentProfile.id === updatedReq.internId) {
        set((state) => ({
          profile: { ...state.profile, ...updatedReq.proposedChanges },
        }));
      }

      // Notify intern
      useNotificationStore.getState().addNotification({
        category: 'profile_update',
        title: 'Profile Change Request Approved',
        shortDescription: 'Your supervisor approved your profile update request.',
        message: 'Your requested profile and identity information changes have been approved and updated on your account profile.',
        actionLabel: 'View Profile',
        actionRoute: '/dashboard/profile',
      }, 'Intern');

      return updatedReq;
    } catch (err) {
      set({ error: err.message, savingProfile: false });
      throw err;
    }
  },

  rejectProfileChangeRequest: async (requestId, reason = '') => {
    set({ savingProfile: true });
    try {
      const updatedReq = await profileService.rejectProfileChangeRequest(requestId, reason);
      set((state) => ({
        profileChangeRequests: state.profileChangeRequests.map((r) => (r.id === requestId ? updatedReq : r)),
        savingProfile: false,
      }));

      // Notify intern
      useNotificationStore.getState().addNotification({
        category: 'profile_update',
        title: 'Profile Change Request Reviewed',
        shortDescription: 'Your profile change request was rejected.',
        message: `Your requested profile changes were reviewed by your supervisor. Note: ${reason || 'Contact supervisor for details.'}`,
        actionLabel: 'View Profile',
        actionRoute: '/dashboard/profile',
      }, 'Intern');

      return updatedReq;
    } catch (err) {
      set({ error: err.message, savingProfile: false });
      throw err;
    }
  },

  fetchProfile: async (role) => {
    set({ loadingProfile: true, error: null });
    try {
      const profile = await profileService.getProfile(role);
      const { skills, documents, internship } = get();
      const completion = calculateCompletion(profile, skills, documents, internship);
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
      const { profile, skills, documents } = get();
      const completion = calculateCompletion(profile, skills, documents, internship);
      set({ internship, completion, loadingInternship: false });
    } catch (err) {
      set({ error: err.message, loadingInternship: false });
    }
  },

  fetchSkills: async () => {
    set({ loadingSkills: true });
    try {
      const skills = await profileService.getSkills();
      const { profile, documents, internship } = get();
      const completion = calculateCompletion(profile, skills, documents, internship);
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
      const { profile, skills, internship } = get();
      const completion = calculateCompletion(profile, skills, documents, internship);
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
      const { skills, documents, internship } = get();
      const completion = calculateCompletion(profile, skills, documents, internship);
      set({ profile, completion, savingProfile: false });

      // Dispatch real notification
      useNotificationStore.getState().addNotification({
        category: 'profile_update',
        title: 'Profile Information Updated',
        shortDescription: 'Your profile personal information was updated successfully.',
        message: 'Your personal details, contact information, and bio have been saved to your account profile.',
        actionLabel: 'View Profile',
        actionRoute: profile?.role === 'Supervisor' ? '/supervisor/profile' : '/dashboard/profile',
      }, profile?.role);

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
      const { skills, documents, internship } = get();
      const profile = get().profile;
      const completion = calculateCompletion(profile, skills, documents, internship);
      set({ completion });

      // Dispatch real notification
      useNotificationStore.getState().addNotification({
        category: 'profile_update',
        title: 'Profile Photo Uploaded',
        shortDescription: 'Your profile photo was updated successfully.',
        message: 'Your new avatar image has been uploaded and applied across your account portal.',
        actionLabel: 'View Profile',
        actionRoute: profile?.role === 'Supervisor' ? '/supervisor/profile' : '/dashboard/profile',
      }, profile?.role);

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
      const { skills, documents, internship } = get();
      const profile = get().profile;
      const completion = calculateCompletion(profile, skills, documents, internship);
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
        const completion = calculateCompletion(state.profile, skills, state.documents, state.internship);
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
      const { profile, documents, internship } = get();
      const skills = get().skills;
      const completion = calculateCompletion(profile, skills, documents, internship);
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
        const completion = calculateCompletion(state.profile, state.skills, documents, state.internship);
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
      const { profile, skills, internship } = get();
      const documents = get().documents;
      const completion = calculateCompletion(profile, skills, documents, internship);
      set({ completion });
    } catch (err) {
      set({ documents: prev, error: err.message });
    }
  },

  downloadDocument: async (doc) => {
    try {
      return await profileService.downloadDocument(doc);
    } catch (err) {
      set({ error: err.message });
      throw err;
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
