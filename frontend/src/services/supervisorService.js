/**
 * @file supervisorService.js
 * @description Clean Service abstraction for Supervisor API requests.
 */

const DELAY_MS = 200;
const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

export const supervisorService = {
  async fetchDashboard() {
    await delay();
    return {
      kpis: [
        { label: 'Total Assigned Interns', value: 0, trend: '0%', trendUp: true },
        { label: 'Active Projects', value: 0, trend: '0%', trendUp: true },
        { label: 'Pending Approvals', value: 0, trend: '0%', trendUp: true },
        { label: 'Average Intern Score', value: '—', trend: '0%', trendUp: true },
      ],
    };
  },

  async fetchInterns(params = {}) {
    await delay();
    return {
      interns: [],
      total: 0,
    };
  },

  async fetchAnalytics() {
    await delay();
    return {
      performanceTrend: [],
      taskDistribution: [],
      reviewStatus: [],
      onboardingProgress: [],
    };
  },

  async fetchActivity() {
    await delay();
    return {
      activities: [],
    };
  },

  async fetchDeadlines() {
    await delay();
    return {
      deadlines: [],
    };
  },

  async fetchWidgets() {
    await delay();
    return {
      approvals: [],
      reminders: [],
      recentlyAssigned: [],
      announcements: [],
      performanceSummary: { totalInterns: 0, avgProgress: 0, topPerformer: '—' },
    };
  },
};
