/**
 * @file KPICard.jsx
 * @description Modern KPI Metric Card component for the Supervisor Dashboard.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiTeamLine,
  RiUserFollowLine,
  RiTaskLine,
  RiStarLine,
  RiCheckboxMultipleLine,
  RiAwardLine,
  RiArrowUpLine,
} from 'react-icons/ri';

const ICON_MAP = {
  RiUserGroupLine: RiTeamLine,
  RiTeamLine,
  RiUserFollowLine,
  RiTaskLine,
  RiStarLine,
  RiCheckboxMultipleLine,
  RiAwardLine,
};


const COLOR_THEMES = {
  blue: {
    bg: 'var(--color-primary-50)',
    iconBg: '#e0e7ff',
    iconColor: '#3730a3',
    border: 'var(--color-primary-200)',
  },
  green: {
    bg: '#f0fdf4',
    iconBg: '#dcfce7',
    iconColor: '#15803d',
    border: '#bbf7d0',
  },
  amber: {
    bg: '#fffbeb',
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    border: '#fde68a',
  },
  purple: {
    bg: '#faf5ff',
    iconBg: '#f3e8ff',
    iconColor: '#6b21a8',
    border: '#e9d5ff',
  },
  indigo: {
    bg: '#eef2ff',
    iconBg: '#e0e7ff',
    iconColor: '#4338ca',
    border: '#c7d2fe',
  },
  emerald: {
    bg: '#ecfdf5',
    iconBg: '#d1fae5',
    iconColor: '#047857',
    border: '#a7f3d0',
  },
};

const KPICard = ({ card, index = 0, onClick, compact = false }) => {
  const navigate = useNavigate();
  const Icon = ICON_MAP[card.iconName] || RiTeamLine;
  const theme = COLOR_THEMES[card.color] || COLOR_THEMES.blue;
  const clickable = Boolean(onClick || card.to);

  const handleActivate = () => {
    if (onClick) onClick(card);
    else if (card.to) navigate(card.to);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      onClick={clickable ? handleActivate : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      } : undefined}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: compact ? '1rem' : '1.25rem',
        border: `1px solid var(--color-neutral-200)`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: clickable ? 'pointer' : 'default',
      }}
    >
      {/* Background accent highlight */}
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

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.625rem', marginBottom: compact ? '0.65rem' : '0.75rem' }}>
        <div
          style={{
            width: compact ? '36px' : '42px',
            height: compact ? '36px' : '42px',
            borderRadius: compact ? '0.65rem' : '0.75rem',
            backgroundColor: theme.iconBg,
            color: theme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? '1.05rem' : '1.25rem',
            flexShrink: 0,
          }}
        >
          <Icon />
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            fontSize: compact ? '0.68rem' : '0.75rem',
            fontWeight: 600,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            backgroundColor:
              card.trendType === 'positive'
                ? '#dcfce7'
                : card.trendType === 'urgent'
                ? '#fee2e2'
                : '#fef3c7',
            color:
              card.trendType === 'positive'
                ? '#166534'
                : card.trendType === 'urgent'
                ? '#991b1b'
                : '#92400e',
          }}
        >
          {card.trendType === 'positive' && <RiArrowUpLine style={{ fontSize: '0.875rem' }} />}
          {card.trend}
        </span>
      </div>

      <div>
        <p style={{ margin: 0, fontSize: compact ? '0.75rem' : '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
          {card.label}
        </p>
        <h2 style={{ margin: '0.2rem 0', fontSize: compact ? '1.45rem' : '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
          {card.value}
        </h2>
        <p style={{ margin: 0, fontSize: compact ? '0.68rem' : '0.75rem', color: 'var(--color-neutral-400)', lineHeight: 1.35 }}>
          {card.description}
        </p>
      </div>
    </motion.div>
  );
};

export default KPICard;
