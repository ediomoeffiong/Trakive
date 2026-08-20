/**
 * @file SecuritySettingsForm.jsx
 * @description Password & Security settings: change password, 2FA toggle, connected providers, security log.
 */

import { useState } from 'react';
import { useForm }  from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast        from 'react-hot-toast';
import {
  RiShieldCheckLine,
  RiEyeLine, RiEyeOffLine,
  RiCheckLine,
  RiTimeLine,
  RiAlertLine,
  RiLink,
} from 'react-icons/ri';
import { useSettingsStore }   from '../../store/useSettingsStore';
import Input                  from '../ui/Input';
import Button                 from '../ui/Button';
import Switch                 from '../ui/Switch';
import PasswordStrength        from '../ui/PasswordStrength';
import { OAUTH_PROVIDERS, TWO_FACTOR_METHODS, mockSecurityEvents } from '../../data/security';

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatRelative = (isoStr) => {
  if (!isoStr) return '—';
  const diff = Date.now() - new Date(isoStr).getTime();
  const days  = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30)  return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

// ── Section separator ─────────────────────────────────────────────────────────
const SectionBlock = ({ title, description, children }) => (
  <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    <div style={{ borderBottom: '1px solid var(--color-neutral-100)', paddingBottom: '1rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.25rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
        {description}
      </p>
    </div>
    {children}
  </div>
);

// ── Severity colours ──────────────────────────────────────────────────────────
const SEVERITY_COLOR = {
  info:    { bg: 'var(--color-primary-50)',  text: 'var(--color-primary-700)' },
  warning: { bg: 'var(--color-warning-50)',  text: 'var(--color-warning-700)' },
  danger:  { bg: 'var(--color-danger-50)',   text: 'var(--color-danger-700)'  },
};

// ── Change Password Form ──────────────────────────────────────────────────────
const ChangePasswordForm = () => {
  const { changePassword, changingPassword, settings } = useSettingsStore();
  const [visible, setVisible] = useState({ current: false, new: false, confirm: false });
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword', '');

  const toggle = (field) => setVisible((v) => ({ ...v, [field]: !v[field] }));

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) return;
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 4000);
      toast.success('Password changed successfully!', { icon: '🔒' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const eyeBtn = (field) => (
    <button
      type="button"
      onClick={() => toggle(field)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
        color: 'var(--color-neutral-400)', padding: 0 }}
      aria-label={visible[field] ? 'Hide password' : 'Show password'}
    >
      {visible[field] ? <RiEyeOffLine /> : <RiEyeLine />}
    </button>
  );

  return (
    <SectionBlock
      title="Change Password"
      description="Use a strong, unique password you do not use elsewhere."
    >
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              background: 'var(--color-success-50)', color: 'var(--color-success-700)',
              fontSize: '0.875rem', fontWeight: 600,
            }}
          >
            <RiCheckLine style={{ fontSize: '1.1rem' }} />
            Password changed successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last changed indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        fontSize: '0.8125rem', color: 'var(--color-neutral-500)',
        padding: '0.5rem 0.75rem', background: 'var(--color-neutral-50)',
        borderRadius: '0.5rem', width: 'fit-content',
      }}>
        <RiTimeLine />
        Last changed: {formatRelative(settings.security.lastPasswordChange)}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          id="currentPassword"
          label="Current Password"
          type={visible.current ? 'text' : 'password'}
          placeholder="Enter current password"
          error={errors.currentPassword?.message}
          rightAddon={eyeBtn('current')}
          {...register('currentPassword', { required: 'Current password is required' })}
        />
        <Input
          id="newPassword"
          label="New Password"
          type={visible.new ? 'text' : 'password'}
          placeholder="Enter new password"
          error={errors.newPassword?.message}
          rightAddon={eyeBtn('new')}
          {...register('newPassword', {
            required: 'New password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />
        <PasswordStrength password={newPassword} />

        <Input
          id="confirmPassword"
          label="Confirm New Password"
          type={visible.confirm ? 'text' : 'password'}
          placeholder="Re-enter new password"
          error={errors.confirmPassword?.message}
          rightAddon={eyeBtn('confirm')}
          {...register('confirmPassword', {
            required: 'Please confirm your new password',
            validate: (v) => v === newPassword || 'Passwords do not match',
          })}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" loading={changingPassword}>
            Update Password
          </Button>
        </div>
      </form>
    </SectionBlock>
  );
};

// ── Two-Factor Authentication ─────────────────────────────────────────────────
const TwoFactorBlock = () => {
  const { settings, toggleTwoFactor, saving } = useSettingsStore();
  const enabled = settings.security.twoFactorEnabled;

  const handleToggle = async () => {
    try {
      await toggleTwoFactor(!enabled);
      toast.success(enabled ? '2FA disabled.' : '2FA enabled!', { icon: enabled ? '🔓' : '🔐' });
    } catch {
      toast.error('Failed to update 2FA settings.');
    }
  };

  return (
    <SectionBlock
      title="Two-Factor Authentication"
      description="Add an extra layer of security to your account."
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.25rem' }}>
            {enabled ? '🔐 2FA is enabled' : '🔓 2FA is disabled'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            {enabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Enable 2FA to significantly improve your account security.'}
          </p>
        </div>
        <Switch checked={enabled} onChange={handleToggle} disabled={saving} size="lg" />
      </div>

      {/* Method list (future/UI only) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {TWO_FACTOR_METHODS.map((method) => (
          <div
            key={method.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem', borderRadius: '0.75rem',
              border: '1.5px solid var(--color-neutral-100)',
              opacity: method.available ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: 0 }}>
                {method.name}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                {method.description}
              </p>
            </div>
            {!method.available && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem',
                borderRadius: 99, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-500)' }}>
                Coming soon
              </span>
            )}
          </div>
        ))}
      </div>
    </SectionBlock>
  );
};

// ── Connected Providers ───────────────────────────────────────────────────────
const ConnectedProvidersBlock = () => (
  <SectionBlock
    title="Connected Accounts"
    description="Link third-party providers for single sign-on. (Coming soon)"
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {OAUTH_PROVIDERS.map((provider) => (
        <div
          key={provider.id}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem', borderRadius: '0.75rem',
            border: '1.5px solid var(--color-neutral-100)',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{provider.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: 0 }}>
              {provider.name}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              {provider.connected ? `Connected as ${provider.email}` : provider.description}
            </p>
          </div>
          <button
            disabled
            style={{
              fontSize: '0.8125rem', fontWeight: 600, padding: '0.4375rem 0.875rem',
              borderRadius: '0.625rem', border: '1.5px solid var(--color-neutral-200)',
              background: 'transparent', color: 'var(--color-neutral-400)', cursor: 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
            }}
          >
            <RiLink /> Connect
          </button>
        </div>
      ))}
    </div>
  </SectionBlock>
);

// ── Security Log ──────────────────────────────────────────────────────────────
const SecurityLogBlock = () => (
  <SectionBlock
    title="Recent Security Events"
    description="A log of recent activity affecting your account security."
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {mockSecurityEvents.map((event) => {
        const colors = SEVERITY_COLOR[event.severity] || SEVERITY_COLOR.info;
        return (
          <div
            key={event.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
              padding: '0.875rem', borderRadius: '0.75rem',
              border: '1px solid var(--color-neutral-100)',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: colors.bg, color: colors.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>
              {event.severity === 'danger' ? <RiAlertLine /> : <RiShieldCheckLine />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.125rem' }}>
                {event.label}
              </p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.25rem' }}>
                {event.device} · {event.location}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                {formatRelative(event.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </SectionBlock>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const SecuritySettingsForm = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <ChangePasswordForm />
    <TwoFactorBlock />
    <ConnectedProvidersBlock />
    <SecurityLogBlock />
  </div>
);

export default SecuritySettingsForm;
