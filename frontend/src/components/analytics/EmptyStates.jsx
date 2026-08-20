/**
 * @file EmptyStates.jsx
 * @description Reusable empty state illustrations and call-to-action cards for Analytics & Reports.
 */

import { motion } from 'framer-motion';
import {
  RiBarChart2Line,
  RiFileTextLine,
  RiFolderDownloadLine,
  RiSearch2Line,
  RiAddLine,
  RiRefreshLine,
} from 'react-icons/ri';

export const EmptyState = ({
  type = 'data',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const icons = {
    data: RiBarChart2Line,
    reports: RiFileTextLine,
    saved: RiFileTextLine,
    exports: RiFolderDownloadLine,
    search: RiSearch2Line,
  };

  const defaults = {
    data: { title: 'No Analytics Data Available', description: 'There is no performance data matching your currently applied filter controls.' },
    reports: { title: 'No Reports Found', description: 'You have not configured or saved any custom analytics reports yet.' },
    saved: { title: 'No Saved Reports', description: 'Save your frequently used report configurations to quickly access them anytime.' },
    exports: { title: 'No Export History', description: 'Generated PDF, Excel, or CSV report exports will appear in your export log here.' },
    search: { title: 'No Results Matching Query', description: 'Try adjusting your search keywords or clearing active filters.' },
  };

  const displayTitle = title || defaults[type]?.title || 'No Data Found';
  const displayDescription = description || defaults[type]?.description || 'Try updating your settings.';
  const IconComponent = icons[type] || RiBarChart2Line;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '3rem 2rem',
        border: '1px border-dashed var(--color-neutral-300)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1rem',
        }}
      >
        <IconComponent />
      </div>

      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
        {displayTitle}
      </h3>
      <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)', maxWidth: '400px', lineHeight: 1.5 }}>
        {displayDescription}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.625rem',
            border: 'none',
            backgroundColor: 'var(--color-primary-600)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }}
        >
          {type === 'saved' || type === 'reports' ? <RiAddLine /> : <RiRefreshLine />}
          {actionLabel || 'Reset & Retry'}
        </button>
      )}
    </motion.div>
  );
};
