/**
 * @file HeroSection.jsx
 * @description Landing page hero — tagline, CTA, subtle background accents.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiArrowRightLine, RiShieldCheckLine } from 'react-icons/ri';
import { fadeInUp, staggerContainer, staggerItem } from '../../animations/variants';
import Badge from '../ui/Badge';
import { ROUTES } from '../../constants';

const HeroSection = () => {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        background: '#ffffff',
        padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(4rem, 8vw, 6rem)',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background blobs */}
      <div aria-hidden style={{
        position: 'absolute', top: '-120px', left: '-160px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'var(--color-primary-600)', opacity: 0.05,
        filter: 'blur(80px)', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-100px', right: '-120px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'var(--color-primary-400)', opacity: 0.05,
        filter: 'blur(70px)', pointerEvents: 'none',
      }} />

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{
          position: 'relative',
          maxWidth: '720px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Eyebrow badge */}
        <motion.div variants={staggerItem}>
          <Badge variant="primary" dot id="hero-badge">
            Internship Management, Simplified
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={staggerItem}
          id="hero-headline"
          style={{
            fontSize: 'clamp(2.125rem, 5vw, 3.375rem)',
            fontWeight: 800,
            color: 'var(--color-neutral-900)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: 0,
          }}
        >
          Track Every Step of Your{' '}
          <span style={{ color: 'var(--color-primary-600)' }}>
            Internship Journey
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={staggerItem}
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
            color: 'var(--color-neutral-600)',
            lineHeight: 1.75,
            maxWidth: '580px',
            margin: 0,
          }}
        >
          Trakive gives interns a structured way to manage tasks, track progress,
          and receive performance reviews — while giving organisations complete
          visibility over their internship programmes.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={staggerItem}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link
            to={ROUTES.REGISTER}
            id="hero-get-started-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8125rem 1.625rem',
              borderRadius: '0.75rem',
              background: 'var(--color-primary-600)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-700)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-primary-600)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.25)';
            }}
          >
            Get Started Free
            <RiArrowRightLine aria-hidden />
          </Link>

          <Link
            to={ROUTES.LOGIN}
            id="hero-login-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.8125rem 1.625rem',
              borderRadius: '0.75rem',
              border: '1.5px solid var(--color-neutral-200)',
              background: '#ffffff',
              color: 'var(--color-neutral-700)',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-neutral-400)';
              e.currentTarget.style.background = 'var(--color-neutral-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            Log in
          </Link>
        </motion.div>

        {/* Trust micro-copy */}
        <motion.p
          variants={staggerItem}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: 'var(--color-neutral-400)',
            margin: 0,
          }}
        >
          <RiShieldCheckLine aria-hidden style={{ color: 'var(--color-success-500)' }} />
          Free to use · No credit card required · Set up in minutes
        </motion.p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
