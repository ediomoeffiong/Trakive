import { useEffect } from 'react';
import { useAppStore } from '../store';

const AUTO_COLLAPSE_QUERY = '(max-width: 1100px)';

export function useAppearanceSync() {
  const theme = useAppStore((s) => s.theme);
  const spacing = useAppStore((s) => s.spacing);
  const sidebarBehavior = useAppStore((s) => s.sidebarBehavior);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark) => {
      root.classList.toggle('dark', isDark);
      root.dataset.theme = isDark ? 'dark' : 'light';
    };
    const handleSystemThemeChange = (event) => applyTheme(event.matches);

    if (theme === 'system') {
      root.dataset.themePreference = 'system';
      applyTheme(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    root.dataset.themePreference = theme;
    applyTheme(theme === 'dark');
    return undefined;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('spacing-compact', spacing === 'compact');
    root.dataset.spacing = spacing || 'comfortable';
  }, [spacing]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sidebarBehavior = sidebarBehavior || 'full';

    if (sidebarBehavior === 'collapsed') {
      setSidebarCollapsed(true);
      return undefined;
    }

    if (sidebarBehavior === 'auto') {
      const mediaQuery = window.matchMedia(AUTO_COLLAPSE_QUERY);
      const applySidebar = (eventOrQuery) => {
        setSidebarCollapsed(Boolean(eventOrQuery.matches));
      };

      applySidebar(mediaQuery);
      mediaQuery.addEventListener('change', applySidebar);
      return () => mediaQuery.removeEventListener('change', applySidebar);
    }

    setSidebarCollapsed(false);
    return undefined;
  }, [setSidebarCollapsed, sidebarBehavior]);
}
