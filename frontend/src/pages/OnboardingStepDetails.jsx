/**
 * @file OnboardingStepDetails.jsx
 * @description Premium step details page for a single onboarding step.
 *
 * Layout: 2-column grid (instructions + sidebar) on lg, single-column on mobile.
 * Features:
 *  - Back navigation + step-to-step prev/next controls
 *  - Animated hero header with status indicator
 *  - Markdown-like instruction renderer
 *  - Resource cards with hover lift and type-specific icons/colours
 *  - Drag-and-drop file upload zone with live progress bar
 *  - Uploaded document list with per-doc status badges and remove action
 *  - FAQ accordion (using step-local faqs)
 *  - Sidebar: action card (mark complete / set in-progress) + status display
 *  - Supervisor mock portal with approve/reject + rejection notes modal
 *  - Verification history timeline
 *  - Step nav widget (prev / next)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiTimeLine,
  RiCalendarEventLine,
  RiPlayCircleLine,
  RiFileTextLine,
  RiBookOpenLine,
  RiExternalLinkLine,
  RiUploadCloud2Line,
  RiDeleteBin6Line,
  RiShieldCheckFill,
  RiShieldUserLine,
  RiCheckboxCircleFill,
  RiErrorWarningLine,
  RiCloseLine,
  RiCheckLine,
  RiAlertLine,
  RiLoader4Line,
  RiQuestionLine,
  RiArrowDownSLine,
  RiFileDownloadLine,
} from 'react-icons/ri';

import {
  Badge,
  Button,
  ProgressBar,
  Skeleton,
} from '../components/ui';

import { useOnboardingStore } from '../store';
import { ROUTES } from '../constants';

// ─── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  not_started:           { label: 'Not Started',     variant: 'neutral',  Icon: null,                   bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' },
  in_progress:           { label: 'In Progress',     variant: 'primary',  Icon: RiLoader4Line,          bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb' },
  completed:             { label: 'Completed',       variant: 'success',  Icon: RiCheckboxCircleFill,   bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  awaiting_verification: { label: 'Awaiting Review', variant: 'warning',  Icon: RiTimeLine,             bg: '#fffbeb', border: '#fde68a', text: '#d97706' },
  verified:              { label: 'Verified',        variant: 'success',  Icon: RiShieldCheckFill,      bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  rejected:              { label: 'Rejected',        variant: 'danger',   Icon: RiAlertLine,            bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
};

const RESOURCE_TYPE_CONFIG = {
  video: { Icon: RiPlayCircleLine,    accent: '#6366f1', light: '#eef2ff', label: 'Video' },
  pdf:   { Icon: RiFileDownloadLine,  accent: '#ef4444', light: '#fef2f2', label: 'PDF Document' },
  guide: { Icon: RiBookOpenLine,      accent: '#10b981', light: '#ecfdf5', label: 'Guide' },
  link:  { Icon: RiExternalLinkLine,  accent: '#3b82f6', light: '#eff6ff', label: 'External Link' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Minimal markdown-like renderer: renders **bold**, numbered lists, and code blocks */
