/**
 * @file AppLayout.jsx
 * @description Root layout for authenticated pages.
 * Composes: Sidebar + Topbar + MainContent.
 * Handles:
 *  - Mobile sidebar open/close, sidebar collapse state
 *  - Theme class application to document.documentElement (.dark)
 *  - Accessibility classes (reduced-motion, text-scale-*, focus-enhanced)
 *  - Spacing mode class (spacing-compact)
 */

import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar, Topbar, MainContent } from '../components/layout';
import { useSidebarCollapsed, useAppStore } from '../store';

const AppLayout = () => {
  const collapsed = useSidebarCollapsed();
  const theme     = useAppStore((s) => s.theme);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobileSidebar  = useCallback(() => setMobileOpen(true),  []);
  const closeMobileSidebar = useCallback(() => setMobileOpen(false), []);

  // ── Theme sync → document root class ──────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // 'system' — follow OS preference
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const apply = (e) => {
        if (e.matches) root.classList.add('dark');
        else           root.classList.remove('dark');
      };
      apply(mq);
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return (
    <div className="app-shell">
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={closeMobileSidebar}
      />

      {/* ── Main (Topbar + Content) ───────────────────────────────────────── */}
      <div
        className={['app-main', collapsed ? 'sidebar-collapsed' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <Topbar onMobileMenuOpen={openMobileSidebar} />

        {/* Page transitions */}
        <AnimatePresence mode="wait">
          <MainContent>
            {/* Outlet renders the matched child route */}
            <Outlet />
          </MainContent>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppLayout;
