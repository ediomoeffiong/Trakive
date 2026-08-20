/**
 * @file InternLayout.jsx
 * @description Dedicated application shell layout for Intern portal pages.
 * Composes: Sidebar + Topbar + MainContent.
 */

import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar, Topbar, MainContent } from '../components/layout';
import { useSidebarCollapsed, useAppStore } from '../store';

const InternLayout = () => {
  const collapsed = useSidebarCollapsed();
  const theme = useAppStore((s) => s.theme);
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
    </div>
  );
};

export default InternLayout;
