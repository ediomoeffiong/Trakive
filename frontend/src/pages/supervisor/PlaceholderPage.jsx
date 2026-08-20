/**
 * @file PlaceholderPage.jsx
 * @description Reusable placeholder page for Supervisor module expansion.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RiToolsLine, RiArrowLeftLine } from 'react-icons/ri';
import { ROUTES } from '../../constants';

const SupervisorPlaceholderPage = ({ title = 'Supervisor Module', description = 'This module is scheduled for implementation in upcoming Day releases.' }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        margin: '2rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '1rem',
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.25rem',
        }}
      >
        <RiToolsLine />
      </div>

      <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
        {title}
      </h2>

      <p style={{ margin: '0 0 1.75rem 0', fontSize: '0.9375rem', color: 'var(--color-neutral-500)', maxWidth: '460px', lineHeight: 1.5 }}>
        {description}
      </p>

      <button
        className="btn btn-primary"
        onClick={() => navigate(ROUTES.SUPERVISOR_DASHBOARD)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
      >
        <RiArrowLeftLine />
        Return to Supervisor Dashboard
      </button>
    </motion.div>
  );
};

export default SupervisorPlaceholderPage;
