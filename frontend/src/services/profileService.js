/**
 * @file profileService.js
 * @description Role-aware mock service abstraction for Trakive User Profile & Account Management.
 * Supports both Intern and Supervisor profiles.
 */

import { mockProfile } from '../data/profile';
import { mockSkills } from '../data/skills';
import { mockAchievements } from '../data/achievements';
import { mockDocuments } from '../data/documents';
import { mockAccountActivity } from '../data/accountActivity';
import { mockInternshipInfo } from '../data/internshipInfo';
import {
  mockSupervisorProfile,
  mockSupervisorAssignedInterns,
  mockSupervisorActivity,
  mockSupervisorDocuments,
} from '../data/supervisorProfile';
import { useAppStore } from '../store/useAppStore';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory state
let _internProfile = { ...mockProfile };
let _supervisorProfile = { ...mockSupervisorProfile };
let _skills = [...mockSkills];
let _achievements = [...mockAchievements];
let _internDocuments = [...mockDocuments];
let _supervisorDocuments = [...mockSupervisorDocuments];
let _internActivities = [...mockAccountActivity];
let _supervisorActivities = [...mockSupervisorActivity];
let _assignedInterns = { ...mockSupervisorAssignedInterns };
let _internship = { ...mockInternshipInfo };

const splitName = (name = '') => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(' ') };
};

const normalizeRole = (role = '') => {
  if (role === 'HR Admin') return 'HR Administrator';
  if (role === 'Dept Head') return 'Department Head';
  return role || 'Intern';
};

const getRoleDefaults = (role) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'Supervisor') {
    return {
      role: 'Supervisor',
      jobTitle: 'Supervisor',
      status: 'Pending',
      organization: 'Trakive',
      twoFactorEnabled: false,
      activeSessions: [],
      emailVerified: false,
    };
  }
  if (normalizedRole === 'HR Administrator') {
    return {
      role: 'HR Administrator',
      jobTitle: 'HR Administrator',
      status: 'Pending',
      organization: 'Trakive',
      twoFactorEnabled: false,
      activeSessions: [],
      emailVerified: false,
    };
  }
  if (normalizedRole === 'Department Head') {
    return {
      role: 'Department Head',
      jobTitle: 'Department Head',
      status: 'Pending',
      organization: 'Trakive',
      twoFactorEnabled: false,
      activeSessions: [],
      emailVerified: false,
    };
  }
  return { ...mockProfile, role: normalizedRole };
};

const getCurrentUserProfile = (explicitRole) => {
  const currentUser = useAppStore.getState()?.user;
  const role = normalizeRole(explicitRole || currentUser?.role);
  const { firstName, lastName } = splitName(currentUser?.name);
  const defaults = getRoleDefaults(role);

  return {
    ...mockProfile,
    ...defaults,
    id: currentUser?.id ?? defaults.id ?? mockProfile.id,
    firstName: currentUser?.firstName ?? firstName ?? '',
    lastName: currentUser?.lastName ?? lastName ?? '',
    fullName: currentUser?.name ?? defaults.fullName ?? '',
    email: currentUser?.email ?? defaults.email ?? '',
    department: currentUser?.department ?? defaults.department ?? '',
    avatarUrl: currentUser?.avatarUrl ?? currentUser?.avatar ?? defaults.avatarUrl ?? null,
    bio: currentUser?.bio ?? defaults.bio ?? '',
    role,
  };
};

const getEffectiveRole = (explicitRole) => {
  if (explicitRole) return explicitRole;
  try {
    const currentUser = useAppStore.getState()?.user;
    return normalizeRole(currentUser?.role);
  } catch {
    return 'Intern';
  }
};

