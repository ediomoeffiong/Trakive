/**
 * @file OnboardingInternCard.jsx
 * @description Rich card displaying an intern's onboarding progress, document checklist,
 * submitted profile data, and quick actions for supervisors.
 */

import { motion } from 'framer-motion';
import {
  RiFilePdfLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiCloseCircleLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiGraduationCapLine,
  RiShieldCheckLine,
  RiCheckDoubleLine,
} from 'react-icons/ri';

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    bg: '#ecfdf5',
    color: '#059669',
    border: '#a7f3d0',
    icon: RiCheckboxCircleLine,
  },
  pending: {
    label: 'Pending Review',
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
    icon: RiTimeLine,
  },
  'pending-review': {
    label: 'Pending Review',
    bg: '#fffbeb',
    color: '#d97706',
    border: '#fde68a',
    icon: RiTimeLine,
  },
  resubmission_required: {
    label: 'Needs Revision',
    bg: '#fff7ed',
    color: '#ea580c',
    border: '#fed7aa',
    icon: RiAlertLine,
  },
  rejected: {
    label: 'Rejected',
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fecaca',
    icon: RiCloseCircleLine,
  },
  not_submitted: {
    label: 'Not Uploaded',
    bg: '#f8fafc',
    color: '#64748b',
    border: '#e2e8f0',
    icon: RiTimeLine,
  },
};

const REQUIRED_DOCS = [
  { key: 'resume', label: 'Resume / CV' },
  { key: 'placement_letter', label: 'Placement Letter' },
  { key: 'acceptance_letter', label: 'Acceptance Letter' },
];

const getInitialsBg = (name = 'IN') => {
  const palette = ['#00b4d8', '#10b981', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899', '#0284c7'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
};

export default function OnboardingInternCard({
  intern,
  onOpenDossier,
  onOpenDocModal,
  onQuickApproveAll,
}) {
  const steps = intern.steps || intern.documents || [];
  const approvedCount = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
  const totalRequired = 3;
  const progressPercent = Math.round((approvedCount / totalRequired) * 100);

  const pendingDocs = steps.filter((s) => {
    const st = s.review_status || s.status;
    return (st === 'pending' || st === 'pending-review') && s.submitted !== false;
  });

  const hasNeedsRevision = steps.some((s) => s.review_status === 'resubmission_required' || s.status === 'resubmission_required');
  const isFullyCleared = approvedCount >= totalRequired;

  const initials = (intern.internName || 'Intern')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const info = intern.onboarding_info || {};
  const details = intern.onboarding_details || {};
  const submittedDetailsCount = Object.keys(details).filter((k) => details[k]?.status === 'completed' || details[k]?.submitted_at).length;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.07)' }}
      style={{
        background: '#ffffff',
        borderRadius: '1.125rem',
        border: isFullyCleared
          ? '1.5px solid #a7f3d0'
          : hasNeedsRevision
          ? '1.5px solid #fed7aa'
          : '1px solid #e2e8f0',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top status indicator ribbon */}
      {isFullyCleared && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#ecfdf5',
            color: '#059669',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.2rem 0.75rem',
            borderBottomLeftRadius: '0.625rem',
            borderLeft: '1px solid #a7f3d0',
            borderBottom: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <RiShieldCheckLine /> Cleared & Ready
        </div>
      )}

      {/* Intern Info Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: getInitialsBg(intern.internName),
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: isFullyCleared ? '2px solid #10b981' : '2px solid #ffffff',
          }}
        >
          {initials}
        </div>

        <div style={{ flex: 1, minWidth: 0, paddingRight: isFullyCleared ? '4rem' : '0' }}>
          <div
            onClick={() => onOpenDossier?.(intern)}
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#0f172a',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {intern.internName}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.2rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#0369a1',
                background: '#e0f2fe',
                padding: '0.15rem 0.5rem',
                borderRadius: '99px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <RiBuilding2Line /> {intern.department || 'FifthLab'}
            </span>

            {info.institution && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '180px',
                }}
                title={info.institution}
              >
                <RiGraduationCapLine /> {info.institution}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Label */}
      <div style={{ background: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
            Document Verification
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: isFullyCleared ? '#059669' : progressPercent > 0 ? '#0077b6' : '#64748b',
            }}
          >
            {approvedCount}/{totalRequired} Approved ({progressPercent}%)
          </span>
        </div>

        <div
          style={{
            height: '6px',
            width: '100%',
            background: '#e2e8f0',
            borderRadius: '99px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: isFullyCleared
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #00b4d8, #0077b6)',
              borderRadius: '99px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Document Checklist Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {REQUIRED_DOCS.map((docDef) => {
          const doc = steps.find(
            (s) => s.category === docDef.key || s.title?.toLowerCase().includes(docDef.key)
          );
          const rawStatus = doc
            ? doc.submitted === false
              ? 'not_submitted'
              : doc.review_status || doc.status || 'pending'
            : 'not_submitted';
          const cfg = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.not_submitted;
          const fileName = doc?.document?.file_name || (doc?.submitted ? 'Uploaded' : null);

          return (
            <div
              key={docDef.key}
              onClick={() => {
                if (doc && doc.submitted !== false) {
                  onOpenDocModal?.(intern, doc);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.45rem 0.65rem',
                borderRadius: '0.625rem',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                cursor: doc && doc.submitted !== false ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <RiFilePdfLine style={{ color: cfg.color, fontSize: '1.1rem', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {docDef.label}
                  </div>
                  {fileName && (
                    <div
                      style={{
                        fontSize: '0.65rem',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '160px',
                      }}
                    >
                      {fileName}
                    </div>
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: cfg.color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  flexShrink: 0,
                }}
              >
                <cfg.icon /> {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Profile Details Tag */}
      {submittedDetailsCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
            Forms submitted:
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '0.1rem 0.45rem',
              borderRadius: '99px',
              background: '#f1f5f9',
              color: '#334155',
            }}
          >
            {submittedDetailsCount} questionnaires completed
          </span>
        </div>
      )}

      {/* Card Actions Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginTop: 'auto',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <button
          onClick={() => onOpenDossier?.(intern)}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.625rem',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#f8fafc')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#ffffff')}
        >
          View Dossier <RiArrowRightLine />
        </button>

        {pendingDocs.length > 0 && onQuickApproveAll && (
          <button
            onClick={() => onQuickApproveAll(intern)}
            title={`Quick Approve all ${pendingDocs.length} pending document(s)`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.625rem',
              border: '1px solid #86efac',
              background: '#ecfdf5',
              color: '#15803d',
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <RiCheckDoubleLine /> Approve All ({pendingDocs.length})
          </button>
        )}
      </div>
    </motion.div>
  );
}
