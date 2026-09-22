import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RiTaskLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTimeLine,
  RiUserAddLine,
  RiCalendarCheckLine,
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
  up: { color: '#10b981', bg: '#d1fae5', label: 'Trending up' },
  down: { color: '#ef4444', bg: '#fee2e2', label: 'Trending down' },
  stable: { color: 'var(--color-primary-700)', bg: 'var(--color-primary-50)', label: 'Stable' },
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
    toast.success(`Internship start and end dates verified by Supervisor Tochukwu Mgbemena!`);
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
        className="card"
        style={{
          borderRadius: '1.25rem',
          background: '#ffffff',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--color-neutral-200)',
          overflow: 'hidden',
        }}
      >
        {/* ── Light Blue Hero Header ───────────────────────────────────── */}
        <div
          className="intern-profile-hero"
          style={{
            padding: '1.5rem 1.75rem 2rem 1.75rem',
            background: 'var(--brand-blue)',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Top Bar: Back Button & Verification Badge */}
          <div className="intern-profile-hero-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '0.625rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                color: 'var(--color-primary-800)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease',
              }}
            >
              <RiArrowLeftLine style={{ fontSize: '1rem' }} /> Back
            </button>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '0.625rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: datesVerified ? 'rgba(16, 185, 129, 0.95)' : 'rgba(245, 158, 11, 0.95)',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff', display: 'inline-block' }} />
              {datesVerified ? 'Dates Verified by Supervisor' : 'Pending Date Verification'}
            </span>
          </div>

          {/* Hero Info Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1.5rem',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Left: Avatar & Info */}
            <div className="intern-profile-identity" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: 280 }}>
              <div
                style={{
                  borderRadius: '1.125rem',
                  border: '4px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  background: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <Avatar name={profile.name} src={profile.avatar} size="xl" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                    {profile.name}
                  </h2>
                  <span
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: statusStyle.text,
                    }}
                  >
                    {profile.status}
                  </span>
                  {trendInfo && (
                    <span
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        color: '#ffffff',
                      }}
                    >
                      {trendInfo.label}
                    </span>
                  )}
                </div>

                <p style={{ margin: '0.35rem 0 0.75rem 0', fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.92)', fontWeight: 600 }}>
                  {profile.role} · <span style={{ color: '#ffffff', fontWeight: 700 }}>{profile.department || 'FifthLab'}</span>
                </p>

                {/* Translucent Info Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.95)', background: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backdropFilter: 'blur(6px)' }}>
                    <RiTimeLine style={{ fontSize: '0.9rem' }} /> Primary Supervisor: {profile.supervisor || 'Tochukwu Mgbemena'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.95)', background: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backdropFilter: 'blur(6px)' }}>
                    <RiTimeLine style={{ fontSize: '0.9rem' }} /> Secondary: {secondarySupervisor || 'None assigned'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.95)', background: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backdropFilter: 'blur(6px)' }}>
                    <RiMapPinLine style={{ fontSize: '0.9rem' }} /> {profile.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'rgba(255, 255, 255, 0.95)', background: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', backdropFilter: 'blur(6px)' }}>
                    <RiCalendarEventLine style={{ fontSize: '0.9rem' }} /> {profile.startDate} to {profile.endDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Metrics Cards */}
            <div className="intern-profile-metrics" style={{ display: 'flex', gap: '0.875rem', flexShrink: 0 }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '0.875rem',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  minWidth: '95px',
                }}
              >
                <p style={{ margin: 0, fontSize: '1.625rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                  {performance?.averageScore ?? profile.performanceScore}
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 800, letterSpacing: '0.05em' }}>SCORE</p>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '0.875rem',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  minWidth: '105px',
                }}
              >
                <p style={{ margin: 0, fontSize: '1.625rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                  {profile.onboardingProgress}%
                </p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 800, letterSpacing: '0.05em' }}>ONBOARDING</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Lower Card Content ───────────────────────────────────────── */}
        <div style={{ padding: '1.25rem 1.75rem 1.5rem 1.75rem' }}>
          {/* Internship Period Selector Bar */}
          {((profile.internships && profile.internships.length > 0) || (profile.startDate && profile.startDate !== 'N/A')) && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                flexWrap: 'wrap',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Internship Period:
              </span>
              {(profile.internships && profile.internships.length > 0
                ? profile.internships
                : [
                    {
                      id: 'single-period',
                      title: `Internship Period (${profile.startDate || 'N/A'} - ${profile.endDate || 'N/A'})`,
                      status: profile.status === 'Completed' ? 'completed' : 'active',
                    },
                  ]
              ).map((period) => (
                <button
                  key={period.id}
                  type="button"
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: period.status === 'active' || period.status === 'Current' ? '1px solid var(--brand-blue)' : '1px solid #cbd5e1',
                    background: period.status === 'active' || period.status === 'Current' ? 'var(--color-primary-50)' : '#ffffff',
                    color: period.status === 'active' || period.status === 'Current' ? 'var(--color-primary-700)' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: period.status === 'active' ? '0 1px 3px rgba(2, 132, 199, 0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => toast.success(`Viewing ${period.title}`)}
                >
                  {period.title} ({period.status === 'active' || period.status === 'Current' ? 'Current' : 'Completed'})
                </button>
              ))}
            </div>
          )}

          {/* Contact Strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingBottom: '1.125rem',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '1.125rem',
            }}
          >
            <a
              href={`mailto:${profile.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: 'var(--color-primary-700)', fontWeight: 600, textDecoration: 'none' }}
            >
              <RiMailLine style={{ fontSize: '1rem' }} /> {profile.email}
            </a>
            <a
              href={`tel:${profile.phone}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#475569', textDecoration: 'none' }}
            >
              <RiPhoneLine style={{ fontSize: '1rem' }} /> {profile.phone}
            </a>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>
              {profile.contractType} · {profile.stipend}
            </span>
          </div>

          {/* Quick Actions Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
            {!datesVerified ? (
              <QuickActionButton
                icon={RiCalendarCheckLine}
                label="Verify Internship Dates"
                color="#059669"
                bg="#ecfdf5"
                onClick={handleVerifyDates}
              />
            ) : (
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.875rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '0.625rem' }}>
                Dates Verified by Tochukwu Mgbemena
              </span>
            )}

            <QuickActionButton
              icon={RiUserAddLine}
              label={secondarySupervisor ? `Change Secondary (${secondarySupervisor})` : "Assign Extra Supervisor"}
              color="var(--color-primary-700)"
              bg="var(--color-primary-50)"
              onClick={() => setShowSecondaryModal(true)}
            />
            <QuickActionButton icon={RiTaskLine} label="Assign Task" color="var(--color-primary-700)" bg="var(--color-primary-50)" onClick={() => handleAction('assign-task')} />
            <QuickActionButton icon={RiCalendarEventLine} label="Schedule Review" color="#0891b2" bg="#ecfeff" onClick={() => handleAction('schedule-review')} />
            <QuickActionButton icon={RiCheckboxCircleLine} label="Approve Onboarding" color="#059669" bg="#ecfdf5" onClick={() => handleAction('approve-onboarding')} />
          </div>
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
                Primary Supervisor: <strong>Tochukwu Mgbemena</strong>. Select a co-supervisor for {profile.name}.
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
