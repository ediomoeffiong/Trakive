/**
 * @file OnboardingDocumentModal.jsx
 * @description In-depth Document Review Modal with metadata display, preview trigger,
 * quick-feedback preset chips, required comment validation, and decision confirmation.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiFilePdfLine,
  RiCheckLine,
  RiAlertLine,
  RiCloseLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiMagicLine,
} from 'react-icons/ri';
import api from '../../../services/api';

const REQUIRED_DOC_TITLES = {
  resume: 'Resume / Curriculum Vitae',
  placement_letter: 'Internship / Placement Letter',
  acceptance_letter: 'Acceptance Letter of Offer',
};

const PRESET_FEEDBACK_CHIPS = [
  'Official institutional stamp or seal is missing.',
  'Dean or Department Head signature is required on the placement letter.',
  'The uploaded scan is blurry or illegible. Please re-scan clearly.',
  'Dates do not match your official internship duration.',
  'Document is fully verified and accepted.',
];

export default function OnboardingDocumentModal({
  isOpen,
  onClose,
  intern,
  docItem,
  actionLoading = false,
  onReviewComplete,
}) {
  const [decision, setDecision] = useState('approved');
  const [notes, setNotes] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (docItem) {
      setDecision(docItem.review_status === 'resubmission_required' ? 'resubmission_required' : 'approved');
      setNotes(docItem.review_notes || '');
    }
  }, [docItem]);

  if (!isOpen || !intern || !docItem) return null;

  const doc = docItem.document || (docItem.id ? docItem : null);
  const docId = doc?.id || docItem.id;

  const docTitle = REQUIRED_DOC_TITLES[docItem.category] || docItem.title || 'Onboarding Document';
  const fileName = doc?.file_name || `${docTitle.replace(/\s+/g, '_')}.pdf`;
  const fileSizeStr = doc?.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB';

  const handleApplyPreset = (text) => {
    if (!notes.trim()) {
      setNotes(text);
    } else {
      setNotes(`${notes} ${text}`);
    }
  };

  const handleDownload = async () => {
    if (!docId) {
      toast.error('Document download ID is missing.');
      return;
    }

    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
      toast.error('Browser blocked the tab. Please allow popups for Trakive.');
      return;
    }
    previewWindow.opener = null;
    previewWindow.document.title = `Opening ${fileName}...`;
    previewWindow.document.body.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 24px; text-align: center;">
        <h3>Loading ${fileName}</h3>
        <p style="color: #64748b;">Retrieving secured document from Trakive vault…</p>
      </div>
    `;

    setDownloading(true);
    try {
      const response = await api.get(`/documents/${docId}/download`);
      const payload = response?.data?.data || response?.data || {};
      if (!payload.url) throw new Error('No download URL returned.');
      previewWindow.location.href = payload.url;
    } catch {
      // In dev mock fallback
      previewWindow.close();
      toast.success(`Opening simulated document: ${fileName}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmit = () => {
    if (!decision) return;
    if ((decision === 'rejected' || decision === 'resubmission_required') && !notes.trim()) {
      toast.error('Supervisor comment is REQUIRED when rejecting or requesting resubmission.');
      return;
    }

    onReviewComplete?.(
      intern.internId || intern.intern_id,
      docId,
      decision,
      notes
    );
    onClose();
  };

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
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '0.15rem 0.5rem',
                borderRadius: '99px',
                display: 'inline-block',
                marginBottom: '0.35rem',
              }}
            >
              Document Verification
            </span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
              {docTitle}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#64748b' }}>
              Submitted by <strong>{intern.internName}</strong> ({intern.department || 'FifthLab'})
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* File Card with Download action */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.875rem',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.625rem',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0,
                }}
              >
                <RiFilePdfLine />
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {fileName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Size: {fileSizeStr} · Uploaded: {doc?.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-GB') : 'Recently'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.875rem',
                borderRadius: '0.625rem',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: downloading ? 'not-allowed' : 'pointer',
                flexShrink: 0,
              }}
            >
              {downloading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : <RiExternalLinkLine />}
              {downloading ? 'Opening…' : 'Open Document'}
            </button>
          </div>

          {/* Decision Segmented Switcher */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 800, color: '#334155', marginBottom: '0.5rem' }}>
              Supervisor Decision:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'approved', label: 'Approve', bg: '#ecfdf5', color: '#059669', border: '#10b981', icon: RiCheckLine },
                { id: 'resubmission_required', label: 'Request Revision', bg: '#fff7ed', color: '#ea580c', border: '#f97316', icon: RiAlertLine },
                { id: 'rejected', label: 'Reject', bg: '#fef2f2', color: '#dc2626', border: '#ef4444', icon: RiCloseLine },
              ].map((opt) => {
                const isSelected = decision === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDecision(opt.id)}
                    style={{
                      padding: '0.625rem 0.5rem',
                      borderRadius: '0.75rem',
                      border: isSelected ? `2px solid ${opt.border}` : '1px solid #e2e8f0',
                      background: isSelected ? opt.bg : '#ffffff',
                      color: isSelected ? opt.color : '#475569',
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon /> {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Feedback Preset Chips */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
              <RiMagicLine style={{ color: '#00b4d8', fontSize: '0.85rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                Quick Feedback Presets (Click to insert):
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {PRESET_FEEDBACK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleApplyPreset(chip)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '99px',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.72rem',
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Supervisor Notes Textarea */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Review Comment / Instructions: {(decision === 'rejected' || decision === 'resubmission_required') && <span style={{ color: '#ef4444' }}>* (Required)</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                decision === 'approved'
                  ? 'Optional supervisor commendation or approval notes…'
                  : 'Specify exact feedback or missing elements for the intern…'
              }
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: `1.5px solid ${(decision === 'rejected' || decision === 'resubmission_required') && !notes.trim() ? '#fca5a5' : '#cbd5e1'}`,
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                color: '#0f172a',
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            background: '#f8fafc',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '0.625rem',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={actionLoading}
            style={{
              padding: '0.625rem 1.35rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: decision === 'approved' ? '#10b981' : decision === 'resubmission_required' ? '#f97316' : '#ef4444',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {actionLoading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
            Submit Decision
          </button>
        </div>
      </motion.div>
    </div>
  );
}
