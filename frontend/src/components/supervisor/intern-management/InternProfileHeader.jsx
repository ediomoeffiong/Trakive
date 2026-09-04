import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RiUserAddLine,
  RiCalendarCheckLine,
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

const SUPERVISOR_OPTIONS = [
  { id: 'sup-jane', name: 'Jane Smith', role: 'Senior Mentor' },
  { id: 'sup-mike', name: 'Mike Chen', role: 'Lead Architect' },
  { id: 'sup-vance', name: 'Dr. Robert Vance', role: 'Research Director' },
  { id: 'sup-sarah', name: 'Sarah Connor', role: 'DevOps Lead' },
];

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
  const [datesVerified, setDatesVerified] = useState(profile?.datesVerified || false);
  const [secondarySupervisor, setSecondarySupervisor] = useState(profile?.secondarySupervisor || null);
  const [showSecondaryModal, setShowSecondaryModal] = useState(false);

  if (!profile) return null;

  const statusStyle = STATUS_STYLES[profile.status] || STATUS_STYLES.Active;
  const trendInfo = performance ? TREND_COLORS[performance.trend] || TREND_COLORS.stable : null;

  const handleVerifyDates = () => {
    setDatesVerified(true);
    toast.success(`Internship start and end dates verified by Supervisor Tochukwu Mgbemmena!`);
  };

  const handleAssignSecondary = (sup) => {
    setSecondarySupervisor(sup.name);
    setShowSecondaryModal(false);
    toast.success(`Assigned ${sup.name} as secondary supervisor for ${profile.name}!`);
  };

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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ marginBottom: '1.5rem' }}
    >
      <div
        className="card p-6"
        style={{
          borderRadius: '1rem',
          background: '#ffffff',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid var(--color-neutral-200)',
          position: 'relative',
        }}
      >
        {/* Banner header accent */}
        <div
          style={{
            height: '6rem',
            borderRadius: '0.75rem 0.75rem 0 0',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
            margin: '-1.5rem -1.5rem 0 -1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RiArrowLeftLine /> Back
          </button>

          {/* Date verification status badge */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: datesVerified ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)',
                color: '#ffffff',
                backdropFilter: 'blur(8px)',
              }}
            >
              {datesVerified ? '✓ Dates Verified by Supervisor' : '⏳ Pending Date Verification'}
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginTop: '-2.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Avatar & Info */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
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
                {profile.role} · {profile.department || 'Fifthlab'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <InfoChip icon={RiTimeLine} label={`Primary Supervisor: ${profile.supervisor || 'Tochukwu Mgbemmena'}`} />
                <InfoChip icon={RiTimeLine} label={`Secondary: ${secondarySupervisor || 'None assigned'}`} />
                <InfoChip icon={RiMapPinLine} label={profile.location} />
                <InfoChip icon={RiCalendarEventLine} label={`${profile.startDate} → ${profile.endDate}`} />
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
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>ONBOARDING</p>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            💼 {profile.contractType} · {profile.stipend}
          </span>
        </div>

        {/* Quick Actions for Supervisor */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.625rem',
            marginTop: '1.25rem',
          }}
        >
          {!datesVerified ? (
            <QuickActionButton
              icon={RiCalendarCheckLine}
              label="Verify Internship Dates"
              color="#059669"
              bg="#ecfdf5"
              onClick={handleVerifyDates}
            />
          ) : (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', background: '#ecfdf5', borderRadius: '0.625rem' }}>
              ✓ Dates Verified by Tochukwu Mgbemmena
            </span>
          )}

          <QuickActionButton
            icon={RiUserAddLine}
            label={secondarySupervisor ? `Change Secondary (${secondarySupervisor})` : "Assign Extra Supervisor"}
            color="#7c3aed"
            bg="#faf5ff"
            onClick={() => setShowSecondaryModal(true)}
          />
          <QuickActionButton icon={RiTaskLine} label="Assign Task" color="#4f46e5" bg="#eef2ff" onClick={() => handleAction('assign-task')} />
          <QuickActionButton icon={RiCalendarEventLine} label="Schedule Review" color="#7c3aed" bg="#faf5ff" onClick={() => handleAction('schedule-review')} />
          <QuickActionButton icon={RiCheckboxCircleLine} label="Approve Onboarding" color="#059669" bg="#ecfdf5" onClick={() => handleAction('approve-onboarding')} />
        </div>
      </div>

      {/* Secondary Supervisor Selection Modal */}
      <AnimatePresence>
        {showSecondaryModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#ffffff',
                borderRadius: '1rem',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 700 }}>
                Select Extra / Secondary Supervisor
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', marginBottom: '1.25rem' }}>
                Primary Supervisor: <strong>Tochukwu Mgbemmena</strong>. Select a co-supervisor for {profile.name}.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {SUPERVISOR_OPTIONS.map((sup) => (
                  <button
                    key={sup.id}
                    type="button"
                    onClick={() => handleAssignSecondary(sup)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.625rem',
                      border: '1px solid var(--color-neutral-200)',
                      background: 'var(--color-neutral-50)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                        {sup.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                        {sup.role}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                      Assign
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSecondaryModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--color-neutral-300)',
                    background: '#fff',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InternProfileHeader;
