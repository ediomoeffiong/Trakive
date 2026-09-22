/**
 * @file SessionsDevicesList.jsx
 * @description Active sessions & connected devices list with multi-device support,
 * 10-per-page pagination for past sessions, and 3-device login limit notice.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiComputerLine,
  RiSmartphoneLine,
  RiTabletLine,
  RiMapPinLine,
  RiTimeLine,
  RiDeleteBin7Line,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiRefreshLine,
  RiHistoryLine,
  RiInformationLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from 'react-icons/ri';
import {
  useSettingsStore,
  useCurrentSessions,
  useOtherSessions,
  useOtherSessionsPagination,
} from '../../store/useSettingsStore';
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

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const DeviceIcon = ({ type }) => {
  const style = { fontSize: '1.4rem' };
  if (type === 'mobile')  return <RiSmartphoneLine style={style} />;
  if (type === 'tablet')  return <RiTabletLine style={style} />;
  return <RiComputerLine style={style} />;
};

// ── Active Session Card ───────────────────────────────────────────────────────
const ActiveSessionCard = ({ session, onRevoke, isRevoking }) => (
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
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: '1.25rem',
      borderRadius: '0.875rem',
      border: `1.5px solid ${session.isCurrent ? 'var(--color-primary-200)' : 'var(--color-neutral-200)'}`,
      background: session.isCurrent ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
      position: 'relative',
    }}
  >
    {/* Device icon */}
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '0.75rem',
        flexShrink: 0,
        background: session.isCurrent ? 'var(--color-primary-100)' : 'var(--color-neutral-100)',
        color: session.isCurrent ? 'var(--color-primary-600)' : 'var(--color-neutral-600)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DeviceIcon type={session.deviceType} />
    </div>

    {/* Session info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
          {session.device}
        </p>
        {session.isCurrent ? (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0.125rem 0.5rem',
              borderRadius: 99,
              background: 'var(--color-primary-600)',
              color: '#fff',
            }}
          >
            This Device
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '0.125rem 0.5rem',
              borderRadius: 99,
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
            }}
          >
            Active
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', margin: '0 0 0.375rem', fontWeight: 500 }}>
        {session.browser} · {session.os}
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
          <RiMapPinLine /> {session.location} · {session.ip}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
          <RiTimeLine /> {session.isCurrent ? 'Active now' : formatRelative(session.lastActive)}
        </span>
      </div>
    </div>

    {/* Revoke button for other active devices */}
    {!session.isCurrent && (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onRevoke(session.id)}
        disabled={isRevoking}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.4375rem 0.875rem',
          borderRadius: '0.625rem',
          flexShrink: 0,
          border: '1.5px solid var(--color-danger-200)',
          background: '#fff',
          color: isRevoking ? 'var(--color-neutral-400)' : 'var(--color-danger-600)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: isRevoking ? 'wait' : 'pointer',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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

// ── Past Session Card ─────────────────────────────────────────────────────────
const PastSessionCard = ({ session }) => {
  const isRevoked = session.status === 'revoked' || session.revokedAt;
  const statusLabel = isRevoked ? 'Signed out' : 'Expired';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        padding: '1rem 1.25rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--color-neutral-200)',
        background: 'var(--color-neutral-50)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '0.625rem',
          flexShrink: 0,
          background: 'var(--color-neutral-100)',
          color: 'var(--color-neutral-400)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <DeviceIcon type={session.deviceType} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: 0 }}>
            {session.device}
          </p>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              padding: '0.1rem 0.45rem',
              borderRadius: 99,
              background: isRevoked ? '#fef2f2' : '#f3f4f6',
              color: isRevoked ? '#dc2626' : '#6b7280',
              border: `1px solid ${isRevoked ? '#fecaca' : '#e5e7eb'}`,
            }}
          >
            {statusLabel}
          </span>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.25rem' }}>
          {session.browser} · {session.os}
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
            <RiMapPinLine /> {session.location} · {session.ip}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
            <RiTimeLine /> {formatRelative(session.revokedAt || session.lastActive)} ({formatDate(session.revokedAt || session.lastActive)})
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────
const NoPastSessions = () => (
  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📋</div>
    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: '0.25rem' }}>
      No past sessions
    </p>
    <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
      You have no prior or revoked session history recorded.
    </p>
  </div>
);

