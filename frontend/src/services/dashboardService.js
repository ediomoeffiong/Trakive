/**
 * @file dashboardService.js
 * @description Clean API service layer for dashboard details (no pre-filled demo clutter).
 */

import { useAppStore } from '../store/useAppStore';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  getStats: async () => {
    await delay(200);
    return {
      internshipProgress: { label: 'Overall Internship Progress', value: 0, suffix: '%', trend: '0%', trendUp: true },
      tasksCompleted: { label: 'Tasks Completed', value: 0, trend: '0', trendUp: true },
      pendingTasks: { label: 'Pending Tasks', value: 0, trend: '0', trendUp: true },
      upcomingDeadlines: { label: 'Upcoming Deadlines', value: 0, trend: '0', trendUp: true },
    };
  },

  getTasks: async () => {
    await delay(200);
    const user = useAppStore.getState()?.user;
    const userTasksKey = `trakive_user_tasks_${user?.id || 'new'}`;
    const savedTasks = localStorage.getItem(userTasksKey);
    return savedTasks ? JSON.parse(savedTasks) : [];
  },

  getActivities: async () => {
    await delay(200);
    const user = useAppStore.getState()?.user;
    const userActsKey = `trakive_user_activities_${user?.id || 'new'}`;
    const savedActs = localStorage.getItem(userActsKey);
    if (savedActs) return JSON.parse(savedActs);
    return [];
  },

  getNotifications: async () => {
    await delay(200);
    return [];
  },

  getProgress: async () => {
    await delay(200);
    const user = useAppStore.getState()?.user;
    const onboardingKey = `trakive_user_onboarding_${user?.id || 'new'}`;
    const savedOb = localStorage.getItem(onboardingKey);
    let completedCount = 0;
    let totalCount = 11;
    if (savedOb) {
      const parsed = JSON.parse(savedOb);
      totalCount = parsed.length || 11;
      completedCount = parsed.filter((s) => s.status === 'completed' || s.status === 'verified').length;
    }
    const obPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const profileCompleted = user?.profileCompleted ? 100 : 25;

    return {
      profileCompletion: { value: profileCompleted, label: 'Profile Details Setup' },
      onboarding: { value: obPct, completedSteps: completedCount, totalSteps: totalCount },
      weeklyGoal: { value: 0, completedTasks: 0, totalTasks: 0 },
      monthlyCompletion: { value: 0 },
      internship: { durationText: 'Active Internship' },
    };
  },

  getChartData: async () => {
    await delay(200);
    return {
      productivity: [
        { day: 'Mon', tasks: 0 },
        { day: 'Tue', tasks: 0 },
        { day: 'Wed', tasks: 0 },
        { day: 'Thu', tasks: 0 },
        { day: 'Fri', tasks: 0 },
      ],
      distribution: [
        { name: 'Completed', value: 0, color: '#10b981' },
        { name: 'In Progress', value: 0, color: '#3b82f6' },
        { name: 'Assigned', value: 0, color: '#64748b' },
      ],
      monthly: [
        { week: 'Week 1', progress: 0 },
        { week: 'Week 2', progress: 0 },
        { week: 'Week 3', progress: 0 },
        { week: 'Week 4', progress: 0 },
      ],
    };
  },
};
