/**
 * @file RolePreferencesForm.jsx
 * @description Role-specific settings page. Dynamically renders different forms
 * based on the authenticated user's role. Supports Intern, Supervisor, HR Administrator,
 * and Department Head users.
 */

import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { RiSettings4Line } from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore }      from '../../store/useAppStore';
import { ROLE_SETTINGS_LABELS } from '../../data/preferences';
import Switch   from '../ui/Switch';
import Input    from '../ui/Input';
import Button   from '../ui/Button';
import UnsavedChangesBar from './UnsavedChangesBar';

// ── Shared row wrappers ────────────────────────────────────────────────────────
const PrefRow = ({ label, description, children }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    padding: '0.875rem 0', borderBottom: '1px solid var(--color-neutral-100)',
  }}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.125rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
        {description}
      </p>
    </div>
    {children}
  </div>
);

// ── Intern Preferences ────────────────────────────────────────────────────────
const InternPreferences = ({ prefs, onToggle, onSet }) => (
  <>
    <PrefRow label="Progress Widgets" description="Show goal and task progress cards on your dashboard">
      <Switch checked={!!prefs.showProgressWidgets} onChange={() => onToggle('showProgressWidgets')} />
    </PrefRow>
    <PrefRow label="Daily Goal Reminders" description="Receive a morning reminder about today's goals">
      <Switch checked={!!prefs.dailyGoalReminders} onChange={() => onToggle('dailyGoalReminders')} />
    </PrefRow>
    <PrefRow label="Task Deadline Warnings" description="Alert me 24 hours before a task deadline">
      <Switch checked={!!prefs.taskDeadlineWarnings} onChange={() => onToggle('taskDeadlineWarnings')} />
    </PrefRow>
    <PrefRow label="Progress Summary Emails" description="Receive a weekly email with your progress summary">
      <Switch checked={!!prefs.progressSummaryEmails} onChange={() => onToggle('progressSummaryEmails')} />
    </PrefRow>
    <PrefRow label="Mentor Message Alerts" description="Notify me when my supervisor sends a message">
      <Switch checked={!!prefs.mentorMessageAlerts} onChange={() => onToggle('mentorMessageAlerts')} />
    </PrefRow>
  </>
);

