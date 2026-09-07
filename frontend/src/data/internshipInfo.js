/**
 * @file internshipInfo.js
 * @description Internship information seed for profile screens.
 */

export const mockInternshipInfo = {
  employeeId: 'TRK-2026-0042',
  department: 'FifthLab',
  team: 'Engineering & Product',
  organization: 'FifthLab',
  office: 'Lagos HQ',

  startDate: '',
  endDate: '',
  datesVerified: false,
  dateVerificationStatus: 'Pending Supervisor Verification',
  durationWeeks: 0,
  durationMonths: 0,

  status: 'Active',
  statusColor: '#10b981',

  workLocation: 'Hybrid / Lagos',
  workHours: '9:00 AM - 5:00 PM',
  daysPerWeek: 5,

  supervisor: {
    id: 'sup-tochukwu',
    name: 'Tochukwu Mgbemmena',
    title: 'Lead Supervisor & Managing Partner',
    email: 'tochukwu@fifthlab.com',
    phone: '+234 803 123 4567',
    department: 'FifthLab Management',
    avatarUrl: null,
  },

  secondarySupervisor: {
    id: null,
    name: null,
    title: null,
    email: null,
  },

  hrContact: {
    name: 'HR Administration',
    title: 'People Operations',
    email: 'hr@fifthlab.com',
    phone: '+234 802 987 6543',
  },

  stipendRange: 'Standard Intern',

  weeksCompleted: 0,
  weeksRemaining: 0,
  completionPercentage: 0,
};
