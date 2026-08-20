/**
 * @file DeptHeadSidebar.jsx
 * @description Dedicated navigation sidebar for the Department Head Portal.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiDashboardLine,
  RiShieldUserLine,
  RiGroupLine,
  RiBarChartGroupedLine,
  RiCheckboxCircleLine,
  RiMegaphoneLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiLogoutBoxRLine,
  RiBuilding2Line,
  RiTaskLine,
  RiStarLine,
  RiBellLine,
  RiUser3Line,
  RiSettings3Line,
} from 'react-icons/ri';
import { ROUTES, APP_NAME } from '../../constants';
import { useSidebarCollapsed, useToggleSidebar, useAppStore } from '../../store';

const DEPT_HEAD_NAV_ITEMS = [
  { label: 'Dashboard',     icon: RiDashboardLine,         to: ROUTES.DEPARTMENT_HEAD_DASHBOARD },
  { label: 'Interns',       icon: RiGroupLine,             to: ROUTES.DEPARTMENT_HEAD_INTERNS },
  { label: 'Supervisors',   icon: RiShieldUserLine,        to: ROUTES.DEPARTMENT_HEAD_SUPERVISORS },
  { label: 'Tasks',         icon: RiTaskLine,              to: ROUTES.DEPARTMENT_HEAD_TASKS },
  { label: 'Reviews',       icon: RiStarLine,              to: ROUTES.DEPARTMENT_HEAD_REVIEWS },
  { label: 'Analytics',     icon: RiBarChartGroupedLine,   to: ROUTES.DEPARTMENT_HEAD_ANALYTICS },
  { label: 'Approvals',     icon: RiCheckboxCircleLine,    to: ROUTES.DEPARTMENT_HEAD_APPROVALS },
  { label: 'Announcements', icon: RiMegaphoneLine,         to: ROUTES.DEPARTMENT_HEAD_ANNOUNCEMENTS },
];

const DEPT_HEAD_BOTTOM_ITEMS = [
  { label: 'Notifications', icon: RiBellLine,     to: ROUTES.DEPARTMENT_HEAD_NOTIFICATIONS },
  { label: 'Profile',       icon: RiUser3Line,    to: ROUTES.DEPARTMENT_HEAD_PROFILE },
  { label: 'Settings',      icon: RiSettings3Line, to: ROUTES.DEPARTMENT_HEAD_SETTINGS },
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
          background: 'linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
        }}
        aria-hidden
      >
        <RiBuilding2Line style={{ color: '#ffffff', fontSize: '1.125rem' }} />
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
                color: '#0284c7',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Dept Head Portal
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
      end={item.to === ROUTES.DEPARTMENT_HEAD_DASHBOARD}
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

const DeptHeadSidebar = ({ mobileOpen = false, onMobileClose }) => {
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
        aria-label="Department Head navigation"
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
          <SectionLabel label="Department Oversight" collapsed={collapsed} />

          {DEPT_HEAD_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="divider" style={{ margin: '0' }} />

        <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <SectionLabel label="Account" collapsed={collapsed} />
          {DEPT_HEAD_BOTTOM_ITEMS.map((item) => (
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

export default DeptHeadSidebar;
