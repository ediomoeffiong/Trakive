/**
 * @file AuthLayout.jsx
 * @description Premium, clean centered layout for all authentication screens (Login, Register, ForgotPassword).
 * Features Trakive cyan glow accents, dark backdrop, and seamless brand identity.
 */

import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { APP_NAME, ROUTES } from '../constants';

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(ellipse at 50% 0%, #0c1e33 0%, #080f1e 50%, #030712 100%)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      {/* ── Background Aesthetics ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Subtle Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(0, 180, 216, 0.08) 1px, transparent 0)',
            backgroundSize: '32px 32px',
            opacity: 0.8,
          }}
        />

        {/* Brand Cyan Glowing Ambient Lights */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(0, 180, 216, 0.18) 0%, rgba(0, 150, 199, 0.05) 50%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '5%',
            width: '380px',
            height: '380px',
            background: 'radial-gradient(circle, rgba(0, 119, 182, 0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            left: '-5%',
            width: '320px',
            height: '320px',
            background: 'radial-gradient(circle, rgba(0, 180, 216, 0.08) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Top Logo & Title ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ zIndex: 10 }}
      >
        <Link
          to={ROUTES.LANDING}
          title="Go to Trakive Home"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '0.875rem',
              background: 'linear-gradient(135deg, #00b4d8 0%, #0077b6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 180, 216, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.15)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" opacity="0.9" />
              <path d="M8 2L14 5.5L8 9L2 5.5L8 2Z" fill="white" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
            <span
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {APP_NAME}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#67e8f9',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: 'rgba(0, 180, 216, 0.12)',
                padding: '0.15rem 0.6rem',
                borderRadius: '999px',
                border: '1px solid rgba(0, 180, 216, 0.25)',
              }}
            >
              CWG PLC &amp; FifthLab
            </span>
          </div>
        </Link>
      </motion.div>

      {/* ── Central Authentication Card ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
          margin: '1.5rem 0',
        }}
      >
        <Outlet />
      </div>

      {/* ── Bottom Footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          zIndex: 10,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} {APP_NAME} &bull; Internship Management System
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'inline-block',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          Enterprise Single Sign-On &bull; CWG Secure Workspace
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
