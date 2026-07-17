/**
 * @file PlaceholderPage.jsx
 * @description Generic placeholder for pages not yet implemented.
 * Renders the page name and a "coming soon" message.
 */

import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const PlaceholderPage = ({ title }) => {
  const { pathname } = useLocation();
  const pageName = title || pathname.replace('/', '').replace(/-/g, ' ') || 'Page';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ marginBottom: '0.25rem', textTransform: 'capitalize' }}>{pageName}</h2>
        <p style={{ margin: 0 }}>This page is under construction and will be available soon.</p>
      </div>

      <Card id={`placeholder-card-${pageName.toLowerCase().replace(/\s/g, '-')}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 2rem',
            gap: '1rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              background: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
            }}
          >
            🚧
          </div>
          <div>
            <Badge variant="warning" dot style={{ marginBottom: '0.75rem' }}>
              Coming Soon
            </Badge>
            <h3 style={{ textTransform: 'capitalize', marginBottom: '0.375rem' }}>{pageName}</h3>
            <p style={{ margin: 0, maxWidth: '320px' }}>
              This feature is being built. Check back in the next sprint!
            </p>
          </div>
        </motion.div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
