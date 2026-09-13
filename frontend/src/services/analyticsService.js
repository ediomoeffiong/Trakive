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
import { useAppStore } from '../store/useAppStore';

// Helper to determine if current session is a demo user account
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

// Helper for fetching stored items from localStorage
const getStoredItems = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Helper for simulating async API delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  /**
   * Fetch main analytics dashboard metrics and KPI cards.
   * @param {object} filters
   */
  async getDashboardMetrics(filters = {}) {
    await delay(300);

    if (!isDemoUser()) {
      const user = useAppStore.getState()?.user;
      const tasks = getStoredItems('trakive_tasks');
      const reviews = getStoredItems('trakive_reviews');
      const interns = getStoredItems('trakive_intern_profiles');

      const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
      const tasksInProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
      const pendingReviews = tasks.filter((t) => t.status === 'pending_review' || t.status === 'submitted').length + reviews.filter((r) => r.status === 'pending').length;
      const completedReviews = reviews.filter((r) => r.status === 'completed').length;
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved').length;

      const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
        : 0;

      return {
        metrics: {
          overallPerformanceScore: avgRating,
          performanceScoreTrend: '0%',
          performanceScorePositive: true,
          activeInterns: interns.length,
          activeInternsTrend: '0',
          activeInternsPositive: true,
          completedTasks: completedTasks,
          completedTasksTrend: '0%',
          completedTasksPositive: true,
          tasksInProgress: tasksInProgress,
          tasksInProgressTrend: '0',
          tasksInProgressPositive: true,
          pendingReviews: pendingReviews,
          pendingReviewsTrend: '0',
          pendingReviewsPositive: false,
          completedReviews: completedReviews,
          completedReviewsTrend: '0%',
          completedReviewsPositive: true,
          onboardingCompletionRate: '0%',
          onboardingCompletionTrend: '0%',
          onboardingCompletionPositive: true,
          averagePerformanceRating: avgRating,
          averagePerformanceRatingTrend: '0',
          averagePerformanceRatingPositive: true,
          organizationHealthScore: '100/100',
          organizationHealthTrend: 'Good',
          organizationHealthPositive: true,
        },
        summaryCards: {
          bestPerformingIntern: null,
          mostImprovedIntern: null,
          supervisorPerformance: null,
          highestPerformingDept: user?.department || null,
          upcomingReviewDeadlines: [],
          overdueTasks: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved'),
        },
        filterOptions: {
          ...mockFilterOptions,
          departments: ['All Departments', user?.department || 'FifthLab'],
          supervisors: ['All Supervisors', user?.name || 'Supervisor'],
        },
      };
    }

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
    await delay(350);

    if (!isDemoUser()) {
      const tasks = getStoredItems('trakive_tasks');
      const reviews = getStoredItems('trakive_reviews');

      const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
      const tasksInProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
      const pendingReviews = tasks.filter((t) => t.status === 'pending_review' || t.status === 'submitted').length;
      const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved').length;

      const taskStatusData = [
        { name: 'Completed', value: completedTasks, color: '#10b981' },
        { name: 'In Progress', value: tasksInProgress, color: '#3b82f6' },
        { name: 'Pending Review', value: pendingReviews, color: '#f59e0b' },
        { name: 'Overdue', value: overdueTasks, color: '#ef4444' },
      ];

      const reviewStatusData = [
        { name: 'Completed', value: reviews.filter((r) => r.status === 'completed').length, color: '#10b981' },
        { name: 'In Progress', value: reviews.filter((r) => r.status === 'in_progress').length, color: '#6366f1' },
        { name: 'Pending Approval', value: reviews.filter((r) => r.status === 'pending').length, color: '#f59e0b' },
        { name: 'Overdue', value: 0, color: '#ef4444' },
      ];

      return {
        weeklyTrend: [
          { period: 'Week 1', avgScore: 0, targetScore: 4.0, topPerformerScore: 0 },
          { period: 'Week 2', avgScore: 0, targetScore: 4.0, topPerformerScore: 0 },
          { period: 'Week 3', avgScore: 0, targetScore: 4.2, topPerformerScore: 0 },
          { period: 'Week 4', avgScore: 0, targetScore: 4.2, topPerformerScore: 0 },
        ],
        monthlyTrend: [
          { month: 'Jan', performance: 0, completionRate: 0, satisfaction: 100 },
          { month: 'Feb', performance: 0, completionRate: 0, satisfaction: 100 },
          { month: 'Mar', performance: 0, completionRate: 0, satisfaction: 100 },
        ],
        deptTaskCompletion: [
          { department: 'FifthLab', completed: completedTasks, inProgress: tasksInProgress, pendingReview: pendingReviews },
        ],
        performanceComparison: [
          { entity: 'FifthLab', score: 0, taskSpeed: 100, reviewQuality: 100 },
        ],
        taskStatus: taskStatusData,
        reviewStatus: reviewStatusData,
        onboardingCompletion: [
          { name: 'Phase 1: Setup', value: 100, color: '#10b981' },
          { name: 'Phase 2: Fundamentals', value: 0, color: '#3b82f6' },
          { name: 'Phase 3: Core Tasks', value: 0, color: '#8b5cf6' },
          { name: 'Phase 4: Final Capstone', value: 0, color: '#f59e0b' },
        ],
        productivityGrowth: [
          { month: 'Jan', velocity: 0, velocityBenchmark: 100, commits: 0 },
          { month: 'Feb', velocity: 0, velocityBenchmark: 100, commits: 0 },
        ],
        skillMatrix: [
          { subject: 'Communication', internScore: 0, deptAverage: 0, maxMark: 5.0 },
          { subject: 'Technical Skills', internScore: 0, deptAverage: 0, maxMark: 5.0 },
          { subject: 'Teamwork', internScore: 0, deptAverage: 0, maxMark: 5.0 },
          { subject: 'Initiative', internScore: 0, deptAverage: 0, maxMark: 5.0 },
          { subject: 'Quality of Work', internScore: 0, deptAverage: 0, maxMark: 5.0 },
        ],
        heatmapData: mockHeatmapData,
      };
    }

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
    await delay(300);
    if (!isDemoUser()) {
      const saved = getStoredItems('trakive_saved_reports');
      const exports = getStoredItems('trakive_export_history');
      return {
        savedReports: saved,
        exportHistory: exports,
      };
    }
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
    if (!isDemoUser()) {
      const tasks = getStoredItems('trakive_tasks');
      const completed = tasks.filter((t) => t.status === 'completed' || t.status === 'approved').length;
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;

      const dynamicInsights = [
        {
          id: 'insight-1',
          title: 'Analytics Engine Live',
          description: 'Your central performance intelligence dashboard is active and synced with real workspace activities.',
          type: 'positive',
          category: 'Overview',
          timestamp: 'Just now',
          metric: 'Active',
          impact: 'Low Impact',
        },
      ];

      if (overdue === 0) {
        dynamicInsights.push({
          id: 'insight-2',
          title: 'Deadline Status Clear',
          description: 'No overdue tasks detected in your department pipeline.',
          type: 'positive',
          category: 'Deadlines',
          timestamp: 'Just now',
          metric: '0 Overdue',
          impact: 'Low Impact',
        });
      } else {
        dynamicInsights.push({
          id: 'insight-2',
          title: 'Overdue Task Alert',
          description: `${overdue} task(s) currently require attention to meet upcoming deadlines.`,
          type: 'warning',
          category: 'Deadlines',
          timestamp: 'Just now',
          metric: `${overdue} Overdue`,
          impact: 'Critical Alert',
        });
      }

      if (completed > 0) {
        dynamicInsights.push({
          id: 'insight-3',
          title: 'Task Completion Logged',
          description: `${completed} task(s) successfully completed in your workspace.`,
          type: 'positive',
          category: 'Productivity',
          timestamp: 'Today',
          metric: `${completed} Done`,
          impact: 'Medium Impact',
        });
      }

      return dynamicInsights;
    }

    return mockInsights;
  },

  /**
   * Save a new or edited report configuration.
   * @param {object} reportConfig
   */
  async saveReport(reportConfig) {
    await delay(400);
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

    if (!isDemoUser()) {
      const current = getStoredItems('trakive_saved_reports');
      localStorage.setItem('trakive_saved_reports', JSON.stringify([newReport, ...current]));
    }

    return newReport;
  },

  /**
   * Simulate report generation & export process with progress updates callback.
   * @param {object} exportConfig
   * @param {function} onProgress
   */
  async generateExport(exportConfig, onProgress) {
    onProgress?.(15);
    await delay(200);
    onProgress?.(45);
    await delay(300);
    onProgress?.(80);
    await delay(200);
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

    if (!isDemoUser()) {
      const current = getStoredItems('trakive_export_history');
      localStorage.setItem('trakive_export_history', JSON.stringify([newExportRecord, ...current]));
    }

    return newExportRecord;
  },
};
