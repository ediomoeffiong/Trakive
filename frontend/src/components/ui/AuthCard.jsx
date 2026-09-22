/**
 * @file AuthCard.jsx
 * @description Card wrapper for authentication layout pages featuring smooth Framer Motion entry animations and brand accents.
 */

import { motion } from 'framer-motion';

const AuthCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`card auth-card relative overflow-hidden ${className}`}
      style={{
        padding: 'clamp(1.5rem, 4vw, 2.25rem)',
        borderRadius: '1.125rem',
        backgroundColor: 'rgba(255, 255, 255, 0.97)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        width: '100%',
        maxWidth: '100%',
        backdropFilter: 'blur(16px)',
        ...props.style,
      }}
      {...props}
    >
      {/* Top Brand Accent Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00b4d8 0%, #0096c7 50%, #22d3ee 100%)',
        }}
      />
      {children}
    </motion.div>
  );
};

export default AuthCard;

