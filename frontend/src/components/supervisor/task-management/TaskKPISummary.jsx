/**
 * @file TaskKPISummary.jsx
 * @description KPI summary cards for the Supervisor Task Management dashboard.
 * Modern light-themed cards with pastel icon badges, progress indicators, and interactive click-to-filter capabilities.
 */

import { motion } from 'framer-motion';
import {
  RiCheckboxLine,
  RiTaskLine,
  RiPlayCircleLine,
  RiEyeLine,
  RiFocus2Line,
  RiTargetLine,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiAlarmWarningLine,
  RiDraftLine,
  RiArrowDownLine,
} from 'react-icons/ri';
import { TaskKPISkeletonGrid } from './TaskSkeletonLoaders';

const ICON_MAP = {
  RiCheckboxLine,
  RiTaskLine,
  RiPlayCircleLine,
  RiEyeLine,
  RiFocus2Line,
  RiTargetLine,
  RiCheckboxCircleLine,
  RiCheckLine,
  RiAlarmWarningLine,
  RiDraftLine,
};

const COLOR_THEMES = {
  blue:    { bg: '#eef2ff', iconBg: '#e0e7ff', iconColor: '#3730a3', border: '#c7d2fe', badgeBg: '#e0e7ff', badgeColor: '#3730a3' },
  indigo:  { bg: '#eef2ff', iconBg: '#e0e7ff', iconColor: '#4338ca', border: '#c7d2fe', badgeBg: '#eef2ff', badgeColor: '#4338ca' },
  amber:   { bg: '#fffbeb', iconBg: '#fef3c7', iconColor: '#b45309', border: '#fde68a', badgeBg: '#fef3c7', badgeColor: '#92400e' },
  green:   { bg: '#f0fdf4', iconBg: '#dcfce7', iconColor: '#15803d', border: '#bbf7d0', badgeBg: '#dcfce7', badgeColor: '#166534' },
  red:     { bg: '#fef2f2', iconBg: '#fee2e2', iconColor: '#b91c1c', border: '#fecaca', badgeBg: '#fee2e2', badgeColor: '#991b1b' },
  neutral: { bg: '#f8fafc', iconBg: '#f1f5f9', iconColor: '#64748b', border: '#e2e8f0', badgeBg: '#f1f5f9', badgeColor: '#475569' },
};

const TaskKPICard = ({ card, index = 0, onClick, isActive = false }) => {
  if (!card) return null;
  const Icon = ICON_MAP[card.iconName] || RiTaskLine;
  const theme = COLOR_THEMES[card.color] || COLOR_THEMES.indigo;

  const isCompletedCard = card.id === 'completed' || card.filterKey === 'completed';
  const isOverdueCard = card.id === 'overdue' || card.filterKey === 'overdue';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{
        y: -4,
        boxShadow: isActive
          ? '0 0 0 2px #00b4d8, 0 10px 28px rgba(0, 180, 216, 0.18)'
          : '0 8px 24px rgba(0, 0, 0, 0.08)',
        borderColor: isActive ? '#00b4d8' : 'var(--color-neutral-300)',
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: isActive
          ? '1.5px solid #00b4d8'
          : '1px solid var(--color-neutral-200)',
        boxShadow: isActive
          ? '0 0 0 3px rgba(0, 180, 216, 0.2), 0 6px 20px rgba(0, 0, 0, 0.06)'
          : '0 4px 16px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        minHeight: '140px',
        userSelect: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
      }}
      title={onClick ? `Filter by ${card.label}` : undefined}
      aria-label={`${card.label}: ${card.value}`}
    >
      {/* Background soft accent gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '85px',
          height: '85px',
          background: `radial-gradient(circle, ${theme.bg} 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: '50%',
          transform: 'translate(15px, -15px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: Icon + Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 1 }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '0.75rem',
            backgroundColor: theme.iconBg,
            color: theme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            flexShrink: 0,
          }}
        >
          <Icon />
        </div>

        {/* Top-right indicator / badge */}
        {isCompletedCard ? (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
            }}
          >
            <RiCheckLine />
          </div>
        ) : isOverdueCard ? (
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
            }}
          >
            <RiArrowDownLine />
          </div>
        ) : card.trend ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.725rem',
              fontWeight: 700,
              backgroundColor: theme.badgeBg || '#f1f5f9',
              color: theme.badgeColor || 'var(--color-neutral-700)',
              whiteSpace: 'nowrap',
            }}
          >
            {card.trend}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div style={{ marginTop: '0.75rem', zIndex: 1 }}>
        <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)', letterSpacing: '0.01em' }}>
          {card.label || 'Metric'}
        </p>
        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.1 }}>
          {card.value ?? 0}
        </h2>
        {card.description && (
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)', lineHeight: 1.35 }}>
            {card.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const TaskKPISummary = ({ kpis = [], isLoading = false, onKPIClick, activeFilter = null }) => {
  if (isLoading) return <TaskKPISkeletonGrid />;

  const safeKpis = Array.isArray(kpis) ? kpis.filter(Boolean) : [];

  if (safeKpis.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
        gap: '1rem',
        width: '100%',
      }}
    >
      {safeKpis.map((card, i) => (
        <TaskKPICard
          key={card.id || card.label || i}
          card={card}
          index={i}
          isActive={activeFilter ? activeFilter === card.filterKey : false}
          onClick={onKPIClick ? () => onKPIClick(card) : undefined}
        />
      ))}
    </div>
  );
};

export default TaskKPISummary;
