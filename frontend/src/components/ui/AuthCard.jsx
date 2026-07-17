/**
 * @file AuthCard.jsx
 * @description Card wrapper for authentication layout pages featuring smooth Framer Motion entry animations.
 */

import { motion } from 'framer-motion';

const AuthCard = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`card auth-card ${className}`}
      style={{
        padding: 'clamp(1.35rem, 3vw, 2rem)',
        borderRadius: '1rem',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        boxShadow: '0 18px 50px rgb(15 23 42 / 0.08)',
        border: '1px solid var(--color-neutral-200)',
        width: '100%',
        maxWidth: '100%',
        backdropFilter: 'blur(12px)',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AuthCard;
