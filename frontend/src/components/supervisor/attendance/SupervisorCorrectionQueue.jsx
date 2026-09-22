import { useState, useMemo } from 'react';
import {
  RiCheckDoubleLine,
  RiCloseCircleLine,
  RiErrorWarningLine,
  RiCalendarEventLine,
} from 'react-icons/ri';
import { Badge, Button, EmptyState, Skeleton } from '../../../components/ui';

const STATUS_VARIANTS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const getInitials = (firstName = '', lastName = '') => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'IN';
};

const SupervisorCorrectionQueue = ({ queue = [], loading, onReview }) => {
  const [filter, setFilter] = useState('pending'); // 'pending' | 'all'

  const filteredQueue = useMemo(() => {
    if (filter === 'pending') {
      return (queue || []).filter((q) => q.status === 'pending');
    }
    return queue || [];
  }, [queue, filter]);

  const pendingCount = useMemo(() => {
    return (queue || []).filter((q) => q.status === 'pending').length;
  }, [queue]);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} height="130px" borderRadius="12px" />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-neutral-100)',
          padding: '0.25rem',
          borderRadius: '0.625rem',
          border: '1px solid var(--color-neutral-200)',
        }}>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: filter === 'pending' ? '#ffffff' : 'transparent',
              color: filter === 'pending' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              boxShadow: filter === 'pending' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: filter === 'all' ? '#ffffff' : 'transparent',
              color: filter === 'all' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            All Requests ({queue.length})
          </button>
        </div>

        <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          Showing {filteredQueue.length} review request{filteredQueue.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Queue Cards */}
      {filteredQueue.length === 0 ? (
        <EmptyState
          title={filter === 'pending' ? 'No pending review requests!' : 'No correction requests recorded'}
          description={filter === 'pending'
            ? 'All intern correction submissions for your team have been processed.'
            : 'Submitted review requests from interns will appear here.'}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredQueue.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';

            return (
              <div
                key={req.id}
                style={{
                  border: `1px solid ${isPending ? '#fde68a' : isApproved ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '0.875rem',
                  padding: '1.25rem',
                  background: isPending ? '#fffdf7' : isApproved ? '#f0fdf4' : '#fef2f2',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                }}
              >
                {/* Header: Intern Info & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--color-primary-100)',
                      color: 'var(--color-primary-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {getInitials(req.first_name, req.last_name)}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--color-neutral-900)', display: 'block' }}>
                        {req.first_name} {req.last_name}
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>
                        {req.email}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8125rem',
                      color: 'var(--color-neutral-600)',
                      background: 'rgba(0,0,0,0.04)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                    }}>
                      <RiCalendarEventLine />
                      {new Date(req.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <Badge variant={STATUS_VARIANTS[req.status] || 'warning'}>
                      {isPending ? 'Pending Review' : isApproved ? 'Approved' : 'Rejected'}
                    </Badge>
                  </div>
                </div>

                {/* Reason Details */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: '0.625rem',
                  padding: '0.875rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--color-neutral-800)',
                  lineHeight: 1.5,
                }}>
                  <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
                    Requested Status: <strong style={{ color: 'var(--color-neutral-800)', textTransform: 'capitalize' }}>{req.requested_status || 'Present'}</strong>
                  </p>
                  <p style={{ margin: 0, color: 'var(--color-neutral-700)' }}>
                    <strong>Intern Reason:</strong> {req.reason}
                  </p>
                </div>

                {/* Optional Location Error Payload info */}
                {req.location_payload?.last_error && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.78rem',
                    color: 'var(--color-danger-700)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                  }}>
                    <RiErrorWarningLine style={{ flexShrink: 0 }} />
                    <span><strong>Technical Error Recorded:</strong> {req.location_payload.last_error}</span>
                  </div>
                )}

                {/* Past Reviewer Remark if already reviewed */}
                {req.reviewer_reason && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                    <strong>Supervisor Remark:</strong> {req.reviewer_reason}
                  </div>
                )}

                {/* Actions for Pending Requests */}
                {isPending && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem', marginTop: '0.25rem' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onReview?.(req, 'rejected')}
                      style={{ color: 'var(--color-danger-600)', borderColor: 'var(--color-danger-200)' }}
                    >
                      <RiCloseCircleLine style={{ marginRight: '0.25rem' }} /> Reject
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => onReview?.(req, 'approved')}
                    >
                      <RiCheckDoubleLine style={{ marginRight: '0.25rem' }} /> Approve as {req.requested_status || 'Present'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupervisorCorrectionQueue;
