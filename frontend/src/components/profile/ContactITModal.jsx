/**
 * @file ContactITModal.jsx
 * @description Modal prompt shown when an intern attempts to edit locked/immutable fields
 * such as Job Title, Department, or Email Address.
 */

import { motion } from 'framer-motion';
import { RiLock2Line, RiInformationLine, RiCloseLine } from 'react-icons/ri';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const ContactITModal = ({ isOpen, onClose, fieldName = 'Job Title' }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25em',
      }}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '1.25em',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '440px',
          padding: '1.75em',
          position: 'relative',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25em',
            right: '1.25em',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
        }}
        >
          <RiCloseLine style={{ fontSize: '1.2rem' }} />
        </button>

        {/* Icon Header */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '1rem',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            marginBottom: '1.25em',
        }}
        >
          <RiLock2Line />
        </div>


        {/* Content */}
        <h3
          style={{
            margin: '0 0 0.5em',
            fontSize: '1.125em',
            fontWeight: 800,
            color: '#0f172a',
        }}
        >
          Field Locked: {fieldName}
        </h3>

        <p
          style={{
            margin: '0 0 1.25em',
            fontSize: '0.875em',
            color: '#475569',
            lineHeight: 1.6,
        }}
        >
          You cannot edit your <strong>{fieldName}</strong> directly. System roles, department assignments, and official email addresses are managed centrally by HR and IT Administration.
        </p>

        {/* Information Callout Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.875em',
            padding: '1rem',
            display: 'flex',
            gap: '0.75em',
            alignItems: 'flex-start',
            marginBottom: '1.5em',
        }}
        >
          <RiInformationLine
            style={{ fontSize: '1.25em', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }}
          />
          <div style={{ fontSize: '0.8125em', color: '#334155', lineHeight: 1.5 }}>
            <strong>How to request a change:</strong>
            <br />
            Please reach out to your IT Administrator or HR Operations team at '{''}
            <span style={{ color: '#2563eb', fontWeight: 600 }}>it-support@trakive.com</span> to submit an official role modification request.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75em', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.625em 1.25em',
              fontWeight: 700,
              fontSize: '0.875em',
              borderRadius: '0.75em',
              background: '#00b4d8',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactITModal;
