/**
 * @file AuthLayout.jsx
 * @description Premium, clean centered layout for all authentication screens (Login, Register, ForgotPassword).
 * Features subtle grid layout, backdrop blur particles, and dynamic layout transitions.
 */

import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_NAME } from '../constants';

const AuthLayout = () => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      fontFamily: 'var(--font-sans)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '2rem 1.5rem',
    }}>
      {/* ── Background Aesthetics ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Grids */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          opacity: 0.85,
        }} />
        {/* Soft glowing ambient lights */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', right: '10%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
      </div>

      {/* ── Top Logo & Title ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 10,
        }}
      >
        <div style={{
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.875rem',
          background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.45)',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
        }}>
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" opacity="0.9" />
            <path d="M8 2L14 5.5L8 9L2 5.5L8 2Z" fill="white" />
          </svg>
        </div>
        <div style={{
          fontSize: '1.375rem',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.03em',
          textShadow: '0 2px 4px rgba(0,0,0,0.15)',
        }}>
          {APP_NAME}
        </div>
      </motion.div>

      {/* ── Central Authentication Card ── */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        margin: '2rem 0',
      }}>
        <Outlet />
      </div>

      {/* ── Bottom Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          fontSize: '0.75rem',
          color: 'var(--color-neutral-500)',
          zIndex: 10,
          textAlign: 'center',
        }}
      >
        &copy; {new Date().getFullYear()} {APP_NAME}. Secure Intern Workspace. All rights reserved.
      </motion.div>
    </div>
  );
};

export default AuthLayout;
