/**
 * @file SettingsLayout.jsx
 * @description Settings module layout: left sidebar nav (desktop) / mobile tab slider.
 * Renders the active settings section with animated transitions.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine,
  RiUserSettingsLine, RiShieldCheckLine, RiComputerLine,
  RiBellLine, RiPaletteLine, RiShieldUserLine, RiEyeLine,
  RiTranslate2, RiSettings4Line, RiArrowLeftLine,
} from 'react-icons/ri';

// ── Section nav items ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',     label: 'Overview',            icon: RiDashboardLine },
  { id: 'account',       label: 'Account',             icon: RiUserSettingsLine },
  { id: 'security',      label: 'Security',            icon: RiShieldCheckLine },
  { id: 'sessions',      label: 'Sessions & Devices',  icon: RiComputerLine },
  { id: 'notifications', label: 'Notifications',       icon: RiBellLine },
  { id: 'appearance',    label: 'Appearance',          icon: RiPaletteLine },
  { id: 'privacy',       label: 'Privacy',             icon: RiShieldUserLine },
  { id: 'accessibility', label: 'Accessibility',       icon: RiEyeLine },
  { id: 'language',      label: 'Language & Region',   icon: RiTranslate2 },
  { id: 'role',          label: 'Role Preferences',    icon: RiSettings4Line },
];

// ── Section titles ─────────────────────────────────────────────────────────────
const SECTION_TITLES = {
  dashboard:     'Settings',
  account:       'Account Settings',
  security:      'Password & Security',
  sessions:      'Sessions & Devices',
  notifications: 'Notification Preferences',
  appearance:    'Appearance',
  privacy:       'Privacy Settings',
  accessibility: 'Accessibility',
  language:      'Language & Region',
  role:          'Role Preferences',
};

// ── Desktop Sidebar Nav ────────────────────────────────────────────────────────
const DesktopSidebar = ({ active, onSelect }) => (
  <div
    className="card"
    style={{ padding: '0.5rem', position: 'sticky', top: '1.5rem' }}
  >
    {NAV_ITEMS.map((item) => {
      const Icon    = item.icon;
      const isActive = active === item.id;
      return (
        <motion.button
          key={item.id}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(item.id)}
          id={`settings-nav-${item.id}`}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none',
            background: isActive ? 'var(--color-primary-50)' : 'transparent',
            color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-600)',
            fontWeight: isActive ? 700 : 500, fontSize: '0.875rem', cursor: 'pointer',
            textAlign: 'left', marginBottom: '0.125rem',
            transition: 'all 0.15s',
          }}
        >
          <Icon style={{ fontSize: '1.05rem', flexShrink: 0 }} />
          <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
          {isActive && (
            <motion.span
              layoutId="settings-nav-indicator"
              style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: 'var(--color-primary-600)',
              }}
            />
          )}
        </motion.button>
      );
    })}
  </div>
);

// ── Mobile horizontal scroller ─────────────────────────────────────────────────
const MobileTabBar = ({ active, onSelect }) => (
  <div style={{
    display: 'flex', overflowX: 'auto', gap: '0.5rem',
    padding: '0.375rem', scrollbarWidth: 'none',
    background: 'var(--color-neutral-50)', borderRadius: '0.875rem',
    border: '1px solid var(--color-neutral-100)',
  }}>
    {NAV_ITEMS.map((item) => {
      const Icon    = item.icon;
      const isActive = active === item.id;
      return (
        <motion.button
          key={item.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(item.id)}
          id={`settings-tab-${item.id}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0,
            padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
            background: isActive ? 'var(--color-primary-600)' : 'transparent',
            color: isActive ? '#fff' : 'var(--color-neutral-500)',
            fontWeight: 600, fontSize: '0.8125rem',
            transition: 'all 0.2s',
          }}
        >
          <Icon style={{ fontSize: '1rem' }} />
          <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
        </motion.button>
      );
    })}
  </div>
);

// ── Section header / back button ──────────────────────────────────────────────
const SectionHeader = ({ section, onBack }) => {
  if (section === 'dashboard') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onBack('dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.4375rem 0.875rem', borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
          background: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)',
          fontSize: '0.8125rem', fontWeight: 600,
        }}
      >
        <RiArrowLeftLine /> Back
      </motion.button>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, letterSpacing: '-0.02em' }}>
        {SECTION_TITLES[section] || 'Settings'}
      </h1>
    </div>
  );
};

// ── Animation variants ─────────────────────────────────────────────────────────
const panelVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -12 },
};

// ── Main Layout ────────────────────────────────────────────────────────────────
/**
 * @param {object}   props
 * @param {string}   props.activeSection  - current settings section id
 * @param {function} props.onNavigate     - navigate to a section by id
 * @param {React.ReactNode} props.children - the rendered section content
 */
const SettingsLayout = ({ activeSection, onNavigate, children }) => (
  <div>
    {/* Mobile tab bar — visible only on small screens */}
    <div style={{ marginBottom: '1rem' }} className="settings-mobile-tabs">
      <MobileTabBar active={activeSection} onSelect={onNavigate} />
    </div>

    {/* Section back navigation (non-dashboard) */}
    <SectionHeader section={activeSection} onBack={onNavigate} />

    {/* Main grid: sidebar + content */}
    <div className="settings-grid" style={{ marginTop: '1rem' }}>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="settings-desktop-sidebar">
        <DesktopSidebar active={activeSection} onSelect={onNavigate} />
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          variants={panelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>

    {/* Responsive overrides */}
    <style>{`
      .settings-mobile-tabs { display: none; }
      .settings-desktop-sidebar { display: block; }

      @media (max-width: 900px) {
        .settings-mobile-tabs { display: block; }
        .settings-desktop-sidebar { display: none; }
      }
    `}</style>
  </div>
);

export default SettingsLayout;
