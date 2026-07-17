/**
 * @file SuccessMessage.jsx
 * @description Standard animated success message block with customizable actions.
 */

import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';

const SuccessMessage = ({ title, message, children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1.5rem 0.5rem',
      }}
      {...props}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-success-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 16px rgb(34 197 94 / 0.12)',
        }}
      >
        <FiCheckCircle size={32} style={{ color: 'var(--color-success-600)' }} />
      </div>

      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-neutral-900)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-neutral-500)',
          lineHeight: 1.5,
          marginBottom: '1.5rem',
        }}
      >
        {message}
      </p>

      {children && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default SuccessMessage;
