/**
 * @file InternProfileHeader.jsx
 * @description Detailed intern profile header card with avatar, internship info,
 * status badge, duration, and quick action buttons.
 */

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiTaskLine,
  RiCalendarEventLine,
  RiMessage2Line,
  RiCheckboxCircleLine,
  RiBarChartLine,
  RiMailLine,
  RiPhoneLine,
  RiLinkedinBoxLine,
  RiMapPinLine,
  RiTimeLine,
  RiArrowLeftLine,
} from 'react-icons/ri';
import Avatar from '../../ui/Avatar';
import { ROUTES } from '../../../constants';

const STATUS_STYLES = {
  Active: { bg: '#dcfce7', text: '#15803d' },
  'Pending Review': { bg: '#fef3c7', text: '#b45309' },
  'Needs Help': { bg: '#fee2e2', text: '#b91c1c' },
  'On Leave': { bg: '#f3f4f6', text: '#4b5563' },
};

const TREND_COLORS = {
  up: { color: '#10b981', bg: '#d1fae5', label: '↑ Trending up' },
  down: { color: '#ef4444', bg: '#fee2e2', label: '↓ Trending down' },
  stable: { color: '#6366f1', bg: '#e0e7ff', label: '→ Stable' },
};

const QuickActionButton = ({ icon: Icon, label, color, bg, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -1 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.5rem 0.875rem',
      borderRadius: '0.625rem',
      border: `1px solid ${color}30`,
      background: bg,
      color: color,
      fontSize: '0.8125rem',
      fontWeight: 600,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'box-shadow 0.15s ease',
    }}
  >
    <Icon style={{ fontSize: '1rem', flexShrink: 0 }} />
    {label}
  </motion.button>
);

const InfoChip = ({ icon: Icon, label, color = 'var(--color-neutral-600)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color }}>
    <Icon style={{ fontSize: '0.9rem', flexShrink: 0, color: 'var(--color-neutral-400)' }} />
    {label}
  </div>
);

const InternProfileHeader = ({ profile, performance }) => {
  const navigate = useNavigate();

  if (!profile) return null;

  const statusStyle = STATUS_STYLES[profile.status] || STATUS_STYLES.Active;
  const trendInfo = performance ? TREND_COLORS[performance.trend] || TREND_COLORS.stable : null;

  const handleAction = (action) => {
    switch (action) {
      case 'assign-task':
        toast.success(`Opening task assignment for ${profile.name}...`);
        navigate(`${ROUTES.SUPERVISOR_TASKS}?action=new&intern=${profile.id}`);
        break;
      case 'schedule-review':
        toast.success(`Opening review scheduler for ${profile.name}...`);
        navigate(`${ROUTES.SUPERVISOR_REVIEWS}?action=schedule&intern=${profile.id}`);
        break;
      case 'message':
        toast.success(`Opening message composer for ${profile.name}... (UI only)`);
        break;
      case 'approve-onboarding':
        toast.success(`Opening onboarding approvals for ${profile.name}...`);
        navigate(`${ROUTES.SUPERVISOR_ONBOARDING}?intern=${profile.id}`);
        break;
      case 'analytics':
        toast.success(`Opening analytics for ${profile.name}...`);
        navigate(`${ROUTES.SUPERVISOR_REPORTS}?intern=${profile.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Gradient Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)',
          padding: '1.25rem 2rem 3.5rem 2rem',
          position: 'relative',
        }}
      >
        <button
          onClick={() => navigate(ROUTES.SUPERVISOR_INTERNS)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '0.5rem',
            color: '#c7d2fe',
            fontSize: '0.8125rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            cursor: 'pointer',
          }}
        >
          <RiArrowLeftLine />
          Back to Interns
        </button>

        <span
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '2rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.12)',
            color: '#c7d2fe',
            padding: '0.25rem 0.625rem',
            borderRadius: '99px',
          }}
        >
          {profile.batch}
        </span>
      </div>

      {/* Profile Body */}
      <div style={{ padding: '0 2rem 1.75rem 2rem', marginTop: '-2.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          {/* Left: Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.25rem' }}>
            <div
              style={{
                borderRadius: '1rem',
                border: '4px solid #ffffff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                background: '#fff',
                flexShrink: 0,
              }}
            >
              <Avatar name={profile.name} src={profile.avatar} size="xl" />
            </div>

            <div style={{ paddingBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--color-neutral-900)',
                  }}
                >
                  {profile.name}
                </h2>
                <span
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {profile.status}
                </span>
                {trendInfo && (
                  <span
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: trendInfo.bg,
                      color: trendInfo.color,
                    }}
                  >
                    {trendInfo.label}
                  </span>
                )}
              </div>

              <p style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
                {profile.role} · {profile.department}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <InfoChip icon={RiTimeLine} label={`Supervisor: ${profile.supervisor}`} />
                <InfoChip icon={RiMapPinLine} label={profile.location} />
                <InfoChip icon={RiCalendarEventLine} label={`${profile.startDate} → ${profile.endDate}`} />
                <InfoChip icon={RiTimeLine} label={profile.timezone} />
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: 'center', padding: '0.625rem 1rem', background: 'var(--color-neutral-50)', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)' }}>
              <p style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {performance?.averageScore ?? profile.performanceScore}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>SCORE</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.625rem 1rem', background: 'var(--color-neutral-50)', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)' }}>
              <p style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {profile.onboardingProgress}%
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>ONBOARDED</p>
            </div>
          </div>
        </div>

        {/* Contact Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--color-neutral-100)',
          }}
        >
          <a
            href={`mailto:${profile.email}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}
          >
            <RiMailLine /> {profile.email}
          </a>
          <a
            href={`tel:${profile.phone}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-neutral-600)', textDecoration: 'none' }}
          >
            <RiPhoneLine /> {profile.phone}
          </a>
          <a
            href={`https://${profile.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#0a66c2', textDecoration: 'none' }}
          >
            <RiLinkedinBoxLine /> LinkedIn
          </a>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            🎓 {profile.university} · {profile.major}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            💼 {profile.contractType} · {profile.stipend}
          </span>
        </div>

        {/* Quick Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.625rem',
            marginTop: '1.25rem',
          }}
        >
          <QuickActionButton icon={RiTaskLine} label="Assign Task" color="#4f46e5" bg="#eef2ff" onClick={() => handleAction('assign-task')} />
          <QuickActionButton icon={RiCalendarEventLine} label="Schedule Review" color="#7c3aed" bg="#faf5ff" onClick={() => handleAction('schedule-review')} />
          <QuickActionButton icon={RiMessage2Line} label="Send Message" color="#0891b2" bg="#ecfeff" onClick={() => handleAction('message')} />
          <QuickActionButton icon={RiCheckboxCircleLine} label="Approve Onboarding" color="#059669" bg="#ecfdf5" onClick={() => handleAction('approve-onboarding')} />
          <QuickActionButton icon={RiBarChartLine} label="View Analytics" color="#d97706" bg="#fffbeb" onClick={() => handleAction('analytics')} />
        </div>
      </div>
    </motion.div>
  );
};

export default InternProfileHeader;
