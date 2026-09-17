/**
 * @file InternLayout.jsx
 * @description Dedicated application shell layout for Intern portal pages.
 * Composes: Sidebar + Topbar + MainContent.
 */

import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar, Topbar, MainContent } from '../components/layout';
import FirstTimeLoginModal from '../components/onboarding/FirstTimeLoginModal';
import { useSidebarCollapsed, useAppStore } from '../store';
import { useNotificationStore } from '../store/useNotificationStore';

const InternLayout = () => {
  const collapsed = useSidebarCollapsed();
  const theme = useAppStore((s) => s.theme);
  const user = useAppStore((s) => s.user);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    if (!user) return undefined;
    fetchNotifications(user.role);
    const intervalId = window.setInterval(() => {
      fetchNotifications(user.role);
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [fetchNotifications, user]);

  return (
    <div className="app-shell intern-theme">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={closeMobileSidebar} />

      <div
        className={['app-main', collapsed ? 'sidebar-collapsed' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <Topbar onMobileMenuOpen={openMobileSidebar} />

        <AnimatePresence mode="wait">
          <MainContent>
            <Outlet />
          </MainContent>
        </AnimatePresence>
      </div>

      {/* First-time login prompt modal */}
      <FirstTimeLoginModal />
    </div>
  );
};

export default InternLayout;
