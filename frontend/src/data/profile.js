/**
 * @file profile.js
 * @description Mock profile data for Trakive User Profile & Account Management module.
 */

export const mockProfile = {
  id: 'u-1',
  firstName: '',
  lastName: '',
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  state: '',
  country: '',
  bio: '',

  // Avatar
  avatarUrl: null,

  // Role info (set by HR/supervisor)
  role: 'Intern',
  department: '',
  organization: 'Trakive',
  employeeId: '',
  supervisorId: '',
  supervisorName: '',
  supervisorEmail: '',
  supervisorPhone: '',
  supervisorTitle: '',
  supervisorAvatarUrl: null,

  // Internship period
  startDate: '',
  endDate: '',
  status: 'Pending',          // 'Active' | 'Completed' | 'Paused' | 'Pending'
  workLocation: '',

  // Security metadata
  lastLogin: '',
  passwordLastChanged: '',
  twoFactorEnabled: false,
  activeSessions: [
    {
      id: 'sess_001',
      device: 'Chrome on macOS',
      location: 'Lagos, Nigeria',
      ip: '41.58.114.201',
      lastActive: '2026-07-24T06:30:00Z',
      isCurrent: true,
    },
    {
      id: 'sess_002',
      device: 'Safari on iPhone 15',
      location: 'Lagos, Nigeria',
      ip: '41.58.114.210',
      lastActive: '2026-07-23T20:10:00Z',
      isCurrent: false,
    },
  ],

  // Account meta
  createdAt: '',
  updatedAt: '',
  emailVerified: false,
};
