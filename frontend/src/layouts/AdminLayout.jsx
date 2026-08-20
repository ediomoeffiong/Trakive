/**
 * @file AdminLayout.jsx
 * @description Dedicated application shell layout for HR Admin and Department Head portals.
 * Composes: AdminSidebar + AdminTopbar + MainContent.
 */

import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AdminSidebar, DeptHeadSidebar, AdminTopbar, MainContent } from '../components/layout';
import { useSidebarCollapsed, useAppStore } from '../store';

const AdminLayout = () => {
  const collapsed = useSidebarCollapsed();
  const theme = useAppStore((s) => s.theme);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDeptHead = location.pathname.startsWith('/department-head');

  const openMobileSidebar = useCallback(() => setMobileOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = (e) => {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      };
      apply(mq);
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return (
    <div className="app-shell admin-theme">
      {isDeptHead ? (
        <DeptHeadSidebar mobileOpen={mobileOpen} onMobileClose={closeMobileSidebar} />
      ) : (
        <AdminSidebar mobileOpen={mobileOpen} onMobileClose={closeMobileSidebar} />
      )}
      <div className={['app-main', collapsed ? 'sidebar-collapsed' : ''].filter(Boolean).join(' ')}>
        <AdminTopbar onMobileMenuOpen={openMobileSidebar} />
        <AnimatePresence mode="wait">
          <MainContent>
            <Outlet />
          </MainContent>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminLayout;
