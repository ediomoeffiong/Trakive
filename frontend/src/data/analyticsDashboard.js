/**
 * @file analyticsDashboard.js
 * @description Metrics and statistics for the Reports & Analytics module.
 */

export const mockDashboardMetrics = {
  overallPerformanceScore: 0,
  performanceScoreTrend: '0%',
  performanceScorePositive: true,
  activeInterns: 0,
  activeInternsTrend: '0',
  activeInternsPositive: true,
  completedTasks: 0,
  completedTasksTrend: '0%',
  completedTasksPositive: true,
  tasksInProgress: 0,
  tasksInProgressTrend: '0',
  tasksInProgressPositive: true,
  pendingReviews: 0,
  pendingReviewsTrend: '0',
  pendingReviewsPositive: false,
  completedReviews: 0,
  completedReviewsTrend: '0%',
  completedReviewsPositive: true,
  onboardingCompletionRate: '0%',
  onboardingCompletionTrend: '0%',
  onboardingCompletionPositive: true,
  averagePerformanceRating: 0,
  averagePerformanceRatingTrend: '0',
  averagePerformanceRatingPositive: true,
  organizationHealthScore: '100/100',
  organizationHealthTrend: 'Good',
  organizationHealthPositive: true,
};

export const mockSummaryReportCards = {
  bestPerformingIntern: null,
  mostImprovedIntern: null,
  supervisorPerformance: null,
  highestPerformingDept: null,
  upcomingReviewDeadlines: [],
  overdueTasks: [],
};

export const mockFilterOptions = {
  dateRanges: [
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last 30 Days', value: 'last_30' },
    { label: 'Last 90 Days', value: 'last_90' },
    { label: 'Year to Date', value: 'ytd' },
  ],
  departments: ['All Departments', 'FifthLab'],
  batches: ['All Cohorts'],
  supervisors: ['All Supervisors', 'Tochukwu Mgbemmena'],
  interns: ['All Interns'],
  taskStatuses: ['All Statuses', 'Completed', 'In Progress', 'Pending Review', 'Overdue'],
  reviewCycles: ['All Cycles', 'Onboarding Review', 'Mid-Term Evaluation', 'Final Assessment'],
  onboardingStatuses: ['All Onboarding Statuses', 'Completed', 'In Progress', 'Not Started'],
};

export const mockExportHistory = [];