// ── Supervisor Preferences ────────────────────────────────────────────────────
const SupervisorPreferences = ({ prefs, onToggle, onSet }) => (
  <>
    <PrefRow label="Auto-Approve Minor Tasks" description="Automatically approve tasks marked as routine or low-impact">
      <Switch checked={!!prefs.autoApproveMinorTasks} onChange={() => onToggle('autoApproveMinorTasks')} />
    </PrefRow>
    <PrefRow label="Track Intern Online Status" description="Show online/offline indicator for your assigned interns">
      <Switch checked={!!prefs.trackInternOnlineStatus} onChange={() => onToggle('trackInternOnlineStatus')} />
    </PrefRow>
    <PrefRow label="Show Intern Progress Cards" description="Display individual intern progress summaries on your dashboard">
      <Switch checked={!!prefs.showInternProgressCards} onChange={() => onToggle('showInternProgressCards')} />
    </PrefRow>
    <PrefRow label="Daily Team Digest" description="Receive a daily summary of your team's activity">
      <Switch checked={!!prefs.dailyTeamDigest} onChange={() => onToggle('dailyTeamDigest')} />
    </PrefRow>
    <PrefRow label="Alert on Late Submissions" description="Notify me when an intern misses a deadline">
      <Switch checked={!!prefs.alertOnLateSubmission} onChange={() => onToggle('alertOnLateSubmission')} />
    </PrefRow>
    <PrefRow label="Alert on Review Requests" description="Notify me when an intern submits a review request">
      <Switch checked={!!prefs.alertOnReviewRequest} onChange={() => onToggle('alertOnReviewRequest')} />
    </PrefRow>

    {/* Submission alert threshold */}
    <div style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
        Submission Alert Threshold
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.75rem' }}>
        Alert me when more than this many interns have pending submissions
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Input
          id="submissionAlertThreshold"
          type="number"
          min={1}
          max={20}
          value={prefs.submissionAlertThreshold ?? 3}
          onChange={(e) => onSet('submissionAlertThreshold', parseInt(e.target.value, 10))}
          style={{ width: 80 }}
        />
        <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>intern(s)</span>
      </div>
    </div>

    {/* Feedback template */}
    <div style={{ padding: '0.875rem 0' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
        Default Feedback Template
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.75rem' }}>
        Choose the default format for intern feedback forms
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['structured', 'freeform', 'rubric'].map((tmpl) => (
          <button
            key={tmpl}
            onClick={() => onSet('defaultFeedbackTemplate', tmpl)}
            style={{
              padding: '0.4375rem 1rem', borderRadius: '0.625rem', border: 'none',
              background: prefs.defaultFeedbackTemplate === tmpl ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
              color: prefs.defaultFeedbackTemplate === tmpl ? '#fff' : 'var(--color-neutral-700)',
              fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tmpl}
          </button>
        ))}
      </div>
    </div>
  </>
);

// ── HR Preferences ─────────────────────────────────────────────────────────────
const HRPreferences = ({ prefs, onToggle, onSet }) => (
  <>
    <PrefRow label="Auto-Assign Mentor" description="Automatically assign a supervisor when a new intern is onboarded">
      <Switch checked={!!prefs.autoAssignMentor} onChange={() => onToggle('autoAssignMentor')} />
    </PrefRow>
    <PrefRow label="Require Document Verification" description="All new interns must verify ID before dashboard access">
      <Switch checked={!!prefs.requireDocumentVerification} onChange={() => onToggle('requireDocumentVerification')} />
    </PrefRow>
    <PrefRow label="Global Announcements" description="Enable org-wide announcement broadcasting">
      <Switch checked={!!prefs.globalAnnouncementsEnabled} onChange={() => onToggle('globalAnnouncementsEnabled')} />
    </PrefRow>
    <PrefRow label="Weekly Org Report" description="Receive a weekly organization onboarding & performance report">
      <Switch checked={!!prefs.weeklyOrgReport} onChange={() => onToggle('weeklyOrgReport')} />
    </PrefRow>
    <PrefRow label="Onboarding Completion Alerts" description="Alert when an intern completes the full onboarding program">
      <Switch checked={!!prefs.onboardingCompletionAlerts} onChange={() => onToggle('onboardingCompletionAlerts')} />
    </PrefRow>

    {/* Default onboarding duration */}
    <div style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
        Default Onboarding Duration
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.75rem' }}>
        Standard duration in days for new intern onboarding
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Input
          id="onboardingDuration"
          type="number"
          min={7}
          max={365}
          value={prefs.defaultOnboardingDuration ?? 90}
          onChange={(e) => onSet('defaultOnboardingDuration', parseInt(e.target.value, 10))}
          style={{ width: 90 }}
        />
        <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>days</span>
      </div>
    </div>

    {/* Welcome banner */}
    <div style={{ padding: '0.875rem 0' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
        Welcome Banner Text
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.75rem' }}>
        The message displayed to interns on their first login
      </p>
      <textarea
        value={prefs.welcomeBannerText ?? ''}
        onChange={(e) => onSet('welcomeBannerText', e.target.value)}
        rows={3}
        style={{
          width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
          border: '1.5px solid var(--color-neutral-200)',
          background: 'var(--color-neutral-50)', color: 'var(--color-neutral-800)',
          fontSize: '0.875rem', fontFamily: 'var(--font-sans)', resize: 'vertical',
          outline: 'none',
        }}
      />
    </div>
  </>
);

// ── Department Head Preferences ────────────────────────────────────────────────
const DeptHeadPreferences = ({ prefs, onToggle, onSet }) => {
  const kpi = prefs.kpiWeights || {};

  return (
    <>
      {/* KPI weights */}
      <div style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
          KPI Weight Distribution
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.875rem' }}>
          Set the percentage weight for each KPI metric. Must total 100%.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { key: 'taskCompletion',   label: 'Task Completion Rate' },
            { key: 'attendanceRate',   label: 'Attendance Rate' },
            { key: 'performanceScore', label: 'Performance Score' },
            { key: 'peerFeedback',     label: 'Peer Feedback' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--color-neutral-700)', width: 180, flexShrink: 0 }}>
                {label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Input
                  id={`kpi-${key}`}
                  type="number"
                  min={0}
                  max={100}
                  value={kpi[key] ?? 25}
                  onChange={(e) => onSet('kpiWeights', { ...kpi, [key]: parseInt(e.target.value, 10) })}
                  style={{ width: 70 }}
                />
                <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>%</span>
              </div>
              {/* Mini bar */}
              <div style={{ flex: 1, minWidth: 80, height: 6, background: 'var(--color-neutral-100)', borderRadius: 99 }}>
                <div style={{ width: `${Math.min(kpi[key] ?? 25, 100)}%`, height: '100%', background: 'var(--color-primary-500)', borderRadius: 99, transition: 'width 0.3s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* KPI total */}
        {(() => {
          const total = Object.values(kpi).reduce((a, b) => a + (Number(b) || 0), 0);
          return (
            <p style={{
              marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 700,
              color: total === 100 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
            }}>
              Total: {total}% {total === 100 ? '✓ Balanced' : `(${total > 100 ? 'Over' : 'Under'} by ${Math.abs(total - 100)}%)`}
            </p>
          );
        })()}
      </div>

      <PrefRow label="Budget Approval Required" description="Require department head approval for intern expense submissions">
        <Switch checked={!!prefs.budgetApprovalRequired} onChange={() => onToggle('budgetApprovalRequired')} />
      </PrefRow>

      {/* Auto-escalate */}
      <div style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
          Auto-Escalate After (days)
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.75rem' }}>
          Unresolved issues escalate to department head after this many days
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Input
            id="autoEscalateAfterDays"
            type="number" min={1} max={30}
            value={prefs.autoEscalateAfterDays ?? 5}
            onChange={(e) => onSet('autoEscalateAfterDays', parseInt(e.target.value, 10))}
            style={{ width: 80 }}
          />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>days</span>
        </div>
      </div>

      {/* Sync template */}
      <div style={{ padding: '0.875rem 0' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
          Department Sync Template
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.75rem' }}>
          The default report format used in department-wide syncs
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['weekly-review', 'monthly-summary', 'ad-hoc'].map((tmpl) => (
            <button
              key={tmpl}
              onClick={() => onSet('departmentSyncTemplate', tmpl)}
              style={{
                padding: '0.4375rem 1rem', borderRadius: '0.625rem', border: 'none',
                background: prefs.departmentSyncTemplate === tmpl ? 'var(--color-primary-600)' : 'var(--color-neutral-100)',
                color: prefs.departmentSyncTemplate === tmpl ? '#fff' : 'var(--color-neutral-700)',
                fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tmpl.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// ── Role selector (debug helper) ───────────────────────────────────────────────
export const RoleSelectorDebug = () => {
  const { setUser, user } = useAppStore();
  const roles = ['Intern', 'Supervisor', 'HR Administrator', 'Department Head'];

  if (!user) return null;

  return (
    <div style={{
      padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
      background: 'linear-gradient(135deg, #1e293b, #0f172a)',
      display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>
        🔧 Preview as:
      </span>
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => setUser({ ...user, role })}
          style={{
            padding: '0.375rem 0.875rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
            background: user.role === role ? 'var(--color-primary-600)' : 'rgba(255,255,255,0.1)',
            color: user.role === role ? '#fff' : '#94a3b8',
            fontSize: '0.8125rem', fontWeight: 600,
          }}
        >
          {role}
        </button>
      ))}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const RolePreferencesForm = () => {
  const { rolePreferences, fetchRolePreferences, updateRolePreferenceField, saveRolePreferences, saving, isDirty, discardChanges } = useSettingsStore();
  const user = useAppStore((s) => s.user);
  const role = user?.role || 'Intern';
  const meta = ROLE_SETTINGS_LABELS[role] || ROLE_SETTINGS_LABELS.Intern;

  useEffect(() => {
    fetchRolePreferences(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleToggle = (key) => updateRolePreferenceField(key, !rolePreferences[key]);
  const handleSet    = (key, val) => updateRolePreferenceField(key, val);

  const handleSave = async () => {
    try {
      await saveRolePreferences(role);
      toast.success(`${meta.title} saved!`, { icon: '✅' });
    } catch {
      toast.error('Failed to save preferences.');
    }
  };

  const renderForm = () => {
    switch (role) {
      case 'Supervisor':
        return <SupervisorPreferences prefs={rolePreferences} onToggle={handleToggle} onSet={handleSet} />;
      case 'HR Administrator':
        return <HRPreferences prefs={rolePreferences} onToggle={handleToggle} onSet={handleSet} />;
      case 'Department Head':
        return <DeptHeadPreferences prefs={rolePreferences} onToggle={handleToggle} onSet={handleSet} />;
      default:
        return <InternPreferences prefs={rolePreferences} onToggle={handleToggle} onSet={handleSet} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
      <RoleSelectorDebug />

      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '0.875rem', flexShrink: 0,
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
          }}>
            <RiSettings4Line />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                {meta.title}
              </h2>
              <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              {meta.description}
            </p>
          </div>
        </div>

        {renderForm()}
      </div>

      <UnsavedChangesBar
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={discardChanges}
      />
    </div>
  );
};

export default RolePreferencesForm;
