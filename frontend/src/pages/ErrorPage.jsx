/**
 * @file ErrorPage.jsx
 * @description Premium Error Boundary page fallback for React Router.
 */

import { useRouteError, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { RiRefreshLine, RiHomeLine } from 'react-icons/ri';
import { ROUTES } from '../constants';

const ErrorPage = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error("Route level error boundary caught:", error);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--color-neutral-50)',
        textAlign: 'center',
        gap: '1.5rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
      >
        <div
          style={{
            fontSize: '5rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, var(--color-danger-600), var(--color-danger-400))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          Oops!
        </div>

        <h2 style={{ color: 'var(--color-neutral-900)', marginBottom: 0 }}>
          Something went wrong
        </h2>
        <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '0.9rem', color: 'var(--color-neutral-500)' }}>
          {error?.message || error?.statusText || "An unexpected application error occurred."}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem' }}>
          <Button
            variant="outline"
            leftIcon={<RiRefreshLine />}
            onClick={() => window.location.reload()}
            id="reload-btn"
          >
            Reload Page
          </Button>
          <Button
            leftIcon={<RiHomeLine />}
            onClick={() => navigate(ROUTES.DASHBOARD)}
            id="go-home-btn"
          >
            Back to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
