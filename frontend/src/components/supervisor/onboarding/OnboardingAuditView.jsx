/**
 * @file OnboardingAuditView.jsx
 * @description Supervisor onboarding activity and verification audit trail.
 */

import {
  RiHistoryLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiUser3Line,
} from 'react-icons/ri';

const ACTION_CONFIG = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#059669', icon: RiCheckboxCircleLine },
  resubmission_required: { label: 'Revision Requested', bg: '#fff7ed', color: '#ea580c', icon: RiAlertLine },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', icon: RiCloseCircleLine },
};

export default function OnboardingAuditView({ queue = [] }) {
  // Aggregate all audit logs across all interns in the queue
  const logs = queue
    .flatMap((intern) => {
      const internLogs = intern.auditLog || [];
      return internLogs.map((log) => ({
        ...log,
        internName: intern.internName,
        department: intern.department,
      }));
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (logs.length === 0) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        <RiHistoryLine style={{ fontSize: '3rem', color: '#94a3b8', margin: '0 auto 0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
          No Onboarding Audit History Yet
        </h3>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
          When you approve or request revisions on documents, compliance forms, or intern dossiers, the activity log will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1.125rem',
        border: '1px solid #e2e8f0',
        padding: '1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>
          Onboarding Audit Trail ({logs.length})
        </h3>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
          Immutable log of all onboarding approvals, resubmissions, and supervisor commentary.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {logs.map((log, index) => {
          const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.approved;
          const Icon = cfg.icon;
          const dateStr = log.timestamp
            ? new Date(log.timestamp).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recent';

          return (
            <div
              key={log.id || index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: cfg.bg,
                  color: cfg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Icon />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.875rem' }}>
                      {log.stepTitle || 'Onboarding Item'}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b', marginLeft: '0.35rem' }}>
                      for <strong>{log.internName}</strong> ({log.department || 'FifthLab'})
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '99px',
                      background: cfg.bg,
                      color: cfg.color,
                    }}
                  >
                    {cfg.label}
                  </span>
                </div>

                {log.reason && (
                  <div
                    style={{
                      marginTop: '0.35rem',
                      fontSize: '0.8125rem',
                      color: '#334155',
                      background: '#ffffff',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    "{log.reason}"
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '0.35rem',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <RiUser3Line /> {log.performedBy || 'Supervisor'}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <RiTimeLine /> {dateStr}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
