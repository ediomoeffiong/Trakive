/**
 * @file internManagementService.js
 * @description Service abstraction for the Supervisor Intern Management module.
 * All methods return Promises with artificial delays to simulate backend responses.
 * Replace mock data imports with real API calls (axios) to connect to the backend.
 */

import api from './api';
import { weeklyPlanService } from './weeklyPlanService';
import { reviewService } from './reviewService';
import { mockInternProfiles } from '../data/internProfiles';
import { mockInternProgress } from '../data/internProgress';
import { mockInternDocuments } from '../data/internDocuments';
import { mockSupervisorNotes } from '../data/supervisorNotes';
import { mockInternActivity } from '../data/internActivity';
import { mockInternPerformance } from '../data/internPerformance';
import { normalizeDepartmentForPerson, normalizePersonRecord } from '../utils/people';

// ── Simulated network delay ──────────────────────────────────────────────────
const DELAY_MS = 600;
const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory mutable store for notes (simulates a database)
const NOTES_STORAGE_KEY = 'trakive_supervisor_intern_notes';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const loadNotesStore = () => {
  if (typeof localStorage === 'undefined') return JSON.parse(JSON.stringify(mockSupervisorNotes));
  return safeParse(localStorage.getItem(NOTES_STORAGE_KEY), JSON.parse(JSON.stringify(mockSupervisorNotes)));
};

const saveNotesStore = (store) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(store));
  }
};

let notesStore = loadNotesStore();

const unwrapApiData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const dateOnly = (value) => {
  if (!value) return null;
  return String(value).split('T')[0];
};

const getDurationLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return 'N/A';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'N/A';
  const months = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24 * 30.44)));
  return `${months} month${months === 1 ? '' : 's'}`;
};

const normalizeTask = (task = {}) => ({
  id: task.id || task.task_id || `task-${Date.now()}`,
  title: task.title || task.taskTitle || 'Untitled task',
  description: task.description || task.weekly_note || '',
  status: task.status || task.end_of_week_status || 'pending',
  priority: task.priority || 'medium',
  dueDate: task.due_date || task.dueDate || null,
  weekStart: task.week_start || task.weekStart || null,
  source: task.task_source || task.source || 'weekly',
  projectName: task.project_name || task.projectName || '',
  notes: task.weekly_note || task.notes || '',
});

const normalizeWeeklyPlan = (plan = {}) => {
  const tasks = Array.isArray(plan.tasks) ? plan.tasks.map(normalizeTask) : [];
  return {
    id: plan.id,
    status: plan.status || 'draft',
    weekStart: plan.week_start || plan.weekStart,
    weekEnd: plan.week_end || plan.weekEnd,
    submittedAt: plan.submitted_at || plan.submittedAt,
    reviewedAt: plan.reviewed_at || plan.reviewedAt,
    feedback: plan.reviewer_feedback || plan.feedback || '',
    tasks,
    stats: plan.stats || {
      total: tasks.length,
      completed: tasks.filter((t) => ['completed', 'done'].includes(String(t.status).toLowerCase())).length,
      ongoing: tasks.filter((t) => ['ongoing', 'in_progress', 'in-progress'].includes(String(t.status).toLowerCase())).length,
      pending: tasks.filter((t) => ['pending', 'todo'].includes(String(t.status).toLowerCase())).length,
      not_done: tasks.filter((t) => ['not_done', 'blocked'].includes(String(t.status).toLowerCase())).length,
    },
  };
};

const activeInternship = (data = {}) => {
  const records = data.internships || data.internship_records || data.internshipRecords || [];
  return records.find((record) => record.status === 'active') || records[0] || null;
};

