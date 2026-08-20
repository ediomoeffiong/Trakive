/**
 * @file PrivacySettingsForm.jsx
 * @description Privacy settings: profile visibility, data sharing, and activity controls.
 */

import toast from 'react-hot-toast';
import {
  RiShieldUserLine, RiEyeLine, RiMailLine, RiPhoneLine,
  RiLineChartLine, RiBarChartLine, RiGlobalLine,
} from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import Switch              from '../ui/Switch';
import UnsavedChangesBar   from './UnsavedChangesBar';

// ── Shared section block ──────────────────────────────────────────────────────
const PrivacySection = ({ icon: Icon, title, description, children }) => (
  <div className="card" style={{ padding: '1.75rem' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1.25rem' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '0.75rem', flexShrink: 0,
        background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
      }}>
        <Icon />
      </div>
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
    {children}
  </div>
);

// ── Switch row with description ───────────────────────────────────────────────
const PrivacyRow = ({ icon: Icon, label, description, checked, onChange, disabled }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    padding: '0.875rem 0',
    borderBottom: '1px solid var(--color-neutral-100)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
      {Icon && (
        <div style={{
          width: 34, height: 34, borderRadius: '0.5rem', flexShrink: 0,
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
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
    <Switch checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

// ── Visibility selector ───────────────────────────────────────────────────────
const VisibilitySelector = ({ value, onChange }) => {
  const opts = [
    { value: 'everyone', label: '🌍 Everyone',    description: 'All Trakive users' },
    { value: 'team',     label: '👥 My Team',      description: 'Only your supervisor, HR, and dept. head' },
    { value: 'private',  label: '🔒 Only Me',      description: 'Only you can see your profile' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {opts.map((opt) => (
        <label
          key={opt.value}
          htmlFor={`visibility-${opt.value}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer',
            border: `1.5px solid ${value === opt.value ? 'var(--color-primary-300)' : 'var(--color-neutral-200)'}`,
            background: value === opt.value ? 'var(--color-primary-50)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          <input
            type="radio"
            id={`visibility-${opt.value}`}
            name="profileVisibility"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{ accentColor: 'var(--color-primary-600)', width: 16, height: 16, flexShrink: 0 }}
          />
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: 0 }}>
              {opt.label}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              {opt.description}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PrivacySettingsForm = () => {
  const { settings, updateField, saveCategory, saving, isDirty, discardChanges } = useSettingsStore();
  const priv = settings.privacy;

  const toggle = (key) => updateField('privacy', key, !priv[key]);

  const handleSave = async () => {
    try {
      await saveCategory('privacy');
      toast.success('Privacy settings updated!', { icon: '🔒' });
    } catch {
      toast.error('Failed to save privacy settings.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

      {/* Profile Visibility */}
      <PrivacySection
        icon={RiGlobalLine}
        title="Profile Visibility"
        description="Control who can see your profile and personal information."
      >
        <VisibilitySelector
          value={priv.profileVisibility}
          onChange={(v) => updateField('privacy', 'profileVisibility', v)}
        />
      </PrivacySection>

      {/* Contact Information */}
      <PrivacySection
        icon={RiShieldUserLine}
        title="Contact Information"
        description="Choose what contact details are visible to others on your team."
      >
        <PrivacyRow
          icon={RiMailLine}
          label="Show Email to Supervisors"
          description="Your supervisor and HR can see your email address"
          checked={priv.showEmailToSupervisor}
          onChange={() => toggle('showEmailToSupervisor')}
        />
        <PrivacyRow
          icon={RiPhoneLine}
          label="Show Phone Number"
          description="Your phone number is visible on your profile page"
          checked={priv.showPhoneNumber}
          onChange={() => toggle('showPhoneNumber')}
        />
      </PrivacySection>

      {/* Activity & Analytics */}
      <PrivacySection
        icon={RiLineChartLine}
        title="Activity & Analytics"
        description="Manage how your activity data is used and displayed."
      >
        <PrivacyRow
          icon={RiEyeLine}
          label="Activity Visibility"
          description="Show your online status and recent activity to teammates"
          checked={priv.activityVisibility}
          onChange={() => toggle('activityVisibility')}
        />
        <PrivacyRow
          icon={RiBarChartLine}
          label="Analytics Participation"
          description="Allow Trakive to use anonymized usage data to improve the platform"
          checked={priv.analyticsParticipation}
          onChange={() => toggle('analyticsParticipation')}
        />
      </PrivacySection>

      {/* Notice */}
      <div style={{
        padding: '1rem 1.25rem', borderRadius: '0.875rem',
        background: 'var(--color-primary-50)',
        border: '1px solid var(--color-primary-100)',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>ℹ️</span>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-primary-700)', margin: 0 }}>
          Trakive will never sell your personal data. These settings control visibility within your organization only.
          For full data policy details, review our{' '}
          <a href="/privacy" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>Privacy Policy</a>.
        </p>
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

export default PrivacySettingsForm;
