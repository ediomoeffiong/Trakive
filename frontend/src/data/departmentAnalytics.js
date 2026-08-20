/**
 * @file departmentAnalytics.js
 * @description Mock data for Department Head Analytics & Reports.
 */

export const performanceTrends = [
  { month: 'Jan', avgScore: 82.5, technical: 84.0, softSkills: 81.0, benchmark: 80.0 },
  { month: 'Feb', avgScore: 85.0, technical: 86.5, softSkills: 83.5, benchmark: 80.0 },
  { month: 'Mar', avgScore: 87.2, technical: 88.0, softSkills: 86.4, benchmark: 80.0 },
  { month: 'Apr', avgScore: 89.4, technical: 90.2, softSkills: 88.6, benchmark: 80.0 },
  { month: 'May', avgScore: 90.8, technical: 91.5, softSkills: 90.1, benchmark: 80.0 },
  { month: 'Jun', avgScore: 92.4, technical: 93.8, softSkills: 91.0, benchmark: 80.0 },
  { month: 'Jul', avgScore: 93.5, technical: 94.6, softSkills: 92.4, benchmark: 80.0 },
];

export const taskCompletionCharts = {
  byStatus: [
    { name: 'Completed', value: 340, color: '#10b981' },
    { name: 'In Progress', value: 112, color: '#3b82f6' },
    { name: 'Under Review', value: 38, color: '#f59e0b' },
    { name: 'Delayed / Behind', value: 14, color: '#ef4444' },
  ],
  byCategory: [
    { category: 'Frontend Development', completed: 95, inProgress: 28, delayed: 3 },
    { category: 'Backend & APIs', completed: 110, inProgress: 35, delayed: 5 },
    { category: 'DevOps Infrastructure', completed: 48, inProgress: 18, delayed: 2 },
    { category: 'Data & Machine Learning', completed: 52, inProgress: 20, delayed: 3 },
    { category: 'QA & Automation', completed: 35, inProgress: 11, delayed: 1 },
  ],
  weeklyVelocity: [
    { week: 'Wk 1', created: 45, completed: 40 },
    { week: 'Wk 2', created: 50, completed: 48 },
    { week: 'Wk 3', created: 52, completed: 55 },
    { week: 'Wk 4', created: 60, completed: 58 },
    { week: 'Wk 5', created: 58, completed: 62 },
    { week: 'Wk 6', created: 64, completed: 66 },
  ],
};

export const reviewStatistics = {
  totalReviews: 186,
  onTimePercentage: 94.6,
  avgTurnaroundHours: 18.4,
  ratingDistribution: [
    { grade: 'Exceeds Expectations (90-100%)', count: 24, percentage: '57.1%' },
    { grade: 'Meets Expectations (75-89%)', count: 15, percentage: '35.7%' },
    { grade: 'Needs Improvement (60-74%)', count: 3, percentage: '7.2%' },
    { grade: 'Unsatisfactory (<60%)', count: 0, percentage: '0%' },
  ],
  supervisorTurnaround: [
    { supervisor: 'Tochukwu Mgbemena', reviewsDone: 42, avgHours: 14.2, onTime: 98 },
    { supervisor: 'Tochukwu Mgbemena', reviewsDone: 48, avgHours: 16.5, onTime: 96 },
    { supervisor: 'Tochukwu Mgbemena', reviewsDone: 26, avgHours: 12.0, onTime: 100 },
    { supervisor: 'Tochukwu Mgbemena', reviewsDone: 34, avgHours: 20.1, onTime: 91 },
    { supervisor: 'Tochukwu Mgbemena', reviewsDone: 36, avgHours: 19.8, onTime: 92 },
  ],
};

export const internshipCompletionTrends = [
  { cohort: '2024 Q3', enrolled: 30, completed: 28, passRate: 93.3, distinctionRate: 40.0 },
  { cohort: '2024 Q4', enrolled: 32, completed: 31, passRate: 96.8, distinctionRate: 43.7 },
  { cohort: '2025 Q1', enrolled: 35, completed: 34, passRate: 97.1, distinctionRate: 48.5 },
  { cohort: '2025 Q2', enrolled: 38, completed: 37, passRate: 97.3, distinctionRate: 52.6 },
  { cohort: '2025 Q3', enrolled: 40, completed: 39, passRate: 97.5, distinctionRate: 55.0 },
  { cohort: '2026 Alpha', enrolled: 42, completed: 41, passRate: 97.6, distinctionRate: 59.5 },
];

export const deptMetricsOverview = {
  activeProjects: 18,
  totalMentorshipHours: 840,
  averageAttendanceRate: 98.4,
  hireConversionEligibility: 78.5,
};
