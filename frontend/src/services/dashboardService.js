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

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardService = {
  getStats: async () => {
    await delay(700);
    return { ...mockDashboardStats };
  },

  getTasks: async () => {
    await delay(900);
    return [...mockTasks];
  },

  getActivities: async () => {
    await delay(600);
    return [...mockActivities];
  },

  getNotifications: async () => {
    await delay(500);
    return [...mockNotifications];
  },

  getProgress: async () => {
    await delay(700);
    return { ...mockProgress };
  },

  getChartData: async () => {
    await delay(800);
    return {
      productivity: [...mockWeeklyProductivity],
      distribution: [...mockTaskStatusDistribution],
      monthly: [...mockMonthlyProgress]
    };
  }
};
