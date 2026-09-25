/**
 * @file InternDossierModal.jsx
 * @description Comprehensive Intern Onboarding Dossier Modal showing academic profile,
 * contact details, document checklist, form questionnaires, and full verification history.
 */

import { motion } from 'framer-motion';
import {
  RiCloseLine,
  RiBuilding2Line,
  RiGraduationCapLine,
  RiPhoneLine,
  RiMailLine,
  RiCalendarLine,
  RiFilePdfLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
  RiDownloadLine,
  RiCheckDoubleLine,
  RiHistoryLine,
} from 'react-icons/ri';

const STATUS_CONFIG = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#059669', icon: RiCheckboxCircleLine },
  pending: { label: 'Pending Review', bg: '#fffbeb', color: '#d97706', icon: RiTimeLine },
  'pending-review': { label: 'Pending Review', bg: '#fffbeb', color: '#d97706', icon: RiTimeLine },
  resubmission_required: { label: 'Needs Revision', bg: '#fff7ed', color: '#ea580c', icon: RiAlertLine },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', icon: RiAlertLine },
  not_submitted: { label: 'Not Uploaded', bg: '#f1f5f9', color: '#64748b', icon: RiTimeLine },
};

const REQUIRED_DOCS = [
  { key: 'resume', title: 'Resume / Curriculum Vitae', description: 'Up-to-date CV detailing skills, coursework, and personal projects.' },
  { key: 'placement_letter', title: 'Internship / Placement Letter', description: 'Official institutional SIWES / IT recommendation letter with stamp.' },
  { key: 'acceptance_letter', title: 'Acceptance Letter of Offer', description: 'Signed and dated CWG PLC / FifthLab internship offer acceptance.' },
];

export default function InternDossierModal({
  isOpen,
  onClose,
  intern,
  onOpenDocModal,
  onQuickApproveAll,
  onDownloadDoc,
}) {
  if (!isOpen || !intern) return null;

  const info = intern.onboarding_info || {};
  const steps = intern.steps || intern.documents || [];
  const details = intern.onboarding_details || {};
  const approvedCount = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
  const pendingDocs = steps.filter((s) => {
    const st = s.review_status || s.status;
    return (st === 'pending' || st === 'pending-review') && s.submitted !== false;
  });
  const isFullyCleared = approvedCount >= 3;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
            color: '#ffffff',
            padding: '1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '1.25rem',
            }}
          >
            <RiCloseLine />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#ffffff',
                color: '#0077b6',
                fontSize: '1.25rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {(intern.internName || 'IN').split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
                  {intern.internName}
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.6rem',
                    borderRadius: '99px',
                    background: isFullyCleared ? '#ecfdf5' : '#fef3c7',
                    color: isFullyCleared ? '#059669' : '#92400e',
                  }}
                >
                  {isFullyCleared ? 'Fully Cleared & Verified' : `${approvedCount}/3 Documents Cleared`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '0.8125rem', opacity: 0.95, flexWrap: 'wrap' }}>
                <span><RiBuilding2Line style={{ verticalAlign: '-1px' }} /> {intern.department || 'FifthLab'}</span>
                <span><RiMailLine style={{ verticalAlign: '-1px' }} /> {intern.email}</span>
                {info.phone && <span><RiPhoneLine style={{ verticalAlign: '-1px' }} /> {info.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Academic & Placement Info Cards */}
          <div>
            <h4 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Academic & Placement Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {[
                { label: 'Institution', val: info.institution, icon: RiGraduationCapLine },
                { label: 'Field of Study', val: info.field_of_study, icon: RiGraduationCapLine },
                { label: 'Academic Standing', val: info.academic_year || 'Undergraduate', icon: RiGraduationCapLine },
                { label: 'Duration / Period', val: info.start_date ? `${info.start_date} to ${info.end_date || 'End'}` : '6 Months', icon: RiCalendarLine },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Icon /> {label}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                    {val || 'Not provided'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Required Compliance Documents ({approvedCount}/3)
              </h4>

              {pendingDocs.length > 0 && onQuickApproveAll && (
                <button
                  onClick={() => onQuickApproveAll(intern)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #86efac',
                    background: '#ecfdf5',
                    color: '#15803d',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <RiCheckDoubleLine /> Approve All Pending ({pendingDocs.length})
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                const fileName = doc?.document?.file_name;
                const docId = doc?.document?.id || doc?.id;

                return (
                  <div
                    key={docDef.key}
                    style={{
                      border: `1.5px solid ${cfg.border || '#e2e8f0'}`,
                      background: '#ffffff',
                      borderRadius: '0.875rem',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0, flex: '1 1 240px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '0.625rem',
                          background: cfg.bg,
                          color: cfg.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.25rem',
                          flexShrink: 0,
                        }}
                      >
                        <RiFilePdfLine />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                            {docDef.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: cfg.bg,
                              color: cfg.color,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '99px',
                            }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {docDef.description}
                        </div>
                        {fileName && (
                          <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: 600, marginTop: '0.25rem' }}>
                            File: {fileName}
                          </div>
                        )}
                        {doc?.review_notes && (
                          <div style={{ fontSize: '0.72rem', color: '#c2410c', background: '#fff7ed', padding: '0.35rem 0.5rem', borderRadius: '0.375rem', marginTop: '0.35rem' }}>
                            Feedback: {doc.review_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {fileName && onDownloadDoc && (
                        <button
                          type="button"
                          onClick={() => onDownloadDoc(docId)}
                          style={{
                            padding: '0.45rem 0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#0f172a',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <RiDownloadLine /> Open
                        </button>
                      )}

                      {doc && doc.submitted !== false && (
                        <button
                          type="button"
                          onClick={() => onOpenDocModal?.(intern, doc)}
                          style={{
                            padding: '0.45rem 0.875rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            background: '#00b4d8',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Review & Decide
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Details Submitted */}
          {Object.keys(details).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Questionnaires & Workstation Provisioning
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {Object.entries(details).map(([key, item]) => (
                  <div key={key} style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, color: item?.review_status === 'approved' ? '#059669' : '#d97706' }}>
                        {item?.review_status || 'Submitted'}
                      </span>
                    </div>
                    {item?.details && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                        {Object.entries(item.details).slice(0, 3).map(([k, v]) => (
                          <div key={k}>
                            <strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail for this intern */}
          {(intern.auditLog || []).length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 0.625rem 0', fontSize: '0.875rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Verification History
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {intern.auditLog.map((log) => (
                  <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <RiHistoryLine />
                    <strong>{log.action?.toUpperCase()}</strong> on {log.stepTitle} by {log.performedBy} (
                    {new Date(log.timestamp).toLocaleDateString('en-GB')})
                    {log.reason && <span>— "{log.reason}"</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5625rem 1.25rem',
              borderRadius: '0.625rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Dossier
          </button>
        </div>
      </motion.div>
    </div>
  );
}
