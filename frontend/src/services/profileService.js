/**
 * @file profileService.js
 * @description Role-aware profile service abstraction for Trakive User Profile & Account Management.
 * Supports both Intern and Supervisor profiles.
 */

import api from './api';
import { useAppStore } from '../store/useAppStore';
import {
  DEFAULT_FIFTHLAB_SUPERVISOR,
  isFifthLabDisplayPerson,
  normalizeDepartmentForPerson,
  normalizePersonRecord,
} from '../utils/people';

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory state for current-session uploads/edits when the API is unavailable.
let _internProfile = { activeSessions: [] };
let _supervisorProfile = { activeSessions: [] };
let _skills = [];
let _internDocuments = [];
let _supervisorDocuments = [];
let _internActivities = [];
let _supervisorActivities = [];
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

const isPendingSupervisorValue = (value) => /^(pending assignment|not assigned|none assigned)?$/i.test(String(value || '').trim());

const getApprovedDepartmentName = (user = {}, roleProfile = null, fallback = '') => {
  const storedInfo = safeJson(localStorage.getItem(`trakive_onboarding_info_${user.id || 'default'}`), {});
  const savedProfile = safeJson(localStorage.getItem(`trakive_user_profile_${user.id || 'default'}`), {});
  const selectedDepartment =
    user.department_name ||
    user.department ||
    roleProfile?.department_name ||
    storedInfo.department_name ||
    savedProfile.department ||
    fallback;

  if (isFifthLabDisplayPerson(user) && /^(it department|engineering|information technology)$/i.test(String(selectedDepartment || '').trim())) {
    return 'FifthLab';
  }

  return normalizeDepartmentForPerson(user, selectedDepartment || fallback);
};

const safeJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const calculateWeeks = (startDate, endDate) => {
  if (!startDate || !endDate) return { durationWeeks: null, weeksCompleted: null, weeksRemaining: null, completionPercentage: 0 };
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return { durationWeeks: null, weeksCompleted: null, weeksRemaining: null, completionPercentage: 0 };
  }
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const durationWeeks = Math.max(1, Math.ceil((end - start) / weekMs));
  const elapsedWeeks = Math.max(0, Math.floor((Date.now() - start.getTime()) / weekMs));
  const weeksCompleted = Math.min(durationWeeks, elapsedWeeks);
  const weeksRemaining = Math.max(0, durationWeeks - weeksCompleted);
  const completionPercentage = Math.min(100, Math.max(0, Math.round((weeksCompleted / durationWeeks) * 100)));
  return { durationWeeks, weeksCompleted, weeksRemaining, completionPercentage };
};

const mapBackendProfile = ({ user, role_profile: roleProfile } = {}) => {
  if (!user) return null;

  const role = normalizeRole(user.role_name);
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const supervisorName = [roleProfile?.supervisor_first_name, roleProfile?.supervisor_last_name]
    .filter(Boolean)
    .join(' ');
  const department = getApprovedDepartmentName(user, roleProfile, '');
  const defaultSupervisor = department === 'FifthLab' ? DEFAULT_FIFTHLAB_SUPERVISOR : null;

  return normalizePersonRecord({
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
    department,
    organization: user.organization_name || roleProfile?.organization_name || '',
    employeeId: '',
    supervisorId: roleProfile?.supervisor_id ?? defaultSupervisor?.id ?? '',
    supervisorName: supervisorName || defaultSupervisor?.name || '',
    supervisorEmail: roleProfile?.supervisor_email ?? defaultSupervisor?.email ?? '',
    status: normalizeStatus(roleProfile?.intern_status ?? user.status),
    bio: user.bio ?? roleProfile?.bio ?? roleProfile?.specialization ?? '',
    lastLogin: user.last_login_at ?? '',
    emailVerified: Boolean(user.is_email_verified),
    createdAt: user.created_at ?? '',
    updatedAt: user.updated_at ?? '',
  });
};

