/**
 * @file taskTimeline.js
 * @description Mock activity timeline events for the Supervisor Task Management module.
 */

export const mockTaskTimeline = {
  'task-001': [
    {
      id: 'evt-001-1',
      type: 'created',
      title: 'Task Created',
      description: 'Task "Build User Authentication UI" was created by Dr. Ediomo Effiong',
      actor: 'Dr. Ediomo Effiong',
      timestamp: '2026-07-20T09:00:00',
      timeAgo: '11 days ago',
    },
    {
      id: 'evt-001-2',
      type: 'assigned',
      title: 'Assigned to Interns',
      description: 'Task assigned to Amara Osei and Kofi Mensah',
      actor: 'Dr. Ediomo Effiong',
      timestamp: '2026-07-20T09:30:00',
      timeAgo: '11 days ago',
    },
    {
      id: 'evt-001-3',
      type: 'updated',
      title: 'Instructions Updated',
      description: 'Dr. Ediomo Effiong added clarification to step 7 about accessibility requirements',
      actor: 'Dr. Ediomo Effiong',
      timestamp: '2026-07-22T14:00:00',
      timeAgo: '9 days ago',
    },
    {
      id: 'evt-001-4',
      type: 'progress',
      title: 'Progress Update',
      description: 'Amara Osei updated progress to 65% — working on login and register screens',
      actor: 'Ediomo Effiong',
      timestamp: '2026-07-28T11:00:00',
      timeAgo: '3 days ago',
    },
  ],
  'task-002': [
    {
      id: 'evt-002-1',
      type: 'created',
      title: 'Task Created',
      description: 'Task "API Integration & Data Fetching Layer" was created',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-07-18T08:00:00',
      timeAgo: '13 days ago',
    },
    {
      id: 'evt-002-2',
      type: 'assigned',
      title: 'Assigned to Zara Nwosu',
      description: 'Task assigned to Zara Nwosu for backend integration work',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-07-18T08:30:00',
      timeAgo: '13 days ago',
    },
    {
      id: 'evt-002-3',
      type: 'submitted',
      title: 'First Submission',
      description: 'Zara Nwosu submitted attempt 1 — basic Axios setup',
      actor: 'Ediomo Effiong',
      timestamp: '2026-08-02T11:15:00',
      timeAgo: '5 hours ago',
    },
    {
      id: 'evt-002-4',
      type: 'reviewed',
      title: 'Submission Reviewed',
      description: 'Marcus Rodriguez reviewed attempt 1 with score 68/100 — needs revision',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-08-03T10:00:00',
      timeAgo: '4 hours ago',
    },
    {
      id: 'evt-002-5',
      type: 'submitted',
      title: 'Second Submission',
      description: 'Zara Nwosu submitted attempt 2 — revised with complete error handling',
      actor: 'Ediomo Effiong',
      timestamp: '2026-08-04T14:32:00',
      timeAgo: '1 hour ago',
    },
  ],
  'task-004': [
    {
      id: 'evt-004-1',
      type: 'created',
      title: 'Task Created',
      description: 'Task "Database Schema Design" was created',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-07-10T09:00:00',
      timeAgo: '21 days ago',
    },
    {
      id: 'evt-004-2',
      type: 'assigned',
      title: 'Assigned to Fatima Al-Hassan',
      description: 'Task assigned to Fatima Al-Hassan',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-07-10T09:30:00',
      timeAgo: '21 days ago',
    },
    {
      id: 'evt-004-3',
      type: 'submitted',
      title: 'Submission Received',
      description: 'Fatima Al-Hassan submitted complete schema with ERD and migration scripts',
      actor: 'Ediomo Effiong',
      timestamp: '2026-07-27T16:45:00',
      timeAgo: '4 days ago',
    },
    {
      id: 'evt-004-4',
      type: 'reviewed',
      title: 'Submission Reviewed',
      description: 'Marcus Rodriguez reviewed and approved with score 94/100',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-07-28T09:30:00',
      timeAgo: '3 days ago',
    },
    {
      id: 'evt-004-5',
      type: 'approved',
      title: 'Task Completed & Approved',
      description: 'Task marked as completed. Outstanding work!',
      actor: 'Marcus Rodriguez',
      timestamp: '2026-07-28T09:35:00',
      timeAgo: '3 days ago',
    },
  ],
};

export const getTaskTimeline = (taskId) => {
  return mockTaskTimeline[taskId] || [
    {
      id: `${taskId}-created`,
      type: 'created',
      title: 'Task Created',
      description: 'Task was created and added to the task board',
      actor: 'Supervisor',
      timestamp: '2026-07-20T09:00:00',
      timeAgo: '11 days ago',
    },
    {
      id: `${taskId}-assigned`,
      type: 'assigned',
      title: 'Assigned to Interns',
      description: 'Task was assigned to intern(s)',
      actor: 'Supervisor',
      timestamp: '2026-07-20T09:30:00',
      timeAgo: '11 days ago',
    },
  ];
};

export default mockTaskTimeline;
