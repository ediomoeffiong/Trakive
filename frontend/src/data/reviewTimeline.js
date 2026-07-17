/**
 * @file reviewTimeline.js
 * @description Mock timeline events for each review cycle, keyed by review ID.
 */

export const mockReviewTimelines = {
  'rev-001': [
    {
      id: 'tl-001-1',
      event: 'Self-Assessment Submitted',
      description: 'Intern submitted self-assessment ratings and reflections.',
      timestamp: '2026-06-29T09:15:00Z',
      status: 'completed',
      icon: 'self',
    },
    {
      id: 'tl-001-2',
      event: 'Review Scheduled',
      description: 'Supervisor scheduled the formal review meeting.',
      timestamp: '2026-06-29T11:00:00Z',
      status: 'completed',
      icon: 'scheduled',
    },
    {
      id: 'tl-001-3',
      event: 'Supervisor Evaluation Completed',
      description: 'Supervisor completed ratings and written feedback.',
      timestamp: '2026-07-01T14:30:00Z',
      status: 'completed',
      icon: 'evaluation',
    },
    {
      id: 'tl-001-4',
      event: 'Review Published',
      description: 'Review results shared with intern.',
      timestamp: '2026-07-02T09:00:00Z',
      status: 'completed',
      icon: 'published',
    },
  ],

  'rev-002': [
    {
      id: 'tl-002-1',
      event: 'Self-Assessment Submitted',
      description: 'Intern submitted self-assessment ratings and reflections.',
      timestamp: '2026-06-13T11:00:00Z',
      status: 'completed',
      icon: 'self',
    },
    {
      id: 'tl-002-2',
      event: 'Review Scheduled',
      description: 'Supervisor scheduled the formal review meeting.',
      timestamp: '2026-06-13T14:00:00Z',
      status: 'completed',
      icon: 'scheduled',
    },
    {
      id: 'tl-002-3',
      event: 'Supervisor Evaluation Completed',
      description: 'Supervisor completed ratings and written feedback.',
      timestamp: '2026-06-14T17:00:00Z',
      status: 'completed',
      icon: 'evaluation',
    },
    {
      id: 'tl-002-4',
      event: 'Review Published',
      description: 'Review results shared with intern.',
      timestamp: '2026-06-15T09:00:00Z',
      status: 'completed',
      icon: 'published',
    },
  ],

  'rev-003': [
    {
      id: 'tl-003-1',
      event: 'Self-Assessment Submitted',
      description: 'Intern submitted self-assessment ratings and reflections.',
      timestamp: '2026-06-27T14:00:00Z',
      status: 'completed',
      icon: 'self',
    },
    {
      id: 'tl-003-2',
      event: 'Review Scheduled',
      description: 'Supervisor scheduled the formal review meeting.',
      timestamp: '2026-06-27T16:00:00Z',
      status: 'completed',
      icon: 'scheduled',
    },
    {
      id: 'tl-003-3',
      event: 'Supervisor Evaluation Completed',
      description: 'Supervisor completed ratings and written feedback.',
      timestamp: '2026-06-28T16:00:00Z',
      status: 'completed',
      icon: 'evaluation',
    },
    {
      id: 'tl-003-4',
      event: 'Review Published',
      description: 'Review results shared with intern.',
      timestamp: '2026-06-29T09:00:00Z',
      status: 'completed',
      icon: 'published',
    },
  ],

  'rev-005': [
    {
      id: 'tl-005-1',
      event: 'Self-Assessment Submitted',
      description: 'Waiting for intern to submit self-assessment.',
      timestamp: null,
      status: 'pending',
      icon: 'self',
    },
    {
      id: 'tl-005-2',
      event: 'Review Scheduled',
      description: 'Review will be scheduled once self-assessment is submitted.',
      timestamp: null,
      status: 'upcoming',
      icon: 'scheduled',
    },
    {
      id: 'tl-005-3',
      event: 'Supervisor Evaluation',
      description: 'Supervisor will complete the evaluation.',
      timestamp: null,
      status: 'upcoming',
      icon: 'evaluation',
    },
    {
      id: 'tl-005-4',
      event: 'Review Published',
      description: 'Results will be shared after evaluation.',
      timestamp: null,
      status: 'upcoming',
      icon: 'published',
    },
  ],
};
