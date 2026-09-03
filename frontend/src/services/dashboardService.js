/**
 * @file dashboardService.js
 * @description Mock API service layer for dashboard details.
 */

import {
  mockDashboardStats,
  mockTasks,
  mockActivities,
  mockNotifications,
  mockProgress,
  mockWeeklyProductivity,
  mockTaskStatusDistribution,
  mockMonthlyProgress
} from '../data';
import { useAppStore } from '../store/useAppStore';

const isDemoUser = () => {
  try {
    const user = useAppStore.getState()?.user;
    if (!user) return false;
    const demoIds = ['u-1', 'u-2', 'u-3', 'u-4'];
    const demoEmails = ['intern@trakive.com', 'supervisor@trakive.com', 'hr@trakive.com', 'head@trakive.com'];
    return demoIds.includes(user.id) || demoEmails.includes(user.email?.toLowerCase());
  } catch {
    return false;
  }
};

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  getStats: async () => {
    await delay(300);
    if (!isDemoUser()) {
      return {
        internshipProgress: { label: 'Overall Internship Progress', value: 0, suffix: '%', trend: '0%', trendUp: true },
        tasksCompleted: { label: 'Tasks Completed', value: 0, trend: '0', trendUp: true },
        pendingTasks: { label: 'Pending Tasks', value: 0, trend: '0', trendUp: true },
        upcomingDeadlines: { label: 'Upcoming Deadlines', value: 0, trend: '0', trendUp: true },
      };
    }
    return { ...mockDashboardStats };
  },

  getTasks: async () => {
    await delay(350);
    if (!isDemoUser()) {
      const user = useAppStore.getState()?.user;
      const userTasksKey = `trakive_user_tasks_${user?.id || 'new'}`;
      const savedTasks = localStorage.getItem(userTasksKey);
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [...mockTasks];
  },

  getActivities: async () => {
    await delay(300);
    if (!isDemoUser()) {
      const user = useAppStore.getState()?.user;
      const userActsKey = `trakive_user_activities_${user?.id || 'new'}`;
      const savedActs = localStorage.getItem(userActsKey);
      if (savedActs) return JSON.parse(savedActs);
      return [
        {
          id: `act-${Date.now()}`,
          type: 'profile_updated',
          title: 'Account Created',
          description: 'Welcome to Trakive! Account registration complete.',
          timestamp: 'Just now'
        }
      ];
    }
    return [...mockActivities];
  },

  getNotifications: async () => {
    await delay(300);
    if (!isDemoUser()) {
      return [];
    }
    return [...mockNotifications];
  },

  getProgress: async () => {
    await delay(300);
    if (!isDemoUser()) {
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
        internship: { durationText: 'Day 1 of Internship' }
      };
    }
    return { ...mockProgress };
  },

  getChartData: async () => {
    await delay(300);
    if (!isDemoUser()) {
      return {
        productivity: [
          { day: 'Mon', tasks: 0 },
          { day: 'Tue', tasks: 0 },
          { day: 'Wed', tasks: 0 },
          { day: 'Thu', tasks: 0 },
          { day: 'Fri', tasks: 0 }
        ],
        distribution: [
          { name: 'Completed', value: 0, color: '#10b981' },
          { name: 'In Progress', value: 0, color: '#3b82f6' },
          { name: 'Assigned', value: 0, color: '#64748b' }
        ],
        monthly: [
          { week: 'Week 1', progress: 0 },
          { week: 'Week 2', progress: 0 },
          { week: 'Week 3', progress: 0 },
          { week: 'Week 4', progress: 0 }
        ]
      };
    }
    return {
      productivity: [...mockWeeklyProductivity],
      distribution: [...mockTaskStatusDistribution],
      monthly: [...mockMonthlyProgress]
    };
  }
};
