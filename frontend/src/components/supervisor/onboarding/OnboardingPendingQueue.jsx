/**
 * @file OnboardingPendingQueue.jsx
 * @description Fast-Track Pending Document Inbox. Lists all unreviewed onboarding documents
 * across the entire cohort for rapid review and verification.
 */

import { motion } from 'framer-motion';
import {
  RiFilePdfLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiDownloadLine,
  RiShieldCheckLine,
  RiGraduationCapLine,
  RiBuilding2Line,
} from 'react-icons/ri';

const REQUIRED_TITLES = {
  resume: 'Resume / CV',
  placement_letter: 'Internship / Placement Letter',
  acceptance_letter: 'Acceptance Letter',
};

export default function OnboardingPendingQueue({
  queue = [],
  actionLoading = false,
  onApproveDoc,
  onOpenDocReview,
  onDownloadDoc,
}) {
  // Extract all pending documents across all interns
  const pendingItems = queue.flatMap((intern) => {
    const steps = intern.steps || intern.documents || [];
    return steps
      .filter((step) => {
        const st = step.review_status || step.status;
        return (st === 'pending' || st === 'pending-review') && step.submitted !== false;
      })
      .map((step) => ({
        intern,
        step,
        docTitle: REQUIRED_TITLES[step.category] || step.title || 'Onboarding Document',
        fileName: step.document?.file_name || 'Document.pdf',
        fileSize: step.document?.file_size ? `${(step.document.file_size / (1024 * 1024)).toFixed(1)} MB` : null,
        uploadedAt: step.uploaded_at || step.document?.uploaded_at,
      }));
  });

  if (pendingItems.length === 0) {
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
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 1.25rem',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
          }}
        >
          <RiShieldCheckLine />
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
          All Pending Documents Cleared!
        </h3>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', maxWidth: '440px', marginInline: 'auto' }}>
          There are currently no onboarding documents waiting for your review. When an intern uploads a new placement letter, resume, or acceptance form, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>
            Fast-Track Pending Queue ({pendingItems.length})
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
            Quickly inspect, approve, or request revisions on newly submitted documents without navigating intern-by-intern.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {pendingItems.map(({ intern, step, docTitle, fileName, fileSize, uploadedAt }) => {
          const docId = step.document?.id || step.id;
          const formattedDate = uploadedAt
            ? new Date(uploadedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Recently';

          return (
            <motion.div
              key={`${intern.internId}-${step.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #e2e8f0',
                padding: '1.125rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Left: Document Info & Intern metadata */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: '1 1 300px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '0.75rem',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
                    flexShrink: 0,
                  }}
                >
                  <RiFilePdfLine />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                      {docTitle}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '99px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <RiTimeLine /> Pending Review
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.2rem' }}>
                    Uploaded by <strong>{intern.internName}</strong> ·{' '}
                    <span style={{ color: '#0284c7', fontWeight: 600 }}>
                      <RiBuilding2Line style={{ verticalAlign: '-1px' }} /> {intern.department || 'FifthLab'}
                    </span>
                    {intern.onboarding_info?.institution && (
                      <span style={{ color: '#64748b', marginLeft: '0.35rem' }}>
                        (<RiGraduationCapLine style={{ verticalAlign: '-1px' }} /> {intern.onboarding_info.institution})
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    File: <code style={{ color: '#334155', fontWeight: 600 }}>{fileName}</code> {fileSize ? `(${fileSize})` : ''} · Submitted on {formattedDate}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {/* View / Open File */}
                <button
                  type="button"
                  onClick={() => onDownloadDoc?.(docId)}
                  title="Open uploaded file in preview window"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.625rem',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <RiDownloadLine /> Open File
                </button>

                {/* Detailed Review & Feedback */}
                <button
                  type="button"
                  onClick={() => onOpenDocReview?.(intern, step)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.625rem',
                    border: '1px solid #fed7aa',
                    background: '#fff7ed',
                    color: '#c2410c',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <RiCloseLine /> Review / Revise
                </button>

                {/* Instant Quick Approve */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => onApproveDoc?.(intern.internId || intern.intern_id, docId, 'Document verified and approved.')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '0.625rem',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <RiCheckLine /> Approve
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
