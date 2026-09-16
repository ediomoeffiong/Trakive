/**
 * @file Topbar.jsx
 * @description Sticky top navigation bar for Trakive's AppLayout.
 * Displays: hamburger/X (mobile), page title, search, notifications, user avatar, name & role.
 */

import { useState } from 'react';
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
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useCurrentUser, useTheme, useAppStore } from '../../store';
import { useProfileStore } from '../../store/useProfileStore';
import { NotificationDrawer } from '../notifications';
import { ROUTES } from '../../constants';
import { formatRole } from '../../utils';

// ── Route → Page title map ────────────────────────────────────────────────────
const PAGE_TITLES = {
  [ROUTES.DASHBOARD]:        'Dashboard',
  [ROUTES.ANALYTICS]:        'Reports & Analytics Hub',
  [ROUTES.ANALYTICS_COMPARE]:'Comparative Performance Analytics',
  [ROUTES.REPORTS]:          'Reports & Analytics Hub',
  [ROUTES.REPORTS_BUILDER]:  'Custom Report Builder',
  [ROUTES.REPORTS_SAVED]:    'Saved Reports & Templates',
  [ROUTES.REPORTS_EXPORT]:   'Export & Download Center',
  [ROUTES.TASKS]:            'Tasks',
  [ROUTES.TASK_DETAILS]:     'Task Details',
  [ROUTES.ONBOARDING]:       'Onboarding Pathway',
  [ROUTES.REVIEWS]:          'Performance Reviews',
  [ROUTES.NOTIFICATIONS]:    'Notifications',
  [ROUTES.SETTINGS]:         'Settings',
  [ROUTES.PROFILE]:          'My Profile',
};



// ── NotificationBell is now handled by NotificationDrawer (components/notifications)
// ── which uses useNotificationStore for full notification center integration.


const Topbar = ({ onMobileMenuToggle, onMobileMenuOpen, mobileOpen = false }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const storedProfile = useProfileStore((s) => s.profile);
  const theme = useTheme();
  const setTheme = useAppStore((s) => s.setTheme);
  const logout = useAppStore((s) => s.logout);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Support both new toggle handler and legacy open handler
  const handleMobileMenu = onMobileMenuToggle ?? onMobileMenuOpen;

  // Check if pathname matches task detail route regex
  const isTaskDetail = pathname.startsWith('/dashboard/tasks/');
  const pageTitle = isTaskDetail ? 'Task Details' : (PAGE_TITLES[pathname] ?? 'Trakive');
  const profile = storedProfile?.id && storedProfile.id === user?.id ? storedProfile : null;
  const displayName = profile?.fullName || user?.name || 'User';
  const displayRole = profile?.role || user?.role || 'Intern';
  const displayDepartment = profile?.department || user?.department_name || user?.department || 'Department not set';

  return (
    <header className="app-topbar" role="banner" id="app-topbar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', background: '#fff', borderBottom: '1px solid var(--color-neutral-200)', height: 'var(--topbar-height)', sticky: 'top', zIndex: 40 }}>
      {/* Mobile menu toggle — hamburger when closed, X when open */}
      <button
        className="btn btn-ghost btn-icon lg-hidden"
        onClick={handleMobileMenu}
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
        id="mobile-menu-btn"
        style={{ fontSize: '1.25rem', color: 'var(--color-neutral-600)', flexShrink: 0 }}
      >
        {mobileOpen ? <RiCloseLine /> : <RiMenuLine />}
      </button>

      {/* Page title */}
      <AnimatePresence mode="wait">
        <motion.h1
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--color-neutral-900)',
            margin: 0,
            flexShrink: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          id="page-title"
        >
          {pageTitle}
        </motion.h1>
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search bar */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
        id="topbar-search"
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
          placeholder="Search for tasks, resources..."
          className="input-field"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search"
          id="global-search"
          style={{
            paddingLeft: '2.25rem',
            width: searchFocused ? 'clamp(160px, 28vw, 280px)' : 'clamp(140px, 20vw, 210px)',
            transition: 'width 0.2s ease',
            height: '38px',
          }}
        />
      </div>

      {/* Theme toggle */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        id="theme-toggle-btn"
        style={{ fontSize: '1.15rem', color: 'var(--color-neutral-500)' }}
      >
        {theme === 'light' ? <RiMoonLine /> : <RiSunLine />}
      </button>

      {/* Notifications — powered by useNotificationStore */}
      <NotificationDrawer />

      {/* User profile dropdown trigger */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '99px',
            cursor: 'pointer'
          }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open user menu"
          id="user-menu-btn"
        >
          <Avatar
            name={displayName}
            src={profile?.avatarUrl || user?.avatarUrl || user?.avatar_url || user?.avatar}
            size="sm"
            online
          />
          {/* User Role & Name (Desktop only) */}
          <div className="lg-only" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.1, marginBottom: '2px' }}>
              {formatRole(displayRole)}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', lineHeight: 1.1 }}>
              {displayName}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              {/* Click-away overlay */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 50 }}
                onClick={() => setMenuOpen(false)}
                aria-hidden
              />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 0.5rem)',
                  right: 0,
                  width: '220px',
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
                    {displayName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                    {formatRole(displayRole)} • {displayDepartment}
                  </p>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-neutral-200)', margin: '0.5rem 0' }} />

                {/* My Profile option */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(ROUTES.PROFILE);
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
                    gap: '0.5rem'
                  }}
                >
                  <RiUser3Line />
                  My Profile
                </button>

                {/* Settings option */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(ROUTES.SETTINGS);
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
                    gap: '0.5rem'
                  }}
                >
                  <RiSettings3Line />
                  Settings
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--color-neutral-200)', margin: '0.5rem 0' }} />

                {/* Logout option */}
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
                    gap: '0.5rem'
                  }}
                >
                  <RiLogoutBoxRLine />
                  Sign Out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Topbar;
