/**
 * @file CTASection.jsx
 * @description Final call-to-action section with primary background.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';
import { scaleIn } from '../../animations/variants';
import { ROUTES } from '../../constants';

const CTASection = () => {
  return (
    <section
      id="cta"
      style={{
        background: 'var(--color-primary-600)',
        padding: 'clamp(3.5rem, 8vw, 5.5rem) 1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background decoration */}
      <div aria-hidden style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-60px', left: '-60px',
        width: '240px', height: '240px', borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />

      <motion.div
        variants={scaleIn}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: 0,
          lineHeight: 1.2,
        }}>
          Ready to take control of your internship?
        </h2>

        <p style={{
          fontSize: '1.0625rem',
          color: 'rgba(255,255,255,0.82)',
          lineHeight: 1.7,
          maxWidth: '520px',
          margin: 0,
        }}>
          Join Trakive today and experience a structured, transparent, and rewarding internship from start to finish.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to={ROUTES.REGISTER}
            id="cta-register-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.75rem',
              background: '#ffffff',
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Get Started Free
            <RiArrowRightLine aria-hidden />
          </Link>

          <Link
            to={ROUTES.LOGIN}
            id="cta-login-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.75rem',
              border: '1.5px solid rgba(255,255,255,0.4)',
              background: 'transparent',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
          >
            Log In
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
