/**
 * @file dashboardStats.js
 * @description Mock statistic data for KPI cards.
 */

export const mockDashboardStats = {
  internshipProgress: {
    value: 68, // in percentage
    label: "Overall Internship Progress",
    trend: "+5%",
    trendUp: true,
    suffix: "%"
  },
  tasksCompleted: {
    value: 24,
    label: "Tasks Completed",
    trend: "+4",
    trendUp: true,
    total: 32
  },
  pendingTasks: {
    value: 8,
    label: "Pending Tasks",
    trend: "-2",
    trendUp: true
  },
  upcomingDeadlines: {
    value: 3,
    label: "Upcoming Deadlines",
    trend: "2 Overdue",
    trendUp: false
  }
};
