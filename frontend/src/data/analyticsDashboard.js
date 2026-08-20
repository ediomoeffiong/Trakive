/**
 * @file analyticsDashboard.js
 * @description Comprehensive mock metrics and statistics for the Reports & Analytics module.
 * Supports role-based metrics for Intern, Supervisor, HR Administrator, and Department Head.
 */

export const mockDashboardMetrics = {
  // General KPIs across the organization
  overallPerformanceScore: 4.6,
  performanceScoreTrend: '+0.3 vs last month',
  performanceScorePositive: true,

  activeInterns: 48,
  activeInternsTrend: '+6 new this batch',
  activeInternsPositive: true,

  completedTasks: 342,
  completedTasksTrend: '+12% vs last period',
  completedTasksPositive: true,

  tasksInProgress: 84,
  tasksInProgressTrend: '-4% backlog',
  tasksInProgressPositive: true,

  pendingReviews: 18,
  pendingReviewsTrend: '5 due today',
  pendingReviewsPositive: false,

  completedReviews: 126,
  completedReviewsTrend: '98% on-time completion',
  completedReviewsPositive: true,

  onboardingCompletionRate: '88%',
  onboardingCompletionTrend: '+5% vs target',
  onboardingCompletionPositive: true,

  averagePerformanceRating: 4.5,
  averagePerformanceRatingTrend: 'Target: 4.2',
  averagePerformanceRatingPositive: true,

  organizationHealthScore: '94/100',
  organizationHealthTrend: 'Excellent (Top 5%)',
  organizationHealthPositive: true,
};

// Summary Report Cards
export const mockSummaryReportCards = {
  bestPerformingIntern: {
    id: 'intern-1',
    name: 'Ediomo Effiong',
    role: 'Frontend Engineering Intern',
    department: 'FifthLab',
    avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    score: 4.95,
    completedTasks: 28,
    badge: 'Top Contributor',
    metricLabel: 'Performance Rating',
    metricValue: '4.95 / 5.0',
    type: 'intern',
  },
  mostImprovedIntern: {
    id: 'intern-2',
    name: 'Ediomo Effiong',
    role: 'Backend Engineering Intern',
    department: 'Engineering',
    avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    score: 4.8,
    growthDelta: '+24%',
    badge: 'Fast Learner',
    metricLabel: 'Growth Spike',
    metricValue: '+24% Score Delta',
    type: 'intern',
  },
  supervisorPerformance: {
    id: 'sup-1',
    name: 'Tochukwu Mgbemena',
    role: 'Senior Tech Lead',
    department: 'FifthLab',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTp5OZN_RzRJQ2uE0wMl4jfA5IjbH8B6S9IJaY9tRUBLQ&s=10',
    assignedCount: 12,
    reviewVelocity: '1.2 days avg turn-around',
    badge: 'Top Manager',
    metricLabel: 'Team Output Rate',
    metricValue: '96% Satisfactory',
    type: 'supervisor',
  },
  highestPerformingDept: {
    id: 'dept-1',
    name: 'FifthLab Engineering',
    lead: 'Moradeke Akintola',
    internCount: 18,
    avgScore: 4.85,
    badge: 'Benchmark Dept',
    metricLabel: 'Avg Dept Rating',
    metricValue: '4.85 / 5.0',
    type: 'department',
  },
  upcomingReviewDeadlines: [
    { id: 'rev-1', internName: 'Ediomo Effiong', dueDate: 'Tomorrow, 5:00 PM', type: 'Mid-Term Evaluation', supervisor: 'Tochukwu Mgbemena' },
    { id: 'rev-2', internName: 'Ediomo Effiong', dueDate: 'Jul 28, 2026', type: 'Sprint 4 Check-in', supervisor: 'Tochukwu Mgbemena' },
    { id: 'rev-3', internName: 'Ediomo Effiong', dueDate: 'Jul 30, 2026', type: 'Final Internship Assessment', supervisor: 'Tochukwu Mgbemena' },
  ],
  overdueTasks: [
    { id: 'task-101', title: 'API Integration Test Suite', assignee: 'Ediomo Effiong', dept: 'Backend', daysOverdue: 2 },
    { id: 'task-102', title: 'Figma Design System Audit', assignee: 'Ediomo Effiong', dept: 'UI/UX Design', daysOverdue: 1 },
  ],
};

// Filter options lookup dataset
export const mockFilterOptions = {
  dateRanges: [
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 30 Days', value: 'last_30' },
    { label: 'Last 90 Days', value: 'last_90' },
    { label: 'Year to Date', value: 'ytd' },
  ],
  departments: ['All Departments', 'FifthLab', 'Engineering', 'Human Resources', 'UI/UX Design', 'Product Management'],
  batches: ['All Cohorts', 'Cohort Q1-2026', 'Cohort Q2-2026', 'Cohort Q3-2026'],
  supervisors: ['All Supervisors', 'Tochukwu Mgbemena', 'Moradeke Akintola', 'Tinu Adeyemi'],
  interns: ['All Interns', 'Ediomo Effiong'],
  taskStatuses: ['All Statuses', 'Completed', 'In Progress', 'Pending Review', 'Overdue'],
  reviewCycles: ['All Cycles', 'Onboarding Review', 'Mid-Term Evaluation', 'Final Assessment'],
  onboardingStatuses: ['All Onboarding Statuses', 'Completed', 'In Progress', 'Not Started'],
};
