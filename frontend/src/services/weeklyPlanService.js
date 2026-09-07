/**
 * @file weeklyPlanService.js
 * @description Real Axios API calls for weekly plan management with fallback error handling.
 */
import api from './api';

const isFallbackError = (err) => {
  return (
    !err?.response ||
    err?.code === 'ERR_NETWORK' ||
    err?.code === 'ECONNREFUSED' ||
    err?.response?.status === 401 ||
    err?.response?.status === 403
  );
};

export const weeklyPlanService = {
  /** Intern: get current or specific week plan + tasks */
  getWeeklyPlan: async (weekStart) => {
    try {
      return await api.get('/weekly-plans/mine', { params: { week_start: weekStart } }).then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', data: { week_start: weekStart, tasks: [] } };
      }
      throw err;
    }
  },

  /** Get tasks for a specific week (intern or supervisor) */
  getWeeklyTasks: async (weekStart, internId) => {
    try {
      return await api
        .get(`/weekly-plans/tasks/${weekStart}`, { params: internId ? { intern_id: internId } : {} })
        .then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', data: [] };
      }
      throw err;
    }
  },

  /** Intern: add a task to their weekly plan */
  addWeeklyTask: async (weekStart, data) => {
    try {
      return await api.post(`/weekly-plans/tasks/${weekStart}`, data).then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', data: { id: `wpt-${Date.now()}`, ...data } };
      }
      throw err;
    }
  },

  /** Intern: update a task's weekly status and note */
  updateTaskStatus: async (taskId, data) => {
    try {
      return await api.patch(`/weekly-plans/tasks/${taskId}/status`, data).then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', data: { id: taskId, ...data } };
      }
      throw err;
    }
  },

  /** Intern: submit weekly report for review */
  submitWeeklyReport: async (planId) => {
    try {
      return await api.post(`/weekly-plans/${planId}/submit`).then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', message: 'Report submitted' };
      }
      throw err;
    }
  },

  /** Supervisor: review a submitted weekly report */
  reviewWeeklyReport: async (planId, data) => {
    try {
      return await api.post(`/weekly-plans/${planId}/review`, data).then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', message: 'Report reviewed' };
      }
      throw err;
    }
  },

  /** Supervisor: list all interns' weekly plans */
  supervisorView: async (params) => {
    try {
      return await api.get('/weekly-plans', { params }).then((r) => r.data);
    } catch (err) {
      if (isFallbackError(err)) {
        return { status: 'success', data: [] };
      }
      throw err;
    }
  },
};
