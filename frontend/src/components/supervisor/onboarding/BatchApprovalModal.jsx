/**
 * @file BatchApprovalModal.jsx
 * @description Confirmation modal for batch-approving pending onboarding documents.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiCheckDoubleLine,
  RiCloseLine,
  RiFilePdfLine,
  RiLoader4Line,
} from 'react-icons/ri';

export default function BatchApprovalModal({
  isOpen,
  onClose,
  pendingItems = [],
  actionLoading = false,
  onConfirmBatchApprove,
}) {
  const [batchNotes, setBatchNotes] = useState('All documents verified and accepted.');

  if (!isOpen) return null;

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '0.625rem',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <RiCheckDoubleLine />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0f172a' }}>
                Batch Approve Documents
              </h3>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Verify and approve {pendingItems.length} pending document(s) at once
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#94a3b8', cursor: 'pointer' }}
          >
            <RiCloseLine />
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
            The following documents will be marked <strong>Approved</strong> with supervisor verification recorded in the audit trail:
          </p>

          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              background: '#f8fafc',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            {pendingItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  padding: '0.4rem 0.6rem',
                  background: '#ffffff',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <RiFilePdfLine style={{ color: '#ef4444', fontSize: '1rem', flexShrink: 0 }} />
                <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.internName}:</span>
                <span style={{ color: '#475569' }}>{item.title || item.docTitle}</span>
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Supervisor Verification Note:
            </label>
            <textarea
              value={batchNotes}
              onChange={(e) => setBatchNotes(e.target.value)}
              rows={2}
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
        </div>

        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.625rem',
            background: '#f8fafc',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.5625rem 1rem',
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
            onClick={() => {
              onConfirmBatchApprove(pendingItems, batchNotes);
              onClose();
            }}
            disabled={actionLoading}
            style={{
              padding: '0.5625rem 1.25rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 800,
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            {actionLoading ? <RiLoader4Line style={{ animation: 'spin 0.8s linear infinite' }} /> : null}
            Approve All ({pendingItems.length})
          </button>
        </div>
      </motion.div>
    </div>
  );
}
