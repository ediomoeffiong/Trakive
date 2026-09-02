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
import api from './api';
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
let _backendProfile = null;
let _backendRoleProfile = null;

const splitName = (name = '') => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/).filter(Boolean);
  return { firstName, lastName: rest.join(' ') };
};

const normalizeRole = (role = '') => {
  const normalized = String(role || '').toLowerCase();
  if (normalized === 'hr' || normalized === 'hr admin' || normalized === 'hr_administrator') return 'HR Administrator';
  if (normalized === 'head' || normalized === 'dept head' || normalized === 'department_head') return 'Department Head';
  if (normalized === 'supervisor') return 'Supervisor';
  if (normalized === 'intern') return 'Intern';
  if (normalized === 'admin' || normalized === 'super_admin') return 'HR Administrator';
  return role || 'Intern';
};

const normalizeStatus = (status = '') => {
  const value = String(status || '').toLowerCase();
  if (value === 'active') return 'Active';
  if (value === 'completed') return 'Completed';
  if (value === 'paused' || value === 'suspended') return 'Paused';
  return 'Pending';
};

const apiData = (response) => response?.data?.data ?? response?.data;

const mapBackendProfile = ({ user, role_profile: roleProfile } = {}) => {
  if (!user) return null;

  const role = normalizeRole(user.role_name);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const supervisorName = [roleProfile?.supervisor_first_name, roleProfile?.supervisor_last_name]
    .filter(Boolean)
    .join(' ');

  return {
    ...mockProfile,
    id: user.id,
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    fullName,
    email: user.email ?? '',
    phone: user.phone ?? '',
    dateOfBirth: user.date_of_birth ?? '',
    gender: user.gender ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    state: user.state ?? '',
    country: user.country ?? '',
    avatarUrl: user.avatar_url ?? null,
    role,
    jobTitle: roleProfile?.title ?? (role === 'Intern' ? 'Intern' : role),
    department: roleProfile?.department_name ?? user.department_name ?? '',
    organization: 'Trakive',
    employeeId: roleProfile?.intern_profile_id ?? roleProfile?.id ?? user.id ?? '',
    supervisorId: roleProfile?.supervisor_id ?? '',
    supervisorName,
    supervisorEmail: roleProfile?.supervisor_email ?? '',
    status: normalizeStatus(roleProfile?.intern_status ?? user.status),
    bio: user.bio ?? roleProfile?.bio ?? roleProfile?.specialization ?? '',
    lastLogin: user.last_login_at ?? '',
    emailVerified: Boolean(user.is_email_verified),
    createdAt: user.created_at ?? '',
    updatedAt: user.updated_at ?? '',
  };
};

const mapBackendInternship = (roleProfile) => {
  if (!roleProfile) return _internship;

  return {
    ..._internship,
    employeeId: roleProfile.intern_profile_id ?? '',
    department: roleProfile.department_name ?? '',
    team: roleProfile.department_code ?? '',
    organization: 'Trakive',
    startDate: roleProfile.start_date ?? _internship.startDate,
    endDate: roleProfile.end_date ?? _internship.endDate,
    workLocation: roleProfile.work_location ?? _internship.workLocation,
    workHours: roleProfile.work_hours ?? _internship.workHours,
    daysPerWeek: roleProfile.days_per_week ?? _internship.daysPerWeek,
    status: normalizeStatus(roleProfile.intern_status),
    supervisor: {
      ..._internship.supervisor,
      name: [roleProfile.supervisor_first_name, roleProfile.supervisor_last_name]
        .filter(Boolean)
        .join(' '),
      email: roleProfile.supervisor_email ?? '',
    },
    completionPercentage: roleProfile.intern_status === 'active' ? _internship.completionPercentage : 0,
  };
};

const mapBackendDocument = (doc) => ({
  id: doc.id,
  name: doc.file_name ?? doc.name ?? doc.title ?? 'Document',
  displayName: doc.title ?? doc.file_name ?? doc.name ?? 'Document',
  type: doc.category ?? 'Document',
  category: doc.category ?? 'Uploaded',
  size: doc.file_size ?? doc.size ?? 0,
  mimeType: doc.mime_type ?? doc.mimeType ?? '',
  uploadedAt: doc.created_at ?? doc.uploadedAt ?? '',
  status: doc.status ?? 'Stored',
  statusColor: '#10b981',
  icon: 'DOC',
});

