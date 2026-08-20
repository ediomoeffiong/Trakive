/**
 * @file preferences.js
 * @description Role-specific preferences for Trakive users.
 * Each role has a unique set of configurable options surfaced in Settings.
 */

/**
 * Intern-specific preferences
 */
export const internPreferences = {
  showProgressWidgets:   true,
  dailyGoalReminders:    true,
  taskDeadlineWarnings:  true,
  progressSummaryEmails: false,
  mentorMessageAlerts:   true,
};

/**
 * Supervisor-specific preferences
 */
export const supervisorPreferences = {
  // Submission alerts
  submissionAlertThreshold: 3, // notify when > 3 interns have pending submissions
  autoApproveMinorTasks:    false,

  // Intern visibility
  trackInternOnlineStatus:  true,
  showInternProgressCards:  true,

  // Feedback
  defaultFeedbackTemplate:  'structured', // 'structured' | 'freeform' | 'rubric'

  // Notifications
  dailyTeamDigest:          true,
  alertOnLateSubmission:    true,
  alertOnReviewRequest:     true,
};

/**
 * HR Administrator-specific preferences
 */
export const hrPreferences = {
  // Onboarding configuration
  defaultOnboardingDuration: 90, // days
  autoAssignMentor:          true,
  welcomeBannerText:         'Welcome to FifthLab — we are thrilled to have you! 🎉',

  // Org-wide defaults
  requireDocumentVerification: true,
  globalAnnouncementsEnabled:  true,
  internDataRetentionDays:     365,

  // Reports
  weeklyOrgReport:             true,
  onboardingCompletionAlerts:  true,
};

/**
 * Department Head-specific preferences
 */
export const departmentHeadPreferences = {
  // KPI weights
  kpiWeights: {
    taskCompletion:   40, // %
    attendanceRate:   20,
    performanceScore: 30,
    peerFeedback:     10,
  },

  // Escalation
  escalationContactEmail: 'ediomo.effiong@trakive.com',
  autoEscalateAfterDays:  5,

  // Templates
  departmentSyncTemplate: 'weekly-review', // 'weekly-review' | 'monthly-summary' | 'ad-hoc'
  budgetApprovalRequired: false,
};

/** Lookup map from role → preferences schema */
export const ROLE_PREFERENCES_MAP = {
  'Intern':           internPreferences,
  'Supervisor':       supervisorPreferences,
  'HR Administrator': hrPreferences,
  'Department Head':  departmentHeadPreferences,
};

/** Role-specific settings section descriptors shown in the settings UI */
export const ROLE_SETTINGS_LABELS = {
  Intern: {
    title:       'Personal Tracking Preferences',
    description: 'Customize how you track your progress and receive reminders.',
    icon:        '🎯',
  },
  Supervisor: {
    title:       'Team Management Preferences',
    description: 'Configure how you manage and monitor your assigned interns.',
    icon:        '👨‍💼',
  },
  'HR Administrator': {
    title:       'Organization Policy Preferences',
    description: 'Set org-wide defaults for onboarding, policies, and compliance.',
    icon:        '🏛️',
  },
  'Department Head': {
    title:       'Department Settings',
    description: 'Control KPI weights, escalation rules, and department-level templates.',
    icon:        '🏢',
  },
};
