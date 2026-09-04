import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import router from './routes';
import { useAppStore } from './store';

function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (isDark) => root.classList.toggle('dark', isDark);
    const handleSystemThemeChange = (event) => applyTheme(event.matches);

    if (theme === 'system') {
      applyTheme(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    applyTheme(theme === 'dark');
  }, [theme]);

  return (
    <>
      {/* Router */}
      <RouterProvider router={router} />

      {/* Toast notifications — positioned top-right, max 3 visible */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 500,
            borderRadius: '0.75rem',
            boxShadow: '0 8px 24px rgb(0 0 0 / 0.10)',
            padding: '0.75rem 1rem',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
            style: { borderLeft: '4px solid #22c55e' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
            style: { borderLeft: '4px solid #ef4444' },
          },
        }}
      />
    </>
  );
}

export default App;
