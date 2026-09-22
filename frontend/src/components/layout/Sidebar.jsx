/**
 * @file Sidebar.jsx
 * @description Collapsible navigation sidebar for Trakive's AppLayout.
 * - Desktop: pinned left, toggles between full (240px) and icon-only (72px)
 * - Mobile (< 1024px): slides in as an overlay from the left
 *
/**
 * @file Sidebar.jsx
 * @description Collapsible navigation sidebar for Trakive's AppLayout.
 * - Desktop: pinned left, toggles between full (240px) and icon-only (72px)
 * - Mobile (< 1024px): slides in as an overlay from the left
 *
 * State is managed by Zustand (useAppStore) so collapse preference persists.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiDashboardLine,
  RiTaskLine,
  RiCheckboxMultipleLine,
  RiStarLine,
  RiSettings3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLogoutBoxRLine,
  RiFolderLine,
  RiCalendarCheckLine,
} from 'react-icons/ri';
import { useMemo, useEffect } from 'react';
import { ROUTES, APP_NAME } from '../../constants';
import { useSidebarCollapsed, useToggleSidebar, useAppStore, useOnboardingStatus } from '../../store';

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
function SidebarNavItem({ item, collapsed, onMobileClose }) {
  const Icon = item.icon;
  const isDanger = item.badgeVariant === 'danger';
  const isWarning = item.badgeVariant === 'warning';

  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.DASHBOARD}
      className={({ isActive }) =>
        ['nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')
      }
      title={collapsed ? (item.badge ? `${item.label} (${item.badge})` : item.label) : undefined}
      style={{ justifyContent: collapsed ? 'center' : undefined, position: 'relative' }}
      onClick={onMobileClose}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon className="nav-icon" aria-hidden />
        {collapsed && item.badge && (
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6',
              boxShadow: '0 0 0 2px var(--color-surface, #ffffff)',
            }}
            aria-label={item.badge}
          />
        )}
      </div>
      <AnimatePresence>
        {!collapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {item.label}
            </motion.span>
            {item.badge && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.125rem 0.45rem',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                  marginLeft: '0.375rem',
                  flexShrink: 0,
                  background: isDanger ? '#fee2e2' : isWarning ? '#fef3c7' : 'var(--color-neutral-100)',
                  color: isDanger ? '#b91c1c' : isWarning ? '#b45309' : 'var(--color-neutral-700)',
                  border: isDanger ? '1px solid #fecaca' : isWarning ? '1px solid #fde68a' : '1px solid var(--color-neutral-200)',
                }}
              >
                {item.badge}
              </motion.span>
            )}
          </div>
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
  const user = useAppStore((s) => s.user);
  const { shouldShowOnboarding, badgeText, badgeVariant, fetchStatus } = useOnboardingStatus();

  useEffect(() => {
    if (user?.role === 'Intern') {
      fetchStatus();
    }
  }, [fetchStatus, user?.role]);

  const navItems = useMemo(() => {
    const items = [
      { label: 'Dashboard',  icon: RiDashboardLine,     to: ROUTES.DASHBOARD },
      { label: 'Attendance', icon: RiCalendarCheckLine, to: ROUTES.ATTENDANCE },
      { label: 'Tasks',      icon: RiTaskLine,          to: ROUTES.TASKS },
      { label: 'Projects',   icon: RiFolderLine,        to: ROUTES.PROJECTS },
    ];

    if (shouldShowOnboarding) {
      items.push({
        label: 'Onboarding',
        icon: RiCheckboxMultipleLine,
        to: ROUTES.ONBOARDING,
        badge: badgeText,
        badgeVariant,
      });
    }

    items.push({
      label: 'Reviews',
      icon: RiStarLine,
      to: ROUTES.REVIEWS,
    });

    return items;
  }, [shouldShowOnboarding, badgeText, badgeVariant]);

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

          {navItems.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} onMobileClose={onMobileClose} />
          ))}

        </nav>

        <div className="divider" style={{ margin: '0' }} />

        {/* Bottom nav + collapse toggle */}
        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <SectionLabel label="Account" collapsed={collapsed} />
          {BOTTOM_NAV.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} onMobileClose={onMobileClose} />
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
