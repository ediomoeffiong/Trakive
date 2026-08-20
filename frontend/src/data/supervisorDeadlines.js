/**
 * @file supervisorDeadlines.js
 * @description Mock upcoming deadlines data for Supervisor Dashboard.
 */

export const mockDeadlines = [
  {
    id: 'dead-1',
    internName: 'Ediomo Effiong',
    internAvatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    taskTitle: 'CI/CD Security Audit Report',
    dueDate: '2026-07-24', // Today (overdue / due today)
    priority: 'High',
    status: 'Overdue',
    isOverdue: true,
  },
  {
    id: 'dead-2',
    internName: 'Ediomo Effiong',
    internAvatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    taskTitle: 'Design System Tokens PR',
    dueDate: '2026-07-25',
    priority: 'High',
    status: 'Pending Review',
    isOverdue: false,
  },
  {
    id: 'dead-3',
    internName: 'Ediomo Effiong',
    internAvatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    taskTitle: 'Churn Prediction Model Baseline',
    dueDate: '2026-07-26',
    priority: 'Medium',
    status: 'In Progress',
    isOverdue: false,
  },
  {
    id: 'dead-4',
    internName: 'Ediomo Effiong',
    internAvatar: 'https://media.licdn.com/dms/image/v2/D4E03AQHi3ZYYUFg3BA/profile-displayphoto-scale_200_200/B4EZn2pX4JIQAY-/0/1760779700254?e=2147483647&v=beta&t=m2VcejF7Sc7-T5m2cldFz4lrewoSSMY6HyHc63NBtkM',
    taskTitle: 'API Latency Benchmark',
    dueDate: '2026-07-28',
    priority: 'Low',
    status: 'In Progress',
    isOverdue: false,
  },
];
