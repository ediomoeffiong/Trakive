/**
 * @file AccountSettingsForm.jsx
 * @description Account settings form: display name, username, email, and phone.
 * Includes an email change flow with a mock OTP verification modal.
 */

import { useEffect, useState } from 'react';
import { useForm }             from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast                   from 'react-hot-toast';
import { RiMailSendLine, RiCloseLine, RiCheckLine, RiUserLine, RiPhoneLine } from 'react-icons/ri';
import { useSettingsStore }    from '../../store/useSettingsStore';
import Input                   from '../ui/Input';
import Button                  from '../ui/Button';
import UnsavedChangesBar       from './UnsavedChangesBar';

// ── Section header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1.5rem' }}>
    <div style={{
      width: 44, height: 44, borderRadius: '0.75rem', flexShrink: 0,
      background: 'var(--color-primary-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--color-primary-600)', fontSize: '1.25rem',
    }}>
      <Icon />
    </div>
    <div>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.25rem' }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
        {description}
      </p>
    </div>
  </div>
);

// ── OTP Email Verification Modal ──────────────────────────────────────────────
const EmailVerifyModal = ({ email, onClose }) => {
  const { verifyEmailChange, verifyingEmail } = useSettingsStore();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    try {
      await verifyEmailChange(otp);
      toast.success('Email address updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          background: 'var(--color-neutral-50)', borderRadius: '1.25rem',
          padding: '2rem', width: '100%', maxWidth: '420px',
          boxShadow: '0 24px 64px rgb(0 0 0 / 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '0.75rem',
            background: 'var(--color-primary-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-primary-600)', fontSize: '1.25rem', flexShrink: 0,
          }}>
            <RiMailSendLine />
          </div>
          <div>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Verify new email
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              Code sent to {email}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-neutral-400)', fontSize: '1.25rem', display: 'flex', padding: '0.25rem',
            }}
          >
            <RiCloseLine />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', marginBottom: '1.25rem' }}>
          Enter the 6-digit verification code we sent to your new email address to confirm the change.
          <br />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
            (For demo: enter any 6 digits)
          </span>
        </p>

        <div style={{ marginBottom: '0.75rem' }}>
          <Input
            id="email-otp"
            label="Verification Code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            placeholder="000000"
            error={error}
            style={{ letterSpacing: '0.3em', fontWeight: 700, fontSize: '1.25rem', textAlign: 'center' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" style={{ flex: 1 }} onClick={onClose} disabled={verifyingEmail}>
            Cancel
          </Button>
          <Button
            variant="primary"
            style={{ flex: 1 }}
            onClick={handleVerify}
            loading={verifyingEmail}
            disabled={otp.length !== 6}
          >
            <RiCheckLine /> Verify
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Form ─────────────────────────────────────────────────────────────────
const AccountSettingsForm = () => {
  const {
    settings, saving, isDirty,
    updateAccountSettings,
    requestEmailChange,
    emailVerifyOpen, setEmailVerifyOpen, pendingEmail,
    discardChanges,
  } = useSettingsStore();

  const account = settings.account;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty: formDirty },
  } = useForm({ defaultValues: account });

  // Sync form when store account changes externally
  useEffect(() => {
    reset(settings.account);
  }, [settings.account, reset]);

  const watchedEmail = watch('email');
  const emailChanged = watchedEmail !== account.email;

  const onSubmit = async (data) => {
    try {
      // Separate email change from other updates
      const { email, ...rest } = data;

      // Save non-email fields
      if (Object.keys(rest).some((k) => rest[k] !== account[k])) {
        await updateAccountSettings(rest);
        toast.success('Account information updated!');
      }

      // Trigger email verification flow if email changed
      if (emailChanged && email !== account.email) {
        await requestEmailChange(email);
        toast.success('Verification email sent!', { icon: '📨' });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update account settings.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '1.75rem' }}>
        <SectionHeader
          icon={RiUserLine}
          title="Account Information"
          description="Update your personal details and contact information."
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="settings-form-grid" style={{ marginBottom: '1rem' }}>
            <Input
              id="displayName"
              label="Display Name"
              placeholder="Your full name"
              error={errors.displayName?.message}
              {...register('displayName', {
                required: 'Display name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
            />
            <Input
              id="username"
              label="Username"
              placeholder="your.username"
              hint="Unique identifier for your profile"
              error={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                pattern: {
                  value: /^[a-z0-9._-]+$/i,
                  message: 'Username can only contain letters, numbers, dots, hyphens',
                },
              })}
            />
          </div>

          {/* Email with change alert */}
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              hint={emailChanged ? '⚠️ Changing email requires verification' : undefined}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+234 800 000 0000"
              error={errors.phone?.message}
              leftAddon={<RiPhoneLine />}
              {...register('phone', {
                pattern: {
                  value: /^\+?[\d\s\-()]{7,20}$/,
                  message: 'Enter a valid phone number',
                },
              })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => reset(account)}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={!formDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Email Verification Modal */}
      <AnimatePresence>
        {emailVerifyOpen && (
          <EmailVerifyModal
            email={pendingEmail}
            onClose={() => setEmailVerifyOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountSettingsForm;
