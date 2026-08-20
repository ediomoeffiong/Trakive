/**
 * @file AdminTopbar.jsx
 * @description Dedicated top bar header for the HR Administrator Portal.
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiMenuLine,
  RiSearchLine,
  RiSunLine,
  RiMoonLine,
  RiUser3Line,
  RiSettings3Line,
  RiLogoutBoxRLine,
} from 'react-icons/ri';
import Avatar from '../ui/Avatar';
import { useCurrentUser, useTheme, useAppStore } from '../../store';
import { NotificationDrawer } from '../notifications';
import { ROUTES } from '../../constants';

const ADMIN_PAGE_TITLES = {
  [ROUTES.ADMIN_DASHBOARD]:          'HR Dashboard',
  [ROUTES.ADMIN_INTERNS]:            'Intern Management',
  [ROUTES.ADMIN_SUPERVISORS]:        'Supervisor Management',
  [ROUTES.ADMIN_DEPARTMENTS]:        'Department Management',
  [ROUTES.ADMIN_BATCHES]:            'Internship Batches',
  [ROUTES.ADMIN_ANNOUNCEMENTS]:      'Organization Announcements',
  [ROUTES.ADMIN_USERS]:              'User Management',
  [ROUTES.ADMIN_REPORTS]:            'Reports & Analytics',
  [ROUTES.ADMIN_REPORTS_BUILDER]:    'Custom Report Builder',
  [ROUTES.ADMIN_REPORTS_SAVED]:      'Saved Reports',
  [ROUTES.ADMIN_REPORTS_EXPORT]:     'Export Center',
  [ROUTES.ADMIN_NOTIFICATIONS]:      'Notifications',
  [ROUTES.ADMIN_PROFILE]:            'HR Admin Profile',
  [ROUTES.ADMIN_SETTINGS]:           'Portal Settings',

  // Dept Head
  [ROUTES.DEPARTMENT_HEAD_DASHBOARD]:      'Department Dashboard',
  [ROUTES.DEPARTMENT_HEAD_SUPERVISORS]:    'Supervisor Overview',
  [ROUTES.DEPARTMENT_HEAD_INTERNS]:        'Department Interns',
  [ROUTES.DEPARTMENT_HEAD_TASKS]:          'Task Monitoring',
  [ROUTES.DEPARTMENT_HEAD_REVIEWS]:        'Review Overview',
  [ROUTES.DEPARTMENT_HEAD_ANALYTICS]:      'Department Analytics',
  [ROUTES.DEPARTMENT_HEAD_APPROVALS]:      'Department Approvals',
  [ROUTES.DEPARTMENT_HEAD_ANNOUNCEMENTS]:  'Department Announcements',
  [ROUTES.DEPARTMENT_HEAD_NOTIFICATIONS]:  'Notifications',
  [ROUTES.DEPARTMENT_HEAD_PROFILE]:        'Department Head Profile',
  [ROUTES.DEPARTMENT_HEAD_SETTINGS]:       'Portal Settings',
};

const AdminTopbar = ({ onMobileMenuOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const theme = useTheme();
  const setTheme = useAppStore((s) => s.setTheme);
  const logout = useAppStore((s) => s.logout);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isDeptHead = pathname.startsWith('/department-head');
  const isInternDetails = pathname.startsWith('/admin/interns/');
  const pageTitle = isInternDetails
    ? 'Intern Profile'
    : (ADMIN_PAGE_TITLES[pathname] ?? (isDeptHead ? 'Department Head Portal' : 'HR Admin Portal'));

  const adminName = user?.name ?? (isDeptHead ? 'Dr. Arinola Coker' : 'Funmi Adeyemi');
  const adminRole = user?.role ?? (isDeptHead ? 'Department Head' : 'HR Administrator');

  return (
    <header
      className="app-topbar"
      role="banner"
      id="admin-topbar"
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
        onClick={onMobileMenuOpen}
        aria-label="Open navigation menu"
        id="admin-mobile-menu-btn"
        style={{ fontSize: '1.25rem', color: 'var(--color-neutral-600)' }}
      >
        <RiMenuLine />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <h1
            style={{
              fontSize: '1.0625rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              margin: 0,
            }}
            id="admin-page-title"
          >
            {pageTitle}
          </h1>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: isDeptHead ? '#e0f2fe' : '#e0f2fe',
              color: isDeptHead ? '#0284c7' : '#0369a1',
              border: isDeptHead ? '1px solid #bae6fd' : '1px solid #bae6fd',
            }}
          >
            {isDeptHead ? 'Dept Head' : 'HR Admin'}
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
        id="admin-topbar-search"
      >
        <RiSearchLine
          style={{
            position: 'absolute',
            left: '0.75rem',
            color: searchFocused ? '#0ea5e9' : 'var(--color-neutral-400)',
            fontSize: '1rem',
            transition: 'color 0.15s ease',
            pointerEvents: 'none',
          }}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search interns, supervisors, batches..."
          className="input-field"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search HR admin portal"
          id="admin-global-search"
          style={{
            paddingLeft: '2.25rem',
            width: searchFocused ? '300px' : '240px',
            transition: 'width 0.2s ease',
            height: '38px',
          }}
        />
      </div>

      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        id="admin-theme-toggle-btn"
        style={{ fontSize: '1.15rem', color: 'var(--color-neutral-500)' }}
      >
        {theme === 'light' ? <RiMoonLine /> : <RiSunLine />}
      </button>

      <NotificationDrawer />

      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '99px',
            cursor: 'pointer',
          }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open HR admin user menu"
          id="admin-user-menu-btn"
        >
          <Avatar
            name={adminName}
            src={user?.avatarUrl || user?.avatar}
            size="sm"
            online
          />

          <div className="lg-only" style={{ textAlign: 'left', lineHeight: 1.1 }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
              {adminName}
            </p>
            <p style={{ margin: 0, fontSize: '0.6875rem', fontWeight: 500, color: '#0ea5e9' }}>
              {adminRole}
            </p>
          </div>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
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
                    {adminName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                    {adminRole}
                  </p>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-neutral-200)', margin: '0.5rem 0' }} />

                <button
                  onClick={() => { setMenuOpen(false); navigate(isDeptHead ? ROUTES.DEPARTMENT_HEAD_PROFILE : ROUTES.ADMIN_PROFILE); }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%', textAlign: 'left', justifyContent: 'flex-start',
                    padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                    color: 'var(--color-neutral-700)', cursor: 'pointer',
                    borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  <RiUser3Line />
                  {isDeptHead ? 'My Profile' : 'Admin Profile'}
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate(isDeptHead ? ROUTES.DEPARTMENT_HEAD_SETTINGS : ROUTES.ADMIN_SETTINGS); }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%', textAlign: 'left', justifyContent: 'flex-start',
                    padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                    color: 'var(--color-neutral-700)', cursor: 'pointer',
                    borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
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
                    } catch {
                      toast.error('Failed to logout.');
                    }
                  }}
                  className="btn btn-ghost"
                  style={{
                    width: '100%', textAlign: 'left', justifyContent: 'flex-start',
                    padding: '0.5rem 0.75rem', fontSize: '0.875rem',
                    color: 'var(--color-danger-600)', cursor: 'pointer',
                    borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
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

export default AdminTopbar;