const mapBackendInternship = (roleProfile) => {
  const currentUser = useAppStore.getState()?.user || {};
  const storedInfo = safeJson(localStorage.getItem(`trakive_onboarding_info_${currentUser.id || 'default'}`), {});
  if (!roleProfile) {
    const department = getApprovedDepartmentName(currentUser, null, storedInfo.department_name || currentUser.department || '');
    const defaultSupervisor = department === 'FifthLab' ? DEFAULT_FIFTHLAB_SUPERVISOR : null;
    const startDate = storedInfo.start_date || currentUser.startDate || '';
    const endDate = storedInfo.end_date || currentUser.endDate || '';
    const weeks = calculateWeeks(startDate, endDate);
    return normalizePersonRecord({
      employeeId: '',
      department,
      team: '',
      organization: currentUser.organization_name || currentUser.organization || '',
      startDate,
      endDate,
      workLocation: storedInfo.work_location || '',
      workHours: storedInfo.work_hours || '',
      daysPerWeek: storedInfo.days_per_week || '',
      status: currentUser.status || 'Pending',
      supervisor: {
        name: isPendingSupervisorValue(currentUser.supervisorName) ? (defaultSupervisor?.name || '') : currentUser.supervisorName,
        email: currentUser.supervisorEmail || defaultSupervisor?.email || '',
        title: defaultSupervisor?.title || '',
      },
      ...weeks,
      records: startDate || endDate ? [{
        id: 'current',
        title: 'Current Internship',
        department,
        startDate,
        endDate,
        status: currentUser.status || 'Pending',
      }] : [],
    });
  }

  const department = getApprovedDepartmentName(
    { ...currentUser, id: roleProfile.user_id || currentUser.id, email: roleProfile.email || currentUser.email },
    roleProfile,
    storedInfo.department_name || currentUser.department || ''
  );
  const startDate = roleProfile.start_date ?? storedInfo.start_date ?? currentUser.startDate ?? '';
  const endDate = roleProfile.end_date ?? storedInfo.end_date ?? currentUser.endDate ?? '';
  const weeks = calculateWeeks(startDate, endDate);
  const supervisorName = [roleProfile.supervisor_first_name, roleProfile.supervisor_last_name]
    .filter(Boolean)
    .join(' ');
  const defaultSupervisor = department === 'FifthLab' ? DEFAULT_FIFTHLAB_SUPERVISOR : null;
  const record = startDate || endDate ? {
    id: roleProfile.internship_record_id || roleProfile.intern_profile_id || 'current',
    title: roleProfile.internship_title || 'Current Internship',
    department,
    startDate,
    endDate,
    status: normalizeStatus(roleProfile.internship_record_status || roleProfile.intern_status),
    supervisor: supervisorName || defaultSupervisor?.name || '',
  } : null;

  return normalizePersonRecord({
    employeeId: '',
    department,
    team: roleProfile.department_code ?? '',
    organization: currentUser.organization_name || currentUser.organization || roleProfile.organization_name || '',
    startDate,
    endDate,
    workLocation: roleProfile.record_work_location ?? roleProfile.work_location ?? '',
    workHours: roleProfile.record_work_hours ?? roleProfile.work_hours ?? '',
    daysPerWeek: roleProfile.record_days_per_week ?? roleProfile.days_per_week ?? '',
    status: normalizeStatus(roleProfile.internship_record_status || roleProfile.intern_status),
    supervisor: {
      name: supervisorName || defaultSupervisor?.name || '',
      email: roleProfile.supervisor_email ?? defaultSupervisor?.email ?? '',
      title: defaultSupervisor?.title || '',
    },
    ...weeks,
    records: record ? [record] : [],
  });
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
  const base = {
    role: normalizedRole,
    jobTitle: normalizedRole,
    status: 'Pending',
    organization: '',
    twoFactorEnabled: false,
    activeSessions: [],
    emailVerified: false,
  };

  if (normalizedRole === 'Supervisor') {
    return {
      ...base,
      jobTitle: 'Supervisor',
    };
  }
  if (normalizedRole === 'HR Administrator') {
    return {
      ...base,
      jobTitle: 'HR Administrator',
    };
  }
  if (normalizedRole === 'Department Head') {
    return {
      ...base,
      jobTitle: 'Department Head',
    };
  }
  return base;
};

const hasRealBackendToken = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user || !user.token) return false;
    return !user.token.startsWith('mock-');
  } catch {
    return false;
  }
};

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@thefifthlab.com', 'supervisor@thefifthlab.com', 'hr@thefifthlab.com', 'head@thefifthlab.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
};

