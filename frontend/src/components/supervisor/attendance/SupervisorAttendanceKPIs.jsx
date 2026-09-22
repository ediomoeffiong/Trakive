import { motion } from 'framer-motion';
import {
  RiUserFollowLine,
  RiCheckDoubleLine,
  RiTimeLine,
  RiCloudLine,
  RiFeedbackLine,
  RiAlertLine,
} from 'react-icons/ri';
import { Card, Skeleton } from '../../../components/ui';

const cardHover = {
  hover: {
    y: -3,
    boxShadow: '0 8px 24px -6px rgba(0, 0, 0, 0.12)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
};

const SupervisorAttendanceKPIs = ({ dashboard, loading, onSelectTab }) => {
  if (loading) {
    return (
      <div className="dashboard-kpi-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height="110px" borderRadius="14px" />
        ))}
      </div>
    );
  }

  const counts = dashboard?.counts || {};
  const isPhysical = dashboard?.required;
  const isOnlineDay = dashboard?.day_type === 'online';
  const pendingCorrections = (dashboard?.correction_queue || []).length;

  const cards = [
    {
      id: 'expected',
      label: isPhysical ? 'Expected In-Office' : isOnlineDay ? 'Expected (Online Day)' : 'Scheduled Today',
      value: isPhysical ? counts.expected || 0 : '0',
      sub: isPhysical ? 'Mandatory office check-in' : (isOnlineDay ? 'Online day — no office check-in' : 'Non-workday / Holiday'),
      icon: RiUserFollowLine,
      color: 'var(--color-primary-600)',
      bg: 'var(--color-primary-50)',
    },
    {
      id: 'present',
      label: 'Verified Present',
      value: counts.present || 0,
      sub: `${counts.present || 0} intern${counts.present === 1 ? '' : 's'} on-time at office`,
      icon: RiCheckDoubleLine,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      id: 'late',
      label: 'Late Arrivals',
      value: counts.late || 0,
      sub: counts.late > 0 ? 'Arrived after grace window' : 'No late arrivals today',
      icon: RiTimeLine,
      color: '#d97706',
      bg: '#fffbeb',
      highlight: counts.late > 0,
    },
    {
      id: 'mode_status',
      label: isOnlineDay ? 'Online Task Credited' : 'Pending Check-In',
      value: isOnlineDay ? counts.remote || 0 : counts.pending || 0,
      sub: isOnlineDay ? 'Credited via task completion' : (isPhysical ? 'Yet to check in today' : 'No pending required'),
      icon: isOnlineDay ? RiCloudLine : RiAlertLine,
      color: isOnlineDay ? '#0284c7' : (counts.pending > 0 && isPhysical ? '#ef4444' : '#64748b'),
      bg: isOnlineDay ? '#f0f9ff' : (counts.pending > 0 && isPhysical ? '#fef2f2' : 'var(--color-neutral-100)'),
      highlight: counts.pending > 0 && isPhysical,
    },
    {
      id: 'corrections',
      label: 'Correction Queue',
      value: pendingCorrections,
      sub: pendingCorrections > 0 ? `${pendingCorrections} request${pendingCorrections === 1 ? '' : 's'} awaiting review` : 'All requests reviewed',
      icon: RiFeedbackLine,
      color: pendingCorrections > 0 ? '#b45309' : 'var(--color-neutral-600)',
      bg: pendingCorrections > 0 ? '#fef3c7' : 'var(--color-neutral-100)',
      highlight: pendingCorrections > 0,
      badgeText: pendingCorrections > 0 ? 'Needs Action' : null,
      onClick: () => onSelectTab?.('corrections'),
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    }}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.id} variants={cardHover} whileHover="hover">
            <Card
              interactive={Boolean(card.onClick)}
              onClick={card.onClick}
              style={{
                height: '100%',
                border: card.highlight ? `1.5px solid ${card.color}` : undefined,
                cursor: card.onClick ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--color-neutral-500)',
                    }}>
                      {card.label}
                    </p>
                    {card.badgeText && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.45rem',
                        borderRadius: '999px',
                        background: '#f59e0b',
                        color: '#ffffff',
                      }}>
                        {card.badgeText}
                      </span>
                    )}
                  </div>

                  <h3 style={{
                    margin: '0.35rem 0 0',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: 'var(--color-neutral-900)',
                    lineHeight: 1.1,
                  }}>
                    {card.value}
                  </h3>

                  <p style={{
                    margin: '0.35rem 0 0',
                    fontSize: '0.73rem',
                    color: 'var(--color-neutral-500)',
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {card.sub}
                  </p>
                </div>

                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: card.bg,
                  color: card.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}>
                  <Icon />
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SupervisorAttendanceKPIs;
