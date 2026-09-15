/**
 * @file internManagementService.js
 * @description Service abstraction for the Supervisor Intern Management module.
 * All methods return Promises with artificial delays to simulate backend responses.
 * Replace mock data imports with real API calls (axios) to connect to the backend.
 */

import api from './api';
import { mockInternProfiles } from '../data/internProfiles';
import { mockInternProgress } from '../data/internProgress';
import { mockInternDocuments } from '../data/internDocuments';
import { mockSupervisorNotes } from '../data/supervisorNotes';
import { mockInternActivity } from '../data/internActivity';
import { mockInternPerformance } from '../data/internPerformance';

// ── Simulated network delay ──────────────────────────────────────────────────
const DELAY_MS = 600;
const delay = (ms = DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory mutable store for notes (simulates a database)
let notesStore = JSON.parse(JSON.stringify(mockSupervisorNotes));

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
      rawResult = rawItems.map((item) => ({
        id: item.user_id || item.id,
        internId: item.user_id || item.id,
        name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email,
        email: item.email,
        department: item.department_name || item.department || 'Engineering',
        role: 'Intern',
        status: item.intern_status === 'active' ? 'Active' : (item.intern_status === 'onboarding' ? 'Pending Review' : 'Active'),
        performanceScore: Number(item.performance_score || 4.5),
        onboardingProgress: item.onboarding_ready ? 100 : (item.onboarding_step ? item.onboarding_step * 25 : 50),
        currentTask: item.current_task || (item.onboarding_ready ? 'Active Internship' : 'Completing Onboarding'),
        startDate: item.created_at ? item.created_at.split('T')[0] : '2026-06-01',
        endDate: '2026-12-31',
        batch: 'Batch 2026-A',
        avatar: item.avatar_url || null,
      }));
    } catch (err) {
      console.warn('Failed to fetch real interns from backend API:', err);
    }

    if (rawResult.length === 0 && mockInternProfiles.length > 0) {
      rawResult = [...mockInternProfiles];
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
      const data = res.data?.data || res.data;
      if (data) {
        return {
          profile: {
            id: data.user_id || data.id || internId,
            internId: data.user_id || data.id || internId,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email,
            email: data.email,
            phone: data.phone || 'N/A',
            department: data.department_name || 'Engineering',
            role: 'Intern',
            status: data.intern_status === 'active' ? 'Active' : 'Pending Review',
            performanceScore: Number(data.performance_score || 4.8),
            onboardingProgress: data.onboarding_ready ? 100 : 50,
            institution: data.institution || 'N/A',
            fieldOfStudy: data.field_of_study || 'N/A',
            emergencyContact: data.emergency_contact || {},
            skills: data.skills || [],
            avatar: data.avatar_url || null,
            internships: [
              { id: `${internId}-p1`, title: 'Current Internship (2026)', startDate: data.user_created_at?.split('T')[0] || '2026-06-01', endDate: '2026-12-31', status: 'active' },
            ],
          }
        };
      }
    } catch (e) {
      console.warn('Failed to fetch real intern profile:', e);
    }
    const profile = mockInternProfiles.find((i) => i.id === internId) || null;
    return { profile };
  },


  /**
   * Fetch intern progress widgets data.
   * @param {string} internId
   * @returns {Promise<{ progress: object | null }>}
   */
  async fetchInternProgress(internId) {
    await delay(350);
    return { progress: mockInternProgress[internId] || null };
  },

  /**
   * Fetch intern documents.
   * @param {string} internId
   * @returns {Promise<{ documents: Array }>}
   */
  async fetchInternDocuments(internId) {
    await delay(300);
    return { documents: mockInternDocuments[internId] || [] };
  },

  /**
   * Fetch intern activity timeline.
   * @param {string} internId
   * @returns {Promise<{ activities: Array }>}
   */
  async fetchInternActivity(internId) {
    await delay(400);
    return { activities: mockInternActivity[internId] || [] };
  },

  /**
   * Fetch intern performance snapshot.
   * @param {string} internId
   * @returns {Promise<{ performance: object | null }>}
   */
  async fetchInternPerformance(internId) {
    await delay(350);
    return { performance: mockInternPerformance[internId] || null };
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
    }
    return { note: updated };
  },
};

export default internManagementService;
