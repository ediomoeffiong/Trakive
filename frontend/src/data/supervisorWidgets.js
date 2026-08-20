/**
 * @file supervisorWidgets.js
 * @description Mock widget datasets for Supervisor Dashboard.
 */

export const mockPendingApprovals = [
  {
    id: 'appr-1',
    intern: 'Ediomo Effiong',
    type: 'Onboarding Milestone 3',
    requestedAt: '2 hours ago',
  },
  {
    id: 'appr-2',
    intern: 'Ediomo Effiong',
    type: 'Task Submission Review',
    requestedAt: '4 hours ago',
  },
  {
    id: 'appr-3',
    intern: 'Ediomo Effiong',
    type: 'Access Grant Request',
    requestedAt: '1 day ago',
  },
];

export const mockReviewReminders = [
  {
    id: 'rem-1',
    intern: 'Ediomo Effiong',
    reviewType: 'Month 2 Evaluation',
    dueDate: 'In 2 days',
  },
  {
    id: 'rem-2',
    intern: 'Ediomo Effiong',
    reviewType: 'Onboarding Check-in',
    dueDate: 'In 4 days',
  },
];

export const mockRecentlyAssignedInterns = [
  {
    id: 'int-006',
    name: 'Ediomo Effiong',
    department: 'Data Science',
    assignedDate: 'July 20, 2026',
    avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
  },
  {
    id: 'int-004',
    name: 'Ediomo Effiong',
    department: 'DevOps',
    assignedDate: 'July 15, 2026',
    avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
  },
];

export const mockOrgAnnouncements = [
  {
    id: 'ann-1',
    title: 'Mid-Term Internship Showcase Scheduled for Aug 12',
    date: 'July 22, 2026',
    author: 'HR Team',
  },
  {
    id: 'ann-2',
    title: 'New Feedback Guidelines released for Supervisors',
    date: 'July 18, 2026',
    author: 'Engineering Leadership',
  },
];

export const mockTeamPerformanceSummary = {
  completionRate: '92%',
  onTimeRate: '88%',
  satisfactionScore: '4.7/5',
  topPerformingDept: 'UI/UX Design',
};
