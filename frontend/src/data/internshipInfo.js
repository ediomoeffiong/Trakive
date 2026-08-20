/**
 * @file internshipInfo.js
 * @description Empty internship information seed for profile screens before backend data exists.
 */

export const mockInternshipInfo = {
  employeeId: '',
  department: '',
  team: '',
  organization: 'Trakive',
  office: '',

  startDate: '',
  endDate: '',
  durationWeeks: 0,
  durationMonths: 0,

  status: 'Pending',
  statusColor: '#64748b',

  workLocation: '',
  workHours: '',
  daysPerWeek: 0,

  supervisor: {
    id: '',
    name: '',
    title: '',
    email: '',
    phone: '',
    department: '',
    avatarUrl: null,
  },

  hrContact: {
    name: '',
    title: '',
    email: '',
    phone: '',
  },

  stipendRange: '',

  weeksCompleted: 0,
  weeksRemaining: 0,
  completionPercentage: 0,
};
