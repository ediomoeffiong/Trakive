/**
 * @file Topbar.jsx
 * @description Sticky top navigation bar for Trakive's AppLayout.
 * Displays: hamburger (mobile), page title, search, notifications, user avatar, name & role.
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiMenuLine,
  RiBellLine,
  RiSearchLine,
  RiSunLine,
  RiMoonLine,
  RiUser3Line,
  RiSettings3Line,
  RiLogoutBoxRLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useCurrentUser, useTheme, useAppStore, useDashboardStore } from '../../store';
import { ROUTES } from '../../constants';

// ── Route → Page title map ────────────────────────────────────────────────────
const PAGE_TITLES = {
  [ROUTES.DASHBOARD]:     'Dashboard',
  [ROUTES.TASKS]:         'Tasks',
  [ROUTES.TASK_DETAILS]:  'Task Details',
  [ROUTES.ONBOARDING]:    'Onboarding Pathway',
  [ROUTES.REVIEWS]:       'Performance Reviews',
  [ROUTES.NOTIFICATIONS]: 'Notifications',
  [ROUTES.SETTINGS]:      'Settings',
  [ROUTES.PROFILE]:       'My Profile',
};

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const notifications = useDashboardStore((s) => s.notifications);
  const fetchNotifications = useDashboardStore((s) => s.fetchNotifications);
  const markAllRead = useDashboardStore((s) => s.markAllNotificationsRead);
  const markRead = useDashboardStore((s) => s.markNotificationRead);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadNotifications = notifications.filter((n) => n.unread);
  const unreadCount = unreadNotifications.length;

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        id="notification-bell-btn"
        style={{ position: 'relative', fontSize: '1.2rem', color: 'var(--color-neutral-500)' }}
      >
        <RiBellLine />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-danger-500)',
              border: '2px solid #fff',
            }}
            aria-hidden
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Click-away overlay */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 50 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              id="notification-panel"
              role="dialog"
              aria-label="Notifications"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '340px',
                background: '#fff',
                borderRadius: '0.875rem',
                boxShadow: '0 8px 32px rgb(0 0 0 / 0.12)',
                zIndex: 51,
                overflow: 'hidden',
                border: '1px solid var(--color-neutral-200)',
              }}
            >
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-neutral-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <h6 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Notifications</h6>
                {unreadCount > 0 && (
                  <span
                    onClick={markAllRead}
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-primary-600)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </span>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                        navigate(ROUTES.NOTIFICATIONS);
                      }}
                      style={{
                        padding: '0.875rem 1.25rem',
                        borderBottom: '1px solid var(--color-neutral-100)',
                        background: n.unread ? 'var(--color-primary-50)' : '#fff',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-neutral-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = n.unread ? 'var(--color-primary-50)' : '#fff')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-neutral-800)', marginBottom: '0.125rem' }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                            {n.description}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {n.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                style={{
                  padding: '0.75rem',
                  textAlign: 'center',
                  background: 'var(--color-neutral-50)',
                  borderTop: '1px solid var(--color-neutral-100)',
                }}
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate(ROUTES.NOTIFICATIONS);
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', fontSize: '0.8125rem', padding: '0.375rem', justifyContent: 'center' }}
                >
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Topbar ────────────────────────────────────────────────────────────────────
const Topbar = ({ onMobileMenuOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const theme = useTheme();
  const setTheme = useAppStore((s) => s.setTheme);
  const logout = useAppStore((s) => s.logout);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if pathname matches task detail route regex
  const isTaskDetail = pathname.startsWith('/dashboard/tasks/');
  const pageTitle = isTaskDetail ? 'Task Details' : (PAGE_TITLES[pathname] ?? 'Trakive');

  return (
    <header className="app-topbar" role="banner" id="app-topbar" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem', background: '#fff', borderBottom: '1px solid var(--color-neutral-200)', height: 'var(--topbar-height)', sticky: 'top', zIndex: 40 }}>
      {/* Mobile menu toggle */}
      <button
        className="btn btn-ghost btn-icon lg-hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open navigation menu"
        id="mobile-menu-btn"
        style={{ fontSize: '1.25rem', color: 'var(--color-neutral-600)' }}
      >
        <RiMenuLine />
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
            flexShrink: 0,
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
            width: searchFocused ? '280px' : '210px',
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

      {/* Notifications */}
      <NotificationBell />

      {/* User profile dropdown trigger */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '99px',
            cursor: 'pointer'
          }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open user menu"
          id="user-menu-btn"
        >
          <Avatar
            name={user?.name ?? 'Demo User'}
            src={user?.avatarUrl || user?.avatar}
            size="sm"
            online
          />
          {/* User Name & Role (Desktop only) */}
          <div className="lg-only" style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              {user?.name ?? 'Demo User'}
            </p>
            <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-neutral-400)' }}>
              {user?.role ?? 'Intern'}
            </p>
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
                    {user?.name ?? 'Demo User'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                    {user?.role ?? 'Intern'} • {user?.department ?? 'Engineering'}
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
