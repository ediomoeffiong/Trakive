/**
 * @file OnboardingApprovalsView.jsx
 * @description Supervisor onboarding approval checklist view with document
 * verification, approve/reject controls, and audit history.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiFileTextLine,
  RiFilePdfLine,
  RiFileImageLine,
  RiDownloadLine,
  RiArrowRightSLine,
  RiArrowLeftLine,
  RiHistoryLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiLoader4Line,
} from 'react-icons/ri';
import { OnboardingCardSkeleton } from './ReviewSkeletonLoaders';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

const STEP_STATUS_CONFIG = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#059669', icon: RiCheckboxCircleLine },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', icon: RiCloseCircleLine },
  'pending-review': { label: 'Pending', bg: '#fffbeb', color: '#d97706', icon: RiTimeLine },
  'not-submitted': { label: 'Not Submitted', bg: '#f1f5f9', color: '#64748b', icon: RiTimeLine },
};

const FILE_ICONS = {
  pdf: { icon: RiFilePdfLine, color: '#ef4444' },
  image: { icon: RiFileImageLine, color: '#10b981' },
  default: { icon: RiFileTextLine, color: '#64748b' },
};

const getInitialsBg = (initials = 'XX') => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#059669'];
  return colors[initials.charCodeAt(0) % colors.length];
};

const ProgressCircle = ({ percent = 0 }) => {
  const r = 20;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  const color = percent === 100 ? '#10b981' : percent >= 60 ? '#4f46e5' : '#f59e0b';
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight="700" fill={color}>
        {percent}%
      </text>
    </svg>
  );
};

// ── Step Review Panel (shown when a step is selected) ─────────────────────────
const StepReviewPanel = ({ intern, step, isLoading, onApprove, onReject, onBack }) => {
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [confirming, setConfirming] = useState(null); // 'approve' | 'reject'

  const cfg = STEP_STATUS_CONFIG[step.status] || STEP_STATUS_CONFIG['not-submitted'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '0.875rem', fontWeight: 700, padding: 0 }}
      >
        <RiArrowLeftLine /> Back to {intern.internName}
      </button>

      {/* Step header */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{step.title}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{step.category}</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: cfg.bg, color: cfg.color, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
            <cfg.icon style={{ fontSize: '0.875rem' }} />
            {cfg.label}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{step.description}</p>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', marginTop: '0.5rem' }}>
          Submitted: {fmt(step.submittedAt)}
          {step.required && <span style={{ marginLeft: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Required</span>}
        </div>
      </div>

      {/* Documents */}
      {step.documents?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.875rem', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attached Documents</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {step.documents.map((doc) => {
              const { icon: FileIcon, color } = FILE_ICONS[doc.type] || FILE_ICONS.default;
              return (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-100)' }}>
                  <FileIcon style={{ fontSize: '1.375rem', color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>{doc.size} · {fmt(doc.uploadedAt)}</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} title="Download" style={{ background: 'none', border: 'none', color: 'var(--color-neutral-400)', fontSize: '1.1rem', cursor: 'pointer' }}>
                    <RiDownloadLine />
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Previous review notes */}
      {step.notes && (
        <div style={{ background: '#fffbeb', borderRadius: '0.875rem', padding: '1rem', border: '1px solid #fef3c7' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.375rem' }}>Reviewer Note</div>
          <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>{step.notes}</div>
        </div>
      )}

      {/* Action panel — only for pending-review steps */}
      {step.status === 'pending-review' && (
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem' }}>
          <h4 style={{ margin: '0 0 1rem', fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Your Decision</h4>

          {!confirming ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for the intern…"
                rows={3}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', lineHeight: 1.6, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-neutral-200)')}
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirming('approve')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <RiCheckboxCircleLine /> Approve Step
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(239,68,68,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setConfirming('reject')}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <RiCloseCircleLine /> Reject Step
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.875rem', borderRadius: '0.875rem', background: confirming === 'approve' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${confirming === 'approve' ? '#a7f3d0' : '#fecaca'}` }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: confirming === 'approve' ? '#059669' : '#dc2626', marginBottom: '0.25rem' }}>
                  {confirming === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                  This action will update the step status and notify the intern.
                </div>
              </div>
              {confirming === 'reject' && (
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (required)…"
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid #fecaca', fontSize: '0.875rem', lineHeight: 1.6, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                />
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setConfirming(null)} style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (confirming === 'reject' && !rejectReason.trim()) { alert('Please provide a rejection reason.'); return; }
                    if (confirming === 'approve') onApprove?.(intern.internId, step.id, notes);
                    else onReject?.(intern.internId, step.id, rejectReason || notes);
                  }}
                  disabled={isLoading}
                  style={{ flex: 1, padding: '0.625rem', borderRadius: '0.75rem', border: 'none', background: confirming === 'approve' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {isLoading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
                  Confirm {confirming === 'approve' ? 'Approval' : 'Rejection'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ── Intern Card ───────────────────────────────────────────────────────────────
const InternOnboardingCard = ({ intern, onSelectIntern }) => {
  const pendingCount = intern.steps.filter((s) => s.status === 'pending-review').length;
  const statusColor = intern.overallProgress === 100 ? '#10b981' : intern.overallProgress >= 60 ? '#4f46e5' : '#f59e0b';

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', cursor: 'pointer' }}
      onClick={() => onSelectIntern(intern)}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: getInitialsBg(intern.internInitials), color: '#fff', fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {intern.internInitials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intern.internName}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{intern.department}</div>
        </div>
        <ProgressCircle percent={intern.overallProgress} />
      </div>

      {/* Steps summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {intern.steps.slice(0, 4).map((step) => {
          const cfg = STEP_STATUS_CONFIG[step.status] || STEP_STATUS_CONFIG['not-submitted'];
          return (
            <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.625rem', borderLeft: `3px solid ${cfg.color}` }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '0.5rem' }}>{step.title}</span>
              <span style={{ padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
            </div>
          );
        })}
        {intern.steps.length > 4 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', textAlign: 'center' }}>+{intern.steps.length - 4} more steps</div>
        )}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {pendingCount > 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
            <RiAlertLine /> {pendingCount} awaiting review
          </span>
        ) : (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Start Date: {fmt(intern.startDate)}</span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4f46e5', fontSize: '0.8125rem', fontWeight: 700 }}>
          Review <RiArrowRightSLine />
        </div>
      </div>
    </motion.div>
  );
};

// ── Intern Checklist View ─────────────────────────────────────────────────────
const InternChecklistView = ({ intern, isLoading, onApprove, onReject, onBack }) => {
  const [selectedStep, setSelectedStep] = useState(null);
  const [activeTab, setActiveTab] = useState('checklist');

  if (selectedStep) {
    return (
      <StepReviewPanel
        intern={intern}
        step={selectedStep}
        isLoading={isLoading}
        onApprove={(internId, stepId, notes) => { onApprove(internId, stepId, notes); setSelectedStep(null); }}
        onReject={(internId, stepId, notes) => { onReject(internId, stepId, notes); setSelectedStep(null); }}
        onBack={() => setSelectedStep(null)}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Back */}
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '0.875rem', fontWeight: 700, padding: 0 }}>
        <RiArrowLeftLine /> All Interns
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'linear-gradient(135deg, #f8faff, #eef2ff)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e0e7ff' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: getInitialsBg(intern.internInitials), color: '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {intern.internInitials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{intern.internName}</div>
          <div style={{ fontSize: '0.875rem', color: '#4f46e5', fontWeight: 600 }}>{intern.department}</div>
        </div>
        <ProgressCircle percent={intern.overallProgress} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', background: '#f8fafc', borderRadius: '0.75rem', padding: '0.25rem', border: '1px solid var(--color-neutral-200)' }}>
        {[{ id: 'checklist', label: 'Checklist', icon: RiShieldCheckLine }, { id: 'history', label: 'Audit History', icon: RiHistoryLine }].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.5rem', borderRadius: '0.625rem', border: 'none', background: activeTab === id ? '#fff' : 'transparent', color: activeTab === id ? '#4f46e5' : 'var(--color-neutral-500)', fontWeight: activeTab === id ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer', boxShadow: activeTab === id ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.15s' }}
          >
            <Icon style={{ fontSize: '0.9rem' }} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'checklist' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {intern.steps.map((step) => {
            const cfg = STEP_STATUS_CONFIG[step.status] || STEP_STATUS_CONFIG['not-submitted'];
            const canReview = step.status === 'pending-review';
            return (
              <motion.div
                key={step.id}
                whileHover={canReview ? { x: 4 } : {}}
                style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: '#fff', borderRadius: '0.875rem', border: `1px solid ${canReview ? '#fef3c7' : 'var(--color-neutral-200)'}`, cursor: canReview ? 'pointer' : 'default', transition: 'border-color 0.15s' }}
                onClick={() => canReview && setSelectedStep(step)}
              >
                <cfg.icon style={{ fontSize: '1.25rem', color: cfg.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{step.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{step.category} · {fmt(step.submittedAt)}</div>
                </div>
                <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
                {canReview && <RiArrowRightSLine style={{ color: '#f59e0b', fontSize: '1.1rem', flexShrink: 0 }} />}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {intern.auditLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>No audit history yet</div>
          ) : (
            intern.auditLog.map((log) => (
              <div key={log.id} style={{ padding: '0.875rem', background: '#f8fafc', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-100)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                {log.action === 'approved'
                  ? <RiCheckboxCircleLine style={{ color: '#059669', fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }} />
                  : <RiCloseCircleLine style={{ color: '#dc2626', fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
                    <span style={{ textTransform: 'capitalize' }}>{log.action}</span>: {log.stepTitle}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                    by {log.performedBy} · {fmt(log.timestamp)}
                  </div>
                  {log.reason && <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: '0.25rem', fontStyle: 'italic' }}>"{log.reason}"</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const OnboardingApprovalsView = ({ queue = [], isLoading = false, actionLoading = false, onApprove, onReject }) => {
  const [selectedIntern, setSelectedIntern] = useState(null);

  if (isLoading) return <OnboardingCardSkeleton count={4} />;

  if (selectedIntern) {
    const intern = queue.find((i) => i.internId === selectedIntern.internId) || selectedIntern;
    return (
      <InternChecklistView
        intern={intern}
        isLoading={actionLoading}
        onApprove={(internId, stepId, notes) => onApprove?.(internId, stepId, notes)}
        onReject={(internId, stepId, notes) => onReject?.(internId, stepId, notes)}
        onBack={() => setSelectedIntern(null)}
      />
    );
  }

  if (queue.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <RiShieldCheckLine style={{ fontSize: '3rem', color: 'var(--color-neutral-300)', marginBottom: '1rem' }} />
        <h3 style={{ margin: 0, color: 'var(--color-neutral-500)', fontWeight: 700 }}>All Onboarding Steps Clear</h3>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>No pending onboarding items to review.</p>
      </div>
    );
  }

  const pendingCount = queue.reduce((acc, i) => acc + i.steps.filter((s) => s.status === 'pending-review').length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {pendingCount > 0 && (
        <div style={{ background: '#fffbeb', borderRadius: '0.875rem', padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.625rem', border: '1px solid #fef3c7' }}>
          <RiAlertLine style={{ color: '#d97706', fontSize: '1.1rem', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#92400e' }}>
            {pendingCount} step{pendingCount !== 1 ? 's' : ''} awaiting your review across {queue.filter((i) => i.steps.some((s) => s.status === 'pending-review')).length} intern{queue.filter((i) => i.steps.some((s) => s.status === 'pending-review')).length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {queue.map((intern) => (
          <InternOnboardingCard key={intern.internId} intern={intern} onSelectIntern={setSelectedIntern} />
        ))}
      </div>
    </div>
  );
};

export default OnboardingApprovalsView;
