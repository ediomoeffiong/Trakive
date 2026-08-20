/**
 * @file supervisorService.js
 * @description Service abstraction for Supervisor API requests.
 * Uses artificial delay to simulate asynchronous backend requests.
 */

import { mockSupervisorKPIs } from '../data/supervisorDashboard';
import { mockInterns } from '../data/interns';
import {
  mockPerformanceTrend,
  mockTaskDistribution,
  mockReviewStatus,
  mockOnboardingProgressDistribution,
} from '../data/supervisorAnalytics';
import { mockSupervisorActivities } from '../data/supervisorActivity';
import { mockDeadlines } from '../data/supervisorDeadlines';
import {
  mockPendingApprovals,
  mockReviewReminders,
  mockRecentlyAssignedInterns,
  mockOrgAnnouncements,
  mockTeamPerformanceSummary,
} from '../data/supervisorWidgets';

const DELAY_MS = 600; // Simulated network delay

const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

export const supervisorService = {
  /**
   * Fetch KPI metrics summary for supervisor dashboard
   */
  async fetchDashboard() {
    await delay();
    return {
      kpis: mockSupervisorKPIs,
    };
  },

  /**
   * Fetch list of interns assigned to supervisor
   */
  async fetchInterns(params = {}) {
    await delay();
    let result = [...mockInterns];

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q) ||
          i.currentTask.toLowerCase().includes(q),
      );
    }

    if (params.department && params.department !== 'All') {
      result = result.filter((i) => i.department === params.department);
    }

    if (params.status && params.status !== 'All') {
      result = result.filter((i) => i.status === params.status);
    }

    return {
      interns: result,
      total: result.length,
    };
  },

  /**
   * Fetch dashboard analytics charts data
   */
  async fetchAnalytics() {
    await delay();
    return {
      performanceTrend: mockPerformanceTrend,
      taskDistribution: mockTaskDistribution,
      reviewStatus: mockReviewStatus,
      onboardingProgress: mockOnboardingProgressDistribution,
    };
  },

  /**
   * Fetch supervisor activity stream
   */
  async fetchActivity() {
    await delay();
    return {
      activities: mockSupervisorActivities,
    };
  },

  /**
   * Fetch upcoming & overdue deadlines
   */
  async fetchDeadlines() {
    await delay();
    return {
      deadlines: mockDeadlines,
    };
  },

  /**
   * Fetch modular supervisor widgets data
   */
  async fetchWidgets() {
    await delay();
    return {
      pendingApprovals: mockPendingApprovals,
      reviewReminders: mockReviewReminders,
      recentlyAssigned: mockRecentlyAssignedInterns,
      announcements: mockOrgAnnouncements,
      teamSummary: mockTeamPerformanceSummary,
    };
  },
};

export default supervisorService;
