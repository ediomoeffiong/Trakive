/**
 * @file supervisorNotes.js
 * @description Private supervisor notes per intern. Visible only within the Supervisor interface.
 */

export const mockSupervisorNotes = {
  'int-001': [
    {
      id: 'note-001-1',
      internId: 'int-001',
      title: 'Exceptional Design Token Work',
      content:
        'Sarah has shown exceptional understanding of design systems. Her implementation of the token pipeline was ahead of schedule and showed great attention to cross-platform consistency. Consider recommending her for a more senior project scope next cycle.',
      createdAt: '2026-07-15T10:30:00Z',
      updatedAt: '2026-07-15T10:30:00Z',
      isPinned: true,
      category: 'Performance',
      color: '#4f46e5',
    },
    {
      id: 'note-001-2',
      internId: 'int-001',
      title: 'Mid-term Review Notes',
      content:
        'Mid-term review went smoothly. Sarah is self-directed and requires minimal hand-holding. Follow up on her request for more challenging task assignments — she may be ready for a team lead task component. Check in next Friday.',
      createdAt: '2026-07-10T14:00:00Z',
      updatedAt: '2026-07-10T14:00:00Z',
      isPinned: false,
      category: 'Review',
      color: '#059669',
    },
    {
      id: 'note-001-3',
      internId: 'int-001',
      title: 'Communication Observation',
      content:
        'Sarah tends to go quiet during sprint planning. Might be worth setting up a 1-on-1 to explore if she needs more context before meetings or if there are blockers she\'s hesitant to surface publicly.',
      createdAt: '2026-07-05T09:15:00Z',
      updatedAt: '2026-07-05T09:15:00Z',
      isPinned: false,
      category: 'Observation',
      color: '#d97706',
    },
  ],
  'int-002': [
    {
      id: 'note-002-1',
      internId: 'int-002',
      title: 'API Optimization Progress',
      content:
        'Marcus made solid progress on the API latency task. Reduced P99 by ~35ms. Will need guidance on query optimization for the next stage — schedule a pair coding session.',
      createdAt: '2026-07-20T11:00:00Z',
      updatedAt: '2026-07-20T11:00:00Z',
      isPinned: true,
      category: 'Technical',
      color: '#4f46e5',
    },
    {
      id: 'note-002-2',
      internId: 'int-002',
      title: 'Documentation Gaps',
      content:
        'Marcus has been producing solid code but documentation is lagging. Flag this in next review and provide the team doc template as a reference. Goal: all PRs must include inline comments before week 8.',
      createdAt: '2026-07-08T16:45:00Z',
      updatedAt: '2026-07-08T16:45:00Z',
      isPinned: false,
      category: 'Improvement',
      color: '#dc2626',
    },
  ],
  'int-003': [
    {
      id: 'note-003-1',
      internId: 'int-003',
      title: 'Outstanding Performance — Consider Return Offer',
      content:
        'Elena has consistently exceeded expectations across every dimension. 100% onboarding, perfect attendance, 4.9 performance score. Strongly recommend for a return offer. Discuss with HR before August 1st.',
      createdAt: '2026-07-22T09:00:00Z',
      updatedAt: '2026-07-22T09:00:00Z',
      isPinned: true,
      category: 'Performance',
      color: '#059669',
    },
    {
      id: 'note-003-2',
      internId: 'int-003',
      title: 'Figma Library Delivery',
      content:
        'The component library Elena delivered has been adopted by 3 other teams. She documented every component variant and wrote usage guidelines. This level of output sets the bar for future interns.',
      createdAt: '2026-07-18T13:30:00Z',
      updatedAt: '2026-07-18T13:30:00Z',
      isPinned: false,
      category: 'Achievement',
      color: '#059669',
    },
  ],
  'int-004': [
    {
      id: 'note-004-1',
      internId: 'int-004',
      title: 'Pending Review — Action Required',
      content:
        'David has 2 task reviews pending sign-off on my end. Need to prioritize reviewing his CI/CD audit report by end of week. Don\'t let this slip further.',
      createdAt: '2026-07-25T08:00:00Z',
      updatedAt: '2026-07-25T08:00:00Z',
      isPinned: true,
      category: 'Action Required',
      color: '#dc2626',
    },
    {
      id: 'note-004-2',
      internId: 'int-004',
      title: 'Onboarding Catch-Up Plan',
      content:
        'David is behind on onboarding milestones due to delayed document submission. Created a catch-up plan: complete modules 3-5 by July 30th. Set a reminder check-in for July 28th.',
      createdAt: '2026-07-12T10:30:00Z',
      updatedAt: '2026-07-12T10:30:00Z',
      isPinned: false,
      category: 'Onboarding',
      color: '#d97706',
    },
  ],
  'int-005': [
    {
      id: 'note-005-1',
      internId: 'int-005',
      title: 'Strong Stakeholder Communication',
      content:
        'Aisha\'s survey analysis presentation was one of the clearest I\'ve seen from an intern. She told a compelling story with the data and anticipated questions well. Recommend including her in the Q3 roadmap session.',
      createdAt: '2026-07-19T15:00:00Z',
      updatedAt: '2026-07-19T15:00:00Z',
      isPinned: true,
      category: 'Performance',
      color: '#4f46e5',
    },
  ],
  'int-006': [
    {
      id: 'note-006-1',
      internId: 'int-006',
      title: 'Struggling with Model Training — Schedule Support',
      content:
        'Lucas has flagged difficulty with the churn model convergence. This is an advanced problem — arrange a session with the senior ML engineer (Priya) to unblock him. Don\'t let this stall his momentum.',
      createdAt: '2026-07-24T09:30:00Z',
      updatedAt: '2026-07-24T09:30:00Z',
      isPinned: true,
      category: 'Support Needed',
      color: '#dc2626',
    },
    {
      id: 'note-006-2',
      internId: 'int-006',
      title: 'Onboarding Delays',
      content:
        'Lucas started late (July 1) compared to the rest of the cohort. His onboarding is naturally behind the group. Adjust expectations accordingly and track him on his own pace, not vs. the cohort average.',
      createdAt: '2026-07-10T11:00:00Z',
      updatedAt: '2026-07-10T11:00:00Z',
      isPinned: false,
      category: 'Context',
      color: '#64748b',
    },
  ],
  'int-007': [
    {
      id: 'note-007-1',
      internId: 'int-007',
      title: 'Accessibility Audit Quality',
      content:
        'Emily\'s a11y audit identified 47 WCAG violations across the product — well above what we expected. Her remediation recommendations were also actionable and prioritized by severity. Great work.',
      createdAt: '2026-07-21T14:00:00Z',
      updatedAt: '2026-07-21T14:00:00Z',
      isPinned: false,
      category: 'Performance',
      color: '#059669',
    },
  ],
  'int-008': [
    {
      id: 'note-008-1',
      internId: 'int-008',
      title: 'On Leave — Check-in on Return',
      content:
        'James is currently on approved personal leave. Expected return: July 28th. Schedule a 30-min re-onboarding call for July 28th to catch him up on any changes during his absence.',
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
      isPinned: true,
      category: 'Leave Management',
      color: '#64748b',
    },
  ],
};

export default mockSupervisorNotes;
