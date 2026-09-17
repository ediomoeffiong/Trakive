/**
 * @file SupervisorLayout.jsx
 * @description Dedicated application shell layout for Supervisor portal pages.
 * Composes: SupervisorSidebar + SupervisorTopbar + MainContent.
 */

import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SupervisorSidebar, SupervisorTopbar, MainContent } from '../components/layout';
import { useSidebarCollapsed, useAppStore } from '../store';
import { useNotificationStore } from '../store/useNotificationStore';

const SupervisorLayout = () => {
  const collapsed = useSidebarCollapsed();
  const theme = useAppStore((s) => s.theme);
  const user = useAppStore((s) => s.user);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobileSidebar = useCallback(() => setMobileOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setMobileOpen((v) => !v), []);

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

  useEffect(() => {
    if (!user) return undefined;
    fetchNotifications(user.role);
    const intervalId = window.setInterval(() => {
      fetchNotifications(user.role);
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [fetchNotifications, user]);

  return (
    <div className="app-shell supervisor-theme">
      <SupervisorSidebar mobileOpen={mobileOpen} onMobileClose={closeMobileSidebar} />

      <div
        className={['app-main', collapsed ? 'sidebar-collapsed' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <SupervisorTopbar onMobileMenuToggle={toggleMobileSidebar} mobileOpen={mobileOpen} />

        <AnimatePresence mode="wait">
          <MainContent>
            <Outlet />
          </MainContent>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SupervisorLayout;
