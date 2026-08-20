/**
 * @file ReviewFormModal.jsx
 * @description Modal for submitting a supervisor review: rubric scores, feedback,
 * strengths, areas for improvement, recommendation, and decision.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCloseLine,
  RiSaveLine,
  RiSendPlaneLine,
  RiCheckboxCircleLine,
  RiRefreshLine,
  RiCloseCircleLine,
  RiAddLine,
  RiDeleteBinLine,
} from 'react-icons/ri';

// ── Rubric Slider ─────────────────────────────────────────────────────────────
const RubricSlider = ({ label, value, onChange }) => {
  const color = value >= 90 ? '#10b981' : value >= 70 ? '#4f46e5' : value >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>{label}</span>
        <span style={{ fontSize: '1.0625rem', fontWeight: 900, color, minWidth: '38px', textAlign: 'right' }}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: color, cursor: 'pointer', height: '6px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)' }}>0</span>
        <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)' }}>100</span>
      </div>
    </div>
  );
};

// ── Tag Chip Input ────────────────────────────────────────────────────────────
const TagChipInput = ({ label, tags = [], onChange, placeholder, color = '#4f46e5', bg = '#eef2ff' }) => {
  const [input, setInput] = useState('');
  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };
  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', padding: '0.625rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', minHeight: '44px' }}>
        {tags.map((tag) => (
          <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', borderRadius: '9999px', background: bg, color: color, fontSize: '0.8125rem', fontWeight: 600 }}>
            {tag}
            <button onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color, opacity: 0.7, fontSize: '0.875rem', lineHeight: 1, padding: 0 }}><RiCloseLine /></button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          style={{ flex: '1', minWidth: '120px', border: 'none', background: 'none', fontSize: '0.8125rem', color: 'var(--color-neutral-700)', outline: 'none', padding: '0 0.25rem' }}
        />
      </div>
      <button onClick={addTag} disabled={!input.trim()} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', borderRadius: '0.5rem', border: '1.5px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-500)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
        <RiAddLine /> Add
      </button>
    </div>
  );
};

// ── Decision Selector ─────────────────────────────────────────────────────────
const DECISIONS = [
  { value: 'approved', label: 'Approved', icon: RiCheckboxCircleLine, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'needs-revision', label: 'Needs Revision', icon: RiRefreshLine, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  { value: 'rejected', label: 'Rejected', icon: RiCloseCircleLine, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
];

const RECOMMENDATIONS = [
  'Exceeds Expectations',
  'Meets Expectations',
  'Needs Coaching',
  'Unsatisfactory',
];

// ── Main Component ─────────────────────────────────────────────────────────────
const ReviewFormModal = ({
  isOpen = false,
  submission = null,
  draft = {},
  isLoading = false,
  onClose,
  onDraftChange,
  onSaveDraft,
  onSubmit,
}) => {
  const handleSubmit = () => {
    if (!draft.decision) { alert('Please select a decision (Approved / Needs Revision / Rejected).'); return; }
    if (!draft.feedback?.trim()) { alert('Please provide feedback.'); return; }
    onSubmit?.(submission?.id, {
      score: draft.score || 0,
      quality: draft.quality || 0,
      timeliness: draft.timeliness || 0,
      communication: draft.communication || 0,
      technicalDepth: draft.technicalDepth || 0,
      feedback: draft.feedback,
      strengths: draft.strengths || [],
      areasForImprovement: draft.areasForImprovement || [],
      recommendation: draft.recommendation,
      decision: draft.decision,
    });
  };

  const avgScore = Math.round(
    ((draft.quality || 0) + (draft.timeliness || 0) + (draft.communication || 0) + (draft.technicalDepth || 0)) / 4
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(3px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(680px, calc(100vw - 2rem))',
              maxHeight: 'calc(100vh - 4rem)',
              background: '#fff',
              borderRadius: '1.25rem',
              zIndex: 301,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--color-neutral-900)' }}>Write Review</h3>
                {submission && (
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                    {submission.internName} · {submission.taskTitle}
                  </p>
                )}
              </div>
              <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)', fontSize: '1.1rem' }}>
                <RiCloseLine />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* ── Rubric Scores ─────────────────────────────────────────── */}
              <div style={{ background: 'linear-gradient(135deg, #f8faff, #eef2ff)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e0e7ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Evaluation Rubric</h4>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: avgScore >= 90 ? '#059669' : avgScore >= 70 ? '#4f46e5' : '#d97706', lineHeight: 1 }}>{avgScore}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>Avg Score</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <RubricSlider label="Quality of Work" value={draft.quality || 0} onChange={(v) => onDraftChange?.('quality', v)} />
                  <RubricSlider label="Timeliness" value={draft.timeliness || 0} onChange={(v) => onDraftChange?.('timeliness', v)} />
                  <RubricSlider label="Communication" value={draft.communication || 0} onChange={(v) => onDraftChange?.('communication', v)} />
                  <RubricSlider label="Technical Depth" value={draft.technicalDepth || 0} onChange={(v) => onDraftChange?.('technicalDepth', v)} />
                </div>
              </div>

              {/* ── Feedback ──────────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
                  Feedback <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={draft.feedback || ''}
                  onChange={(e) => onDraftChange?.('feedback', e.target.value)}
                  placeholder="Write detailed feedback for the intern. Be specific about what was done well and what needs improvement..."
                  rows={5}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '0.875rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', resize: 'vertical', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
                  onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--color-neutral-200)')}
                />
              </div>

              {/* ── Strengths & Improvements ──────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <TagChipInput
                  label="Strengths"
                  tags={draft.strengths || []}
                  onChange={(tags) => onDraftChange?.('strengths', tags)}
                  placeholder="Add strength…"
                  color="#059669"
                  bg="#ecfdf5"
                />
                <TagChipInput
                  label="Areas for Improvement"
                  tags={draft.areasForImprovement || []}
                  onChange={(tags) => onDraftChange?.('areasForImprovement', tags)}
                  placeholder="Add area…"
                  color="#d97706"
                  bg="#fffbeb"
                />
              </div>

              {/* ── Recommendation ────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>Recommendation</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {RECOMMENDATIONS.map((rec) => (
                    <motion.button
                      key={rec}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onDraftChange?.('recommendation', rec)}
                      style={{
                        padding: '0.5rem 0.875rem',
                        borderRadius: '9999px',
                        border: `1.5px solid ${draft.recommendation === rec ? '#4f46e5' : 'var(--color-neutral-200)'}`,
                        background: draft.recommendation === rec ? '#eef2ff' : '#fff',
                        color: draft.recommendation === rec ? '#4338ca' : 'var(--color-neutral-600)',
                        fontSize: '0.8125rem',
                        fontWeight: draft.recommendation === rec ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {rec}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* ── Decision ──────────────────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
                  Decision <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {DECISIONS.map(({ value, label, icon: Icon, color, bg, border }) => {
                    const isActive = draft.decision === value;
                    return (
                      <motion.button
                        key={value}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onDraftChange?.('decision', value)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.875rem',
                          borderRadius: '0.875rem',
                          border: `2px solid ${isActive ? color : 'var(--color-neutral-200)'}`,
                          background: isActive ? bg : '#fff',
                          color: isActive ? color : 'var(--color-neutral-500)',
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 800 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          boxShadow: isActive ? `0 4px 16px ${color}25` : 'none',
                        }}
                      >
                        <Icon style={{ fontSize: '1.5rem' }} />
                        {label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSaveDraft?.(submission?.id)}
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                <RiSaveLine /> Save Draft
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(79,70,229,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(79,70,229,0.28)' }}
              >
                {isLoading ? (
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <RiSendPlaneLine />
                )}
                Submit Review
              </motion.button>
            </div>
          </motion.div>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewFormModal;
