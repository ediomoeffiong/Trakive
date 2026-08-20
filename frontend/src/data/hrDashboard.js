/**
 * @file hrDashboard.js
 * @description Mock HR Administrator dashboard statistics and analytics data.
 */

export const hrKPICards = [
  {
    id: 'total-interns',
    label: 'Total Interns',
    value: 148,
    change: +12,
    changeLabel: 'since last batch',
    changeType: 'increase',
    icon: 'group',
    color: 'blue',
  },
  {
    id: 'active-supervisors',
    label: 'Active Supervisors',
    value: 24,
    change: +2,
    changeLabel: 'this quarter',
    changeType: 'increase',
    icon: 'shield-user',
    color: 'indigo',
  },
  {
    id: 'departments',
    label: 'Departments',
    value: 8,
    change: 0,
    changeLabel: 'no change',
    changeType: 'neutral',
    icon: 'building',
    color: 'purple',
  },
  {
    id: 'pending-approvals',
    label: 'Pending Approvals',
    value: 12,
    change: -4,
    changeLabel: 'cleared this week',
    changeType: 'decrease',
    icon: 'time',
    color: 'amber',
  },
  {
    id: 'completion-rate',
    label: 'Completion Rate',
    value: '94.2%',
    change: +2.1,
    changeLabel: 'from last cohort',
    changeType: 'increase',
    icon: 'chart-pie',
    color: 'emerald',
  },
  {
    id: 'active-batches',
    label: 'Active Batches',
    value: 4,
    change: 0,
    changeLabel: '2 ending this month',
    changeType: 'neutral',
    icon: 'layers',
    color: 'cyan',
  },
];

export const hrDeptDistribution = [
  { department: 'Engineering', interns: 38, color: '#6366f1' },
  { department: 'Product', interns: 22, color: '#8b5cf6' },
  { department: 'Design', interns: 18, color: '#ec4899' },
  { department: 'Marketing', interns: 20, color: '#f59e0b' },
  { department: 'Data Science', interns: 16, color: '#10b981' },
  { department: 'Finance', interns: 14, color: '#06b6d4' },
  { department: 'HR', interns: 12, color: '#f97316' },
  { department: 'Operations', interns: 8, color: '#84cc16' },
];

export const hrBatchTrend = [
  { month: 'Feb', active: 112, completed: 0 },
  { month: 'Mar', active: 120, completed: 18 },
  { month: 'Apr', active: 130, completed: 22 },
  { month: 'May', active: 138, completed: 28 },
  { month: 'Jun', active: 145, completed: 32 },
  { month: 'Jul', active: 148, completed: 38 },
];

export const hrPendingApprovals = [
  { id: 'pa-001', type: 'Onboarding Step', intern: 'Ediomo Effiong', step: 'Contract Signing', submittedAt: '2026-07-30T10:22:00Z', priority: 'high' },
  { id: 'pa-002', type: 'Leave Request', intern: 'Folake Adesanya', step: 'Medical Leave', submittedAt: '2026-07-30T08:15:00Z', priority: 'medium' },
  { id: 'pa-003', type: 'Supervisor Assignment', intern: 'Emeka Nwosu', step: 'Reassignment Request', submittedAt: '2026-07-29T14:40:00Z', priority: 'low' },
  { id: 'pa-004', type: 'Onboarding Step', intern: 'Temi Balogun', step: 'Background Check', submittedAt: '2026-07-29T11:00:00Z', priority: 'high' },
  { id: 'pa-005', type: 'Exit Form', intern: 'Yusuf Abdullahi', step: 'Offboarding Submission', submittedAt: '2026-07-28T16:55:00Z', priority: 'medium' },
  { id: 'pa-006', type: 'Onboarding Step', intern: 'Chisom Eze', step: 'ID Verification', submittedAt: '2026-07-28T09:30:00Z', priority: 'high' },
];

export const hrRecentActivity = [
  { id: 'act-001', type: 'announcement', title: 'Q3 Review Period Announced', actor: 'HR Admin', time: '2026-07-31T08:00:00Z' },
  { id: 'act-002', type: 'batch_created', title: 'Batch 2026-B4 Created', actor: 'HR Admin', time: '2026-07-30T15:30:00Z' },
  { id: 'act-003', type: 'supervisor_added', title: 'New Supervisor: Dr. Ngozi Okoro Added', actor: 'HR Admin', time: '2026-07-30T11:00:00Z' },
  { id: 'act-004', type: 'intern_assigned', title: '14 Interns Assigned to Batch 2026-B3', actor: 'HR Admin', time: '2026-07-29T14:00:00Z' },
  { id: 'act-005', type: 'user_deactivated', title: 'User Account Deactivated: James Doe', actor: 'HR Admin', time: '2026-07-29T09:45:00Z' },
  { id: 'act-006', type: 'department_updated', title: 'Engineering Dept. Lead Updated', actor: 'HR Admin', time: '2026-07-28T16:00:00Z' },
];
