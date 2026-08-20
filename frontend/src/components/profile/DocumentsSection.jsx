/**
 * @file DocumentsSection.jsx
 * @description Personal documents section with upload, replace, remove, and mock download.
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useProfileStore } from '../../store/useProfileStore';
import { DOCUMENT_TYPES } from '../../data/documents';
import ProfileEmptyState from './ProfileEmptyState';
import { DocumentsSkeleton } from './ProfileSkeletons';

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (str) => {
  if (!str) return '—';
  try {
    return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return str;
  }
};

const StatusBadge = ({ status, color }) => (
  <span
    style={{
      fontSize: '0.73rem',
      fontWeight: 700,
      padding: '0.2rem 0.625rem',
      borderRadius: 99,
      background: `${color}18`,
      color,
    }}
  >
    {status}
  </span>
);

// ── Upload Modal ──────────────────────────────────────────────────────────────

const UploadDocModal = ({ onClose }) => {
  const { uploadDocument, uploadingDocument, documentProgress } = useProfileStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be 10 MB or less.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadDocument(selectedFile, docType);
      toast.success('Document uploaded!');
      onClose();
    } catch {
      toast.error('Upload failed. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    background: '#fff',
    outline: 'none',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', padding: '1.75rem', width: '100%', maxWidth: 460, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Upload Document</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginTop: 2 }}>Max 10 MB · PDF, JPG, PNG</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Document type selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="doc-type-select" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
            Document Type
          </label>
          <select id="doc-type-select" style={inputStyle} value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop zone for document upload"
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--color-primary-400)' : 'var(--color-neutral-300)'}`,
            borderRadius: '0.875rem',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
            transition: 'all 0.2s ease',
            marginBottom: '0.75rem',
          }}
        >
          {selectedFile ? (
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{selectedFile.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{formatBytes(selectedFile.size)}</p>
              <button
                style={{ fontSize: '0.75rem', color: 'var(--color-primary-600)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.25rem' }}
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              >
                Change file
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>Drag & drop your document here</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', marginTop: 2 }}>or click to browse files</p>
            </>
          )}
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Upload progress */}
        <AnimatePresence>
          {uploadingDocument && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>Uploading…</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>{documentProgress}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${documentProgress}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))', borderRadius: 99 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose} disabled={uploadingDocument}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleUpload} disabled={!selectedFile || uploadingDocument} id="upload-doc-confirm-btn">
            {uploadingDocument ? `Uploading ${documentProgress}%...` : 'Upload'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Document Row ──────────────────────────────────────────────────────────────

const DocumentRow = ({ doc, onRemove, onDownload }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.25 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      padding: '0.875rem 1rem',
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-neutral-200)',
      borderRadius: '0.75rem',
    }}
  >
    {/* Icon */}
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: '0.625rem',
        background: '#f0f9ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        flexShrink: 0,
      }}
    >
      DOC
    </div>

    {/* Info */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {doc.displayName}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{doc.name}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>·</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{formatBytes(doc.size)}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>·</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{formatDate(doc.uploadedAt)}</span>
      </div>
    </div>

    <StatusBadge status={doc.status} color={doc.statusColor} />

    {/* Action buttons */}
    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
      <button
        className="btn btn-ghost btn-icon"
        style={{ fontSize: '0.85rem', padding: '0.375rem' }}
        onClick={() => onDownload(doc)}
        aria-label={`Download ${doc.displayName}`}
        title="Download"
      >
        Download
      </button>
      <button
        className="btn btn-ghost btn-icon"
        style={{ fontSize: '0.85rem', padding: '0.375rem', color: 'var(--color-danger-500)' }}
        onClick={() => onRemove(doc.id)}
        aria-label={`Remove ${doc.displayName}`}
        title="Remove"
      >
        Remove
      </button>
    </div>
  </motion.div>
);

// ── Main Section ──────────────────────────────────────────────────────────────

const DocumentsSection = () => {
  const { documents, removeDocument, loadingDocuments, uploadDocOpen, setUploadDocOpen } = useProfileStore();
  const [downloading, setDownloading] = useState(null);

  const handleRemove = async (docId) => {
    try {
      await removeDocument(docId);
      toast.success('Document removed.');
    } catch {
      toast.error('Failed to remove document.');
    }
  };

  const handleDownload = async (doc) => {
    setDownloading(doc.id);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success(`Downloading "${doc.name}"…`);
    } finally {
      setDownloading(null);
    }
  };

  if (loadingDocuments) return (
    <div className="card p-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ width: 200, height: '1.25rem', background: 'var(--color-neutral-100)', borderRadius: '0.5rem' }} />
        <div style={{ width: 100, height: 32, background: 'var(--color-neutral-100)', borderRadius: '0.625rem' }} />
      </div>
      <DocumentsSkeleton />
    </div>
  );

  return (
    <>
      <div className="card p-6">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Documents</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                {documents.length} document{documents.length !== 1 ? 's' : ''} stored
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setUploadDocOpen(true)}
            id="upload-doc-btn"
          >
            Upload
          </button>
        </div>

        {/* Document list */}
        {documents.length === 0 ? (
          <ProfileEmptyState
            icon=""
            title="No documents uploaded"
            description="Upload your CV, ID card, offer letter, and training certificates to keep them in one place."
            actionLabel="Upload document"
            onAction={() => setUploadDocOpen(true)}
            compact
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <AnimatePresence>
              {documents.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onRemove={handleRemove}
                  onDownload={handleDownload}
                  downloading={downloading === doc.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {uploadDocOpen && <UploadDocModal onClose={() => setUploadDocOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default DocumentsSection;
