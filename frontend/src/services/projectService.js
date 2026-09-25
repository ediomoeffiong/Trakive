/**
 * @file projectService.js
 * @description Real API calls for project management.
 *
 * Project data is server-owned. Network failures are deliberately allowed to
 * propagate so the UI can show an honest unavailable state instead of reading
 * or mutating a second, browser-only project store.
 */
import api from './api';

const dataOf = (request) => request.then((response) => response.data);

export const projectService = {
  listProjects: (params = {}) => dataOf(api.get('/projects', { params })),
  getProject: (id) => dataOf(api.get(`/projects/${id}`)),
  createProject: (data) => dataOf(api.post('/projects', data)),
  proposeProject: (data) => dataOf(api.post('/projects/propose', data)),
  updateProject: (id, data) => dataOf(api.put(`/projects/${id}`, data)),
  deleteProject: (id) => dataOf(api.delete(`/projects/${id}`)),
  approveProject: (id) => dataOf(api.post(`/projects/${id}/approve`)),
  rejectProject: (id, reason) => dataOf(api.post(`/projects/${id}/reject`, { reason })),
  requestChanges: (id, feedback) => dataOf(api.post(`/projects/${id}/request-changes`, { feedback })),
  resubmitProject: (id, data) => dataOf(api.post(`/projects/${id}/resubmit`, data)),
  getProjectTasks: (projectId) => dataOf(api.get(`/projects/${projectId}/tasks`)),
  createProjectTask: (projectId, data) => dataOf(api.post(`/projects/${projectId}/tasks`, data)),
  getMilestones: (projectId) => dataOf(api.get(`/projects/${projectId}/milestones`)),
  createMilestone: (projectId, data) => dataOf(api.post(`/projects/${projectId}/milestones`, data)),
  updateMilestone: (projectId, milestoneId, data) =>
    dataOf(api.put(`/projects/${projectId}/milestones/${milestoneId}`, data)),
  deleteMilestone: (projectId, milestoneId) =>
    dataOf(api.delete(`/projects/${projectId}/milestones/${milestoneId}`)),
  reorderMilestones: (projectId, orderedIds) =>
    dataOf(api.put(`/projects/${projectId}/milestones/reorder`, { ordered_ids: orderedIds })),
};
