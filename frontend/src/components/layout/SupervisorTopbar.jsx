/**
 * @file SupervisorTopbar.jsx
 * @description Dedicated top bar header for the Supervisor Portal.
 */

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiMenuLine,
  RiCloseLine,
  RiSearchLine,
  RiSunLine,
  RiMoonLine,
  RiUser3Line,
  RiSettings3Line,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useCurrentUser, useTheme, useAppStore } from '../../store';
import { useProfileStore } from '../../store/useProfileStore';
import { NotificationDrawer } from '../notifications';
import { ROUTES } from '../../constants';
import { formatRole } from '../../utils';

const SUPERVISOR_PAGE_TITLES = {
  [ROUTES.SUPERVISOR_DASHBOARD]:          'Dashboard',
  [ROUTES.SUPERVISOR_INTERNS]:            'Interns',
  [ROUTES.SUPERVISOR_TASKS]:              'Tasks',
  [ROUTES.SUPERVISOR_PROJECTS]:           'Projects',
  [ROUTES.SUPERVISOR_WEEKLY_REVIEW]:      'Weekly',
  [ROUTES.SUPERVISOR_REVIEWS]:            'Reviews',
  [ROUTES.SUPERVISOR_ONBOARDING]:         'Onboarding',
  [ROUTES.SUPERVISOR_REPORTS]:            'Reports',
  [ROUTES.SUPERVISOR_REPORTS_BUILDER]:    'Builder',
  [ROUTES.SUPERVISOR_REPORTS_SAVED]:      'Saved',
  [ROUTES.SUPERVISOR_REPORTS_EXPORT]:     'Export',
  [ROUTES.SUPERVISOR_ANALYTICS_COMPARE]:  'Compare',
  [ROUTES.SUPERVISOR_NOTIFICATIONS]:      'Alerts',
  [ROUTES.SUPERVISOR_PROFILE]:            'Profile',
  [ROUTES.SUPERVISOR_SETTINGS]:           'Settings',
};


const SupervisorTopbar = ({ onMobileMenuToggle, onMobileMenuOpen, mobileOpen = false }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const storedProfile = useProfileStore((s) => s.profile);
  const theme = useTheme();
  const setTheme = useAppStore((s) => s.setTheme);
  const logout = useAppStore((s) => s.logout);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const handleMobileMenu = onMobileMenuToggle ?? onMobileMenuOpen;

  const isInternDetails = pathname.startsWith('/supervisor/interns/');
  const pageTitle = isInternDetails
    ? 'Intern'
    : (SUPERVISOR_PAGE_TITLES[pathname] ?? 'Dashboard');

  // Fallback supervisor user display
  const profile = storedProfile?.id && storedProfile.id === user?.id ? storedProfile : null;
  const supervisorName = profile?.fullName || user?.name || 'Supervisor';
  const supervisorDepartment = profile?.department || user?.department_name || user?.department || 'Department not set';

  return (
    <header
      className="app-topbar"
      role="banner"
      id="supervisor-topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0 1.5rem',
        background: '#fff',
        borderBottom: '1px solid var(--color-neutral-200)',
        height: 'var(--topbar-height)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <button
        className="btn btn-ghost btn-icon lg-hidden"
        onClick={handleMobileMenu}
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
        id="supervisor-mobile-menu-btn"
        style={{ fontSize: '1.25rem', color: 'var(--color-neutral-600)', flexShrink: 0 }}
      >
        {mobileOpen ? <RiCloseLine /> : <RiMenuLine />}
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}
          className="app-topbar-title"
        >
          <h1
            className="app-topbar-heading"
            style={{
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              margin: 0,
            }}
            id="supervisor-page-title"
          >
            {pageTitle}
          </h1>
          <span
            className="topbar-role-chip"
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              border: '1px solid var(--color-primary-200)',
              flexShrink: 0,
            }}
          >
            Supervisor
          </span>
        </motion.div>
      </AnimatePresence>

      <div style={{ flex: 1 }} />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
        id="supervisor-topbar-search"
      >
        <RiSearchLine
          style={{
            position: 'absolute',
            left: '0.75rem',
            color: searchFocused ? 'var(--color-primary-500)' : 'var(--color-neutral-400)',
            fontSize: '1rem',
            transition: 'color 0.15s ease',
            pointerEvents: 'none',
          }}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search interns, tasks, reviews..."
          className="input-field"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search supervisor portal"
          id="supervisor-global-search"
          style={{
            paddingLeft: '2.25rem',
            width: searchFocused ? 'clamp(160px, 24vw, 260px)' : 'clamp(140px, 18vw, 200px)',
            transition: 'width 0.2s ease',
            height: '38px',
            maxWidth: '100%',
          }}
        />
      </div>

      <button
        className="btn btn-ghost btn-icon topbar-theme-toggle"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        id="supervisor-theme-toggle-btn"
        style={{ fontSize: '1.15rem', color: 'var(--color-neutral-500)' }}
      >
        {theme === 'light' ? <RiMoonLine /> : <RiSunLine />}
      </button>

      <NotificationDrawer />

      <div ref={menuRef} style={{ position: 'relative', zIndex: menuOpen ? 80 : 1 }}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '99px',
            cursor: 'pointer',
          }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open supervisor user menu"
          aria-expanded={menuOpen}
          id="supervisor-user-menu-btn"
        >
          <Avatar
            name={supervisorName}
            src={profile?.avatarUrl || user?.avatarUrl || user?.avatar_url || user?.avatar}
            size="sm"
            online
          />

          <div className="lg-only" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '2px' }}>
              {formatRole(profile?.role || user?.role || 'Supervisor')}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', lineHeight: 1.1 }}>
              {supervisorName}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  width: '240px',
                  background: '#fff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 8px 32px rgb(0 0 0 / 0.12)',
                  zIndex: 51,
                  padding: '0.5rem',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-neutral-900)', margin: 0 }}>
                    {supervisorName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                    {supervisorDepartment} • {formatRole(profile?.role || user?.role || 'Supervisor')}
                  </p>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-neutral-200)', margin: '0.5rem 0' }} />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(ROUTES.SUPERVISOR_PROFILE);
                  }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-700)',
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <RiUser3Line />
                  Supervisor Profile
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(ROUTES.SUPERVISOR_SETTINGS);
                  }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-700)',
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <RiSettings3Line />
                  Portal Settings
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--color-neutral-200)', margin: '0.5rem 0' }} />

                <button
                  onClick={async () => {
                    setMenuOpen(false);
                    try {
                      await logout();
                      toast.success('Signed out successfully.');
                      navigate(ROUTES.LOGIN);
                    } catch (err) {
                      toast.error('Failed to logout.');
                    }
                  }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'var(--color-danger-600)',
                    cursor: 'pointer',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <RiLogoutBoxRLine />
                  Sign Out
                </button>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default SupervisorTopbar;
