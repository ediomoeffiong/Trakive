/**
 * @file ExportProgressModal.jsx
 * @description Modal dialog visualizing simulated export generation progress.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { RiFileDownloadLine, RiCheckboxCircleLine } from 'react-icons/ri';

export const ExportProgressModal = ({ isOpen, progress = 0, format = 'PDF', fileName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '1.25rem',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            zIndex: 111,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: progress === 100 ? '#ecfdf5' : 'var(--color-primary-50)',
              color: progress === 100 ? '#10b981' : 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            {progress === 100 ? <RiCheckboxCircleLine /> : <RiFileDownloadLine className="animate-bounce" />}
          </div>


          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {progress === 100 ? 'Export Ready!' : `Generating ${format} Report...`}
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            {fileName || `Analytics_Report_${format}.file`}
          </p>

          {/* Progress Bar Container */}
          <div style={{ width: '100%', backgroundColor: 'var(--color-neutral-100)', height: '10px', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
              style={{
                height: '100%',
                backgroundColor: progress === 100 ? '#10b981' : 'var(--color-primary-600)',
                borderRadius: '99px',
              }}
            />
          </div>

          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
            {progress}% Completed
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
