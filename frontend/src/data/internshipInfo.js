/**
 * @file internshipInfo.js
 * @description Empty internship information seed for profile screens before backend data exists.
 */

export const mockInternshipInfo = {
  employeeId: 'TRK-2026-0042',
  department: 'Fifthlab',
  team: 'Engineering & Product',
  organization: 'Fifthlab',
  office: 'Lagos HQ',

  startDate: '2026-06-01',
  endDate: '2026-12-01',
  datesVerified: false,
  dateVerificationStatus: 'Pending Supervisor Verification',
  durationWeeks: 24,
  durationMonths: 6,

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
    department: 'Fifthlab Management',
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

  weeksCompleted: 12,
  weeksRemaining: 12,
  completionPercentage: 50,
};
