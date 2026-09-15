/**
 * @file supervisorNotifications.js
 * @description Initial mock notifications, announcements, and reminders for Supervisor portal.
 */

export const mockSupervisorNotifications = [
  {
    id: 'sup-notif-1',
    category: 'task_submitted',
    title: 'Task Deliverable Submitted: Mobile Layouts',
    shortDescription: 'Ediomo Effiong submitted deliverables for review.',
    message: 'Ediomo Effiong has completed and submitted "Mobile Responsive Layouts". Deliverables include design components and test suites. Please review and assign a score.',
    timestamp: '15m ago',
    date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    isRead: false,
    isArchived: false,
    sender: { name: 'Ediomo Effiong', role: 'Intern', avatar: null },
    relatedModule: 'reviews',
    relatedId: 'rev-sub-1',
    actionLabel: 'Review Submission',
    actionRoute: '/supervisor/reviews',
    priority: 'high',
  },
  {
    id: 'sup-notif-2',
    category: 'milestone_achieved',
    title: 'Onboarding Approval Request',
    shortDescription: 'Sarah Lee completed Week 2 onboarding tasks.',
    message: 'Sarah Lee completed Week 2 orientation and requested verification for onboarding milestones.',
    timestamp: '1h ago',
    date: new Date(Date.now() - 3600 * 1000).toISOString(),
    isRead: false,
    isArchived: false,
    sender: { name: 'Sarah Lee', role: 'UI/UX Intern', avatar: null },
    relatedModule: 'onboarding',
    relatedId: 'onb-app-1',
    actionLabel: 'Review Approvals',
    actionRoute: '/supervisor/onboarding',
    priority: 'normal',
  },
  {
    id: 'sup-notif-3',
    category: 'new_login_detected',
    title: 'New Login Detected',
    shortDescription: 'Supervisor session initiated.',
    message: 'Account logged in successfully. If this session was not initiated by you, update your portal security settings.',
    timestamp: '1d ago',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    isRead: true,
    isArchived: false,
    sender: { name: 'System Security', role: 'Automated Guard', avatar: null },
    relatedModule: 'security',
    relatedId: 'sec-sup-1',
    actionLabel: 'Portal Settings',
    actionRoute: '/supervisor/settings',
    priority: 'low',
  },
];

export const mockSupervisorAnnouncements = [
  {
    id: 'sup-ann-1',
    title: 'Mid-Term Evaluation Schedule Released',
    content: 'All supervisors are requested to complete mid-term intern evaluations before the end of the month. Evaluation rubrics have been updated in the portal.',
    author: 'Tinu Adeyemi (HR Administrator)',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    priority: 'important',
    category: 'hr_update',
  },
];

export const mockSupervisorReminders = [
  {
    id: 'sup-rem-1',
    title: 'Review Sprint Deliverables for Ediomo Effiong',
    dueDate: 'Today at 5:00 PM',
    urgency: 'warning',
    relatedModule: 'reviews',
    actionLabel: 'Go to Reviews',
    actionRoute: '/supervisor/reviews',
  },
];

