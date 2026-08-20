/**
 * @file SecurityOverview.jsx
 * @description Security section showing last login, active sessions, password status,
 * 2FA toggle, and action buttons (Change Password / Manage Sessions).
 * Links to placeholder pages that will be expanded in Day 10.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/useProfileStore';

const formatDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return str;
  }
};

const timeAgo = (str) => {
  if (!str) return '';
  const diff = Date.now() - new Date(str).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const SessionRow = ({ session, onRevoke }) => {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    setRevoking(true);
    try {
      await onRevoke(session.id);
      toast.success('Session revoked.');
    } catch {
      toast.error('Failed to revoke session.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '0.875rem 1rem',
        background: session.isCurrent ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
        border: `1px solid ${session.isCurrent ? 'var(--color-primary-200)' : 'var(--color-neutral-200)'}`,
        borderRadius: '0.75rem',
      }}
    >
      {/* Device icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '0.625rem',
          background: session.isCurrent ? 'var(--color-primary-100)' : 'var(--color-neutral-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.68rem',
          fontWeight: 800,
          flexShrink: 0,
        }}
      >
        {session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android') ? 'Mobile' : 'Web'}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
            {session.device}
          </p>
          {session.isCurrent && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'var(--color-primary-600)',
                color: '#fff',
                padding: '0.15rem 0.5rem',
                borderRadius: 99,
              }}
            >
              Current
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: 2 }}>
          {session.location} · {session.ip} · {timeAgo(session.lastActive)}
        </p>
      </div>

      {/* Revoke */}
      {!session.isCurrent && (
        <button
          className="btn btn-danger btn-sm"
          onClick={handleRevoke}
          disabled={revoking}
          style={{ flexShrink: 0 }}
          aria-label={`Revoke session on ${session.device}`}
        >
          {revoking ? 'Revoking...' : 'Revoke'}
        </button>
      )}
    </motion.div>
  );
};

const SecurityOverview = () => {
  const { profile, revokeSession, toggleTwoFactor } = useProfileStore();
  const navigate = useNavigate();
  const [togglingTwoFactor, setTogglingTwoFactor] = useState(false);

  const handleToggleTwoFactor = async () => {
    setTogglingTwoFactor(true);
    try {
      await toggleTwoFactor(!profile?.twoFactorEnabled);
      toast.success(
        profile?.twoFactorEnabled
          ? 'Two-factor authentication disabled.'
          : 'Two-factor authentication enabled!'
      );
    } catch {
      toast.error('Failed to update 2FA setting.');
    } finally {
      setTogglingTwoFactor(false);
    }
  };

  const securityItems = [
    {
      icon: 'Login',
      label: 'Last Login',
      value: formatDate(profile?.lastLogin),
      sub: timeAgo(profile?.lastLogin),
      iconBg: '#eef2ff',
    },
    {
      icon: 'Password',
      label: 'Password Last Changed',
      value: formatDate(profile?.passwordLastChanged),
      sub: timeAgo(profile?.passwordLastChanged),
      iconBg: '#f0fdf4',
    },
    {
      icon: 'Email',
      label: 'Email Verified',
      value: profile?.emailVerified ? 'Verified' : 'Not verified',
      valueColor: profile?.emailVerified ? '#16a34a' : '#dc2626',
      iconBg: '#fff7ed',
    },
    {
      icon: '2FA',
      label: 'Two-Factor Auth',
      value: profile?.twoFactorEnabled ? 'Enabled' : 'Disabled',
      valueColor: profile?.twoFactorEnabled ? '#16a34a' : '#dc2626',
      iconBg: '#fdf2f8',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Security Status Card */}
      <div className="card p-6 mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Security Overview</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>Manage your account security settings</p>
          </div>
        </div>

        {/* Security items grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {securityItems.map((item) => (
            <div
              key={item.label}
              style={{
                background: 'var(--color-neutral-50)',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: '0.75rem',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <div style={{ width: 56, height: 34, borderRadius: '0.5rem', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.label}</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: item.valueColor ?? 'var(--color-neutral-800)', marginTop: 1 }}>{item.value}</p>
                {item.sub && <p style={{ fontSize: '0.73rem', color: 'var(--color-neutral-400)', marginTop: 1 }}>{item.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/dashboard/settings')}
            id="change-password-btn"
          >
            Change Password
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleToggleTwoFactor}
            disabled={togglingTwoFactor}
            id="toggle-2fa-btn"
          >
            {togglingTwoFactor ? 'Updating...' : profile?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="card p-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Active Sessions</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                {profile?.activeSessions?.length ?? 0} active session{(profile?.activeSessions?.length ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/dashboard/settings')}
            id="manage-sessions-btn"
          >
            Manage Sessions
          </button>
        </div>

        {/* Session list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {(profile?.activeSessions ?? []).map((session) => (
            <SessionRow key={session.id} session={session} onRevoke={revokeSession} />
          ))}
          {(profile?.activeSessions ?? []).length === 0 && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', textAlign: 'center', padding: '1.5rem 0' }}>
              No active sessions found.
            </p>
          )}
        </div>

        {/* Warning */}
        <div
          style={{
            marginTop: '1rem',
            background: 'var(--color-warning-50)',
            border: '1px solid var(--color-warning-100)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            fontSize: '0.8125rem',
            color: 'var(--color-warning-700)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <span>
            If you see a session you don't recognise, revoke it immediately and{' '}
            <button
              onClick={() => navigate('/dashboard/settings')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-warning-700)', fontWeight: 700, textDecoration: 'underline', fontSize: 'inherit' }}
            >
              change your password
            </button>
            .
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SecurityOverview;
