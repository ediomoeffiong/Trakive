/**
 * @file projectService.js
 * @description Axios API calls for project management with seamless network fallback store.
 */
import api from './api';

const STORAGE_KEY = 'trakive_projects_store';

// Helper to check if error is network/offline or unauthenticated (401/403)
const isNetworkError = (err) => {
  return (
    !err?.response ||
    err?.code === 'ERR_NETWORK' ||
    err?.code === 'ECONNREFUSED' ||
    err?.response?.status === 401 ||
    err?.response?.status === 403
  );
};

// Default projects list starts completely empty (no demo projects)
const INITIAL_MOCK_PROJECTS = [];

const getLocalProjects = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_PROJECTS));
      return INITIAL_MOCK_PROJECTS;
    }
    let parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Purge old demo projects if present (proj-1, proj-2)
      const cleaned = parsed.filter((p) => p.id !== 'proj-1' && p.id !== 'proj-2');
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return INITIAL_MOCK_PROJECTS;
  } catch {
    return INITIAL_MOCK_PROJECTS;
  }
};

const saveLocalProjects = (projects) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    window.dispatchEvent(new CustomEvent('trakive-projects-updated', { detail: projects }));
  } catch (e) {
    console.error('Failed to save projects to localStorage', e);
  }
};

const getCurrentUserInfo = () => {
  try {
    const raw = localStorage.getItem('trakive_user');
    if (!raw) return { id: 'u-1', first_name: 'Alex', last_name: 'Rivera' };
    const parsed = JSON.parse(raw);
    const user = parsed?.state?.user || parsed;
    const nameParts = (user?.name || '').trim().split(' ');
    return {
      id: user?.id || 'u-1',
      first_name: user?.first_name || nameParts[0] || 'Alex',
      last_name: user?.last_name || nameParts.slice(1).join(' ') || 'Rivera',
    };
  } catch {
    return { id: 'u-1', first_name: 'Alex', last_name: 'Rivera' };
  }
};

