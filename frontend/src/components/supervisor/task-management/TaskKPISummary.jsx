/**
 * @file TaskKPISummary.jsx
 * @description KPI summary cards for the Supervisor Task Management dashboard.
 * Reuses the KPICard visual pattern from the Supervisor Dashboard.
 */

import { motion } from 'framer-motion';
import {
  RiTaskLine,
  RiPlayCircleLine,
  RiEyeLine,
  RiCheckboxCircleLine,
  RiAlarmWarningLine,
  RiDraftLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri';
import { TaskKPISkeletonGrid } from './TaskSkeletonLoaders';

const ICON_MAP = {
  RiTaskLine,
  RiPlayCircleLine,
  RiEyeLine,
  RiCheckboxCircleLine,
  RiAlarmWarningLine,
  RiDraftLine,
};

const COLOR_THEMES = {
  blue:    { bg: '#eef2ff', iconBg: '#e0e7ff', iconColor: '#3730a3', border: '#c7d2fe' },
  indigo:  { bg: '#eef2ff', iconBg: '#e0e7ff', iconColor: '#4338ca', border: '#c7d2fe' },
  amber:   { bg: '#fffbeb', iconBg: '#fef3c7', iconColor: '#b45309', border: '#fde68a' },
  green:   { bg: '#f0fdf4', iconBg: '#dcfce7', iconColor: '#15803d', border: '#bbf7d0' },
  red:     { bg: '#fef2f2', iconBg: '#fee2e2', iconColor: '#b91c1c', border: '#fecaca' },
  neutral: { bg: '#f8fafc', iconBg: '#f1f5f9', iconColor: '#64748b', border: '#e2e8f0' },
};

const TREND_STYLES = {
  positive: { bg: '#dcfce7', color: '#166534' },
  warning:  { bg: '#fef3c7', color: '#92400e' },
  urgent:   { bg: '#fee2e2', color: '#991b1b' },
  neutral:  { bg: '#f1f5f9', color: '#475569' },
};

const TaskKPICard = ({ card, index = 0, onClick }) => {
  const Icon = ICON_MAP[card.iconName] || RiTaskLine;
  const theme = COLOR_THEMES[card.color] || COLOR_THEMES.blue;
  const trendStyle = TREND_STYLES[card.trendType] || TREND_STYLES.neutral;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)', transition: { duration: 0.15 } }}
      onClick={onClick}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: `1px solid var(--color-neutral-200)`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        gap: '0.875rem',
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `radial-gradient(circle, ${theme.bg} 0%, rgba(255,255,255,0) 70%)`,
          borderRadius: '50%',
          transform: 'translate(20px, -20px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: icon + trend */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
          }}
        >
          <Icon />
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.7125rem',
            fontWeight: 600,
            backgroundColor: trendStyle.bg,
            color: trendStyle.color,
            whiteSpace: 'nowrap',
          }}
        >
          {card.trendType === 'positive' && <RiArrowUpLine style={{ fontSize: '0.75rem' }} />}
          {card.trendType === 'urgent' && <RiArrowDownLine style={{ fontSize: '0.75rem' }} />}
          {card.trend}
        </span>
      </div>

      {/* Content */}
      <div>
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
          {card.label}
        </p>
        <h2 style={{ margin: '0.2rem 0', fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.1 }}>
          {card.value}
        </h2>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)', lineHeight: 1.4 }}>
          {card.description}
        </p>
      </div>
    </motion.div>
  );
};

const TaskKPISummary = ({ kpis = [], isLoading = false, onKPIClick }) => {
  if (isLoading) return <TaskKPISkeletonGrid />;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem',
      }}
    >
      {kpis.map((card, i) => (
        <TaskKPICard
          key={card.id}
          card={card}
          index={i}
          onClick={onKPIClick ? () => onKPIClick(card) : undefined}
        />
      ))}
    </div>
  );
};

export default TaskKPISummary;
