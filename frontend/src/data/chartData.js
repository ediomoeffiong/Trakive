/**
 * @file chartData.js
 * @description Comprehensive mock data structures for Recharts visualization components.
 */

// Line Chart: Weekly Intern Performance
export const mockWeeklyPerformanceTrend = [
  { period: 'Week 1', avgScore: 3.9, targetScore: 4.0, topPerformerScore: 4.5 },
  { period: 'Week 2', avgScore: 4.1, targetScore: 4.0, topPerformerScore: 4.7 },
  { period: 'Week 3', avgScore: 4.2, targetScore: 4.2, topPerformerScore: 4.8 },
  { period: 'Week 4', avgScore: 4.0, targetScore: 4.2, topPerformerScore: 4.6 },
  { period: 'Week 5', avgScore: 4.4, targetScore: 4.3, topPerformerScore: 4.9 },
  { period: 'Week 6', avgScore: 4.6, targetScore: 4.5, topPerformerScore: 5.0 },
  { period: 'Week 7', avgScore: 4.7, targetScore: 4.5, topPerformerScore: 4.95 },
  { period: 'Week 8', avgScore: 4.65, targetScore: 4.5, topPerformerScore: 5.0 },
];

// Line Chart: Monthly Performance Trend
export const mockMonthlyPerformanceTrend = [
  { month: 'Jan', performance: 3.8, completionRate: 72, satisfaction: 80 },
  { month: 'Feb', performance: 4.0, completionRate: 78, satisfaction: 84 },
  { month: 'Mar', performance: 4.2, completionRate: 83, satisfaction: 88 },
  { month: 'Apr', performance: 4.3, completionRate: 85, satisfaction: 89 },
  { month: 'May', performance: 4.5, completionRate: 91, satisfaction: 93 },
  { month: 'Jun', performance: 4.7, completionRate: 95, satisfaction: 96 },
  { month: 'Jul', performance: 4.6, completionRate: 92, satisfaction: 94 },
];

// Bar Chart: Task Completion by Department
export const mockDeptTaskCompletion = [
  { department: 'FifthLab', completed: 95, inProgress: 24, pendingReview: 8 },
  { department: 'Engineering', completed: 82, inProgress: 30, pendingReview: 12 },
  { department: 'Human Resources', completed: 45, inProgress: 10, pendingReview: 4 },
  { department: 'UI/UX Design', completed: 64, inProgress: 14, pendingReview: 5 },
  { department: 'Product Mgmt', completed: 56, inProgress: 6, pendingReview: 2 },
];

// Bar Chart: Department & Supervisor Comparisons
export const mockPerformanceComparison = [
  { entity: 'FifthLab', score: 4.8, taskSpeed: 94, reviewQuality: 98 },
  { entity: 'Engineering', score: 4.5, taskSpeed: 88, reviewQuality: 92 },
  { entity: 'UI/UX Design', score: 4.6, taskSpeed: 91, reviewQuality: 95 },
  { entity: 'HR & Ops', score: 4.3, taskSpeed: 85, reviewQuality: 90 },
];

// Donut Chart: Task Status Distribution
export const mockAnalyticsTaskStatusDistribution = [
  { name: 'Completed', value: 342, color: '#10b981' },
  { name: 'In Progress', value: 84, color: '#3b82f6' },
  { name: 'Pending Review', value: 18, color: '#f59e0b' },
  { name: 'Overdue', value: 6, color: '#ef4444' },
];


// Donut Chart: Review Status Distribution
export const mockReviewStatusDistribution = [
  { name: 'Completed', value: 126, color: '#10b981' },
  { name: 'In Progress', value: 24, color: '#6366f1' },
  { name: 'Pending Approval', value: 18, color: '#f59e0b' },
  { name: 'Overdue', value: 4, color: '#ef4444' },
];

// Donut Chart: Onboarding Completion
export const mockOnboardingCompletion = [
  { name: 'Phase 1: Setup', value: 100, color: '#10b981' },
  { name: 'Phase 2: Fundamentals', value: 92, color: '#3b82f6' },
  { name: 'Phase 3: Core Tasks', value: 78, color: '#8b5cf6' },
  { name: 'Phase 4: Final Capstone', value: 45, color: '#f59e0b' },
];

// Area Chart: Productivity Growth Over Time
export const mockProductivityGrowth = [
  { month: 'Jan', velocity: 120, velocityBenchmark: 100, commits: 340 },
  { month: 'Feb', velocity: 145, velocityBenchmark: 110, commits: 420 },
  { month: 'Mar', velocity: 190, velocityBenchmark: 120, commits: 510 },
  { month: 'Apr', velocity: 230, velocityBenchmark: 130, commits: 680 },
  { month: 'May', velocity: 280, velocityBenchmark: 140, commits: 840 },
  { month: 'Jun', velocity: 340, velocityBenchmark: 150, commits: 990 },
  { month: 'Jul', velocity: 390, velocityBenchmark: 160, commits: 1120 },
];

// Radar Chart: Multi-dimensional Skill Matrix
export const mockRadarSkillMatrix = [
  { subject: 'Communication', internScore: 4.8, deptAverage: 4.2, maxMark: 5.0 },
  { subject: 'Technical Skills', internScore: 4.9, deptAverage: 4.4, maxMark: 5.0 },
  { subject: 'Teamwork', internScore: 4.7, deptAverage: 4.3, maxMark: 5.0 },
  { subject: 'Initiative', internScore: 4.6, deptAverage: 4.0, maxMark: 5.0 },
  { subject: 'Quality of Work', internScore: 4.95, deptAverage: 4.5, maxMark: 5.0 },
  { subject: 'Attendance', internScore: 5.0, deptAverage: 4.7, maxMark: 5.0 },
  { subject: 'Punctuality', internScore: 4.8, deptAverage: 4.5, maxMark: 5.0 },
];

// Heatmap: GitHub-style contribution grid mock (52 weeks x 7 days)
export const generateHeatmapData = () => {
  const data = [];
  const today = new Date('2026-07-24');
  for (let i = 180; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    // Simulate commit/task activity levels (0: none, 1-3: light, 4-7: medium, 8+: high)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCount = isWeekend ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 10) + 1;
    data.push({
      date: date.toISOString().split('T')[0],
      count: baseCount,
      level: baseCount === 0 ? 0 : baseCount < 3 ? 1 : baseCount < 6 ? 2 : baseCount < 9 ? 3 : 4,
    });
  }
  return data;
};

export const mockHeatmapData = generateHeatmapData();
