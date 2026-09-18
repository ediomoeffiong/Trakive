/**
 * @file OnboardingApprovalsView.jsx
 * @description Supervisor onboarding approval checklist view for CWG PLC & FifthLab intern onboarding documents.
 * Enables viewing, downloading, approving, rejecting, or requesting resubmission with required comments.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiTimeLine,
  RiFilePdfLine,
  RiDownloadLine,
  RiArrowRightSLine,
  RiArrowLeftLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiLoader4Line,
} from 'react-icons/ri';
import { OnboardingCardSkeleton } from './ReviewSkeletonLoaders';
import api from '../../../services/api';

// ── Status Configurations ────────────────────────────────────────────────────
const STATUS_CONFIG = {
  approved: { label: 'Approved', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', icon: RiCheckboxCircleLine },
  rejected: { label: 'Rejected', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: RiCloseCircleLine },
  resubmission_required: { label: 'Resubmission Required', bg: '#fff7ed', color: '#ea580c', border: '#ffedd5', icon: RiAlertLine },
  pending: { label: 'Pending Review', bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: RiTimeLine },
  'pending-review': { label: 'Pending Review', bg: '#fffbeb', color: '#d97706', border: '#fde68a', icon: RiTimeLine },
  not_submitted: { label: 'Not Submitted', bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', icon: RiTimeLine },
};

const REQUIRED_DOC_TITLES = {
  resume: 'Resume / CV',
  placement_letter: 'Internship / Placement Letter',
  acceptance_letter: 'Acceptance Letter',
};

const DETAIL_TITLES = {
  internship_info: 'Internship Info',
  welcome: 'Welcome',
  company_policies: 'Company Policies',
  it_setup: 'IT Setup',
  team_intro: 'Team Introduction',
  training: 'Training',
};

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB');
};

const getSubmittedDetails = (intern) =>
  Object.entries(intern.onboarding_details || {})
    .filter(([, value]) => value?.status === 'completed' || value?.status === 'submitted' || value?.review_status)
    .map(([key, value]) => ({
      key,
      title: DETAIL_TITLES[key] || key.replace(/_/g, ' '),
      submittedAt: formatDate(value.submitted_at),
      details: value.details || {},
      review_status: value.review_status || 'pending',
      review_notes: value.review_notes || '',
    }));

const getInitialsBg = (initials = 'IN') => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#059669'];
  return colors[(initials.charCodeAt(0) || 0) % colors.length];
};

const getDocumentRecord = (item) => item?.document || (item?.id ? item : null);
const getDocumentId = (item) => getDocumentRecord(item)?.id || null;
const hasSubmittedDocument = (item) => Boolean(getDocumentId(item) && item?.submitted !== false);

// ── Document Review Panel ─────────────────────────────────────────────────────
const DocumentReviewPanel = ({ intern, docItem, actionLoading, onReviewComplete, onBack }) => {
  const [decision, setDecision] = useState(null); // 'approved' | 'rejected' | 'resubmission_required'
  const [notes, setNotes] = useState('');
  const [downloading, setDownloading] = useState(false);

  const doc = getDocumentRecord(docItem);
  const status = docItem.review_status || doc?.review_status || docItem.status || 'pending';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const docTitle = REQUIRED_DOC_TITLES[docItem.category] || docItem.title || 'Onboarding Document';

  const handleConfirmAction = () => {
    if (!decision) return;
    if ((decision === 'rejected' || decision === 'resubmission_required') && !notes.trim()) {
      toast.error('A review comment/reason is REQUIRED when rejecting or requesting resubmission.');
      return;
    }

    onReviewComplete?.(intern.internId || intern.intern_id, getDocumentId(docItem), decision, notes);
  };

  const handleDownload = async () => {
    const documentId = getDocumentId(docItem);
    if (!documentId) {
      toast.error('Document is missing its download ID.');
      return;
    }

    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
      toast.error('Your browser blocked the new tab. Please allow pop-ups for Trakive and try again.');
      return;
    }
    previewWindow.opener = null;
    previewWindow.document.title = 'Opening document...';
    previewWindow.document.body.innerHTML = '<p style="font-family: system-ui, sans-serif; padding: 16px;">Opening document...</p>';

    setDownloading(true);
    try {
      const response = await api.get(`/documents/${documentId}/download`);
      const payload = response?.data?.data || response?.data || {};
      if (!payload.url) throw new Error('No download URL returned.');
      previewWindow.location.href = payload.url;
    } catch (err) {
      previewWindow.close();
      toast.error(err.response?.data?.message || err.message || 'Unable to open document.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#00b4d8', fontSize: '0.875rem', fontWeight: 700, padding: 0 }}
      >
        <RiArrowLeftLine /> Back to {intern.internName}
      </button>

      {/* Document Info Card */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{docTitle}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              Submitted by <strong>{intern.internName}</strong> ({intern.department || 'FifthLab'})
            </p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.75rem', fontWeight: 800 }}>
            <cfg.icon /> {cfg.label}
          </span>
        </div>

        {/* File Details & Download */}
        {doc ? (
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <RiFilePdfLine style={{ fontSize: '1.75rem', color: '#ef4444' }} />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{doc.file_name || `${docTitle}.pdf`}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)' }}>
                  Size: {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB'} · Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-GB') : 'Recently'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-300)',
                background: '#fff', color: 'var(--color-neutral-700)', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none',
                cursor: downloading ? 'not-allowed' : 'pointer',
              }}
            >
              {downloading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : <RiDownloadLine />}
              {downloading ? 'Opening...' : 'Open File'}
            </button>
          </div>
        ) : (
          <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '0.75rem', color: '#dc2626', fontSize: '0.875rem' }}>
            No file uploaded for this document item yet.
          </div>
        )}
      </div>

      {/* Review Decision Form */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Supervisor Review Action</h4>

        <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {[
            { id: 'approved', label: 'Approve', bg: '#ecfdf5', color: '#059669', activeBorder: '#10b981' },
            { id: 'resubmission_required', label: 'Request Resubmission', bg: '#fff7ed', color: '#ea580c', activeBorder: '#f97316' },
            { id: 'rejected', label: 'Reject', bg: '#fef2f2', color: '#dc2626', activeBorder: '#ef4444' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDecision(item.id)}
              style={{
                flex: 1, padding: '0.75rem 0.5rem', borderRadius: '0.75rem',
                border: decision === item.id ? `2px solid ${item.activeBorder}` : '1px solid var(--color-neutral-200)',
                background: decision === item.id ? item.bg : '#fff',
                color: decision === item.id ? item.color : 'var(--color-neutral-700)',
                fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Notes / Reason Textarea */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.4rem' }}>
            Supervisor Comment / Reason {(decision === 'rejected' || decision === 'resubmission_required') && <span style={{ color: '#ef4444' }}>* (Required)</span>}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              decision === 'rejected' || decision === 'resubmission_required'
                ? 'Specify the exact reason or instructions for resubmission…'
                : 'Optional reviewer feedback or notes…'
            }
            rows={3}
            style={{
              width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
              border: `1.5px solid ${(decision === 'rejected' || decision === 'resubmission_required') && !notes.trim() ? '#fca5a5' : 'var(--color-neutral-300)'}`,
              fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onBack}
            style={{ padding: '0.625rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-300)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAction}
            disabled={!decision || actionLoading}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: 'none',
              background: !decision ? 'var(--color-neutral-300)' : decision === 'approved' ? '#059669' : decision === 'resubmission_required' ? '#ea580c' : '#dc2626',
              color: '#fff', fontSize: '0.8125rem', fontWeight: 800, cursor: !decision || actionLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {actionLoading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
            Submit Decision
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const DetailReviewPanel = ({ intern, detailItem, actionLoading, onReviewComplete, onBack }) => {
  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState('');
  const status = detailItem.review_status || 'pending';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const rows = Object.entries(detailItem.details || {}).filter(([, value]) => value !== undefined && value !== null && value !== '');

  const handleConfirmAction = () => {
    if (!decision) return;
    if ((decision === 'rejected' || decision === 'resubmission_required') && !notes.trim()) {
      toast.error('A review comment/reason is REQUIRED when rejecting or requesting changes.');
      return;
    }
    onReviewComplete?.(intern.internId || intern.intern_id, `detail:${detailItem.key}`, decision, notes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <button
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#00b4d8', fontSize: '0.875rem', fontWeight: 700, padding: 0 }}
      >
        <RiArrowLeftLine /> Back to {intern.internName}
      </button>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{detailItem.title}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              Submitted by <strong>{intern.internName}</strong>{detailItem.submittedAt ? ` on ${detailItem.submittedAt}` : ''}
            </p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '9999px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.75rem', fontWeight: 800 }}>
            <cfg.icon /> {cfg.label}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {rows.length > 0 ? rows.map(([label, value]) => (
            <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{label.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                {String(value)}
              </div>
            </div>
          )) : (
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>No submitted fields were included.</div>
          )}
        </div>

        {detailItem.review_notes && (
          <div style={{ marginTop: '1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.75rem', padding: '0.85rem', fontSize: '0.85rem', color: '#9a3412' }}>
            Previous feedback: {detailItem.review_notes}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Supervisor Review Action</h4>
        <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
          {[
            { id: 'approved', label: 'Approve', bg: '#ecfdf5', color: '#059669', activeBorder: '#10b981' },
            { id: 'resubmission_required', label: 'Request Changes', bg: '#fff7ed', color: '#ea580c', activeBorder: '#f97316' },
            { id: 'rejected', label: 'Reject', bg: '#fef2f2', color: '#dc2626', activeBorder: '#ef4444' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDecision(item.id)}
              style={{
                flex: 1, padding: '0.75rem 0.5rem', borderRadius: '0.75rem',
                border: decision === item.id ? `2px solid ${item.activeBorder}` : '1px solid var(--color-neutral-200)',
                background: decision === item.id ? item.bg : '#fff',
                color: decision === item.id ? item.color : 'var(--color-neutral-700)',
                fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={decision === 'rejected' || decision === 'resubmission_required' ? 'Specify what the intern should correct...' : 'Optional reviewer feedback...'}
          rows={3}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-300)', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '1rem' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onBack} style={{ padding: '0.625rem 1rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-300)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleConfirmAction}
            disabled={!decision || actionLoading}
            style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: 'none', background: !decision ? 'var(--color-neutral-300)' : decision === 'approved' ? '#059669' : decision === 'resubmission_required' ? '#ea580c' : '#dc2626', color: '#fff', fontSize: '0.8125rem', fontWeight: 800, cursor: !decision || actionLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {actionLoading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
            Submit Decision
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Intern Card ───────────────────────────────────────────────────────────────
const InternOnboardingCard = ({ intern, onSelectIntern }) => {
  const steps = intern.steps || intern.documents || [];
  const approvedCount = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
  const submittedDetails = getSubmittedDetails(intern);

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
      style={{
        background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)',
        padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)', cursor: 'pointer',
      }}
      onClick={() => onSelectIntern(intern)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: getInitialsBg(intern.internName || 'IN'), color: '#fff', fontSize: '0.9375rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {(intern.internName || 'IN').split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{intern.internName || 'Intern'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)' }}>{intern.department || 'FifthLab'}</div>
          </div>
        </div>

        <span style={{ fontSize: '0.8125rem', fontWeight: 800, padding: '0.2rem 0.65rem', borderRadius: '9999px', background: approvedCount === 3 ? '#ecfdf5' : '#eef2ff', color: approvedCount === 3 ? '#059669' : '#4f46e5' }}>
          {approvedCount}/3 Approved
        </span>
      </div>

      {submittedDetails.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {submittedDetails.slice(0, 4).map((item) => (
            <span
              key={item.key}
              style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}
            >
              {item.title}
            </span>
          ))}
          {submittedDetails.length > 4 && (
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
              +{submittedDetails.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* 3 Required Documents Checklist Statuses */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {[
          { key: 'resume', title: 'Resume / CV' },
          { key: 'placement_letter', title: 'Placement Letter' },
          { key: 'acceptance_letter', title: 'Acceptance Letter' },
        ].map((item) => {
          const doc = steps.find((s) => s.category === item.key) || steps.find((s) => s.title?.toLowerCase().includes(item.key));
          const status = doc ? doc.review_status || doc.status || 'pending' : 'not_submitted';
          const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;

          return (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.5rem', borderLeft: `3px solid ${cfg.color}` }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>{item.title}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: cfg.color, background: cfg.bg, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', color: '#00b4d8', fontSize: '0.8125rem', fontWeight: 800 }}>
        Review Documents <RiArrowRightSLine />
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function OnboardingApprovalsView({ queue = [], isLoading = false, actionLoading = false, onApprove, onReject }) {
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [selectedDocItem, setSelectedDocItem] = useState(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);

  const displayQueue = queue;

  if (isLoading) return <OnboardingCardSkeleton count={3} />;

  if (displayQueue.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <RiShieldCheckLine style={{ fontSize: '3rem', color: '#10b981', marginBottom: '0.75rem' }} />
        <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>No Pending Onboarding Document Reviews</h3>
        <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
          All onboarding documents for assigned interns have been reviewed or no submissions are pending.
        </p>
      </div>
    );
  }

  if (selectedIntern && selectedDocItem) {
    return (
      <DocumentReviewPanel
        intern={selectedIntern}
        docItem={selectedDocItem}
        actionLoading={actionLoading}
        onReviewComplete={(internId, categoryOrDocId, decision, notes) => {
          if (decision === 'approved') onApprove?.(internId, categoryOrDocId, notes);
          else onReject?.(internId, categoryOrDocId, notes, decision);
          setSelectedDocItem(null);
        }}
        onBack={() => setSelectedDocItem(null)}
      />
    );
  }

  if (selectedIntern && selectedDetailItem) {
    return (
      <DetailReviewPanel
        intern={selectedIntern}
        detailItem={selectedDetailItem}
        actionLoading={actionLoading}
        onReviewComplete={(internId, detailId, decision, notes) => {
          if (decision === 'approved') onApprove?.(internId, detailId, notes);
          else onReject?.(internId, detailId, notes, decision);
          setSelectedDetailItem(null);
        }}
        onBack={() => setSelectedDetailItem(null)}
      />
    );
  }

  if (selectedIntern) {
    const steps = selectedIntern.steps || selectedIntern.documents || [];
    const submittedDetails = getSubmittedDetails(selectedIntern);
    const info = selectedIntern.onboarding_info || {};
    return (
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <button
          onClick={() => setSelectedIntern(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#00b4d8', fontSize: '0.875rem', fontWeight: 700, padding: 0 }}
        >
          <RiArrowLeftLine /> Back to All Interns
        </button>

        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{selectedIntern.internName} — Onboarding Documents</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>Select any required document below to review, approve, or request resubmission.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Submitted Onboarding Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              ['Institution', info.institution],
              ['Field of Study', info.field_of_study],
              ['Phone', info.phone],
              ['Start Date', formatDate(info.start_date)],
              ['End Date', formatDate(info.end_date)],
            ].map(([label, value]) => (
              <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{value || 'Not submitted'}</div>
              </div>
            ))}
          </div>
          {submittedDetails.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {submittedDetails.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setSelectedDetailItem(item)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.65rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.65rem', cursor: 'pointer' }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534' }}>{item.title}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: STATUS_CONFIG[item.review_status]?.color || '#15803d' }}>
                    {STATUS_CONFIG[item.review_status]?.label || (item.submittedAt ? `Submitted ${item.submittedAt}` : 'Submitted')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.85rem' }}>
              No non-document onboarding details have been submitted yet.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { category: 'resume', title: 'Resume / CV' },
            { category: 'placement_letter', title: 'Placement Letter' },
            { category: 'acceptance_letter', title: 'Acceptance Letter' },
          ].map((item) => {
            const doc = steps.find((s) => s.category === item.category) || steps.find((s) => s.title?.toLowerCase().includes(item.category));
            const status = doc
              ? (doc.submitted === false ? 'not_submitted' : (doc.review_status || doc.status || 'pending'))
              : 'not_submitted';
            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_submitted;
            const fileName = getDocumentRecord(doc)?.file_name;

            return (
              <div
                key={item.category}
                onClick={() => {
                  if (!hasSubmittedDocument(doc)) {
                    toast.error('Intern has not submitted this document yet.');
                    return;
                  }
                  setSelectedDocItem(doc);
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem 1.25rem', background: '#fff', borderRadius: '0.875rem',
                  border: `1.5px solid ${cfg.border}`, cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', marginTop: '0.15rem' }}>
                    {fileName ? `File: ${fileName}` : 'Awaiting intern upload'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: cfg.color, background: cfg.bg, padding: '0.25rem 0.65rem', borderRadius: '9999px', border: `1px solid ${cfg.border}` }}>
                    {cfg.label}
                  </span>
                  <RiArrowRightSLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.2rem' }} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {displayQueue.map((intern) => (
          <InternOnboardingCard key={intern.internId || intern.intern_id} intern={intern} onSelectIntern={setSelectedIntern} />
        ))}
      </div>
    </div>
  );
}