const buildProfile = (data = {}, internId) => {
  const currentInternship = activeInternship(data);
  const startDate = dateOnly(currentInternship?.start_date || currentInternship?.startDate || data.start_date || data.user_created_at || data.created_at);
  const endDate = dateOnly(currentInternship?.end_date || currentInternship?.endDate || data.end_date);
  const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name || data.email || 'Intern';

  return normalizePersonRecord({
    id: data.user_id || data.id || internId,
    internId: data.user_id || data.id || internId,
    name,
    email: data.email,
    phone: data.phone || 'N/A',
    department: normalizeDepartmentForPerson(data, data.department_name || data.department || 'FifthLab'),
    role: 'Intern',
    status: data.intern_status === 'active' ? 'Active' : (data.intern_status === 'completed' ? 'Completed' : 'Pending Review'),
    performanceScore: Number(data.performance_score || data.average_score || 0) || 4.5,
    onboardingProgress: data.onboarding_ready ? 100 : Number(data.onboarding_progress || data.onboarding_step || 50),
    university: data.institution || data.university || 'N/A',
    institution: data.institution || data.university || 'N/A',
    major: data.field_of_study || data.major || 'N/A',
    fieldOfStudy: data.field_of_study || data.major || 'N/A',
    academicYear: data.academic_year || data.academicYear || 'N/A',
    emergencyContact: data.emergency_contact || {},
    skills: data.skills || [],
    avatar: data.avatar_url || data.avatar || null,
    supervisor: data.supervisor_name || data.supervisor || 'Tochukwu Mgbemena',
    location: currentInternship?.work_location || data.work_location || 'Remote / Office',
    contractType: data.contract_type || currentInternship?.contract_type || 'Internship',
    stipend: data.stipend || 'N/A',
    startDate: startDate || 'N/A',
    endDate: endDate || 'N/A',
    duration: getDurationLabel(startDate, endDate),
    batch: data.batch_name || currentInternship?.batch_name || (startDate ? `Batch ${new Date(startDate).getFullYear()}` : 'Unassigned'),
    currentTask: data.current_task || 'No active task yet',
    lastActivity: data.last_active_at ? formatDate(data.last_active_at) : 'recently',
    datesVerified: Boolean(currentInternship?.dates_verified || data.dates_verified),
    internships: (data.internships || data.internship_records || data.internshipRecords || []).map((record, index) => ({
      id: record.id || `internship-${index}`,
      title: record.title || `Internship ${record.internship_number || index + 1} (${formatDate(record.start_date || record.startDate)} - ${formatDate(record.end_date || record.endDate)})`,
      startDate: dateOnly(record.start_date || record.startDate),
      endDate: dateOnly(record.end_date || record.endDate),
      status: record.status || 'active',
    })),
  });
};

const getInternWeeklyPlans = async (internId) => {
  const response = await weeklyPlanService.supervisorView({ intern_id: internId, limit: 50 });
  const data = unwrapApiData(response);
  const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  return items.map(normalizeWeeklyPlan).sort((a, b) => new Date(b.weekStart || 0) - new Date(a.weekStart || 0));
};

const getInternOnboardingRecord = async (internId) => {
  const queue = await reviewService.fetchOnboardingApprovals();
  return queue.find((item) =>
    [item.internId, item.intern_id, item.user_id].some((value) => String(value) === String(internId))
  ) || null;
};

// ── KPI Helpers ──────────────────────────────────────────────────────────────
function computeKPIs(interns) {
  const total = interns.length;
  const active = interns.filter((i) => i.status === 'Active').length;
  const needsAttention = interns.filter(
    (i) => i.status === 'Needs Help' || i.performanceScore < 4.2,
  ).length;
  const onboardingPending = interns.filter((i) => i.onboardingProgress < 100).length;
  const reviewsDue = interns.filter((i) => i.status === 'Pending Review').length;
  const avgScore =
    total > 0
      ? (interns.reduce((sum, i) => sum + Number(i.performanceScore || 0), 0) / total).toFixed(1)
      : '0.0';

  return [
    {
      id: 'total-interns',
      label: 'Total Interns',
      value: String(total),
      description: 'Interns currently assigned to you',
      iconName: 'RiTeamLine',
      color: 'blue',
      trend: `${total} assigned`,
      trendType: 'neutral',
    },
    {
      id: 'active-interns',
      label: 'Active Interns',
      value: String(active),
      description: 'Currently active and contributing',
      iconName: 'RiUserFollowLine',
      color: 'green',
      trend: total > 0 ? `${Math.round((active / total) * 100)}% of team` : '0% of team',
      trendType: 'positive',
    },
    {
      id: 'needs-attention',
      label: 'Needs Attention',
      value: String(needsAttention),
      description: 'Interns flagged for support',
      iconName: 'RiTaskLine',
      color: 'amber',
      trend: needsAttention > 0 ? 'Action required' : 'All clear',
      trendType: needsAttention > 0 ? 'urgent' : 'positive',
    },
    {
      id: 'onboarding-pending',
      label: 'Onboarding Pending',
      value: String(onboardingPending),
      description: 'Interns with incomplete onboarding',
      iconName: 'RiCheckboxMultipleLine',
      color: 'purple',
      trend: `${total - onboardingPending} complete`,
      trendType: 'neutral',
    },
    {
      id: 'reviews-due',
      label: 'Reviews Due',
      value: String(reviewsDue),
      description: 'Pending performance reviews',
      iconName: 'RiStarLine',
      color: 'indigo',
      trend: reviewsDue > 0 ? 'Review now' : 'Up to date',
      trendType: reviewsDue > 0 ? 'urgent' : 'positive',
    },
    {
      id: 'avg-performance',
      label: 'Avg Performance',
      value: `${avgScore}/5`,
      description: 'Average score across all interns',
      iconName: 'RiAwardLine',
      color: 'emerald',
      trend: avgScore >= 4.5 ? 'Excellent' : avgScore >= 4.0 ? 'Good' : 'Needs focus',
      trendType: avgScore >= 4.0 ? 'positive' : 'urgent',
    },
  ];
}

