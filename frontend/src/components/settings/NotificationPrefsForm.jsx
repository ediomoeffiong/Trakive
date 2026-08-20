/**
 * @file NotificationPrefsForm.jsx
 * @description Notification preferences settings — channel toggles, category switches,
 * quiet hours, and weekly digest. Integrates with useSettingsStore.
 */

import toast from 'react-hot-toast';
import {
  RiBellLine, RiMailLine, RiSmartphoneLine, RiApps2Line,
  RiTaskLine, RiStarLine, RiCheckboxMultipleLine, RiMegaphoneLine,
  RiAlarmLine, RiBarChartBoxLine, RiMoonLine,
} from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import Switch              from '../ui/Switch';
import UnsavedChangesBar   from './UnsavedChangesBar';

// ── Reusable switch row ───────────────────────────────────────────────────────
const SwitchRow = ({ icon: Icon, label, description, checked, onChange, disabled }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.875rem 0', gap: '1rem',
    borderBottom: '1px solid var(--color-neutral-100)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
      {Icon && (
        <div style={{
          width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0,
          background: 'var(--color-neutral-50)', color: 'var(--color-neutral-500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
        }}>
          <Icon />
        </div>
      )}
      <div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.125rem' }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
    </div>
    <Switch checked={checked} onChange={onChange} disabled={disabled} size="md" />
  </div>
);

// ── Section block ─────────────────────────────────────────────────────────────
const NotifSection = ({ title, description, children }) => (
  <div className="card" style={{ padding: '1.75rem' }}>
    <div style={{ marginBottom: '0.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0 0 1rem' }}>
        {description}
      </p>
    </div>
    {children}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const NotificationPrefsForm = () => {
  const { settings, updateField, saveCategory, saving, isDirty, discardChanges } = useSettingsStore();
  const prefs = settings.notifications;

  const toggle = (key) => updateField('notifications', key, !prefs[key]);

  const handleSave = async () => {
    try {
      await saveCategory('notifications');
      toast.success('Notification preferences saved!', { icon: '🔔' });
    } catch {
      toast.error('Failed to save preferences.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

      {/* Delivery Channels */}
      <NotifSection
        title="Delivery Channels"
        description="Choose how you want to receive notifications."
      >
        <SwitchRow
          icon={RiApps2Line}
          label="In-App Notifications"
          description="Show notifications inside the Trakive dashboard"
          checked={prefs.inAppNotifications}
          onChange={() => toggle('inAppNotifications')}
        />
        <SwitchRow
          icon={RiMailLine}
          label="Email Notifications"
          description="Receive important updates via email"
          checked={prefs.emailNotifications}
          onChange={() => toggle('emailNotifications')}
        />
        <SwitchRow
          icon={RiSmartphoneLine}
          label="Push Notifications"
          description="Browser push alerts (coming soon)"
          checked={prefs.pushNotifications}
          onChange={() => toggle('pushNotifications')}
          disabled
        />
      </NotifSection>

      {/* Category Toggles */}
      <NotifSection
        title="Notification Categories"
        description="Select which activities send you notifications."
      >
        <SwitchRow
          icon={RiTaskLine}
          label="Task Notifications"
          description="Assignments, deadlines, updates, and comments on tasks"
          checked={prefs.taskNotifications}
          onChange={() => toggle('taskNotifications')}
        />
        <SwitchRow
          icon={RiStarLine}
          label="Performance Reviews"
          description="Review requests, scores, and supervisor feedback"
          checked={prefs.reviewNotifications}
          onChange={() => toggle('reviewNotifications')}
        />
        <SwitchRow
          icon={RiCheckboxMultipleLine}
          label="Onboarding Updates"
          description="Step completions, requirements, and new onboarding content"
          checked={prefs.onboardingUpdates}
          onChange={() => toggle('onboardingUpdates')}
        />
        <SwitchRow
          icon={RiMegaphoneLine}
          label="Announcements"
          description="Organization-wide and department announcements"
          checked={prefs.announcements}
          onChange={() => toggle('announcements')}
        />
        <SwitchRow
          icon={RiAlarmLine}
          label="Reminders"
          description="Scheduled reminders for deadlines and meetings"
          checked={prefs.reminders}
          onChange={() => toggle('reminders')}
        />
        <SwitchRow
          icon={RiBarChartBoxLine}
          label="Weekly Summary"
          description="A weekly digest of your progress and activities"
          checked={prefs.weeklyDigest}
          onChange={() => toggle('weeklyDigest')}
        />
      </NotifSection>

      {/* Quiet Hours — UI only */}
      <NotifSection
        title="Quiet Hours"
        description="Pause all notifications during a specific time window. (Coming soon)"
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem', borderRadius: '0.75rem',
          background: 'var(--color-neutral-50)',
          border: '1.5px dashed var(--color-neutral-200)',
          opacity: 0.6,
        }}>
          <RiMoonLine style={{ fontSize: '1.5rem', color: 'var(--color-neutral-400)', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', margin: 0 }}>
              Quiet Hours (10:00 PM – 8:00 AM)
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              This feature will be available in a future update.
            </p>
          </div>
        </div>
      </NotifSection>

      {/* Sticky save bar */}
      <UnsavedChangesBar
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={discardChanges}
      />
    </div>
  );
};

export default NotificationPrefsForm;
