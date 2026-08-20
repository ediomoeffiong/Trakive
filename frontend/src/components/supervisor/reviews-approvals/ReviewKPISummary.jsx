/**
 * @file ReviewKPISummary.jsx
 * @description KPI cards for the Supervisor Reviews & Approvals dashboard.
 */

import { motion } from 'framer-motion';
import {
  RiTimeLine,
  RiCheckboxCircleLine,
  RiRefreshLine,
  RiCloseCircleLine,
  RiCalendarCheckLine,
  RiAlertLine,
} from 'react-icons/ri';
import { KPICardSkeleton } from './ReviewSkeletonLoaders';

const KPI_CONFIG = [
  {
    key: 'pending',
    label: 'Pending Reviews',
    icon: RiTimeLine,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    shadow: 'rgba(245,158,11,0.3)',
    bg: '#fffbeb',
    filterKey: 'pending-review',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: RiCheckboxCircleLine,
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    shadow: 'rgba(16,185,129,0.3)',
    bg: '#ecfdf5',
    filterKey: 'approved',
  },
  {
    key: 'needsRevision',
    label: 'Needs Revision',
    icon: RiRefreshLine,
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    shadow: 'rgba(79,70,229,0.3)',
    bg: '#eef2ff',
    filterKey: 'needs-revision',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    icon: RiCloseCircleLine,
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    shadow: 'rgba(239,68,68,0.3)',
    bg: '#fef2f2',
    filterKey: 'rejected',
  },
  {
    key: 'reviewsDue',
    label: 'Reviews Due',
    icon: RiCalendarCheckLine,
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    shadow: 'rgba(6,182,212,0.3)',
    bg: '#ecfeff',
    filterKey: null,
  },
];

const containerVariants = {
  animate: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const ReviewKPISummary = ({ kpis = {}, isLoading = false, onKPIClick }) => {
  if (isLoading) return <KPICardSkeleton />;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem',
      }}
    >
      {KPI_CONFIG.map(({ key, label, icon: Icon, gradient, shadow, bg, filterKey }) => {
        const value = kpis[key] ?? 0;
        const isOverdue = key === 'pending' && kpis.overdue > 0;
        const clickable = !!filterKey;

        return (
          <motion.div
            key={key}
            variants={cardVariants}
            whileHover={clickable ? { y: -4, boxShadow: `0 12px 32px ${shadow}` } : {}}
            whileTap={clickable ? { scale: 0.97 } : {}}
            onClick={() => clickable && onKPIClick?.(filterKey)}
            style={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.25rem',
              border: '1px solid var(--color-neutral-200)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              cursor: clickable ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'box-shadow 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background accent */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: bg,
                opacity: 0.7,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '0.75rem',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '1.1rem',
                  boxShadow: `0 4px 12px ${shadow}`,
                  flexShrink: 0,
                }}
              >
                <Icon />
              </div>
              {isOverdue && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                  }}
                >
                  <RiAlertLine style={{ fontSize: '0.7rem' }} />
                  {kpis.overdue} late
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 900,
                  color: 'var(--color-neutral-900)',
                  lineHeight: 1,
                  marginBottom: '0.25rem',
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-500)',
                  lineHeight: 1.3,
                }}
              >
                {label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ReviewKPISummary;
