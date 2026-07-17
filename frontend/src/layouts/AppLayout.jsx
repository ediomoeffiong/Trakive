/**
 * @file AppLayout.jsx
 * @description Root layout for authenticated pages.
 * Composes: Sidebar + Topbar + MainContent.
 * Handles: mobile sidebar open/close, sidebar collapse state.
 */

import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar, Topbar, MainContent } from '../components/layout';
import { useSidebarCollapsed } from '../store';

const AppLayout = () => {
  const collapsed = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobileSidebar  = useCallback(() => setMobileOpen(true),  []);
  const closeMobileSidebar = useCallback(() => setMobileOpen(false), []);

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