export const profileService = {
  /**
   * Fetch user profile by role or active current user.
   * @param {string} [role]
   * @returns {Promise<Object>}
   */
  getProfile: async (role) => {
    await delay(400);
    const activeRole = getEffectiveRole(role);
    const sessionProfile = getCurrentUserProfile(activeRole);
    if (activeRole === 'Supervisor') {
      return { ...sessionProfile, ..._supervisorProfile, ...sessionProfile };
    }
    return { ...sessionProfile, ..._internProfile, ...sessionProfile };
  },

  /**
   * Update personal profile fields.
   * @param {Object} updates
   * @param {string} [role]
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (updates, role) => {
    await delay(500);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorProfile = { ...getCurrentUserProfile(activeRole), ..._supervisorProfile, ...updates, updatedAt: new Date().toISOString() };
      return { ..._supervisorProfile };
    }
    _internProfile = { ...getCurrentUserProfile(activeRole), ..._internProfile, ...updates, updatedAt: new Date().toISOString() };
    return { ..._internProfile };
  },

  /**
   * Fetch assigned interns metrics & list for supervisors.
   * @returns {Promise<Object>}
   */
  getAssignedInterns: async () => {
    await delay(350);
    return { ..._assignedInterns };
  },

  /**
   * Upload avatar with progress callback.
   * @param {File} file
   * @param {Function} onProgress
   * @param {string} [role]
   * @returns {Promise<{ avatarUrl: string }>}
   */
  uploadAvatar: async (file, onProgress, role) => {
    const steps = [10, 30, 60, 90, 100];
    for (const step of steps) {
      await delay(150);
      if (onProgress) onProgress(step);
    }
    const localUrl = URL.createObjectURL(file);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorProfile = { ..._supervisorProfile, avatarUrl: localUrl, updatedAt: new Date().toISOString() };
      _supervisorActivities.unshift({
        id: `act_sup_${Date.now()}`,
        type: 'avatar_updated',
        title: 'Profile Photo Updated',
        description: 'Supervisor profile picture updated',
        icon: '🖼️',
        iconBg: '#fffbeb',
        iconColor: '#f59e0b',
        timestamp: new Date().toISOString(),
        status: 'success',
        device: 'Current Browser',
        ip: '—',
      });
    } else {
      _internProfile = { ..._internProfile, avatarUrl: localUrl, updatedAt: new Date().toISOString() };
      _internActivities.unshift({
        id: `act_${Date.now()}`,
        type: 'avatar_updated',
        title: 'Profile Photo Updated',
        description: 'Profile picture uploaded',
        icon: '🖼️',
        iconBg: '#fffbeb',
        iconColor: '#f59e0b',
        timestamp: new Date().toISOString(),
        status: 'success',
        device: 'Current Browser',
        ip: '—',
      });
    }
    return { avatarUrl: localUrl };
  },

  /**
   * Remove avatar.
   * @param {string} [role]
   * @returns {Promise<Object>}
   */
  removeAvatar: async (role) => {
    await delay(300);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorProfile = { ..._supervisorProfile, avatarUrl: null, updatedAt: new Date().toISOString() };
      return { ..._supervisorProfile };
    }
    _internProfile = { ..._internProfile, avatarUrl: null, updatedAt: new Date().toISOString() };
    return { ..._internProfile };
  },

  /**
   * Fetch internship info (for Intern profile).
   * @returns {Promise<Object>}
   */
  getInternshipInfo: async () => {
    await delay(350);
    return { ..._internship };
  },

  /**
   * Fetch skills.
   * @returns {Promise<Array>}
   */
  getSkills: async () => {
    await delay(300);
    return [..._skills];
  },

  addSkill: async (skill) => {
    await delay(400);
    const newSkill = { id: `skill_${Date.now()}`, ...skill };
    _skills = [..._skills, newSkill];
    return newSkill;
  },

  updateSkill: async (skillId, updates) => {
    await delay(350);
    _skills = _skills.map((s) => (s.id === skillId ? { ...s, ...updates } : s));
    return _skills.find((s) => s.id === skillId);
  },

  removeSkill: async (skillId) => {
    await delay(300);
    _skills = _skills.filter((s) => s.id !== skillId);
  },

  /**
   * Fetch achievements.
   * @returns {Promise<Array>}
   */
  getAchievements: async () => {
    await delay(350);
    return [..._achievements];
  },

  /**
   * Fetch documents by role.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getDocuments: async (role) => {
    await delay(400);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      return [..._supervisorDocuments];
    }
    return [..._internDocuments];
  },

  uploadDocument: async (file, type, onProgress, role) => {
    const steps = [15, 40, 75, 100];
    for (const step of steps) {
      await delay(200);
      if (onProgress) onProgress(step);
    }
    const newDoc = {
      id: `doc_${Date.now()}`,
      name: file.name,
      displayName: type || file.name,
      type: type || 'Document',
      category: 'Uploaded',
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      status: 'Verified',
      statusColor: '#10b981',
      icon: '📄',
    };
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorDocuments = [..._supervisorDocuments, newDoc];
      _supervisorActivities.unshift({
        id: `act_sup_${Date.now()}`,
        type: 'document_uploaded',
        title: 'Document Uploaded',
        description: `Uploaded "${file.name}" to supervisor documents`,
        icon: '📎',
        iconBg: '#fff7ed',
        iconColor: '#f97316',
        timestamp: new Date().toISOString(),
        status: 'success',
        device: 'Current Browser',
        ip: '—',
      });
    } else {
      _internDocuments = [..._internDocuments, newDoc];
      _internActivities.unshift({
        id: `act_${Date.now()}`,
        type: 'document_uploaded',
        title: 'Document Uploaded',
        description: `Uploaded "${file.name}"`,
        icon: '📎',
        iconBg: '#fff7ed',
        iconColor: '#f97316',
        timestamp: new Date().toISOString(),
        status: 'success',
        device: 'Current Browser',
        ip: '—',
      });
    }
    return newDoc;
  },

  removeDocument: async (docId, role) => {
    await delay(300);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorDocuments = _supervisorDocuments.filter((d) => d.id !== docId);
    } else {
      _internDocuments = _internDocuments.filter((d) => d.id !== docId);
    }
  },

  downloadDocument: async (doc) => {
    await delay(500);
    return { downloadUrl: '#', fileName: doc.name };
  },

  /**
   * Fetch account activity log.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getAccountActivity: async (role) => {
    await delay(400);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      return [..._supervisorActivities];
    }
    return [..._internActivities];
  },

  revokeSession: async (sessionId, role) => {
    await delay(400);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorProfile = {
        ..._supervisorProfile,
        activeSessions: _supervisorProfile.activeSessions.filter((s) => s.id !== sessionId),
      };
    } else {
      _internProfile = {
        ..._internProfile,
        activeSessions: _internProfile.activeSessions.filter((s) => s.id !== sessionId),
      };
    }
  },

  toggleTwoFactor: async (enabled, role) => {
    await delay(500);
    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorProfile = { ..._supervisorProfile, twoFactorEnabled: enabled };
    } else {
      _internProfile = { ..._internProfile, twoFactorEnabled: enabled };
    }
    return { twoFactorEnabled: enabled };
  },
};
