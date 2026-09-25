/**
 * @file OnboardingTableView.jsx
 * @description Detailed tabular layout for intern onboarding verification.
 */

import {
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
} from 'react-icons/ri';

const STATUS_PILL = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#059669', icon: RiCheckboxCircleLine },
  pending: { label: 'Pending', bg: '#fffbeb', color: '#d97706', icon: RiTimeLine },
  'pending-review': { label: 'Pending', bg: '#fffbeb', color: '#d97706', icon: RiTimeLine },
  resubmission_required: { label: 'Revision', bg: '#fff7ed', color: '#ea580c', icon: RiAlertLine },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', icon: RiCloseCircleLine },
  not_submitted: { label: 'Missing', bg: '#f1f5f9', color: '#64748b', icon: RiTimeLine },
};

const getDocStatus = (steps, categoryKey) => {
  const doc = steps.find(
    (s) => s.category === categoryKey || s.title?.toLowerCase().includes(categoryKey)
  );
  if (!doc || doc.submitted === false) return { status: 'not_submitted', doc: null };
  const st = doc.review_status || doc.status || 'pending';
  return { status: st, doc };
};

export default function OnboardingTableView({
  interns = [],
  onOpenDossier,
  onOpenDocModal,
  onQuickApproveAll,
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1.125rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#475569',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '0.875rem 1.25rem' }}>Intern</th>
              <th style={{ padding: '0.875rem 1rem' }}>Department</th>
              <th style={{ padding: '0.875rem 1rem' }}>Institution & Program</th>
              <th style={{ padding: '0.875rem 1rem' }}>Progress</th>
              <th style={{ padding: '0.875rem 1rem' }}>Resume</th>
              <th style={{ padding: '0.875rem 1rem' }}>Placement</th>
              <th style={{ padding: '0.875rem 1rem' }}>Acceptance</th>
              <th style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interns.map((intern) => {
              const steps = intern.steps || intern.documents || [];
              const approvedCount = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
              const pendingDocs = steps.filter((s) => {
                const st = s.review_status || s.status;
                return (st === 'pending' || st === 'pending-review') && s.submitted !== false;
              });

              const resumeInfo = getDocStatus(steps, 'resume');
              const placementInfo = getDocStatus(steps, 'placement_letter');
              const acceptanceInfo = getDocStatus(steps, 'acceptance_letter');

              const progressPct = Math.round((approvedCount / 3) * 100);
              const info = intern.onboarding_info || {};

              return (
                <tr
                  key={intern.internId || intern.intern_id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: '0.8125rem',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                >
                  {/* Intern Name & Email */}
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{intern.internName}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{intern.email}</div>
                  </td>

                  {/* Department */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '99px',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}
                    >
                      {intern.department || 'FifthLab'}
                    </span>
                  </td>

                  {/* Institution */}
                  <td style={{ padding: '0.875rem 1rem', maxWidth: '200px' }}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#334155',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={info.institution}
                    >
                      {info.institution || '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {info.field_of_study || 'General Cohort'}
                    </div>
                  </td>

                  {/* Progress */}
                  <td style={{ padding: '0.875rem 1rem', minWidth: '130px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '6px',
                          background: '#e2e8f0',
                          borderRadius: '99px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            background: progressPct === 100 ? '#10b981' : '#00b4d8',
                            borderRadius: '99px',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: progressPct === 100 ? '#059669' : '#0f172a',
                        }}
                      >
                        {approvedCount}/3
                      </span>
                    </div>
                  </td>

                  {/* Resume Status */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <StatusBadge
                      statusInfo={resumeInfo}
                      onClick={() => resumeInfo.doc && onOpenDocModal?.(intern, resumeInfo.doc)}
                    />
                  </td>

                  {/* Placement Letter Status */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <StatusBadge
                      statusInfo={placementInfo}
                      onClick={() => placementInfo.doc && onOpenDocModal?.(intern, placementInfo.doc)}
                    />
                  </td>

                  {/* Acceptance Letter Status */}
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <StatusBadge
                      statusInfo={acceptanceInfo}
                      onClick={() => acceptanceInfo.doc && onOpenDocModal?.(intern, acceptanceInfo.doc)}
                    />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0.875rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                      {pendingDocs.length > 0 && onQuickApproveAll && (
                        <button
                          onClick={() => onQuickApproveAll(intern)}
                          title={`Quick Approve ${pendingDocs.length} pending`}
                          style={{
                            padding: '0.35rem 0.6rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #86efac',
                            background: '#ecfdf5',
                            color: '#15803d',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <RiCheckDoubleLine /> Approve ({pendingDocs.length})
                        </button>
                      )}
                      <button
                        onClick={() => onOpenDossier?.(intern)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        Dossier <RiArrowRightLine />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ statusInfo, onClick }) {
  const cfg = STATUS_PILL[statusInfo.status] || STATUS_PILL.not_submitted;
  const isClickable = Boolean(statusInfo.doc);

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.55rem',
        borderRadius: '99px',
        background: cfg.bg,
        color: cfg.color,
        border: 'none',
        fontSize: '0.72rem',
        fontWeight: 800,
        cursor: isClickable ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      <cfg.icon style={{ fontSize: '0.85rem' }} />
      {cfg.label}
    </button>
  );
}
