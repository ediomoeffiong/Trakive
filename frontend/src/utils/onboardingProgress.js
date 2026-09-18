/**
 * @file onboardingProgress.js
 * @description Shared intern onboarding pathway progress (matches OnboardingDashboard).
 */

export const ONBOARDING_SECTIONS = [
  'internship_info',
  'required_docs',
  'welcome',
  'company_policies',
  'it_setup',
  'team_intro',
  'training',
];

const safeJson = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const countApprovedDocuments = (documentsPayload = {}, localDocs = {}) => {
  const checklist = documentsPayload.documents || documentsPayload.checklist || [];
  const fromApi = Array.isArray(checklist)
    ? checklist.filter((item) => {
        const status = String(item?.review_status || item?.document?.review_status || '').toLowerCase();
        return Boolean(item?.submitted) && status === 'approved';
      }).length
    : 0;

  const fromLocal = Object.values(localDocs || {}).filter((doc) => {
    if (!doc) return false;
    return String(doc.review_status || '').toLowerCase() === 'approved';
  }).length;

  return Math.max(fromApi, fromLocal);
};

export function getInternOnboardingProgress(user, documentsPayload = {}) {
  const userId = user?.id || 'default';
  const completed = safeJson(localStorage.getItem(`trakive_onboarding_completed_steps_${userId}`), {});
  const info = safeJson(localStorage.getItem(`trakive_onboarding_info_${userId}`), {});
  const itSetup = safeJson(localStorage.getItem(`trakive_onboarding_it_setup_${userId}`), {});
  const localDocs = safeJson(localStorage.getItem(`trakive_onboarding_docs_${userId}`), {});
  const approvedDocs = countApprovedDocuments(documentsPayload, localDocs);

  const flags = {
    internship_info: Boolean(completed.internship_info || info.is_saved),
    required_docs: Boolean(completed.required_docs || approvedDocs >= 3),
    welcome: Boolean(completed.welcome),
    company_policies: Boolean(completed.company_policies),
    it_setup: Boolean(completed.it_setup || (itSetup.wifiConfirmed && itSetup.securityGuideRead)),
    team_intro: Boolean(completed.team_intro),
    training: Boolean(completed.training),
  };

  const completedSteps = ONBOARDING_SECTIONS.filter((key) => flags[key]).length;
  const totalSteps = ONBOARDING_SECTIONS.length;
  const value = Math.round((completedSteps / totalSteps) * 100);

  return {
    value,
    completedSteps,
    totalSteps,
    flags,
    info,
    approvedDocs,
  };
}