// ── Service Methods ──────────────────────────────────────────────────────────
export const internManagementService = {
  /**
   * Fetch full intern list with optional filtering and search.
   * @param {object} params - { search, department, status, performanceMin, performanceMax, onboardingStatus, reviewStatus, batch }
   * @returns {Promise<{ interns: Array, total: number, kpis: Array }>}
   */
  async fetchInternList(params = {}) {
    let rawResult = [];
    try {
      const res = await api.get('/interns', { params: { limit: 100 } });
      const rawItems = res.data?.data?.items || res.data?.items || res.data?.data || [];
      rawResult = rawItems.map((item) => {
        const profile = buildProfile(item, item.user_id || item.id);
        return {
          ...profile,
          currentTask: item.current_task || profile.currentTask || (item.onboarding_ready ? 'Active Internship' : 'Completing Onboarding'),
        };
      });
    } catch (err) {
      console.warn('Failed to fetch real interns from backend API:', err);
    }

    if (rawResult.length === 0 && mockInternProfiles.length > 0) {
      rawResult = mockInternProfiles.map((profile) => normalizePersonRecord(profile));
    }

    let result = rawResult;
    const allInternsUnfiltered = [...result];

    const { search, department, status, performanceMin, performanceMax, onboardingStatus, batch, period } =
      params;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.internId.toLowerCase().includes(q) ||
          i.department.toLowerCase().includes(q) ||
          i.role.toLowerCase().includes(q) ||
          i.currentTask.toLowerCase().includes(q),
      );
    }

    if (department && department !== 'All') {
      result = result.filter((i) => i.department === department);
    }

    if (status && status !== 'All') {
      result = result.filter((i) => i.status === status);
    }

    if (period && period !== 'All') {
      if (period === 'Current / Active') {
        result = result.filter((i) => i.status === 'Active' || i.status === 'Pending Review');
      } else if (period === 'Previous Internships') {
        result = result.filter((i) => i.status === 'Completed' || i.internships?.some((rec) => rec.status === 'completed'));
      } else {
        result = result.filter((i) => {
          const startStr = i.startDate || '';
          const endStr = i.endDate || '';
          return startStr.includes(period) || endStr.includes(period) || (i.batch && i.batch.includes(period));
        });
      }
    }

    if (performanceMin !== undefined && performanceMin !== '') {
      result = result.filter((i) => i.performanceScore >= Number(performanceMin));
    }

    if (performanceMax !== undefined && performanceMax !== '') {
      result = result.filter((i) => i.performanceScore <= Number(performanceMax));
    }

    if (onboardingStatus && onboardingStatus !== 'All') {
      if (onboardingStatus === 'Complete') {
        result = result.filter((i) => i.onboardingProgress === 100);
      } else if (onboardingStatus === 'In Progress') {
        result = result.filter((i) => i.onboardingProgress > 0 && i.onboardingProgress < 100);
      } else if (onboardingStatus === 'Not Started') {
        result = result.filter((i) => i.onboardingProgress === 0);
      }
    }

    if (batch && batch !== 'All') {
      result = result.filter((i) => i.batch === batch);
    }

    return {
      interns: result,
      total: result.length,
      kpis: computeKPIs(allInternsUnfiltered),
    };
  },

  /**
   * Fetch a single intern's full profile with internship records.
   * @param {string} internId
   * @returns {Promise<{ profile: object | null }>}
   */
  async fetchInternProfile(internId) {
    try {
      const res = await api.get(`/interns/${internId}`);
      const data = unwrapApiData(res);
      if (data) {
        const profile = buildProfile(data, internId);
        try {
          const plans = await getInternWeeklyPlans(profile.id);
          const latestTask = plans.flatMap((plan) => plan.tasks).find((task) =>
            !['completed', 'done'].includes(String(task.status).toLowerCase())
          );
          if (latestTask) profile.currentTask = latestTask.title;
        } catch (taskError) {
          console.warn('Failed to load current intern task:', taskError);
        }
        return { profile };
      }
    } catch (e) {
      console.warn('Failed to fetch real intern profile:', e);
    }
    const profile = normalizePersonRecord(mockInternProfiles.find((i) => i.id === internId) || null);
    return { profile };
  },


  /**
   * Fetch intern progress widgets data.
   * @param {string} internId
   * @returns {Promise<{ progress: object | null }>}
   */
  async fetchInternProgress(internId) {
    try {
      const plans = await getInternWeeklyPlans(internId);
      const tasks = plans.flatMap((plan) => plan.tasks);
      const completedTasks = tasks.filter((task) => ['completed', 'done'].includes(String(task.status).toLowerCase())).length;
      const onboarding = await getInternOnboardingRecord(internId);
      const onboardingItems = onboarding?.steps || onboarding?.documents || [];
      const onboardingCompleted = onboardingItems.filter((item) =>
        ['approved', 'verified', 'completed'].includes(String(item.status || item.reviewStatus).toLowerCase())
      ).length;
      const reviewedPlans = plans.filter((plan) => plan.reviewedAt || plan.status === 'reviewed').length;
      const onboardingTotal = onboardingItems.length || 4;
      const taskPct = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
      const onboardingPct = onboardingItems.length
        ? Math.round((onboardingCompleted / onboardingItems.length) * 100)
        : Number(onboarding?.progress || 0);
      const reviewPct = plans.length ? Math.round((reviewedPlans / plans.length) * 100) : 0;

      return {
        progress: {
          taskCompletion: { completed: completedTasks, total: tasks.length, percentage: taskPct },
          onboardingCompletion: {
            completed: onboardingItems.length ? onboardingCompleted : Math.round((onboardingPct / 100) * onboardingTotal),
            total: onboardingTotal,
            percentage: onboardingPct,
          },
          reviewCompletion: { completed: reviewedPlans, total: Math.max(plans.length, 1), percentage: reviewPct },
          overallProgress: Math.round((taskPct + onboardingPct + reviewPct) / 3),
          attendance: { present: 0, total: 0, percentage: 0, streak: 0 },
          milestones: [
            { id: 'onboarding', title: 'Onboarding completed', completed: onboardingPct === 100, date: onboardingPct === 100 ? 'Complete' : null },
            { id: 'first-task', title: 'First task assigned', completed: tasks.length > 0, date: tasks[0]?.weekStart ? formatDate(tasks[0].weekStart) : null },
            { id: 'first-review', title: 'Supervisor review completed', completed: reviewedPlans > 0, date: plans.find((plan) => plan.reviewedAt)?.reviewedAt ? formatDate(plans.find((plan) => plan.reviewedAt).reviewedAt) : null },
          ],
        },
      };
    } catch (e) {
      console.warn('Failed to fetch real progress data:', e);
      await delay(350);
      return { progress: mockInternProgress[internId] || null };
    }
  },

  async fetchInternTasks(internId) {
    try {
      const plans = await getInternWeeklyPlans(internId);
      return {
        tasks: plans.flatMap((plan) =>
          plan.tasks.map((task) => ({
            ...task,
            planId: plan.id,
            planStatus: plan.status,
            weekStart: task.weekStart || plan.weekStart,
            weekEnd: plan.weekEnd,
          }))
        ),
        plans,
      };
    } catch (e) {
      console.warn('Failed to fetch real intern tasks:', e);
      return { tasks: [], plans: [] };
    }
  },

  /**
   * Fetch intern documents.
   * @param {string} internId
   * @returns {Promise<{ documents: Array }>}
   */
  async fetchInternDocuments(internId) {
    try {
      const onboarding = await getInternOnboardingRecord(internId);
      const docs = (onboarding?.documents || onboarding?.steps || []).flatMap((item, index) => {
        const uploaded = item.uploadedDocuments || item.documents || [];
        if (uploaded.length > 0) {
          return uploaded.map((doc) => ({
            id: doc.id || `${item.id || index}-${doc.name}`,
            name: doc.name || item.title || item.name || 'Document',
            type: item.type || item.title || item.name || 'Document',
            size: doc.size ? `${Math.round(Number(doc.size) / 1024)} KB` : 'Uploaded',
            uploadedAt: formatDate(doc.uploadedAt || doc.created_at || item.uploadedAt),
            status: ['approved', 'verified', 'completed'].includes(String(doc.status || item.status).toLowerCase()) ? 'Verified' : 'Pending Review',
            url: doc.url || doc.file_url,
          }));
        }
        return {
          id: item.id || `onboarding-doc-${index}`,
          name: item.title || item.name || 'Onboarding document',
          type: item.type || item.category || 'Document',
          size: 'Required',
          uploadedAt: item.uploadedAt ? formatDate(item.uploadedAt) : 'N/A',
          status: ['approved', 'verified', 'completed'].includes(String(item.status || item.reviewStatus).toLowerCase())
            ? 'Verified'
            : (item.status ? 'Pending Review' : 'Missing'),
        };
      });
      return { documents: docs.length ? docs : (mockInternDocuments[internId] || []) };
    } catch (e) {
      console.warn('Failed to fetch real intern documents:', e);
      await delay(300);
      return { documents: mockInternDocuments[internId] || [] };
    }
  },

  /**
   * Fetch intern activity timeline.
   * @param {string} internId
   * @returns {Promise<{ activities: Array }>}
   */
  async fetchInternActivity(internId) {
    try {
      const plans = await getInternWeeklyPlans(internId);
      const taskEvents = plans.flatMap((plan) =>
        plan.tasks.map((task) => ({
          id: `task-${task.id}`,
          type: task.status === 'completed' ? 'task_submitted' : 'task_assigned',
          title: task.status === 'completed' ? 'Task updated' : 'Task assigned',
          description: `${task.title}${plan.weekStart ? ` for week of ${formatDate(plan.weekStart)}` : ''}`,
          timeAgo: task.dueDate ? `Due ${formatDate(task.dueDate)}` : formatDate(plan.weekStart),
          date: task.dueDate || plan.weekStart,
        }))
      );
      const reviewEvents = plans
        .filter((plan) => plan.reviewedAt)
        .map((plan) => ({
          id: `review-${plan.id}`,
          type: 'review_received',
          title: 'Weekly review',
          description: plan.feedback || `Weekly plan reviewed for ${formatDate(plan.weekStart)}`,
          timeAgo: formatDate(plan.reviewedAt),
          date: plan.reviewedAt,
        }));
      const onboarding = await getInternOnboardingRecord(internId);
      const onboardingEvents = (onboarding?.documents || onboarding?.steps || [])
        .filter((item) => ['approved', 'verified', 'completed'].includes(String(item.status || item.reviewStatus).toLowerCase()))
        .map((item, index) => ({
          id: `onboarding-${item.id || index}`,
          type: 'onboarding_approved',
          title: 'Onboarding',
          description: `${item.title || item.name || 'Onboarding item'} approved`,
          timeAgo: item.reviewedAt ? formatDate(item.reviewedAt) : 'Approved',
          date: item.reviewedAt,
        }));

      const activities = [...taskEvents, ...reviewEvents, ...onboardingEvents]
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      return { activities: activities.length ? activities : (mockInternActivity[internId] || []) };
    } catch (e) {
      console.warn('Failed to fetch real intern activity:', e);
      await delay(400);
      return { activities: mockInternActivity[internId] || [] };
    }
  },

  /**
   * Fetch intern performance snapshot.
   * @param {string} internId
   * @returns {Promise<{ performance: object | null }>}
   */
  async fetchInternPerformance(internId) {
    try {
      const plans = await getInternWeeklyPlans(internId);
      const reviewed = plans.filter((plan) => plan.reviewedAt || plan.status === 'reviewed');
      const tasks = plans.flatMap((plan) => plan.tasks);
      const completed = tasks.filter((task) => ['completed', 'done'].includes(String(task.status).toLowerCase())).length;
      const completionScore = tasks.length ? Math.max(1, Math.min(5, Number(((completed / tasks.length) * 5).toFixed(1)))) : 0;
      const responsivenessScore = reviewed.length ? 4.5 : (plans.length ? 3.8 : 0);
      const averageScore = Number(((completionScore || 4) + (responsivenessScore || 4)) / 2).toFixed(1);
      return {
        performance: {
          averageScore,
          maxScore: 5,
          trend: reviewed.length > 1 ? 'up' : 'stable',
          trendDelta: reviewed.length > 1 ? '+0.2' : '0.0',
          competencies: [
            { name: 'Task Completion', score: completionScore || 4 },
            { name: 'Weekly Reporting', score: responsivenessScore || 4 },
            { name: 'Onboarding Readiness', score: tasks.length ? 4.2 : 3.8 },
          ],
          strengths: completed > 0 ? ['Completes assigned work', 'Keeps weekly plan active'] : ['Ready for assignment'],
          areasForImprovement: tasks.length > completed ? ['Close remaining weekly tasks'] : ['Continue documenting progress'],
          trendData: plans.slice(0, 6).reverse().map((plan) => ({
            month: plan.weekStart ? formatDate(plan.weekStart).split(',')[0] : 'Week',
            score: plan.stats?.total ? Number(((plan.stats.completed / plan.stats.total) * 5).toFixed(1)) : 4,
          })),
          recentReviews: reviewed.slice(0, 5).map((plan) => ({
            id: plan.id,
            period: `Week of ${formatDate(plan.weekStart)}`,
            score: plan.stats?.total ? Number(((plan.stats.completed / plan.stats.total) * 5).toFixed(1)) : null,
            status: 'Completed',
            reviewer: 'Supervisor',
            date: formatDate(plan.reviewedAt),
            summary: plan.feedback || 'Weekly report reviewed.',
          })),
        },
      };
    } catch (e) {
      console.warn('Failed to fetch real performance data:', e);
      await delay(350);
      return { performance: mockInternPerformance[internId] || null };
    }
  },

  /**
   * Fetch supervisor notes for an intern.
   * @param {string} internId
   * @returns {Promise<{ notes: Array }>}
   */
  async fetchSupervisorNotes(internId) {
    await delay(300);
    return { notes: notesStore[internId] || [] };
  },

  /**
   * Create or update a supervisor note.
   * @param {string} internId
   * @param {object} note - { id?, title, content, category, color }
   * @returns {Promise<{ note: object }>}
   */
  async saveNote(internId, note) {
    await delay(400);
    if (!notesStore[internId]) notesStore[internId] = [];

    const now = new Date().toISOString();

    if (note.id) {
      // Update existing note
      notesStore[internId] = notesStore[internId].map((n) =>
        n.id === note.id ? { ...n, ...note, updatedAt: now } : n,
      );
      const updated = notesStore[internId].find((n) => n.id === note.id);
      saveNotesStore(notesStore);
      return { note: updated };
    } else {
      // Create new note
      const newNote = {
        id: `note-${internId}-${Date.now()}`,
        internId,
        createdAt: now,
        updatedAt: now,
        isPinned: false,
        ...note,
      };
      notesStore[internId].unshift(newNote);
      saveNotesStore(notesStore);
      return { note: newNote };
    }
  },

  /**
   * Delete a supervisor note.
   * @param {string} internId
   * @param {string} noteId
   * @returns {Promise<{ success: boolean }>}
   */
  async deleteNote(internId, noteId) {
    await delay(300);
    if (notesStore[internId]) {
      notesStore[internId] = notesStore[internId].filter((n) => n.id !== noteId);
      saveNotesStore(notesStore);
    }
    return { success: true };
  },

  /**
   * Toggle pin state of a note.
   * @param {string} internId
   * @param {string} noteId
   * @returns {Promise<{ note: object }>}
   */
  async togglePinNote(internId, noteId) {
    await delay(200);
    let updated = null;
    if (notesStore[internId]) {
      notesStore[internId] = notesStore[internId].map((n) => {
        if (n.id === noteId) {
          updated = { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() };
          return updated;
        }
        return n;
      });
      saveNotesStore(notesStore);
    }
    return { note: updated };
  },
};

export default internManagementService;
