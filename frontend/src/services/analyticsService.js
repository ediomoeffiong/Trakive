/**
 * @file analyticsService.js
 * @description Service layer for fetching analytics metrics, chart data, reports, and AI insights.
 * Uses mock datasets with artificial network delays to imitate production API behavior.
 */

import {
  mockDashboardMetrics,
  mockSummaryReportCards,
  mockFilterOptions,
  mockWeeklyPerformanceTrend,
  mockMonthlyPerformanceTrend,
  mockDeptTaskCompletion,
  mockPerformanceComparison,
  mockAnalyticsTaskStatusDistribution as mockTaskStatusDistribution,
  mockReviewStatusDistribution,

  mockOnboardingCompletion,
  mockProductivityGrowth,
  mockRadarSkillMatrix,
  mockHeatmapData,
  mockSavedReports,
  mockExportHistory,
  mockInsights,
} from '../data';

// Helper for simulating async API delay
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  /**
   * Fetch main analytics dashboard metrics and KPI cards.
   * @param {object} filters
   */
  async getDashboardMetrics(filters = {}) {
    await delay(300);
    return {
      metrics: mockDashboardMetrics,
      summaryCards: mockSummaryReportCards,
      filterOptions: mockFilterOptions,
    };
  },

  /**
   * Fetch chart data filtered by period, department, etc.
   * @param {object} filters
   */
  async getChartData(filters = {}) {
    await delay(450);
    return {
      weeklyTrend: mockWeeklyPerformanceTrend,
      monthlyTrend: mockMonthlyPerformanceTrend,
      deptTaskCompletion: mockDeptTaskCompletion,
      performanceComparison: mockPerformanceComparison,
      taskStatus: mockTaskStatusDistribution,
      reviewStatus: mockReviewStatusDistribution,
      onboardingCompletion: mockOnboardingCompletion,
      productivityGrowth: mockProductivityGrowth,
      skillMatrix: mockRadarSkillMatrix,
      heatmapData: mockHeatmapData,
    };
  },

  /**
   * Fetch saved reports list and export history.
   */
  async getSavedReports() {
    await delay(350);
    return {
      savedReports: mockSavedReports,
      exportHistory: mockExportHistory,
    };
  },

  /**
   * Fetch automated AI system insights.
   */
  async getAIInsights(filters = {}) {
    await delay(300);
    return mockInsights;
  },

  /**
   * Save a new or edited report configuration.
   * @param {object} reportConfig
   */
  async saveReport(reportConfig) {
    await delay(500);
    const newReport = {
      id: `report-${Date.now()}`,
      title: reportConfig.title || 'Untitled Custom Report',
      description: reportConfig.description || 'Custom generated report layout.',
      lastGenerated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      owner: reportConfig.owner || 'Current User',
      ownerRole: reportConfig.ownerRole || 'Supervisor',
      tags: reportConfig.tags || ['Custom'],
      isFavorite: false,
      reportType: reportConfig.reportType || 'Performance',
      period: reportConfig.period || 'This Month',
      metricsCount: reportConfig.metrics?.length || 4,
    };
    return newReport;
  },

  /**
   * Simulate report generation & export process with progress updates callback.
   * @param {object} exportConfig
   * @param {function} onProgress
   */
  async generateExport(exportConfig, onProgress) {
    onProgress?.(15);
    await delay(300);
    onProgress?.(45);
    await delay(400);
    onProgress?.(80);
    await delay(300);
    onProgress?.(100);

    const format = exportConfig.format || 'PDF';
    const newExportRecord = {
      id: `exp-${Date.now()}`,
      fileName: exportConfig.fileName || `Analytics_Report_${Date.now()}.${format.toLowerCase()}`,
      format: format,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      status: 'Completed',
    };
    return newExportRecord;
  },
};
