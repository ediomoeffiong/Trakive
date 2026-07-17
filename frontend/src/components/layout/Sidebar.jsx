/**
 * @file Sidebar.jsx
 * @description Collapsible navigation sidebar for Trakive's AppLayout.
 * - Desktop: pinned left, toggles between full (240px) and icon-only (72px)
 * - Mobile (< 1024px): slides in as an overlay from the left
 *
 * State is managed by Zustand (useAppStore) so collapse preference persists.
 */

import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiDashboardLine,
  RiTaskLine,
  RiCheckboxMultipleLine,
  RiStarLine,
  RiBellLine,
  RiUser3Line,
  RiSettings3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLogoutBoxRLine,
} from 'react-icons/ri';
import { ROUTES, APP_NAME } from '../../constants';
import { useSidebarCollapsed, useToggleSidebar, useAppStore } from '../../store';

// ── Navigation Configuration ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Dashboard',     icon: RiDashboardLine,         to: ROUTES.DASHBOARD },
  { label: 'Tasks',         icon: RiTaskLine,              to: ROUTES.TASKS },
  { label: 'Onboarding',    icon: RiCheckboxMultipleLine,  to: ROUTES.ONBOARDING },
  { label: 'Reviews',       icon: RiStarLine,              to: ROUTES.REVIEWS },
  { label: 'Notifications', icon: RiBellLine,             to: ROUTES.NOTIFICATIONS },
  { label: 'Profile',       icon: RiUser3Line,             to: ROUTES.PROFILE },
];

const BOTTOM_NAV = [
  { label: 'Settings', icon: RiSettings3Line, to: ROUTES.SETTINGS },
];

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <div
      style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        padding: collapsed ? '0 1rem' : '0 1.25rem',
        gap: '0.625rem',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Icon mark */}
      <span
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--color-primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z"
            fill="white"
            opacity="0.9"
          />
          <path d="M8 2L14 5.5L8 9L2 5.5L8 2Z" fill="white" />
        </svg>
      </span>

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              fontWeight: 800,
              fontSize: '1.125rem',
              color: 'var(--color-neutral-900)',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {APP_NAME}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function SidebarNavItem({ item, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.DASHBOARD}
      className={({ isActive }) =>
        ['nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')
      }
      title={collapsed ? item.label : undefined}
      style={{ justifyContent: collapsed ? 'center' : undefined }}
    >
      <Icon className="nav-icon" aria-hidden />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}

// ── Section Label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, collapsed }) {
  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-neutral-400)',
            padding: '0 0.875rem',
            marginTop: '0.5rem',
            marginBottom: '0.25rem',
          }}
        >
          {label}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
/**
 * @param {object}   props
 * @param {boolean}  [props.mobileOpen=false]   Controlled by AppLayout on mobile
 * @param {Function} [props.onMobileClose]       Called when overlay is clicked
 */
const Sidebar = ({ mobileOpen = false, onMobileClose }) => {
  const collapsed = useSidebarCollapsed();
  const toggleSidebar = useToggleSidebar();
  const navigate = useNavigate();
  const logout = useAppStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      toast.error('Failed to logout.');
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <aside
        className={[
          'app-sidebar',
          collapsed ? 'collapsed' : '',
          mobileOpen ? 'mobile-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Logo collapsed={collapsed} />

        <div className="divider" style={{ margin: '0' }} />

        {/* Scroll area */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '0.75rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.125rem',
            height: 'calc(100dvh - var(--topbar-height) - 1px - 56px)',
          }}
        >
          <SectionLabel label="Menu" collapsed={collapsed} />

          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="divider" style={{ margin: '0' }} />

        {/* Bottom nav + collapse toggle */}
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <SectionLabel label="Account" collapsed={collapsed} />
          {BOTTOM_NAV.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-danger-600)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'background 0.15s ease, color 0.15s ease',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-danger-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Logout"
          >
            <RiLogoutBoxRLine className="nav-icon" style={{ color: 'var(--color-danger-600)' }} aria-hidden />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', color: 'var(--color-danger-600)' }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              gap: '0.75rem',
              padding: '0.625rem 0.875rem',
              borderRadius: '0.625rem',
              border: 'none',
              background: 'transparent',
              color: 'var(--color-neutral-400)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'background 0.15s ease, color 0.15s ease',
              width: '100%',
              marginTop: '0.25rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-neutral-100)';
              e.currentTarget.style.color = 'var(--color-neutral-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-neutral-400)';
            }}
            className="lg-only"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <RiArrowRightSLine /> : <RiArrowLeftSLine />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden' }}
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
