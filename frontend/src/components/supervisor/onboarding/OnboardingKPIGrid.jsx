/**
 * @file OnboardingKPIGrid.jsx
 * @description KPI metric cards for supervisor onboarding with interactive filtering.
 */

import { motion } from 'framer-motion';
import {
  RiTimeLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiFileWarningLine,
  RiPieChartLine,
} from 'react-icons/ri';

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function OnboardingKPIGrid({
  stats = {
    pendingReviews: 0,
    approvedInterns: 0,
    needsRevision: 0,
    incompleteInterns: 0,
    completionRate: 0,
    totalDocs: 0,
    approvedDocs: 0,
  },
  activeFilter = 'all',
  onSelectFilter,
}) {
  const cards = [
    {
      id: 'pending',
      label: 'Pending Reviews',
      sublabel: 'Documents awaiting review',
      value: stats.pendingReviews,
      icon: RiTimeLine,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      shadow: 'rgba(245, 158, 11, 0.25)',
      badge: stats.pendingReviews > 0 ? `${stats.pendingReviews} urgent` : null,
      badgeBg: '#fef3c7',
      badgeColor: '#b45309',
      isActive: activeFilter === 'pending',
    },
    {
      id: 'approved',
      label: 'Fully Cleared',
      sublabel: '3/3 verified interns',
      value: stats.approvedInterns,
      icon: RiCheckboxCircleLine,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      shadow: 'rgba(16, 185, 129, 0.25)',
      badge: `${stats.approvedDocs}/${stats.totalDocs} docs`,
      badgeBg: '#dcfce7',
      badgeColor: '#15803d',
      isActive: activeFilter === 'approved',
    },
    {
      id: 'resubmission_required',
      label: 'Needs Revision',
      sublabel: 'Resubmissions requested',
      value: stats.needsRevision,
      icon: RiAlertLine,
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
      shadow: 'rgba(249, 115, 22, 0.25)',
      badge: stats.needsRevision > 0 ? 'Feedback sent' : null,
      badgeBg: '#ffedd5',
      badgeColor: '#c2410c',
      isActive: activeFilter === 'resubmission_required',
    },
    {
      id: 'incomplete',
      label: 'Incomplete Dossiers',
      sublabel: 'Missing required uploads',
      value: stats.incompleteInterns,
      icon: RiFileWarningLine,
      gradient: 'linear-gradient(135deg, #64748b, #475569)',
      shadow: 'rgba(100, 116, 139, 0.2)',
      badge: 'Awaiting uploads',
      badgeBg: '#f1f5f9',
      badgeColor: '#475569',
      isActive: activeFilter === 'incomplete',
    },
    {
      id: 'all',
      label: 'Cohort Compliance',
      sublabel: 'Overall readiness rate',
      value: `${stats.completionRate}%`,
      icon: RiPieChartLine,
      gradient: 'linear-gradient(135deg, #00b4d8, #0077b6)',
      shadow: 'rgba(0, 180, 216, 0.25)',
      badge: 'Active Cohort',
      badgeBg: '#e0f2fe',
      badgeColor: '#0369a1',
      isActive: activeFilter === 'all',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.875rem',
      }}
    >
      {cards.map((c) => (
        <motion.div
          key={c.id}
          variants={cardVariants}
          whileHover={{ y: -3, boxShadow: `0 8px 24px ${c.shadow}` }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectFilter?.(c.isActive && c.id !== 'all' ? 'all' : c.id)}
          style={{
            background: '#ffffff',
            borderRadius: '1rem',
            padding: '1.125rem 1.25rem',
            border: c.isActive ? '2px solid #00b4d8' : '1px solid #e2e8f0',
            boxShadow: c.isActive ? '0 4px 20px rgba(0, 180, 216, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.03)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
        >
          {/* Active indicator bar */}
          {c.isActive && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: '#00b4d8',
              }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '0.75rem',
                background: c.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '1.15rem',
                boxShadow: `0 4px 12px ${c.shadow}`,
              }}
            >
              <c.icon />
            </div>

            {c.badge && (
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '99px',
                  background: c.badgeBg,
                  color: c.badgeColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {c.badge}
              </span>
            )}
          </div>

          <div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 800,
                color: '#334155',
                marginTop: '0.2rem',
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#64748b',
                marginTop: '0.1rem',
              }}
            >
              {c.sublabel}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
