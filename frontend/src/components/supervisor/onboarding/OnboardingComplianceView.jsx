/**
 * @file OnboardingComplianceView.jsx
 * @description Supervisor view for non-document onboarding questionnaires and compliance
 * (IT Setup, Company Policies, Academic Details, Emergency Contacts).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiComputerLine,
  RiShieldCheckLine,
  RiFileTextLine,
  RiCheckLine,
} from 'react-icons/ri';

const SECTION_CONFIG = {
  it_setup: { title: 'IT Setup & Workstation', icon: RiComputerLine, color: '#0284c7', bg: '#e0f2fe' },
  company_policies: { title: 'Company Policies & NDA', icon: RiShieldCheckLine, color: '#059669', bg: '#ecfdf5' },
  internship_info: { title: 'Academic & Internship Details', icon: RiFileTextLine, color: '#7c3aed', bg: '#f5f3ff' },
};

export default function OnboardingComplianceView({
  queue = [],
  actionLoading = false,
  onUpdateDetailStatus,
}) {
  const [selectedSection, setSelectedSection] = useState(null); // { intern, key, data }
  const [decisionNotes, setDecisionNotes] = useState('');

  // Extract all submitted questionnaire items
  const allSubmissions = queue.flatMap((intern) => {
    const details = intern.onboarding_details || {};
    return Object.entries(details)
      .filter(([, val]) => val && (val.status === 'completed' || val.submitted_at || val.review_status))
      .map(([key, val]) => ({
        intern,
        key,
        data: val,
        config: SECTION_CONFIG[key] || {
          title: key.replace(/_/g, ' ').toUpperCase(),
          icon: RiFileTextLine,
          color: '#475569',
          bg: '#f1f5f9',
        },
      }));
  });

  const handleReviewSubmit = (decision) => {
    if (!selectedSection) return;
    onUpdateDetailStatus?.(
      selectedSection.intern.internId || selectedSection.intern.intern_id,
      `detail:${selectedSection.key}`,
      decision,
      decisionNotes
    );
    setSelectedSection(null);
    setDecisionNotes('');
  };

  if (allSubmissions.length === 0) {
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
        <RiShieldCheckLine style={{ fontSize: '3rem', color: '#10b981', margin: '0 auto 0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
          No Compliance Questionnaires Awaiting Review
        </h3>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
          Intern IT setup requests, NDA agreements, and policy questionnaires will be displayed here for sign-off.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>
          Compliance & Questionnaire Submissions ({allSubmissions.length})
        </h3>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
          Review IT provisioning preferences, company policy sign-offs, and academic registrations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {allSubmissions.map(({ intern, key, data, config }) => {
          const st = data.review_status || 'pending';
          const isPending = st === 'pending';
          const isApproved = st === 'approved';
          const Icon = config.icon;
          const rows = Object.entries(data.details || {});

          return (
            <div
              key={`${intern.internId}-${key}`}
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                border: isPending ? '1.5px solid #fde68a' : isApproved ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '0.625rem',
                      background: config.bg,
                      color: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}
                  >
                    <Icon />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a' }}>
                      {config.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {intern.internName} · <span style={{ color: '#0284c7' }}>{intern.department || 'FifthLab'}</span>
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '99px',
                    background: isApproved ? '#ecfdf5' : isPending ? '#fffbeb' : '#fff7ed',
                    color: isApproved ? '#059669' : isPending ? '#d97706' : '#ea580c',
                  }}
                >
                  {isApproved ? 'Approved' : isPending ? 'Pending Review' : 'Needs Revision'}
                </span>
              </div>

              {/* Data fields grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.35rem', background: '#f8fafc', padding: '0.625rem 0.75rem', borderRadius: '0.625rem' }}>
                {rows.length > 0 ? (
                  rows.map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
                        {label.replace(/_/g, ' ')}:
                      </span>
                      <span style={{ color: '#0f172a', fontWeight: 700, textAlign: 'right' }}>
                        {String(val)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Standard completion submitted.
                  </div>
                )}
              </div>

              {data.review_notes && (
                <div style={{ fontSize: '0.72rem', color: '#c2410c', background: '#fff7ed', padding: '0.4rem 0.6rem', borderRadius: '0.5rem' }}>
                  Note: {data.review_notes}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <button
                  onClick={() => setSelectedSection({ intern, key, data })}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Review Details
                </button>
                {isPending && (
                  <button
                    disabled={actionLoading}
                    onClick={() => onUpdateDetailStatus?.(intern.internId || intern.intern_id, `detail:${key}`, 'approved', 'Verified and confirmed.')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <RiCheckLine /> Verify
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Review Modal Dialog */}
      {selectedSection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              width: '100%',
              maxWidth: '480px',
              padding: '1.5rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>
                  Review {SECTION_CONFIG[selectedSection.key]?.title || selectedSection.key}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
                  Submitted by <strong>{selectedSection.intern.internName}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedSection(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {Object.entries(selectedSection.data?.details || {}).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</span>
                  <span style={{ color: '#0f172a', fontWeight: 800 }}>{String(v)}</span>
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Supervisor Feedback / Verification Note:
              </label>
              <textarea
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Optional supervisor notes or instructions if requesting revision…"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.625rem',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.625rem' }}>
              <button
                onClick={() => handleReviewSubmit('resubmission_required')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.625rem',
                  border: '1px solid #fed7aa',
                  background: '#fff7ed',
                  color: '#c2410c',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Request Revision
              </button>
              <button
                onClick={() => handleReviewSubmit('approved')}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Approve & Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
