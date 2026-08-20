/**
 * @file SessionsDevicesList.jsx
 * @description Active sessions & connected devices list with revoke actions.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast         from 'react-hot-toast';
import {
  RiComputerLine, RiSmartphoneLine, RiTabletLine,
  RiMapPinLine, RiTimeLine, RiDeleteBin7Line, RiLogoutBoxRLine, RiShieldCheckLine,
} from 'react-icons/ri';
import { useSettingsStore, useSessions } from '../../store/useSettingsStore';
import Button from '../ui/Button';
import { SessionsListSkeleton } from './SettingsSkeletons';

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatRelative = (isoStr) => {
  if (!isoStr) return 'Unknown';
  const diff  = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)  return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const DeviceIcon = ({ type }) => {
  const style = { fontSize: '1.5rem' };
  if (type === 'mobile')  return <RiSmartphoneLine style={style} />;
  if (type === 'tablet')  return <RiTabletLine style={style} />;
  return <RiComputerLine style={style} />;
};

// ── Session Card ──────────────────────────────────────────────────────────────
const SessionCard = ({ session, onRevoke, isRevoking }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{
      opacity: 0,
      x: 40,
      height: 0,
      marginBottom: 0,
      transition: { duration: 0.3 },
    }}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      padding: '1.25rem', borderRadius: '0.875rem',
      border: `1.5px solid ${session.isCurrent ? 'var(--color-primary-200)' : 'var(--color-neutral-100)'}`,
      background: session.isCurrent ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
      position: 'relative',
    }}
  >
    {/* Device icon */}
    <div style={{
      width: 44, height: 44, borderRadius: '0.75rem', flexShrink: 0,
      background: session.isCurrent ? 'var(--color-primary-100)' : 'var(--color-neutral-100)',
      color: session.isCurrent ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <DeviceIcon type={session.deviceType} />
    </div>

    {/* Session info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
          {session.device}
        </p>
        {session.isCurrent && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '0.125rem 0.5rem', borderRadius: 99,
            background: 'var(--color-primary-600)', color: '#fff',
          }}>
            Current
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: '0 0 0.375rem', fontWeight: 500 }}>
        {session.browser} · {session.os}
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          <RiMapPinLine /> {session.location} · {session.ip}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          <RiTimeLine /> {formatRelative(session.lastActive)}
        </span>
      </div>
    </div>

    {/* Revoke button */}
    {!session.isCurrent && (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onRevoke(session.id)}
        disabled={isRevoking}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.4375rem 0.875rem', borderRadius: '0.625rem', flexShrink: 0,
          border: '1.5px solid var(--color-danger-200)',
          background: 'transparent',
          color: isRevoking ? 'var(--color-neutral-400)' : 'var(--color-danger-600)',
          fontSize: '0.8125rem', fontWeight: 600,
          cursor: isRevoking ? 'wait' : 'pointer',
        }}
      >
        {isRevoking ? (
          <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
          </svg>
        ) : (
          <RiDeleteBin7Line />
        )}
        Sign out
      </motion.button>
    )}
  </motion.div>
);

// ── Empty State ───────────────────────────────────────────────────────────────
const NoOtherSessions = () => (
  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
    <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
    <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: '0.375rem' }}>
      Only one active session
    </p>
    <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
      You&apos;re only signed in on this device. Your account is secure.
    </p>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const SessionsDevicesList = () => {
  const { fetchSessions, revokeSession, revokeOtherSessions, loadingSessions, revokingSession } = useSettingsStore();
  const sessions = useSessions();

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const otherSessions = sessions.filter((s) => !s.isCurrent);
  const currentSession = sessions.find((s) => s.isCurrent);

  const handleRevoke = async (id) => {
    try {
      await revokeSession(id);
      toast.success('Session signed out successfully.', { icon: '🔒' });
    } catch {
      toast.error('Failed to sign out session.');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeOtherSessions();
      toast.success('All other sessions signed out.', { icon: '🔐' });
    } catch {
      toast.error('Failed to sign out other sessions.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Current session */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.75rem',
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            <RiShieldCheckLine />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Current Session
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              This is the device you are currently using
            </p>
          </div>
        </div>

        {loadingSessions ? (
          <SessionsListSkeleton />
        ) : currentSession ? (
          <SessionCard
            session={currentSession}
            onRevoke={() => {}}
            isRevoking={false}
          />
        ) : null}
      </div>

      {/* Other sessions */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Other Sessions
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              {otherSessions.length} other device{otherSessions.length !== 1 ? 's' : ''} signed in
            </p>
          </div>
          {otherSessions.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<RiLogoutBoxRLine />}
              onClick={handleRevokeAll}
              loading={revokingSession === 'all'}
            >
              Sign out all others
            </Button>
          )}
        </div>

        {loadingSessions ? (
          <SessionsListSkeleton />
        ) : otherSessions.length === 0 ? (
          <NoOtherSessions />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence mode="popLayout">
              {otherSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRevoke={handleRevoke}
                  isRevoking={revokingSession === session.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsDevicesList;
