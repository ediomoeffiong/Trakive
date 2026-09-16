import api from './api';

export const supervisorService = {
  async fetchDashboard() {
    try {
      const [internsRes, queueRes, projectsRes, weeklyRes] = await Promise.all([
        api.get('/interns', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/onboarding/supervisor/queue').catch(() => ({ data: {} })),
        api.get('/projects', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/weekly-plans', { params: { limit: 100 } }).catch(() => ({ data: {} })),
      ]);

      const internsData = internsRes.data?.data?.items || internsRes.data?.items || internsRes.data?.data || [];
      const queueData = queueRes.data?.data || queueRes.data || [];
      const projectsData = projectsRes.data?.data || projectsRes.data || [];
      const weeklyData = weeklyRes.data?.data || weeklyRes.data || [];

      const activeProjects = projectsData.filter((p) => p.status === 'active' || p.status === 'in_progress').length;
      const pendingReviews = queueData.length + weeklyData.filter((w) => w.status === 'submitted').length;
      const reviewsDue = weeklyData.filter((w) => w.status === 'submitted').length;

      return {
        kpis: [
          { id: 'total-interns', label: 'Total Assigned Interns', value: String(internsData.length), trend: `${internsData.length} active`, trendUp: true },
          { id: 'active-projects', label: 'Active Projects', value: String(activeProjects), trend: `${projectsData.length} total`, trendUp: true },
          { id: 'pending-reviews', label: 'Pending Task Reviews', value: String(pendingReviews), trend: 'Requires action', trendUp: pendingReviews === 0 },
          { id: 'reviews-due', label: 'Reviews Due This Week', value: String(reviewsDue), trend: 'Weekly reports', trendUp: true },
        ],
      };
    } catch {
      return {
        kpis: [
          { id: 'total-interns', label: 'Total Assigned Interns', value: '0', trend: '0%', trendUp: true },
          { id: 'active-projects', label: 'Active Projects', value: '0', trend: '0%', trendUp: true },
          { id: 'pending-reviews', label: 'Pending Task Reviews', value: '0', trend: '0%', trendUp: true },
          { id: 'reviews-due', label: 'Reviews Due This Week', value: '0', trend: '0%', trendUp: true },
        ],
      };
    }
  },

  async fetchInterns(params = {}) {
    try {
      const res = await api.get('/interns', {
        params: {
          search: params.search || '',
          department_id: params.department !== 'All' ? params.department : undefined,
          status: params.status !== 'All' ? params.status : undefined,
          limit: 100
        }
      });
      const rawItems = res.data?.data?.items || res.data?.items || res.data?.data || [];

      const formattedInterns = rawItems.map((item) => ({
        id: item.user_id || item.id,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email,
        email: item.email,
        department: item.department_name || item.department || 'Engineering',
        currentTask: item.current_task || (item.onboarding_ready ? 'Onboarding Complete' : 'Completing Onboarding'),
        performanceScore: item.performance_score || '4.8',
        onboardingProgress: item.onboarding_ready ? 100 : (item.onboarding_step ? item.onboarding_step * 33 : 33),
        status: item.intern_status === 'active' ? 'Active' : (item.intern_status === 'onboarding' ? 'Pending Review' : 'Active'),
        lastActive: item.updated_at ? new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
        avatar: item.avatar_url || null,
      }));

      return {
        interns: formattedInterns,
        total: formattedInterns.length,
      };
    } catch {
      return { interns: [], total: 0 };
    }
  },

  async fetchAnalytics() {
    try {
      const res = await api.get('/analytics/dashboard');
      const data = res.data?.data || {};
      
      return {
        performanceTrend: data.performanceTrend || [],
        taskDistribution: data.taskDistribution || [],
        reviewStatus: data.reviewStatus || [],
        onboardingProgress: data.onboardingProgress || [],
      };
    } catch {
      return {
        performanceTrend: [],
        taskDistribution: [],
        reviewStatus: [],
        onboardingProgress: [],
      };
    }
  },

  async fetchActivity() {
    try {
      const res = await api.get('/audit-logs', { params: { limit: 10 } });
      const logs = res.data?.data || res.data || [];
      return {
        activities: logs.map(l => ({
          id: l.id,
          user: l.user_name || 'System',
          action: l.action,
          target: l.entity_type,
          time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: l.created_at,
          avatar: l.user_avatar || null,
        }))
      };
    } catch {
      return { activities: [] };
    }
  },

  async fetchDeadlines() {
    try {
      const res = await api.get('/tasks', { params: { status: 'todo,in_progress', limit: 10 } });
      const tasks = res.data?.data || res.data || [];
      return {
        deadlines: tasks.filter(t => t.due_date).map(t => ({
          id: t.id,
          title: t.title,
          assignee: t.assignee_name || 'Unassigned',
          dueDate: t.due_date,
          priority: t.priority || 'normal',
          status: t.status,
        }))
      };
    } catch {
      return { deadlines: [] };
    }
  },

  async fetchWidgets() {
    try {
      const [queueRes, internsRes, weeklyRes] = await Promise.all([
        api.get('/onboarding/supervisor/queue').catch(() => ({ data: {} })),
        api.get('/interns', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/weekly-plans', { params: { limit: 100 } }).catch(() => ({ data: {} })),
      ]);

      const queue = queueRes.data?.data || queueRes.data || [];
      const interns = internsRes.data?.data?.items || internsRes.data?.items || internsRes.data?.data || [];
      const weekly = weeklyRes.data?.data || weeklyRes.data || [];

      const queueItems = Array.isArray(queue) ? queue : [];
      const pendingApprovals = queueItems.map((item, idx) => ({
        id: item.id || item.intern_id || item.internId || item.user_id || `approval-${idx}`,
        intern: item.internName || item.intern || item.name
          || `${item.first_name || ''} ${item.last_name || ''}`.trim()
          || 'Intern',
        type: item.progress_label || item.type || (item.onboarding_ready ? 'Onboarding Complete' : 'Onboarding Review'),
      }));

      const reviewReminders = weekly.filter(w => w.status === 'submitted').map((w, idx) => ({
        id: w.id || `weekly-${idx}`,
        intern: w.intern_name || w.internName || 'Intern',
        internName: w.intern_name || w.internName || 'Intern',
        reviewType: w.title || 'Weekly Report',
        title: `Review Weekly Plan: ${w.title || 'Weekly Report'}`,
        dueDate: w.created_at ? new Date(w.created_at).toLocaleDateString() : '—',
        urgency: 'warning',
      }));

      const recentlyAssigned = interns.slice(0, 5).map((i, idx) => ({
        id: i.user_id || i.id || `intern-${idx}`,
        name: `${i.first_name || ''} ${i.last_name || ''}`.trim() || i.email,
        department: i.department_name || 'Department',
        assignedDate: i.created_at ? new Date(i.created_at).toLocaleDateString() : 'recently',
        assignedAt: i.created_at || new Date().toISOString(),
        avatar: i.avatar_url,
      }));

      const totalCount = interns.length;
      const readyCount = interns.filter(i => i.onboarding_ready).length;
      const avgProgress = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;
      const topPerformer = interns[0] ? `${interns[0].first_name} ${interns[0].last_name}`.trim() : '—';

      return {
        pendingApprovals,
        reviewReminders,
        recentlyAssigned,
        announcements: [],
        teamSummary: { totalInterns: totalCount, avgProgress, topPerformer },
      };
    } catch {
      return {
        pendingApprovals: [],
        reviewReminders: [],
        recentlyAssigned: [],
        announcements: [],
        teamSummary: { totalInterns: 0, avgProgress: 0, topPerformer: '—' },
      };
    }
  },
};
