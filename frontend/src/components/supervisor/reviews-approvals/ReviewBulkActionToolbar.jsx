/**
 * @file ReviewBulkActionToolbar.jsx
 * @description Floating bulk action toolbar for selected submission items.
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine,
  RiDownloadLine,
  RiCloseLine,
} from 'react-icons/ri';

const ACTIONS = [
  { key: 'approve', label: 'Approve All', icon: RiCheckboxCircleLine, color: '#10b981', bg: '#ecfdf5', hoverBg: '#d1fae5' },
  { key: 'request-revision', label: 'Request Revision', icon: RiRefreshLine, color: '#4f46e5', bg: '#eef2ff', hoverBg: '#e0e7ff' },
  { key: 'reject', label: 'Reject All', icon: RiCloseCircleLine, color: '#ef4444', bg: '#fef2f2', hoverBg: '#fee2e2' },
  { key: 'export', label: 'Export', icon: RiDownloadLine, color: '#64748b', bg: '#f1f5f9', hoverBg: '#e2e8f0' },
];

const ReviewBulkActionToolbar = ({ selectedCount = 0, onClear, onAction, isLoading = false }) => (
  <AnimatePresence>
    {selectedCount > 0 && (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid var(--color-neutral-200)',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          minWidth: 'min(540px, calc(100vw - 3rem))',
        }}
      >
        {/* Count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.25rem' }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.625rem',
              minWidth: '22px',
              textAlign: 'center',
            }}
          >
            {selectedCount}
          </span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>
            selected
          </span>
        </div>

        <div style={{ width: '1px', height: '28px', background: 'var(--color-neutral-200)' }} />

        {/* Action Buttons */}
        {ACTIONS.map(({ key, label, icon: Icon, color, bg, hoverBg }) => (
          <motion.button
            key={key}
            disabled={isLoading}
            whileHover={{ scale: 1.04, background: hoverBg }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onAction?.(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: bg,
              color: color,
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease',
            }}
          >
            <Icon style={{ fontSize: '0.9rem' }} />
            {label}
          </motion.button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Dismiss */}
        <motion.button
          whileHover={{ background: '#f1f5f9' }}
          whileTap={{ scale: 0.96 }}
          onClick={onClear}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            border: '1px solid var(--color-neutral-200)',
            background: '#fff',
            color: 'var(--color-neutral-400)',
            cursor: 'pointer',
            fontSize: '1rem',
            flexShrink: 0,
          }}
          title="Clear selection"
        >
          <RiCloseLine />
        </motion.button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ReviewBulkActionToolbar;
