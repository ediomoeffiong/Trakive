/**
 * @file NotFound.jsx
 * @description 404 page for unmatched routes.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { ROUTES } from '../constants';
import { RiArrowLeftLine, RiHomeLine } from 'react-icons/ri';

const NotFound = () => {
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
        {/* Graphic */}
        <div
          style={{
            fontSize: '6rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            letterSpacing: '-0.04em',
          }}
        >
          404
        </div>

        <h2 style={{ color: 'var(--color-neutral-900)', marginBottom: 0 }}>
          Page not found
        </h2>
        <p style={{ maxWidth: '360px', margin: '0 auto' }}>
          The page you're looking for doesn't exist or has been moved. Let's get
          you back on track.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="outline"
            leftIcon={<RiArrowLeftLine />}
            onClick={() => history.back()}
            id="go-back-btn"
          >
            Go Back
          </Button>
          <Link to={ROUTES.DASHBOARD} id="go-home-link">
            <Button leftIcon={<RiHomeLine />} id="go-home-btn">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