const persistBackendSkills = async (skills) => {
  if (!_backendProfile) return;
  try {
    const result = apiData(
      await api.put('/users/profile', {
        skills: skills.map((skill) => skill.name),
      }),
    );
    _backendProfile = result;
    _backendRoleProfile = result?.role_profile ?? _backendRoleProfile;
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw error;
    }
  }
};

const toBackendProfilePayload = (updates = {}) => ({
  first_name: updates.firstName,
  last_name: updates.lastName,
  phone: updates.phone,
  date_of_birth: updates.dateOfBirth,
  gender: updates.gender,
  address: updates.address,
  city: updates.city,
  state: updates.state,
  country: updates.country,
  title: updates.jobTitle,
  bio: updates.bio,
  institution: updates.institution,
  field_of_study: updates.fieldOfStudy,
  academic_year: updates.academicYear,
  work_location: updates.workLocation,
  work_hours: updates.workHours,
  days_per_week: updates.daysPerWeek,
  skills: Array.isArray(updates.skills) ? updates.skills : undefined,
});

const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));

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
    try {
      const result = apiData(await api.get('/users/profile'));
      _backendProfile = result;
      _backendRoleProfile = result?.role_profile ?? null;
      const mapped = mapBackendProfile(result);
      if (mapped) return mapped;
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
    }

    await delay(250);
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
    try {
      const result = apiData(await api.put('/users/profile', stripUndefined(toBackendProfilePayload(updates))));
      _backendProfile = result;
      _backendRoleProfile = result?.role_profile ?? null;
      const mapped = mapBackendProfile(result);
      if (mapped) return mapped;
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
    }

    await delay(300);
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
    try {
      const result = apiData(await api.patch('/users/profile/avatar', { avatar_url: localUrl }));
      const avatarUrl = result?.avatar_url ?? localUrl;
      _backendProfile = _backendProfile
        ? {
            ..._backendProfile,
            user: { ..._backendProfile.user, avatar_url: avatarUrl },
          }
        : _backendProfile;
      return { avatarUrl };
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
    }

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
    await delay(250);
    return { ...mapBackendInternship(_backendRoleProfile) };
  },

  /**
   * Fetch skills.
   * @returns {Promise<Array>}
   */
  getSkills: async () => {
    if (Array.isArray(_backendRoleProfile?.skills) && _backendRoleProfile.skills.length > 0) {
      _skills = _backendRoleProfile.skills.map((skill, index) => {
        const name = typeof skill === 'string' ? skill : skill.name;
        return {
          id: typeof skill === 'string' ? `backend_skill_${index}` : skill.id ?? `backend_skill_${index}`,
          name,
          category: typeof skill === 'string' ? 'Technical' : skill.category ?? 'Technical',
          proficiency: typeof skill === 'string' ? 'Intermediate' : skill.proficiency ?? 'Intermediate',
          percentage: typeof skill === 'string' ? 60 : skill.percentage ?? 60,
          color: typeof skill === 'string' ? '#3b82f6' : skill.color ?? '#3b82f6',
        };
      });
      return [..._skills];
    }

    await delay(250);
    return [..._skills];
  },

  addSkill: async (skill) => {
    await delay(400);
    const newSkill = { id: `skill_${Date.now()}`, ...skill };
    _skills = [..._skills, newSkill];
    await persistBackendSkills(_skills);
    return newSkill;
  },

  updateSkill: async (skillId, updates) => {
    await delay(350);
    _skills = _skills.map((s) => (s.id === skillId ? { ...s, ...updates } : s));
    await persistBackendSkills(_skills);
    return _skills.find((s) => s.id === skillId);
  },

  removeSkill: async (skillId) => {
    await delay(300);
    _skills = _skills.filter((s) => s.id !== skillId);
    await persistBackendSkills(_skills);
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
    try {
      const result = apiData(await api.get('/documents', { params: { limit: 50 } }));
      const docs = Array.isArray(result) ? result : result?.items;
      if (Array.isArray(docs)) return docs.map(mapBackendDocument);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw error;
      }
    }

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
