/**
 * @file Footer.jsx
 * @description Landing page footer with navigation columns and copyright.
 */

import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

const Footer = () => {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Platform',
      links: [
        { label: 'Features',      href: '#features' },
        { label: 'How It Works',  href: '#how-it-works' },
        { label: 'FAQ',           href: '#faq' },
      ],
    },
    {
      heading: 'Account',
      links: [
        { label: 'Log In',    to: ROUTES.LOGIN },
        { label: 'Register',  to: ROUTES.REGISTER },
      ],
    },
    {
      heading: 'Legal',
      links: [
        { label: 'Privacy Policy',   to: ROUTES.PRIVACY },
        { label: 'Terms of Service', to: ROUTES.TERMS },
        { label: 'Contact',          to: ROUTES.CONTACT },
      ],
    },
  ];

  const linkStyle = {
    fontSize: '0.9rem',
    color: 'var(--color-neutral-500)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
    display: 'block',
  };
  const linkHover = (e) => (e.currentTarget.style.color = 'var(--color-neutral-800)');
  const linkLeave = (e) => (e.currentTarget.style.color = 'var(--color-neutral-500)');

  return (
    <footer
      id="site-footer"
      style={{
        background: '#ffffff',
        borderTop: '1px solid var(--color-neutral-200)',
        padding: '3rem 1.5rem 1.75rem',
      }}
    >
      <div style={{ maxWidth: '1152px', margin: '0 auto' }}>
        {/* Top row: logo + tagline + columns */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'var(--color-primary-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" opacity="0.9" />
                  <path d="M8 2L14 5.5L8 9L2 5.5L8 2Z" fill="white" />
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-neutral-900)', letterSpacing: '-0.02em' }}>
                Trakive
              </span>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--color-neutral-500)',
              lineHeight: 1.65,
              margin: 0,
              maxWidth: '200px',
            }}>
              Making internships better, one step at a time.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-neutral-800)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
                margin: '0 0 1rem',
              }}>
                {col.heading}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        style={linkStyle}
                        onMouseEnter={linkHover}
                        onMouseLeave={linkLeave}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.querySelector(link.href);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={linkStyle}
                        onMouseEnter={linkHover}
                        onMouseLeave={linkLeave}
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-neutral-100)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', margin: 0 }}>
            © {year} Trakive. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', margin: 0 }}>
            Built for the next generation of professionals.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
