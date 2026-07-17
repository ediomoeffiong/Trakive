/**
 * @file Navbar.jsx
 * @description Responsive navigation bar for the Trakive landing page.
 * Desktop: Logo + nav links + CTA buttons.
 * Mobile: Hamburger + animated slide-down menu.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';
import { navLinks } from '../../data/navigation';
import { ROUTES } from '../../constants';

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link
      to={ROUTES.LANDING}
      id="navbar-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--color-primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" opacity="0.9" />
          <path d="M8 2L14 5.5L8 9L2 5.5L8 2Z" fill="white" />
        </svg>
      </div>
      <span style={{
        fontWeight: 800,
        fontSize: '1.125rem',
        color: 'var(--color-neutral-900)',
        letterSpacing: '-0.02em',
      }}>
        Trakive
      </span>
    </Link>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleHashClick = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      id="site-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: scrolled ? '1px solid var(--color-neutral-200)' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* ── Desktop bar ─────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1152px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
      }}>
        <Logo />

        {/* Desktop nav links */}
        <nav
          aria-label="Primary navigation"
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); handleHashClick(link.href); }}
              style={{
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: 'var(--color-neutral-600)',
                textDecoration: 'none',
                transition: 'color 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-neutral-900)'; e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-neutral-600)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA buttons */}
        <div
          className="desktop-cta"
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}
        >
          <Link
            to={ROUTES.LOGIN}
            id="navbar-login-btn"
            style={{
              padding: '0.5rem 1.125rem',
              borderRadius: '0.625rem',
              border: '1.5px solid var(--color-neutral-200)',
              background: 'transparent',
              color: 'var(--color-neutral-700)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-neutral-400)'; e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-neutral-200)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Log in
          </Link>
          <Link
            to={ROUTES.REGISTER}
            id="navbar-register-btn"
            style={{
              padding: '0.5rem 1.125rem',
              borderRadius: '0.625rem',
              background: 'var(--color-primary-600)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-primary-700)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-primary-600)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          className="mobile-hamburger"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            color: 'var(--color-neutral-700)',
            fontSize: '1.375rem',
          }}
        >
          {mobileOpen ? <RiCloseLine /> : <RiMenuLine />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              overflow: 'hidden',
              background: '#ffffff',
              borderTop: '1px solid var(--color-neutral-100)',
            }}
          >
            <nav
              aria-label="Mobile navigation"
              style={{ padding: '0.75rem 1.5rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleHashClick(link.href); }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.625rem',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: 'var(--color-neutral-700)',
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-neutral-50)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {link.label}
                </a>
              ))}

              <div style={{ height: '1px', background: 'var(--color-neutral-100)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <Link
                  to={ROUTES.LOGIN}
                  id="mobile-login-btn"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.625rem',
                    border: '1.5px solid var(--color-neutral-200)',
                    color: 'var(--color-neutral-700)',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'block',
                  }}
                >
                  Log in
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  id="mobile-register-btn"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.625rem',
                    background: 'var(--color-primary-600)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    display: 'block',
                  }}
                >
                  Get Started Free
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive CSS injected via style tag */}
      <style>{`
        @media (max-width: 767px) {
          .desktop-nav  { display: none !important; }
          .desktop-cta  { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .mobile-hamburger { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
