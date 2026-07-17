/**
 * @file LoadingScreen.jsx
 * @description Full-screen or container-filling loading overlay.
 */

import { motion } from 'framer-motion';
import Spinner from './Spinner';

/**
 * @param {object}  props
 * @param {string}  [props.message='Loading…']
 * @param {boolean} [props.fullScreen=true]
 */
const LoadingScreen = ({ message = 'Loading…', fullScreen = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: fullScreen ? 'fixed' : 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: fullScreen ? '#ffffff' : 'rgba(255,255,255,0.85)',
        zIndex: fullScreen ? 9999 : 10,
        gap: '1rem',
        backdropFilter: fullScreen ? 'none' : 'blur(2px)',
      }}
      role="status"
      aria-label={message}
    >
      <Spinner size="lg" />
      <p style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--color-neutral-500)',
        margin: 0,
      }}>
        {message}
      </p>
    </motion.div>
  );
};

export default LoadingScreen;
