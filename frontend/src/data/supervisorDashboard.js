/**
 * @file supervisorDashboard.js
 * @description Mock KPI data for the Supervisor Dashboard.
 */

export const mockSupervisorKPIs = [
  {
    id: 'total-interns',
    label: 'Total Interns',
    value: '14',
    trend: '+12%',
    trendType: 'positive',
    description: 'Assigned to your department',
    iconName: 'RiUserGroupLine',
    color: 'blue',
  },
  {
    id: 'active-interns',
    label: 'Active Interns',
    value: '12',
    trend: '85.7%',
    trendType: 'positive',
    description: 'Currently working on tasks',
    iconName: 'RiUserFollowLine',
    color: 'green',
  },
  {
    id: 'pending-reviews',
    label: 'Tasks Pending Review',
    value: '8',
    trend: '+3 today',
    trendType: 'warning',
    description: 'Requires your feedback',
    iconName: 'RiTaskLine',
    color: 'amber',
  },
  {
    id: 'reviews-due',
    label: 'Reviews Due',
    value: '3',
    trend: 'Due in 2 days',
    trendType: 'urgent',
    description: 'Quarterly evaluation due',
    iconName: 'RiStarLine',
    color: 'purple',
  },
  {
    id: 'onboarding-pending',
    label: 'Onboarding Approvals',
    value: '4',
    trend: '2 urgent',
    trendType: 'warning',
    description: 'Milestones waiting sign-off',
    iconName: 'RiCheckboxMultipleLine',
    color: 'indigo',
  },
  {
    id: 'avg-performance',
    label: 'Avg Performance Score',
    value: '4.6',
    trend: '+0.3 vs last month',
    trendType: 'positive',
    description: 'Out of 5.0 overall rating',
    iconName: 'RiAwardLine',
    color: 'emerald',
  },
];