const SessionsError = ({ message, onRetry, loading }) => (
  <div
    style={{
      padding: '1rem',
      borderRadius: '0.75rem',
      border: '1.5px solid var(--color-danger-200)',
      background: 'var(--color-danger-50)',
      color: 'var(--color-danger-700)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap',
    }}
  >
    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>
      {message || 'Unable to load live sessions right now.'}
    </p>
    <Button
      variant="outline"
      size="sm"
      leftIcon={<RiRefreshLine />}
      onClick={onRetry}
      loading={loading}
    >
      Retry
    </Button>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const SessionsDevicesList = () => {
  const {
    fetchSessions,
    setOtherSessionsPage,
    revokeSession,
    revokeOtherSessions,
    loadingSessions,
    revokingSession,
    sessionsError,
  } = useSettingsStore();

  const currentSessions = useCurrentSessions();
  const otherSessions = useOtherSessions();
  const pagination = useOtherSessionsPagination();

  useEffect(() => {
    fetchSessions(1).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const otherActiveCount = currentSessions.filter((s) => !s.isCurrent).length;

  const handleRevoke = async (id) => {
    try {
      await revokeSession(id);
      toast.success('Session signed out successfully.', { icon: '🔒' });
    } catch (err) {
      toast.error(err.message || 'Failed to sign out session.');
    }
  };

  const handleRevokeAllOthers = async () => {
    try {
      await revokeOtherSessions();
      toast.success('All other active devices signed out.', { icon: '🔐' });
    } catch (err) {
      toast.error(err.message || 'Failed to sign out other sessions.');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pagination.totalPages || 1) && newPage !== pagination.page) {
      setOtherSessionsPage(newPage).catch(() => {});
    }
  };

  const totalOther = pagination.total || otherSessions.length;
  const currentPage = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const pageStart = totalOther === 0 ? 0 : (currentPage - 1) * (pagination.limit || 10) + 1;
  const pageEnd = Math.min(currentPage * (pagination.limit || 10), totalOther);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Current Sessions Card ────────────────────────────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '0.75rem',
                background: 'var(--color-primary-50)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <RiShieldCheckLine />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                  Current Sessions
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.6rem',
                    borderRadius: 99,
                    background: currentSessions.length >= 3 ? '#fef3c7' : 'var(--color-primary-50)',
                    color: currentSessions.length >= 3 ? '#b45309' : 'var(--color-primary-700)',
                    border: `1px solid ${currentSessions.length >= 3 ? '#fde68a' : 'var(--color-primary-200)'}`,
                  }}
                >
                  {currentSessions.length} / 3 active
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.2rem 0 0' }}>
                Devices currently signed in to your account (maximum 3 allowed)
              </p>
            </div>
          </div>

          {otherActiveCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RiLogoutBoxRLine />}
              onClick={handleRevokeAllOthers}
              loading={revokingSession === 'all'}
            >
              Sign out all other devices
            </Button>
          )}
        </div>

        {sessionsError && !loadingSessions ? (
          <SessionsError message={sessionsError} onRetry={() => fetchSessions(1).catch(() => {})} loading={loadingSessions} />
        ) : loadingSessions ? (
          <SessionsListSkeleton />
        ) : currentSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence mode="popLayout">
              {currentSessions.map((session) => (
                <ActiveSessionCard
                  key={session.id}
                  session={session}
                  onRevoke={handleRevoke}
                  isRevoking={revokingSession === session.id}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            No active session records found for this login.
          </p>
        )}

        {/* 3-Device Limit Information Banner */}
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.875rem 1rem',
            borderRadius: '0.75rem',
            background: '#f8fafc',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
          }}
        >
          <div style={{ color: 'var(--color-primary-600)', fontSize: '1.1rem', marginTop: 1, flexShrink: 0 }}>
            <RiInformationLine />
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-neutral-800)' }}>Device Limit Policy:</strong> You can stay signed in on up to <strong>3 devices</strong> concurrently.
            If you reach 3 devices, you must sign out from one of your active devices before signing in on a new device.
          </p>
        </div>
      </div>

      {/* ── Other Sessions Card (Past & Revoked Sessions) ────────────────── */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '0.75rem',
                background: 'var(--color-neutral-100)',
                color: 'var(--color-neutral-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <RiHistoryLine />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
                  Other Sessions
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.125rem 0.55rem',
                    borderRadius: 99,
                    background: 'var(--color-neutral-100)',
                    color: 'var(--color-neutral-600)',
                  }}
                >
                  {totalOther} past
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0.2rem 0 0' }}>
                Past and signed out devices on your account (10 per page)
              </p>
            </div>
          </div>
        </div>

        {loadingSessions ? (
          <SessionsListSkeleton />
        ) : otherSessions.length === 0 ? (
          <NoPastSessions />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence mode="popLayout">
              {otherSessions.map((session) => (
                <PastSessionCard
                  key={session.id}
                  session={session}
                />
              ))}
            </AnimatePresence>

            {/* Pagination Controls (10 per page) */}
            {totalOther > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--color-neutral-200)',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                  Showing <strong style={{ color: 'var(--color-neutral-800)' }}>{pageStart}–{pageEnd}</strong> of{' '}
                  <strong style={{ color: 'var(--color-neutral-800)' }}>{totalOther}</strong> sessions
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loadingSessions}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.625rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-neutral-200)',
                      background: currentPage <= 1 ? '#f8fafc' : '#fff',
                      color: currentPage <= 1 ? 'var(--color-neutral-300)' : 'var(--color-neutral-700)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <RiArrowLeftSLine style={{ fontSize: '1rem' }} /> Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loadingSessions}
                      style={{
                        minWidth: 32,
                        height: 32,
                        padding: '0 0.5rem',
                        borderRadius: '0.5rem',
                        border: pageNum === currentPage ? '1.5px solid var(--color-primary-600)' : '1px solid var(--color-neutral-200)',
                        background: pageNum === currentPage ? 'var(--color-primary-600)' : '#fff',
                        color: pageNum === currentPage ? '#fff' : 'var(--color-neutral-700)',
                        fontSize: '0.8125rem',
                        fontWeight: pageNum === currentPage ? 700 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || loadingSessions}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.375rem 0.625rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--color-neutral-200)',
                      background: currentPage >= totalPages ? '#f8fafc' : '#fff',
                      color: currentPage >= totalPages ? 'var(--color-neutral-300)' : 'var(--color-neutral-700)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next <RiArrowRightSLine style={{ fontSize: '1rem' }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsDevicesList;
