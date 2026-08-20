/**
 * @file DocumentsOverview.jsx
 * @description Intern document management overview.
 * Displays uploaded documents with type icons, status badges, and View/Download/Replace actions.
 */

import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiFileTextLine,
  RiFilePdfLine,
  RiFileImageLine,
  RiFileUserLine,
  RiFileShieldLine,
  RiEyeLine,
  RiDownloadLine,
  RiUploadLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiAlertLine,
} from 'react-icons/ri';
import { InternDocumentsLoader } from './InternSkeletonLoaders';
import InternEmptyState from './InternEmptyStates';

// ── Document Type Icons & Colors ──────────────────────────────────────────────
const DOC_TYPE_CONFIG = {
  CV: { icon: RiFileUserLine, color: '#4f46e5', bg: '#eef2ff' },
  'Offer Letter': { icon: RiFileShieldLine, color: '#059669', bg: '#ecfdf5' },
  'ID Card': { icon: RiFileImageLine, color: '#d97706', bg: '#fffbeb' },
  Certificate: { icon: RiFilePdfLine, color: '#7c3aed', bg: '#faf5ff' },
  Portfolio: { icon: RiFileImageLine, color: '#0891b2', bg: '#ecfeff' },
  Agreement: { icon: RiFileTextLine, color: '#dc2626', bg: '#fef2f2' },
};

const DOC_STATUS_CONFIG = {
  Verified: { icon: RiCheckboxCircleLine, color: '#15803d', bg: '#dcfce7' },
  'Pending Review': { icon: RiTimeLine, color: '#b45309', bg: '#fef3c7' },
  Missing: { icon: RiAlertLine, color: '#b91c1c', bg: '#fee2e2' },
};

const DocumentsOverview = ({ documents = [], isLoading = false }) => {
  if (isLoading) return <InternDocumentsLoader />;

  if (!documents || documents.length === 0) {
    return <InternEmptyState type="no-documents" />;
  }

  const handleView = (doc) => {
    toast.success(`Opening ${doc.name} for preview...`);
  };

  const handleDownload = (doc) => {
    toast.success(`Downloading ${doc.name}...`);
  };

  const handleReplace = (doc) => {
    toast.success(`Opening file upload to replace ${doc.name}...`);
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Documents
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            {documents.length} document{documents.length !== 1 ? 's' : ''} on file
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={() => toast.success('Opening document upload...')}
        >
          <RiUploadLine />
          Upload Document
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <AnimatePresence>
          {documents.map((doc, idx) => {
            const typeConfig = DOC_TYPE_CONFIG[doc.type] || { icon: RiFileTextLine, color: '#64748b', bg: '#f1f5f9' };
            const statusConfig = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG['Pending Review'];
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, delay: idx * 0.04 }}
                whileHover={{ backgroundColor: 'var(--color-neutral-50)' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--color-neutral-200)',
                  transition: 'background-color 0.15s ease',
                  flexWrap: 'wrap',
                }}
              >
                {/* Doc Type Icon */}
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '0.625rem',
                    background: typeConfig.bg,
                    color: typeConfig.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                  }}
                >
                  <TypeIcon />
                </div>

                {/* Doc Info */}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-neutral-900)' }}>
                    {doc.name}
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                      {doc.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>·</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                      {doc.size}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>·</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                      Uploaded {doc.uploadedAt}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <StatusIcon style={{ fontSize: '0.875rem' }} />
                  {doc.status}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-ghost btn-icon"
                    title="View document"
                    onClick={() => handleView(doc)}
                    style={{ fontSize: '1rem', padding: '0.375rem', color: '#4f46e5' }}
                  >
                    <RiEyeLine />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    title="Download document"
                    onClick={() => handleDownload(doc)}
                    style={{ fontSize: '1rem', padding: '0.375rem', color: '#059669' }}
                  >
                    <RiDownloadLine />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    title="Replace document"
                    onClick={() => handleReplace(doc)}
                    style={{ fontSize: '1rem', padding: '0.375rem', color: '#d97706' }}
                  >
                    <RiUploadLine />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentsOverview;
