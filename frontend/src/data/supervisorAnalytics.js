/**
 * @file supervisorAnalytics.js
 * @description Mock analytics datasets for Supervisor charts.
 */

export const mockPerformanceTrend = [
  { month: 'Week 1', avgScore: 3.8, target: 4.0 },
  { month: 'Week 2', avgScore: 4.1, target: 4.0 },
  { month: 'Week 3', avgScore: 4.3, target: 4.2 },
  { month: 'Week 4', avgScore: 4.2, target: 4.2 },
  { month: 'Week 5', avgScore: 4.5, target: 4.3 },
  { month: 'Week 6', avgScore: 4.6, target: 4.5 },
  { month: 'Week 7', avgScore: 4.7, target: 4.5 },
  { month: 'Week 8', avgScore: 4.6, target: 4.5 },
];

export const mockTaskDistribution = [
  { department: 'Frontend', completed: 42, inProgress: 12, pendingReview: 5 },
  { department: 'Backend', completed: 38, inProgress: 14, pendingReview: 4 },
  { department: 'UI/UX Design', completed: 29, inProgress: 8, pendingReview: 2 },
  { department: 'DevOps', completed: 18, inProgress: 6, pendingReview: 3 },
  { department: 'Product', completed: 24, inProgress: 7, pendingReview: 1 },
];

export const mockReviewStatus = [
  { name: 'Completed', value: 18, color: '#10b981' },
  { name: 'Pending Review', value: 8, color: '#f59e0b' },
  { name: 'Overdue', value: 3, color: '#ef4444' },
  { name: 'Draft', value: 5, color: '#6b7280' },
];

export const mockOnboardingProgressDistribution = [
  { stage: 'Phase 1: Setup', completed: 14, inProgress: 0, pending: 0 },
  { stage: 'Phase 2: Basics', completed: 12, inProgress: 2, pending: 0 },
  { stage: 'Phase 3: Core Skills', completed: 9, inProgress: 4, pending: 1 },
  { stage: 'Phase 4: Capstone', completed: 5, inProgress: 6, pending: 3 },
];
