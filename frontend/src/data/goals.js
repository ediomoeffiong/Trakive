/**
 * @file goals.js
 * @description Mock development goals for the intern, derived from review feedback.
 */

export const mockDevelopmentGoals = [
  {
    id: 'goal-001',
    title: 'Improve Time Estimation Accuracy',
    description:
      'Break down every new task into sub-tasks of no more than 2 hours each before providing an estimate. Track actual vs. estimated time weekly.',
    progress: 65,
    status: 'in-progress',
    targetDate: '2026-07-31',
    sourceReviewId: 'rev-001',
    sourceReviewTitle: 'Month 1 Performance Review',
    category: 'productivity',
  },
  {
    id: 'goal-002',
    title: 'Enhance Inline Code Documentation',
    description:
      'Add JSDoc comments to every function in new code. Include parameter types, return types, and usage examples for exported utilities.',
    progress: 40,
    status: 'in-progress',
    targetDate: '2026-07-15',
    sourceReviewId: 'rev-001',
    sourceReviewTitle: 'Month 1 Performance Review',
    category: 'quality',
  },
  {
    id: 'goal-003',
    title: 'Adopt Mobile-First Design Approach',
    description:
      'Begin every new design project with mobile wireframes before scaling up to desktop. Include mobile specs in all design handoff documents.',
    progress: 80,
    status: 'in-progress',
    targetDate: '2026-07-20',
    sourceReviewId: 'rev-003',
    sourceReviewTitle: 'Week 4 Mid-Period Review',
    category: 'quality',
  },
  {
    id: 'goal-004',
    title: 'Proactive Blocker Communication',
    description:
      'Share any blockers in the team channel within 2 hours of encountering them. Provide daily async updates on long-running tasks.',
    progress: 90,
    status: 'nearly-complete',
    targetDate: '2026-07-10',
    sourceReviewId: 'rev-002',
    sourceReviewTitle: 'Week 2 Check-in Review',
    category: 'communication',
  },
  {
    id: 'goal-005',
    title: 'Own a Feature End-to-End',
    description:
      'Take full ownership of one feature from requirements gathering through design, implementation, testing, and deployment during Month 2.',
    progress: 20,
    status: 'in-progress',
    targetDate: '2026-07-31',
    sourceReviewId: 'rev-001',
    sourceReviewTitle: 'Month 1 Performance Review',
    category: 'initiative',
  },
  {
    id: 'goal-006',
    title: 'Deepen Design System Knowledge',
    description:
      'Review and document all existing design system tokens and components. Propose at least 2 improvements or additions based on current project needs.',
    progress: 100,
    status: 'completed',
    targetDate: '2026-07-05',
    sourceReviewId: 'rev-003',
    sourceReviewTitle: 'Week 4 Mid-Period Review',
    category: 'quality',
  },
];