const getCurrentUserProfile = (explicitRole) => {
  const currentUser = useAppStore.getState()?.user;
  const role = normalizeRole(explicitRole || currentUser?.role);
  const { firstName, lastName } = splitName(currentUser?.name);

  if (!isDemoUser() && currentUser) {
    const userProfileKey = `trakive_user_profile_${currentUser.id}`;
    const saved = localStorage.getItem(userProfileKey);
    const savedData = safeJson(saved, {});
    const department = getApprovedDepartmentName(currentUser, null, savedData.department ?? 'General');
    const defaultSupervisor = department === 'FifthLab' ? DEFAULT_FIFTHLAB_SUPERVISOR : null;

    return normalizePersonRecord({
      id: currentUser.id,
      firstName: savedData.firstName ?? currentUser.firstName ?? firstName ?? '',
      lastName: savedData.lastName ?? currentUser.lastName ?? lastName ?? '',
      fullName: savedData.fullName ?? (([savedData.firstName ?? firstName, savedData.lastName ?? lastName].filter(Boolean).join(' ')) || currentUser.name || ''),
      email: currentUser.email ?? '',
      phone: savedData.phone ?? currentUser.phone ?? '',
      dateOfBirth: savedData.dateOfBirth ?? savedData.date_of_birth ?? currentUser.dateOfBirth ?? currentUser.date_of_birth ?? '',
      gender: savedData.gender ?? '',
      address: savedData.address ?? '',
      city: savedData.city ?? '',
      state: savedData.state ?? '',
      country: savedData.country ?? '',
      avatarUrl: savedData.avatarUrl ?? currentUser.avatarUrl ?? null,
      role,
      jobTitle: savedData.jobTitle ?? role,
      department,
      organization: savedData.organization ?? currentUser.organization_name ?? currentUser.organization ?? '',
      employeeId: '',
      supervisorId: savedData.supervisorId ?? defaultSupervisor?.id ?? '',
      supervisorName: isPendingSupervisorValue(savedData.supervisorName)
        ? (defaultSupervisor?.name ?? 'Pending Assignment')
        : savedData.supervisorName,
      supervisorEmail: savedData.supervisorEmail ?? defaultSupervisor?.email ?? '',
      status: savedData.status ?? 'Pending',
      bio: savedData.bio ?? currentUser.bio ?? '',
      institution: savedData.institution ?? '',
      fieldOfStudy: savedData.fieldOfStudy ?? '',
      academicYear: savedData.academicYear ?? '',
      startDate: savedData.startDate ?? currentUser.startDate ?? '',
      endDate: savedData.endDate ?? currentUser.endDate ?? '',
      lastLogin: currentUser.lastLogin ?? new Date().toISOString(),
      emailVerified: true,
      createdAt: currentUser.createdAt ?? new Date().toISOString(),
      updatedAt: savedData.updatedAt ?? new Date().toISOString(),
    });
  }

  const defaults = getRoleDefaults(role);
  return normalizePersonRecord({
    ...defaults,
    id: currentUser?.id ?? defaults.id ?? '',
    firstName: currentUser?.firstName ?? firstName ?? '',
    lastName: currentUser?.lastName ?? lastName ?? '',
    fullName: currentUser?.name ?? defaults.fullName ?? '',
    email: currentUser?.email ?? defaults.email ?? '',
    phone: currentUser?.phone ?? '',
    dateOfBirth: currentUser?.dateOfBirth ?? currentUser?.date_of_birth ?? '',
    department: getApprovedDepartmentName(currentUser, null, defaults.department ?? ''),
    organization: currentUser?.organization_name || currentUser?.organization || defaults.organization || '',
    avatarUrl: currentUser?.avatarUrl ?? currentUser?.avatar ?? defaults.avatarUrl ?? null,
    bio: currentUser?.bio ?? defaults.bio ?? '',
    role,
  });
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
    if (hasRealBackendToken()) {
      try {
        const result = apiData(await api.get('/users/profile'));
        _backendProfile = result;
        _backendRoleProfile = result?.role_profile ?? null;
        const mapped = mapBackendProfile(result);
        if (mapped) {
          useAppStore.getState()?.updateUserMeta?.({
            department: mapped.department,
            department_name: mapped.department,
            organization: mapped.organization,
            organization_name: mapped.organization,
            supervisorName: mapped.supervisorName,
            supervisorEmail: mapped.supervisorEmail,
            dateOfBirth: mapped.dateOfBirth,
            date_of_birth: mapped.dateOfBirth,
          });
          return mapped;
        }
      } catch (error) {
        // Backend request failed or unauthenticated; proceed with fallback profile data
      }
    }

    await delay(250);
    const activeRole = getEffectiveRole(role);
    const sessionProfile = getCurrentUserProfile(activeRole);
    return sessionProfile;
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
      // Backend request failed or unauthenticated; fall back to local store updates
    }

    await delay(300);
    const activeRole = getEffectiveRole(role);

    if (!isDemoUser()) {
      const currentUser = useAppStore.getState()?.user;
      if (currentUser) {
        const userProfileKey = `trakive_user_profile_${currentUser.id}`;
        const currentProfile = getCurrentUserProfile(activeRole);
        const updated = { ...currentProfile, ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(userProfileKey, JSON.stringify(updated));

        // Mark profileCompleted in user metadata
        const userMetaKey = `trakive_user_meta_${currentUser.id}`;
        const storedMetaJson = localStorage.getItem(userMetaKey);
        const userMeta = storedMetaJson ? JSON.parse(storedMetaJson) : {};
        userMeta.profileCompleted = true;
        localStorage.setItem(userMetaKey, JSON.stringify(userMeta));

        if (useAppStore.getState()?.updateUserMeta) {
          useAppStore.getState().updateUserMeta({ profileCompleted: true });
        }

        return updated;
      }
    }

    const updated = { ...getCurrentUserProfile(activeRole), ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(`trakive_user_profile_${updated.id || 'default'}`, JSON.stringify(updated));
    return updated;
  },

  /**
   * Fetch assigned interns metrics & list for supervisors.
   * @returns {Promise<Object>}
   */
  getAssignedInterns: async () => {
    try {
      const result = apiData(await api.get('/interns', { params: { limit: 100 } }));
      const items = Array.isArray(result) ? result : result?.items || [];
      const interns = items.map((intern) => ({
        id: intern.id || intern.user_id || intern.intern_id,
        name: intern.name || `${intern.first_name || ''} ${intern.last_name || ''}`.trim() || intern.email,
        role: intern.department_name || intern.department || 'Intern',
        avatar: intern.avatar_url || intern.avatarUrl || null,
        status: normalizeStatus(intern.status || intern.intern_status),
        statusColor: '#10b981',
        completionRate: intern.completionRate || intern.completion_rate || 0,
        tasksCompleted: intern.tasksCompleted || intern.tasks_completed || 0,
        tasksTotal: intern.tasksTotal || intern.tasks_total || 0,
        pendingReviewsCount: intern.pendingReviewsCount || intern.pending_reviews_count || 0,
        attentionRequired: Boolean(intern.attentionRequired || intern.attention_required),
        attentionReason: intern.attentionReason || intern.attention_reason || '',
      }));
      return {
        stats: {
          totalAssigned: interns.length,
          activeInterns: interns.filter((intern) => intern.status === 'Active').length,
          requiringAttention: interns.filter((intern) => intern.attentionRequired).length,
          pendingReviews: interns.reduce((sum, intern) => sum + (intern.pendingReviewsCount || 0), 0),
        },
        interns,
      };
    } catch {
      return {
        stats: { totalAssigned: 0, activeInterns: 0, requiringAttention: 0, pendingReviews: 0 },
        interns: [],
      };
    }
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
      // Backend request failed or unauthenticated; fallback to local url upload
    }

    const activeRole = getEffectiveRole(role);
    if (activeRole === 'Supervisor') {
      _supervisorProfile = { ..._supervisorProfile, avatarUrl: localUrl, hasCustomAvatar: true, updatedAt: new Date().toISOString() };
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
      _internProfile = { ..._internProfile, avatarUrl: localUrl, hasCustomAvatar: true, updatedAt: new Date().toISOString() };
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
    return { avatarUrl: localUrl, hasCustomAvatar: true };
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
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_skills_${user?.id || 'new'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  },

  addSkill: async (skill) => {
    await delay(400);
    const newSkill = { id: `skill_${Date.now()}`, ...skill };
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_skills_${user?.id || 'new'}`;
    const saved = localStorage.getItem(key);
    const current = saved ? JSON.parse(saved) : [];
    const updated = [...current, newSkill];
    localStorage.setItem(key, JSON.stringify(updated));
    _skills = updated;
    await persistBackendSkills(updated);
    return newSkill;
  },

  updateSkill: async (skillId, updates) => {
    await delay(350);
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_skills_${user?.id || 'new'}`;
    const saved = localStorage.getItem(key);
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.map((s) => (s.id === skillId ? { ...s, ...updates } : s));
    localStorage.setItem(key, JSON.stringify(updated));
    _skills = updated;
    await persistBackendSkills(updated);
    return updated.find((s) => s.id === skillId);
  },

  removeSkill: async (skillId) => {
    await delay(300);
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_skills_${user?.id || 'new'}`;
    const saved = localStorage.getItem(key);
    const current = saved ? JSON.parse(saved) : [];
    const updated = current.filter((s) => s.id !== skillId);
    localStorage.setItem(key, JSON.stringify(updated));
    _skills = updated;
    await persistBackendSkills(updated);
  },

  /**
   * Fetch achievements.
   * @returns {Promise<Array>}
   */
  getAchievements: async () => {
    await delay(350);
    return [];
  },

  /**
   * Fetch documents by role.
   * @param {string} [role]
   * @returns {Promise<Array>}
   */
  getDocuments: async (role) => {
    if (hasRealBackendToken()) {
      try {
        const result = apiData(await api.get('/documents', { params: { limit: 50 } }));
        const docs = Array.isArray(result) ? result : result?.items;
        if (Array.isArray(docs)) return docs.map(mapBackendDocument);
      } catch (error) {
        // Backend request failed or unauthenticated; proceed with fallback document data
      }
    }

    await delay(400);
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_documents_${user?.id || 'new'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
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
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_documents_${user?.id || 'new'}`;
    const saved = localStorage.getItem(key);
    const currentDocs = saved ? JSON.parse(saved) : [];
    localStorage.setItem(key, JSON.stringify([newDoc, ...currentDocs]));
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
    const user = useAppStore.getState()?.user;
    const key = `trakive_user_documents_${user?.id || 'new'}`;
    const saved = safeJson(localStorage.getItem(key), []);
    localStorage.setItem(key, JSON.stringify(saved.filter((d) => d.id !== docId)));

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
    return [];
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

  /**
   * Profile Change Requests (Supervisor approval workflow)
   */
  getProfileChangeRequests: async () => {
    await delay(200);
    try {
      const stored = localStorage.getItem('trakive_profile_change_requests');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  },

  submitProfileChangeRequest: async (currentProfile, proposedData) => {
    await delay(400);
    const requests = await profileService.getProfileChangeRequests();
    const newRequest = {
      id: `pcr-${Date.now()}`,
      internId: currentProfile?.id || 'intern-1',
      internName: currentProfile?.fullName || `${currentProfile?.firstName || ''} ${currentProfile?.lastName || ''}`.trim() || 'Intern User',
      internEmail: currentProfile?.email || 'intern@thefifthlab.com',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      proposedChanges: { ...proposedData, fullName: `${proposedData.firstName || ''} ${proposedData.lastName || ''}`.trim() },
      previousValues: {
        firstName: currentProfile?.firstName || '',
        lastName: currentProfile?.lastName || '',
        fullName: currentProfile?.fullName || '',
        phone: currentProfile?.phone || '',
        dateOfBirth: currentProfile?.dateOfBirth || '',
        gender: currentProfile?.gender || '',
        address: currentProfile?.address || '',
        city: currentProfile?.city || '',
        state: currentProfile?.state || '',
        country: currentProfile?.country || 'Nigeria',
        bio: currentProfile?.bio || '',
      },
      rejectionReason: '',
      reviewedAt: null,
      reviewedBy: null,
    };

    const updatedRequests = [newRequest, ...requests];
    localStorage.setItem('trakive_profile_change_requests', JSON.stringify(updatedRequests));
    return newRequest;
  },

  approveProfileChangeRequest: async (requestId) => {
    await delay(400);
    const requests = await profileService.getProfileChangeRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    const targetReq = requests[index];
    targetReq.status = 'approved';
    targetReq.reviewedAt = new Date().toISOString();
    targetReq.reviewedBy = 'Supervisor';

    // Apply updates to the intern profile
    const internId = targetReq.internId;
    const userProfileKey = `trakive_user_profile_${internId}`;
    let internData = {};
    try {
      const stored = localStorage.getItem(userProfileKey);
      if (stored) internData = JSON.parse(stored);
    } catch {
      // ignore
    }

    const updatedProfile = {
      ..._internProfile,
      ...internData,
      ...targetReq.proposedChanges,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(userProfileKey, JSON.stringify(updatedProfile));
    _internProfile = { ..._internProfile, ...updatedProfile };

    localStorage.setItem('trakive_profile_change_requests', JSON.stringify(requests));
    return targetReq;
  },

  rejectProfileChangeRequest: async (requestId, reason = '') => {
    await delay(400);
    const requests = await profileService.getProfileChangeRequests();
    const index = requests.findIndex((r) => r.id === requestId);
    if (index === -1) throw new Error('Request not found');

    const targetReq = requests[index];
    targetReq.status = 'rejected';
    targetReq.rejectionReason = reason;
    targetReq.reviewedAt = new Date().toISOString();
    targetReq.reviewedBy = 'Supervisor';

    localStorage.setItem('trakive_profile_change_requests', JSON.stringify(requests));
    return targetReq;
  },
};
