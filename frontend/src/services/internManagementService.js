/**
 * @file internManagementService.js
 * @description Service abstraction for the Supervisor Intern Management module.
 * All methods return Promises with artificial delays to simulate backend responses.
 * Replace mock data imports with real API calls (axios) to connect to the backend.
 */

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
      ? (interns.reduce((sum, i) => sum + i.performanceScore, 0) / total).toFixed(1)
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
      trend: `${Math.round((active / total) * 100)}% of team`,
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
    await delay();
    let result = [...mockInternProfiles];

    const { search, department, status, performanceMin, performanceMax, onboardingStatus, batch } =
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
      kpis: computeKPIs(mockInternProfiles),
    };
  },

  /**
   * Fetch a single intern's full profile.
   * @param {string} internId
   * @returns {Promise<{ profile: object | null }>}
   */
  async fetchInternProfile(internId) {
    await delay(400);
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
