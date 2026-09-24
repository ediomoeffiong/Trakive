import api from './api';
import { normalizeDepartmentForPerson, normalizePersonRecord } from '../utils/people';

const unwrapList = (res) => {
  const payload = res?.data?.data ?? res?.data ?? [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getApiErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const mondayIso = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0];
};

const isPendingTaskReview = (task) => {
  const status = String(task?.status || '').toLowerCase().replace(/_/g, '-');
  return ['submitted', 'in-review', 'under-review', 'pending-review', 'in_review'].includes(status);
};

const formatRelative = (value) => {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const formatDueDate = (value) => {
  if (!value) return '';
  const date = new Date(String(value).includes('T') ? value : `${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const taskStatus = (task) => String(task?.status || '').toLowerCase().replace(/_/g, '-');
const assigneeName = (task) =>
  task.assignee_name ||
  [task.assignee_first_name, task.assignee_last_name].filter(Boolean).join(' ') ||
  task.internName ||
  'Unassigned intern';

export const supervisorService = {
  async fetchDashboard() {
    try {
      const [internsRes, queueRes, projectsRes, weeklyRes, tasksRes] = await Promise.all([
        api.get('/interns', { params: { limit: 100 } }),
        api.get('/onboarding/supervisor/queue').catch(() => ({ data: {} })),
        api.get('/projects', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/weekly-plans', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/tasks', { params: { page: 1, limit: 100 } }).catch(() => ({ data: {} })),
      ]);

      const internsData = unwrapList(internsRes);
      const queueData = unwrapList(queueRes);
      const projectsData = unwrapList(projectsRes);
      const weeklyData = unwrapList(weeklyRes);
      const tasksData = unwrapList(tasksRes);

      const activeProjects = projectsData.filter((p) => p.status === 'active' || p.status === 'in_progress').length;
      const pendingTaskReviews = tasksData.filter(isPendingTaskReview).length + queueData.length;
      const weekStart = mondayIso();
      const reviewsDue = weeklyData.filter((w) => {
        if (w.status !== 'submitted') return false;
        const planWeek = String(w.week_start || w.weekStart || '').slice(0, 10);
        return !planWeek || planWeek >= weekStart;
      }).length;
      const pendingReviews = pendingTaskReviews;

      return {
        kpis: [
          { id: 'total-interns', label: 'Total Assigned Interns', value: String(internsData.length), trend: `${internsData.length} active`, trendType: 'positive', iconName: 'RiTeamLine', color: 'blue', description: 'Interns assigned to you', to: '/supervisor/interns' },
          { id: 'active-projects', label: 'Active Projects', value: String(activeProjects), trend: `${projectsData.length} total`, trendType: 'positive', iconName: 'RiTaskLine', color: 'green', description: 'Projects currently in progress', to: '/supervisor/projects' },
          { id: 'pending-reviews', label: 'Pending Task Reviews', value: String(pendingReviews), trend: 'Requires action', trendType: pendingReviews === 0 ? 'positive' : 'urgent', iconName: 'RiCheckboxMultipleLine', color: 'amber', description: 'Onboarding and weekly reviews waiting', to: '/supervisor/reviews' },
          { id: 'reviews-due', label: 'Reviews Due This Week', value: String(reviewsDue), trend: 'Weekly reports', trendType: reviewsDue > 0 ? 'urgent' : 'positive', iconName: 'RiStarLine', color: 'purple', description: 'Submitted weekly reports to review', to: '/supervisor/weekly-review' },
        ],
        banner: {
          internCount: internsData.length,
          pendingReviews,
          reviewsDue,
        },
      };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to load supervisor dashboard'));
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
      const rawItems = res.data?.data?.items || res.data?.items || (Array.isArray(res.data?.data) ? res.data.data : []) || [];

      const formattedInterns = rawItems.map((item) => {
        const name = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email;
        return normalizePersonRecord({
          id: item.user_id || item.id,
          name,
          email: item.email,
          department: normalizeDepartmentForPerson({ ...item, name }, item.department_name || item.department || 'Engineering'),
          currentTask: item.current_task || (item.onboarding_ready ? 'Onboarding Complete' : 'Completing Onboarding'),
          performanceScore: item.performance_score || '4.8',
          onboardingProgress: item.onboarding_ready ? 100 : (item.onboarding_step ? item.onboarding_step * 33 : 33),
          status: item.intern_status === 'active' ? 'Active' : (item.intern_status === 'onboarding' ? 'Pending Review' : 'Active'),
          lastActive: item.updated_at ? new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          avatar: item.avatar_url || null,
        });
      });

      return {
        interns: formattedInterns,
        total: formattedInterns.length,
      };
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Failed to load assigned interns'));
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
      const res = await api.get('/tasks', { params: { page: 1, limit: 100, sort: 'updated_at:desc' } });
      const tasks = unwrapList(res);
      const activities = [...tasks]
        .sort((a, b) => String(b.updated_at || b.updatedAt || b.created_at || '').localeCompare(String(a.updated_at || a.updatedAt || a.created_at || '')))
        .slice(0, 8)
        .map((task) => {
          const status = taskStatus(task);
          const user = assigneeName(task);
          const meta =
            status === 'completed' || status === 'reviewed'
              ? { type: 'review', title: 'Completed', badgeColor: 'green', verb: 'completed' }
              : status === 'pending-review' || status === 'submitted' || status === 'in-review'
                ? { type: 'submission', title: 'Submitted', badgeColor: 'blue', verb: 'submitted' }
                : status === 'overdue'
                  ? { type: 'assignment', title: 'Overdue', badgeColor: 'amber', verb: 'is overdue on' }
                  : { type: 'assignment', title: 'Assigned', badgeColor: 'purple', verb: 'was assigned' };

          return {
            id: task.id,
            user,
            avatar: task.assignee_avatar || task.avatar_url || null,
            type: meta.type,
            title: meta.title,
            description: `${user} ${meta.verb} "${task.title || 'a task'}"`,
            time: formatRelative(task.updated_at || task.updatedAt || task.created_at),
            badgeColor: meta.badgeColor,
          };
        });
      return { activities };
    } catch {
      return { activities: [] };
    }
  },

  async fetchDeadlines() {
    try {
      const res = await api.get('/tasks', { params: { page: 1, limit: 100, sort: 'due_date:asc' } });
      const tasks = unwrapList(res);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadlines = tasks
        .filter((task) => task.due_date || task.dueDate)
        .filter((task) => !['completed', 'archived', 'cancelled'].includes(taskStatus(task)))
        .map((task) => {
          const dueRaw = task.due_date || task.dueDate;
          const due = new Date(`${String(dueRaw).slice(0, 10)}T00:00:00`);
          const isOverdue = !Number.isNaN(due.getTime()) && due < today;
          const priority = String(task.priority || 'medium');
          return {
            id: task.id,
            taskTitle: task.title,
            internName: assigneeName(task),
            internAvatar: task.assignee_avatar || task.avatar_url || null,
            dueDate: formatDueDate(dueRaw),
            priority: priority.charAt(0).toUpperCase() + priority.slice(1),
            status: isOverdue ? 'Overdue' : task.status,
            isOverdue,
            sortKey: Number.isNaN(due.getTime()) ? Number.MAX_SAFE_INTEGER : due.getTime(),
          };
        })
        .sort((a, b) => a.sortKey - b.sortKey)
        .slice(0, 8);

      return { deadlines };
    } catch {
      return { deadlines: [] };
    }
  },

  async fetchWidgets() {
    try {
      const [queueRes, internsRes, weeklyRes, tasksRes] = await Promise.all([
        api.get('/onboarding/supervisor/queue').catch(() => ({ data: {} })),
        api.get('/interns', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/weekly-plans', { params: { limit: 100 } }).catch(() => ({ data: {} })),
        api.get('/tasks', { params: { page: 1, limit: 100 } }).catch(() => ({ data: {} })),
      ]);

      const queue = unwrapList(queueRes);
      const interns = Array.isArray(internsRes.data?.data?.items)
        ? internsRes.data.data.items
        : Array.isArray(internsRes.data?.items)
          ? internsRes.data.items
          : unwrapList(internsRes);
      const weekly = unwrapList(weeklyRes);
      const tasks = unwrapList(tasksRes);

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

      const recentlyAssigned = [...interns]
        .sort((a, b) => String(b.created_at || b.createdAt || '').localeCompare(String(a.created_at || a.createdAt || '')))
        .slice(0, 5)
        .map((i, idx) => {
        const name = `${i.first_name || ''} ${i.last_name || ''}`.trim() || i.email;
        const internId = i.user_id || i.id;
        return normalizePersonRecord({
          id: internId || `intern-${idx}`,
          internId,
          name,
          department: normalizeDepartmentForPerson({ ...i, name }, i.department_name || 'Department'),
          assignedDate: i.created_at ? new Date(i.created_at).toLocaleDateString() : 'recently',
          assignedAt: i.created_at || new Date().toISOString(),
          avatar: i.avatar_url,
        });
      });

      const totalCount = interns.length;
      const readyCount = interns.filter((i) => i.onboarding_ready).length;
      const activeTasks = tasks.filter((task) => !['archived', 'cancelled'].includes(taskStatus(task)));
      const completedCount = activeTasks.filter((task) => ['completed', 'reviewed'].includes(taskStatus(task))).length;
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const overdueCount = activeTasks.filter((task) => taskStatus(task) === 'overdue' || (
        (task.due_date || task.dueDate) &&
        !['completed', 'archived'].includes(taskStatus(task)) &&
        new Date(`${String(task.due_date || task.dueDate).slice(0, 10)}T00:00:00`) < startOfToday
      )).length;
      const completionRate = activeTasks.length ? Math.round((completedCount / activeTasks.length) * 100) : 0;
      const onTimeRate = activeTasks.length ? Math.round(((activeTasks.length - overdueCount) / activeTasks.length) * 100) : 0;
      const scores = interns
        .map((intern) => Number(intern.performance_score || intern.performanceScore))
        .filter((score) => Number.isFinite(score) && score > 0);
      const avgScore = scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
      const topIntern = [...interns]
        .sort((a, b) => Number(b.performance_score || 0) - Number(a.performance_score || 0))[0];
      const topName = topIntern
        ? `${topIntern.first_name || ''} ${topIntern.last_name || ''}`.trim() || topIntern.email || '—'
        : '—';

      return {
        pendingApprovals,
        reviewReminders,
        recentlyAssigned,
        announcements: [],
        teamSummary: {
          completionRate: `${completionRate}%`,
          onTimeRate: `${onTimeRate}%`,
          satisfactionScore: totalCount
            ? (avgScore ? `${avgScore.toFixed(1)}/5` : `${readyCount}/${totalCount} ready`)
            : '—',
          topPerformingDept: topName,
          totalInterns: totalCount,
          avgProgress: completionRate,
          topPerformer: topName,
        },
      };
    } catch {
      return {
        pendingApprovals: [],
        reviewReminders: [],
        recentlyAssigned: [],
        announcements: [],
        teamSummary: { completionRate: '0%', onTimeRate: '0%', satisfactionScore: '—', topPerformingDept: '—' },
      };
    }
  },
};
