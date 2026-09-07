/**
 * @file supervisorProfile.js
 * @description Profile data for Supervisor user in Trakive.
 */

export const mockSupervisorProfile = {
  id: 'u-2',
  firstName: 'Tochukwu',
  lastName: 'Mgbemmena',
  fullName: 'Tochukwu Mgbemmena',
  email: 'tochukwu.mgbemmena@trakive.com',
  phone: '+234 803 123 4567',
  jobTitle: 'Senior Project Manager & Lead',
  department: 'FifthLab',
  organization: 'FifthLab Tech Innovations',
  employeeId: 'SUP-2026-042',
  role: 'Supervisor',
  status: 'Active',
  dateJoined: '2023-03-15',
  dateOfBirth: '1988-11-20',
  gender: 'Male',
  address: '15 Admiralty Way, Phase 1',
  city: 'Lekki',
  state: 'Lagos State',
  country: 'Nigeria',
  workLocation: 'Hybrid - Lekki HQ',
  bio: 'Senior Project Manager & Lead with 10+ years experience guiding high-performing engineering squads and mentoring tech talents.',
  avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp5OZN_RzRJQ2uE0wMl4jfA5IjbH8B6S9IJaY9tRUBLQ&s=10',
  updatedAt: new Date().toISOString(),
  twoFactorEnabled: true,
  activeSessions: [
    {
      id: 'sess-1',
      device: 'Chrome on macOS',
      ip: '102.89.43.12',
      location: 'Lagos, Nigeria',
      isCurrent: true,
      lastActive: 'Just now',
    },
  ],
};

export const mockSupervisorAssignedInterns = {
  stats: {
    totalAssigned: 0,
    activeInterns: 0,
    requiringAttention: 0,
    pendingReviews: 0,
  },
  interns: [],
};

export const mockSupervisorActivity = [];

export const mockSupervisorDocuments = [];
