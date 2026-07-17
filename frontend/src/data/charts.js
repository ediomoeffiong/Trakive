/**
 * @file charts.js
 * @description Mock chart datasets for Recharts widgets.
 */

// Weekly Productivity Line Chart
export const mockWeeklyProductivity = [
  { day: "Mon", tasks: 2 },
  { day: "Tue", tasks: 4 },
  { day: "Wed", tasks: 3 },
  { day: "Thu", tasks: 6 },
  { day: "Fri", tasks: 5 },
  { day: "Sat", tasks: 1 },
  { day: "Sun", tasks: 2 }
];

// Task Status Pie Chart
export const mockTaskStatusDistribution = [
  { name: "Completed", value: 24, color: "var(--color-success-500)" },
  { name: "In Progress", value: 3, color: "var(--color-primary-500)" },
  { name: "Under Review", value: 1, color: "var(--color-warning-500)" },
  { name: "Pending", value: 4, color: "var(--color-danger-500)" }
];

// Monthly Progress Bar Chart
export const mockMonthlyProgress = [
  { week: "Week 1", progress: 15 },
  { week: "Week 2", progress: 28 },
  { week: "Week 3", progress: 35 },
  { week: "Week 4", progress: 42 },
  { week: "Week 5", progress: 50 },
  { week: "Week 6", progress: 58 },
  { week: "Week 7", progress: 65 },
  { week: "Week 8", progress: 68 }
];