function InstructionBody({ text }) {
  if (!text) return null;

  // Split into blocks by blank lines
  const blocks = text.split(/\n\n+/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {blocks.map((block, bi) => {
        const trimmed = block.trim();

        // Code block
        if (trimmed.startsWith('```')) {
          const code = trimmed.replace(/^```[^\n]*\n?/, '').replace(/```$/, '');
          return (
            <pre key={bi} style={{
              background: '#0f172a', color: '#e2e8f0',
              borderRadius: '0.625rem', padding: '1rem 1.25rem',
              fontSize: '0.8125rem', lineHeight: 1.7,
              overflowX: 'auto', fontFamily: 'monospace',
              border: '1px solid #1e293b',
            }}>
              <code>{code}</code>
            </pre>
          );
        }

        // Lines in this block
        const lines = trimmed.split('\n');

        return (
          <div key={bi} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {lines.map((line, li) => {
              const isNumbered = /^\d+\.\s/.test(line);
              const isBullet   = /^[-•]\s/.test(line);
              const isHeading  = /^\*\*[^*]+\*\*$/.test(line.trim());

              // Render inline bold
              const renderInline = (txt) => {
                const parts = txt.split(/(\*\*[^*]+\*\*)/g);
                return parts.map((part, pi) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pi} style={{ color: 'var(--color-neutral-800)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
              };

              if (isHeading) {
                return (
                  <h4 key={li} style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: '0.1rem' }}>
                    {line.replace(/^\*\*/, '').replace(/\*\*$/, '')}
                  </h4>
                );
              }

              const content = isNumbered ? line.replace(/^\d+\.\s/, '') : isBullet ? line.replace(/^[-•]\s/, '') : line;

              return (
                <div key={li} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  {isNumbered && (
                    <span style={{
                      minWidth: '1.25rem', height: '1.25rem',
                      background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                      borderRadius: '50%', fontSize: '0.7rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginTop: '0.15rem', flexShrink: 0,
                    }}>
                      {line.match(/^(\d+)/)?.[1]}
                    </span>
                  )}
                  {isBullet && (
                    <span style={{ marginTop: '0.45rem', flexShrink: 0, width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-neutral-400)', display: 'inline-block' }} />
                  )}
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-neutral-600)', lineHeight: 1.7 }}>
                    {renderInline(content)}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(index === 0);
  const question = faq.question ?? faq.q ?? '';
  const answer   = faq.answer   ?? faq.a ?? '';

  return (
    <div style={{
      border: '1px solid var(--color-neutral-200)',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      background: open ? '#fafbff' : '#fff',
      transition: 'background 0.15s ease',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '0.75rem', padding: '0.875rem 1.125rem',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
          <RiQuestionLine style={{ color: 'var(--color-primary-500)', fontSize: '1rem', marginTop: '0.125rem', flexShrink: 0 }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-neutral-800)', lineHeight: 1.5 }}>{question}</span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ flexShrink: 0 }}
        >
          <RiArrowDownSLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.25rem', marginTop: '0.1rem' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 1.125rem 1rem 2.625rem',
              fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.7,
            }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResourceCard({ res }) {
  const cfg = RESOURCE_TYPE_CONFIG[res.type] ?? RESOURCE_TYPE_CONFIG.link;
  const { Icon } = cfg;

  return (
    <a
      href={res.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
        padding: '0.875rem 1rem',
        background: '#fff',
        border: '1.5px solid var(--color-neutral-200)',
        borderRadius: '0.75rem',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cfg.accent + '80';
        e.currentTarget.style.background = cfg.light;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.accent}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '2.25rem', height: '2.25rem',
        background: cfg.light, border: `1.5px solid ${cfg.accent}30`,
        borderRadius: '0.5rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon style={{ color: cfg.accent, fontSize: '1.1rem' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', marginBottom: '0.15rem', lineHeight: 1.4 }}>
          {res.title}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.4 }}>
          {res.description ?? cfg.label}
        </div>
      </div>
      <RiExternalLinkLine style={{ color: 'var(--color-neutral-400)', fontSize: '0.9rem', flexShrink: 0, marginTop: '0.2rem' }} />
    </a>
  );
}

function DocumentRow({ doc, canRemove, onRemove }) {
  const docCfg = {
    verified: { label: 'Verified', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    pending:  { label: 'Pending Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  };
  const cfg = docCfg[doc.status] ?? docCfg.pending;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '0.75rem 1rem',
      background: '#fff',
    }}>
      <div style={{
        width: '2rem', height: '2rem',
        background: '#fef2f2', borderRadius: '0.4rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <RiFileTextLine style={{ color: '#ef4444', fontSize: '1rem' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {doc.name}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', marginTop: '0.1rem' }}>
          {formatBytes(doc.size)} · Uploaded {formatDateTime(doc.uploadedAt)}
        </div>
      </div>
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: '0.7rem', fontWeight: 700,
        color: cfg.color, background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: '0.15rem 0.5rem', borderRadius: '99px',
        whiteSpace: 'nowrap',
      }}>
        {cfg.label}
      </span>
      {canRemove && (
        <button
          onClick={() => onRemove(doc.id)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--color-neutral-400)', padding: '0.25rem',
            borderRadius: '0.375rem', transition: 'all 0.15s ease',
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-neutral-400)'; e.currentTarget.style.background = 'transparent'; }}
          title="Remove document"
        >
          <RiDeleteBin6Line style={{ fontSize: '1rem' }} />
        </button>
      )}
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DetailsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Skeleton width="80px" height="0.875rem" />
        <Skeleton width="12px" height="0.875rem" />
        <Skeleton width="120px" height="0.875rem" />
        <Skeleton width="12px" height="0.875rem" />
        <Skeleton width="200px" height="0.875rem" />
      </div>
      <Skeleton width="100%" height="160px" borderRadius="1rem" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton width="100%" height="240px" borderRadius="1rem" />
          <Skeleton width="100%" height="160px" borderRadius="1rem" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton width="100%" height="160px" borderRadius="1rem" />
          <Skeleton width="100%" height="120px" borderRadius="1rem" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingStepDetails() {
  const { stepId } = useParams();
  const navigate   = useNavigate();
  const {
    steps, loading, error,
    fetchSteps, updateStepStatus,
    uploadDocument, removeDocument,
    triggerSupervisorVerification,
    uploadProgress,
  } = useOnboardingStore();

  const [simulatingReview,  setSimulatingReview]  = useState(false);
  const [showRejectModal,   setShowRejectModal]   = useState(false);
  const [rejectionNotes,    setRejectionNotes]    = useState('');
  const [dragOver,          setDragOver]          = useState(false);
  const [uploadError,       setUploadError]       = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!steps.length) fetchSteps();
  }, [steps.length, fetchSteps]);

  const step = steps.find(s => s.id === stepId);

  // Ordered list for prev/next navigation
  const allStepIds = steps.map(s => s.id);
  const currentIdx = allStepIds.indexOf(stepId);
  const prevStep   = currentIdx > 0 ? steps[currentIdx - 1] : null;
  const nextStep   = currentIdx < steps.length - 1 ? steps[currentIdx + 1] : null;

  // ── Upload logic ───────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    setUploadError('');
    try {
      await uploadDocument(step.id, file);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    }
  }, [uploadDocument, step]);

  const handleFileChange = (e) => {
    handleUpload(e.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files?.[0]);
  };

  // ── Supervisor mock ────────────────────────────────────────────────────────
  const handleSupervisorDecision = async (approve, notes = '') => {
    setSimulatingReview(true);
    setShowRejectModal(false);
    if (step.status !== 'awaiting_verification') {
      await updateStepStatus(step.id, 'awaiting_verification');
    }
    try {
      await triggerSupervisorVerification(step.id, approve, notes);
    } finally {
      setSimulatingReview(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────
  if (loading) return <DetailsSkeleton />;

  if (error || !step) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 1rem', gap: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <h3 style={{ color: 'var(--color-neutral-800)' }}>Step Not Found</h3>
        <p style={{ color: 'var(--color-neutral-500)' }}>{error || "We couldn't find this onboarding step."}</p>
        <Button onClick={() => navigate(ROUTES.ONBOARDING)}>Back to Checklist</Button>
      </div>
    );
  }

  const isDone    = step.status === 'completed' || step.status === 'verified';
  const isLocked  = step.status === 'awaiting_verification';
  const statusCfg = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.not_started;
  const { Icon: StatusIcon } = statusCfg;
  const currentProgress = uploadProgress[step.id];
  const estimatedTime = step.estimatedTime ?? step.duration ?? 0;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(ROUTES.ONBOARDING)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            fontSize: '0.8125rem', color: 'var(--color-neutral-500)',
            fontWeight: 500, padding: '0.25rem 0', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary-600)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-neutral-500)'}
        >
          <RiArrowLeftLine style={{ fontSize: '0.875rem' }} />
          Onboarding Checklist
        </button>
        <span style={{ color: 'var(--color-neutral-300)', fontSize: '0.875rem' }}>/</span>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)', fontWeight: 600, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {step.title}
        </span>
      </nav>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: '#fff',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '1.125rem',
          padding: '1.75rem 2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top accent stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: isDone
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : isLocked
              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
              : 'linear-gradient(90deg, #6366f1, #3b82f6)',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            {/* Category tag */}
            <span style={{
              display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
              color: 'var(--color-primary-600)', background: 'var(--color-primary-50)',
              border: '1px solid var(--color-primary-100)',
              padding: '0.2rem 0.625rem', borderRadius: '99px',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              marginBottom: '0.75rem',
            }}>
              {step.category}
            </span>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.3, marginBottom: '0.75rem' }}>
              {step.title}
            </h2>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              {/* Status chip */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.8rem', fontWeight: 700,
                color: statusCfg.text,
                background: statusCfg.bg,
                border: `1.5px solid ${statusCfg.border}`,
                padding: '0.3rem 0.75rem', borderRadius: '99px',
              }}>
                {StatusIcon && <StatusIcon style={{ fontSize: '0.9rem' }} />}
                {statusCfg.label}
              </div>

              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                <RiTimeLine style={{ fontSize: '0.875rem' }} />
                {estimatedTime} min{estimatedTime !== 1 ? 's' : ''}
              </span>

              {step.dueDate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                  <RiCalendarEventLine style={{ fontSize: '0.875rem' }} />
                  Due {formatDate(step.dueDate)}
                </span>
              )}

              {step.requiresVerification && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: '#4f46e5', background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  padding: '0.25rem 0.625rem', borderRadius: '99px',
                }}>
                  <RiShieldCheckFill style={{ fontSize: '0.8rem' }} />
                  Requires Supervisor Verification
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Body Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: '1.5rem',
        alignItems: 'start',
      }}
        className="step-detail-grid"
      >
        {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Instructions Card */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              background: '#fff',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '1.125rem',
              padding: '1.75rem 2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '1rem', background: 'var(--color-primary-600)', borderRadius: '99px', display: 'inline-block' }} />
              Instructions
            </h3>
            <InstructionBody text={step.instructions} />
          </motion.section>

          {/* Upload Card (only if requiresVerification) */}
          {step.requiresVerification && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              style={{
                background: '#fff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: '1.125rem',
                padding: '1.75rem 2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', gap: '1.25rem',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '4px', height: '1rem', background: '#6366f1', borderRadius: '99px', display: 'inline-block' }} />
                  Document Upload
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.6 }}>
                  Upload your required document to submit this step for supervisor review. Accepted: PDF, DOCX, JPG, PNG — max 5 MB.
                </p>
              </div>

              {/* Error alert */}
              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.75rem 1rem',
                      background: '#fef2f2', border: '1px solid #fecaca',
                      borderRadius: '0.625rem', fontSize: '0.85rem', color: '#dc2626',
                    }}
                  >
                    <RiErrorWarningLine style={{ flexShrink: 0, fontSize: '1rem' }} />
                    <span>{uploadError}</span>
                    <button onClick={() => setUploadError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                      <RiCloseLine />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drop zone */}
              {!isDone && !isLocked && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--color-primary-500)' : 'var(--color-neutral-300)'}`,
                    borderRadius: '0.875rem',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragOver ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
                    transition: 'all 0.15s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload document"
                  onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '3.5rem', height: '3.5rem',
                    background: dragOver ? 'var(--color-primary-100)' : '#fff',
                    border: '1.5px solid var(--color-neutral-200)',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <RiUploadCloud2Line style={{ fontSize: '1.5rem', color: dragOver ? 'var(--color-primary-600)' : 'var(--color-neutral-500)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                      {dragOver ? 'Drop to upload' : 'Click or drag & drop a file here'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>
                      PDF, DOCX, JPG, PNG up to 5 MB
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              <AnimatePresence>
                {currentProgress !== undefined && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: '1rem',
                      background: 'var(--color-neutral-50)',
                      border: '1px solid var(--color-neutral-200)',
                      borderRadius: '0.75rem',
                      display: 'flex', flexDirection: 'column', gap: '0.625rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--color-neutral-600)' }}>Uploading…</span>
                      <span style={{ color: 'var(--color-neutral-900)' }}>{currentProgress}%</span>
                    </div>
                    <ProgressBar value={currentProgress} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Locked message when awaiting or verified */}
              {(isLocked || step.status === 'verified') && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.875rem 1rem',
                  background: isLocked ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${isLocked ? '#fde68a' : '#bbf7d0'}`,
                  borderRadius: '0.75rem',
                  fontSize: '0.85rem',
                  color: isLocked ? '#92400e' : '#166534',
                  fontWeight: 500,
                }}>
                  {isLocked
                    ? <><RiTimeLine style={{ flexShrink: 0 }} /> Your document is submitted and awaiting supervisor review. No further uploads needed.</>
                    : <><RiCheckboxCircleFill style={{ flexShrink: 0 }} /> This step has been verified. Your document has been accepted.</>
                  }
                </div>
              )}

              {/* Uploaded documents list */}
              {step.uploadedDocuments?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                    Uploaded Documents
                  </h4>
                  <div style={{
                    border: '1px solid var(--color-neutral-200)',
                    borderRadius: '0.75rem', overflow: 'hidden',
                    background: '#fff',
                  }}>
                    {step.uploadedDocuments.map((doc, i) => (
                      <div key={doc.id} style={{ borderTop: i > 0 ? '1px solid var(--color-neutral-100)' : 'none' }}>
                        <DocumentRow
                          doc={doc}
                          canRemove={!isDone && !isLocked}
                          onRemove={(docId) => removeDocument(step.id, docId)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {/* Resources */}
          {step.resources?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              style={{
                background: '#fff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: '1.125rem',
                padding: '1.75rem 2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', gap: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span style={{ width: '4px', height: '1rem', background: '#10b981', borderRadius: '99px', display: 'inline-block' }} />
                Supporting Resources
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {step.resources.map(res => <ResourceCard key={res.id} res={res} />)}
              </div>
            </motion.section>
          )}

          {/* FAQs */}
          {step.faqs?.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{
                background: '#fff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: '1.125rem',
                padding: '1.75rem 2rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', gap: '0.875rem',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span style={{ width: '4px', height: '1rem', background: '#f59e0b', borderRadius: '99px', display: 'inline-block' }} />
                Frequently Asked Questions
              </h3>
              {step.faqs.map((faq, i) => <FAQItem key={faq.id ?? i} faq={faq} index={i} />)}
            </motion.section>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '5rem' }}>

          {/* Action Card */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            style={{
              background: '#fff',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '1.125rem',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
            }}
          >
            <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
              Step Actions
            </h4>

            {/* Completed/verified state */}
            {isDone && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '1.25rem', textAlign: 'center',
                background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.875rem', gap: '0.5rem',
              }}>
                <RiCheckboxCircleFill style={{ color: '#16a34a', fontSize: '2rem' }} />
                <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.9rem' }}>
                  {step.status === 'verified' ? 'Verified by Supervisor' : 'Marked Complete'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#16a34a' }}>
                  This step is done. Great work!
                </div>
              </div>
            )}

            {/* Awaiting verification state */}
            {isLocked && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '1.25rem', textAlign: 'center',
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.875rem', gap: '0.5rem',
              }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '3px solid #d97706', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>Awaiting Review</div>
                <div style={{ fontSize: '0.78rem', color: '#a16207' }}>Supervisor will review your document.</div>
              </div>
            )}

            {/* Rejected state */}
            {step.status === 'rejected' && (
              <div style={{
                padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '0.875rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 700, fontSize: '0.875rem' }}>
                  <RiAlertLine /> Submission Rejected
                </div>
                <p style={{ fontSize: '0.78rem', color: '#991b1b', margin: 0 }}>
                  Review the supervisor feedback below, then upload a corrected document.
                </p>
              </div>
            )}

            {/* Action buttons for not-started / in-progress */}
            {!isDone && !isLocked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {!step.requiresVerification && (
                  <Button
                    onClick={() => updateStepStatus(step.id, 'completed')}
                    style={{ width: '100%', justifyContent: 'center' }}
                    leftIcon={<RiCheckLine />}
                  >
                    Mark as Complete
                  </Button>
                )}
                {step.status !== 'in_progress' && !step.requiresVerification && (
                  <Button
                    variant="outline"
                    onClick={() => updateStepStatus(step.id, 'in_progress')}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Start Progress
                  </Button>
                )}
                {step.status === 'in_progress' && !step.requiresVerification && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', textAlign: 'center', margin: 0 }}>
                    In progress — complete all instructions, then mark done.
                  </p>
                )}
                {step.requiresVerification && step.uploadedDocuments?.length === 0 && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', textAlign: 'center', margin: 0 }}>
                    Upload your document above to submit this step for verification.
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Supervisor Mock Portal */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            style={{
              background: 'linear-gradient(145deg, #1e1b4b, #312e81)',
              borderRadius: '1.125rem',
              padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
              boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <RiShieldUserLine style={{ color: '#a5b4fc', fontSize: '1rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#e0e7ff' }}>Supervisor Panel</div>
                <div style={{ fontSize: '0.68rem', color: '#818cf8', marginTop: '0.1rem' }}>Demo — simulates real actions</div>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#a5b4fc', margin: 0, lineHeight: 1.6 }}>
              Simulate a supervisor review to see how the state machine responds in real-time.
            </p>

            {simulatingReview ? (
              <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.08)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 600 }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid #818cf8', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  Reviewing your submission…
                </div>
                <ProgressBar value={100} animated />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => handleSupervisorDecision(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.625rem',
                    background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.625rem', color: '#d1fae5', fontWeight: 700, fontSize: '0.8125rem',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.2)'; e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                >
                  <RiCheckLine style={{ fontSize: '0.875rem' }} />
                  Approve Submission
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.625rem',
                    background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: '0.625rem', color: '#fca5a5', fontWeight: 700, fontSize: '0.8125rem',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                >
                  <RiCloseLine style={{ fontSize: '0.875rem' }} />
                  Reject Submission
                </button>
              </div>
            )}

            {/* Verification history */}
            {step.verificationHistory?.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Verification History</div>
                {step.verificationHistory.map(h => (
                  <div key={h.id} style={{
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '0.625rem', padding: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e0e7ff' }}>{h.reviewer}</span>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700,
                        color: h.status === 'verified' ? '#86efac' : '#fca5a5',
                      }}>
                        {h.status === 'verified' ? '✓ Approved' : '✗ Rejected'}
                      </span>
                    </div>
                    {h.notes && <p style={{ fontSize: '0.78rem', color: '#a5b4fc', margin: 0, lineHeight: 1.6 }}>{h.notes}</p>}
                    <div style={{ fontSize: '0.68rem', color: '#6366f1', marginTop: '0.375rem' }}>{formatDateTime(h.date)}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Step Navigation */}
          {(prevStep || nextStep) && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.16 }}
              style={{
                background: '#fff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: '1.125rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {prevStep && (
                <button
                  onClick={() => navigate(`${ROUTES.ONBOARDING}/${prevStep.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderBottom: nextStep ? '1px solid var(--color-neutral-100)' : 'none',
                    textAlign: 'left', transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-neutral-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <RiArrowLeftLine style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Previous</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginTop: '0.1rem', lineHeight: 1.3 }}>{prevStep.title}</div>
                  </div>
                </button>
              )}
              {nextStep && (
                <button
                  onClick={() => navigate(`${ROUTES.ONBOARDING}/${nextStep.id}`)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left', transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-neutral-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Next</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginTop: '0.1rem', lineHeight: 1.3 }}>{nextStep.title}</div>
                  </div>
                  <RiArrowRightLine style={{ color: 'var(--color-neutral-400)', flexShrink: 0 }} />
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>

    {/* ── Rejection Modal ──────────────────────────────────────────────────── */}
    <AnimatePresence>
      {showRejectModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          }}
          onClick={e => e.target === e.currentTarget && setShowRejectModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            style={{
              background: '#fff',
              borderRadius: '1.125rem',
              maxWidth: '440px', width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowRejectModal(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0.25rem', borderRadius: '50%', color: 'var(--color-neutral-400)',
                display: 'flex', alignItems: 'center',
              }}
            >
              <RiCloseLine style={{ fontSize: '1.25rem' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: '#fef2f2', border: '1.5px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RiAlertLine style={{ color: '#dc2626', fontSize: '1.25rem' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Reject Submission</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: 0, marginTop: '0.2rem' }}>Provide clear feedback so the intern can resubmit.</p>
              </div>
            </div>

            <textarea
              value={rejectionNotes}
              onChange={e => setRejectionNotes(e.target.value)}
              placeholder="e.g., The document is missing the signature on page 3. Please upload the full signed version."
              rows={4}
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1.5px solid var(--color-neutral-200)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-sans)',
                color: 'var(--color-neutral-800)',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.15s ease',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary-400)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-neutral-200)'}
            />

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button
                onClick={() => handleSupervisorDecision(false, rejectionNotes)}
                style={{ background: '#dc2626' }}
              >
                Submit Rejection
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Spinner keyframe */}
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
