/**
 * @file AdminSidebar.jsx
 * @description Dedicated navigation sidebar for the HR Administrator Portal.
 * Includes routes: Dashboard, Interns, Supervisors, Departments,
 * Batches, Announcements, User Management, Reports & Analytics, Settings.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiDashboardLine,
  RiGroupLine,
  RiShieldUserLine,
  RiBuildingLine,
  RiFoldersLine,
  RiMegaphoneLine,
  RiUserSettingsLine,
  RiBarChartBoxLine,
  RiSettings3Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLogoutBoxRLine,
  RiAdminLine,
} from 'react-icons/ri';
import { ROUTES, APP_NAME } from '../../constants';
import { useSidebarCollapsed, useToggleSidebar, useAppStore } from '../../store';

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard',        icon: RiDashboardLine,     to: ROUTES.ADMIN_DASHBOARD },
  { label: 'Interns',          icon: RiGroupLine,         to: ROUTES.ADMIN_INTERNS },
  { label: 'Supervisors',      icon: RiShieldUserLine,    to: ROUTES.ADMIN_SUPERVISORS },
  { label: 'Departments',      icon: RiBuildingLine,      to: ROUTES.ADMIN_DEPARTMENTS },
  { label: 'Batches',          icon: RiFoldersLine,        to: ROUTES.ADMIN_BATCHES },
  { label: 'Announcements',    icon: RiMegaphoneLine,     to: ROUTES.ADMIN_ANNOUNCEMENTS },
  { label: 'User Management',  icon: RiUserSettingsLine,  to: ROUTES.ADMIN_USERS },
  { label: 'Reports',          icon: RiBarChartBoxLine,   to: ROUTES.ADMIN_REPORTS },
];

const BOTTOM_NAV = [
  { label: 'Settings', icon: RiSettings3Line, to: ROUTES.ADMIN_SETTINGS },
];

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
      <span
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)',
        }}
        aria-hidden
      >
        <RiAdminLine style={{ color: '#ffffff', fontSize: '1.125rem' }} />
      </span>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: '1.05rem',
                color: 'var(--color-neutral-900)',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {APP_NAME}
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#0ea5e9',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              HR Admin Portal
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarNavItem({ item, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.ADMIN_DASHBOARD}
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

const AdminSidebar = ({ mobileOpen = false, onMobileClose }) => {
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

      <aside
        className={[
          'app-sidebar',
          collapsed ? 'collapsed' : '',
          mobileOpen ? 'mobile-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="HR Admin navigation"
      >
        <Logo collapsed={collapsed} />

        <div className="divider" style={{ margin: '0' }} />

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
          <SectionLabel label="HR Admin Menu" collapsed={collapsed} />

          {ADMIN_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="divider" style={{ margin: '0' }} />

        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <SectionLabel label="Account" collapsed={collapsed} />
          {BOTTOM_NAV.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}

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
              textAlign: 'left',
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

export default AdminSidebar;