export const projectService = {
  listProjects: async (params = {}) => {
    try {
      return await api.get('/projects', { params }).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        console.warn('Backend unavailable, using local project storage fallback.');
        let list = getLocalProjects();
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (p) => p.title.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s))
          );
        }
        if (params.status && params.status !== '') {
          list = list.filter((p) => p.status === params.status);
        }
        return { status: 'success', data: list };
      }
      throw err;
    }
  },

  getProject: async (id) => {
    try {
      return await api.get(`/projects/${id}`).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const found = list.find((p) => p.id === id);
        if (!found) throw new Error(`Project with ID ${id} not found.`);
        return { status: 'success', data: found };
      }
      throw err;
    }
  },

  createProject: async (data) => {
    try {
      return await api.post('/projects', data).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const user = getCurrentUserInfo();
        const newProj = {
          id: `proj-${Date.now()}`,
          title: data.title,
          description: data.description || '',
          priority: data.priority || 'medium',
          status: 'active',
          progress: 0,
          start_date: data.start_date || '',
          due_date: data.due_date || '',
          notes: data.notes || '',
          source: 'supervisor_assigned',
          created_at: new Date().toISOString(),
          creator_id: user.id,
          creator_first_name: user.first_name,
          creator_last_name: user.last_name,
          supervisor_id: user.id,
          supervisor_first_name: user.first_name,
          supervisor_last_name: user.last_name,
          members: (data.intern_ids || []).map((id) => ({
            intern_id: id,
            first_name: 'Intern',
            last_name: '#' + id,
            role: 'member',
          })),
          milestones: (data.milestones || []).map((m, i) => ({
            id: `m-${Date.now()}-${i}`,
            title: m.title,
            due_date: m.due_date,
            status: 'pending',
          })),
          tasks: [],
          approval_history: [{ action: 'submitted', created_at: new Date().toISOString() }],
        };
        list.unshift(newProj);
        saveLocalProjects(list);
        return { status: 'success', data: newProj };
      }
      throw err;
    }
  },

  proposeProject: async (data) => {
    try {
      return await api.post('/projects/propose', data).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const user = getCurrentUserInfo();
        const newProj = {
          id: `proj-${Date.now()}`,
          title: data.title,
          description: data.description || '',
          proposed_objectives: data.proposed_objectives || '',
          expected_outcome: data.expected_outcome || '',
          priority: data.priority || 'medium',
          status: 'pending_approval',
          progress: 0,
          start_date: data.start_date || '',
          due_date: data.due_date || '',
          notes: data.notes || '',
          source: 'intern_proposed',
          created_at: new Date().toISOString(),
          creator_id: user.id,
          creator_first_name: user.first_name,
          creator_last_name: user.last_name,
          supervisor_id: 'sup-tochukwu',
          supervisor_first_name: 'Tochukwu',
          supervisor_last_name: 'Mgbemmena',
          department: user.department || '',
          members: [
            {
              intern_id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              role: 'lead',
            },
          ],
          milestones: (data.milestones || []).map((m, i) => ({
            id: `m-${Date.now()}-${i}`,
            title: m.title,
            due_date: m.due_date,
            status: 'pending',
          })),
          tasks: [],
          approval_history: [{ action: 'submitted', created_at: new Date().toISOString() }],
        };
        list.unshift(newProj);
        saveLocalProjects(list);
        return { status: 'success', data: newProj };
      }
      throw err;
    }
  },

  updateProject: async (id, data) => {
    try {
      return await api.put(`/projects/${id}`, data).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data };
          saveLocalProjects(list);
          return { status: 'success', data: list[idx] };
        }
      }
      throw err;
    }
  },

  deleteProject: async (id) => {
    try {
      return await api.delete(`/projects/${id}`).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        let list = getLocalProjects();
        list = list.filter((p) => p.id !== id);
        saveLocalProjects(list);
        return { status: 'success', message: 'Project deleted' };
      }
      throw err;
    }
  },

  approveProject: async (id) => {
    try {
      return await api.post(`/projects/${id}/approve`).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
          list[idx].status = 'active';
          list[idx].approval_history = list[idx].approval_history || [];
          list[idx].approval_history.push({ action: 'approved', created_at: new Date().toISOString() });
          saveLocalProjects(list);
          return { status: 'success', data: list[idx] };
        }
      }
      throw err;
    }
  },

  rejectProject: async (id, reason) => {
    try {
      return await api.post(`/projects/${id}/reject`, { reason }).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
          list[idx].status = 'cancelled';
          list[idx].rejection_reason = reason;
          list[idx].approval_history = list[idx].approval_history || [];
          list[idx].approval_history.push({ action: 'rejected', reason, created_at: new Date().toISOString() });
          saveLocalProjects(list);
          return { status: 'success', data: list[idx] };
        }
      }
      throw err;
    }
  },

  requestChanges: async (id, feedback) => {
    try {
      return await api.post(`/projects/${id}/request-changes`, { feedback }).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
          list[idx].status = 'pending_approval';
          list[idx].supervisor_feedback = feedback;
          list[idx].approval_history = list[idx].approval_history || [];
          list[idx].approval_history.push({ action: 'changes_requested', feedback, created_at: new Date().toISOString() });
          saveLocalProjects(list);
          return { status: 'success', data: list[idx] };
        }
      }
      throw err;
    }
  },

  resubmitProject: async (id, data) => {
    try {
      return await api.post(`/projects/${id}/resubmit`, data).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const idx = list.findIndex((p) => p.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...data, status: 'pending_approval' };
          list[idx].approval_history = list[idx].approval_history || [];
          list[idx].approval_history.push({ action: 'resubmitted', created_at: new Date().toISOString() });
          saveLocalProjects(list);
          return { status: 'success', data: list[idx] };
        }
      }
      throw err;
    }
  },

  getProjectTasks: async (projectId) => {
    try {
      return await api.get(`/projects/${projectId}/tasks`).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const found = list.find((p) => p.id === projectId);
        return { status: 'success', data: found?.tasks || [] };
      }
      throw err;
    }
  },

  getMilestones: async (projectId) => {
    try {
      return await api.get(`/projects/${projectId}/milestones`).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const found = list.find((p) => p.id === projectId);
        return { status: 'success', data: found?.milestones || [] };
      }
      throw err;
    }
  },

  createMilestone: async (projectId, data) => {
    try {
      return await api.post(`/projects/${projectId}/milestones`, data).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const idx = list.findIndex((p) => p.id === projectId);
        if (idx !== -1) {
          const newM = { id: `m-${Date.now()}`, title: data.title, due_date: data.due_date, status: 'pending' };
          list[idx].milestones = list[idx].milestones || [];
          list[idx].milestones.push(newM);
          saveLocalProjects(list);
          return { status: 'success', data: newM };
        }
      }
      throw err;
    }
  },

  updateMilestone: async (projectId, milestoneId, data) => {
    try {
      return await api.put(`/projects/${projectId}/milestones/${milestoneId}`, data).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const proj = list.find((p) => p.id === projectId);
        if (proj && proj.milestones) {
          const mIdx = proj.milestones.findIndex((m) => m.id === milestoneId);
          if (mIdx !== -1) {
            proj.milestones[mIdx] = { ...proj.milestones[mIdx], ...data };
            saveLocalProjects(list);
            return { status: 'success', data: proj.milestones[mIdx] };
          }
        }
      }
      throw err;
    }
  },

  deleteMilestone: async (projectId, milestoneId) => {
    try {
      return await api.delete(`/projects/${projectId}/milestones/${milestoneId}`).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const list = getLocalProjects();
        const proj = list.find((p) => p.id === projectId);
        if (proj && proj.milestones) {
          proj.milestones = proj.milestones.filter((m) => m.id !== milestoneId);
          saveLocalProjects(list);
          return { status: 'success', message: 'Milestone deleted' };
        }
      }
      throw err;
    }
  },

  reorderMilestones: async (projectId, orderedIds) => {
    try {
      return await api.put(`/projects/${projectId}/milestones/reorder`, { ordered_ids: orderedIds }).then((r) => r.data);
    } catch (err) {
      if (isNetworkError(err)) {
        return { status: 'success', message: 'Reordered' };
      }
      throw err;
    }
  },
};
