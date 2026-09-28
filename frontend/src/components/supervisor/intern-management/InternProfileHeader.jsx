import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiMailLine,
  RiMapPinLine,
  RiPhoneLine,
  RiTaskLine,
  RiTimeLine,
} from 'react-icons/ri';
import Avatar from '../../ui/Avatar';
import { ROUTES } from '../../../constants';

const STATUS_STYLES = {
  Active: { bg: '#dcfce7', text: '#15803d' },
  Completed: { bg: 'var(--color-primary-50)', text: 'var(--color-primary-700)' },
  'Pending Review': { bg: '#fef3c7', text: '#b45309' },
  'Needs Help': { bg: '#fee2e2', text: '#b91c1c' },
};

const present = (value, fallback = 'Not provided') => {
  if (value === null || value === undefined || value === '' || value === 'N/A') return fallback;
  return value;
};

const formatDate = (value) => {
  if (!value || value === 'N/A') return null;
  const date = new Date(`${String(value).split('T')[0]}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ActionButton = ({ icon: Icon, children, onClick, primary = false }) => (
  <button
    type="button"
    className={`btn ${primary ? 'btn-primary' : 'btn-secondary'}`}
    onClick={onClick}
    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
  >
    <Icon /> {children}
  </button>
);

const InternProfileHeader = ({ profile, performance, progress }) => {
  const navigate = useNavigate();
  if (!profile) return null;

  const statusStyle = STATUS_STYLES[profile.status] || STATUS_STYLES['Pending Review'];
  const score = performance?.averageScore ?? profile.performanceScore;
  const onboarding = Number(progress?.onboardingCompletion?.percentage ?? profile.onboardingProgress ?? 0);
  const startDate = formatDate(profile.startDate);
  const endDate = formatDate(profile.endDate);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card intern-detail-profile-card"
      style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid var(--color-neutral-200)', boxShadow: '0 8px 32px rgba(0, 180, 216, 0.18)' }}
    >
      <div className="intern-profile-hero" style={{ padding: '1.5rem 1.75rem 1.75rem', background: 'var(--brand-blue)', color: '#fff' }}>
        <div className="intern-profile-hero-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button type="button" onClick={() => navigate(ROUTES.SUPERVISOR_INTERNS)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', border: '1px solid rgba(255,255,255,.35)', borderRadius: '0.625rem', background: 'rgba(255,255,255,.14)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            <RiArrowLeftLine /> All interns
          </button>
          <span style={{ padding: '0.35rem 0.7rem', borderRadius: 999, background: statusStyle.bg, color: statusStyle.text, fontSize: '0.75rem', fontWeight: 800 }}>{profile.status}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="intern-profile-identity" style={{ display: 'flex', alignItems: 'center', gap: '1.125rem', minWidth: 0 }}>
            <div style={{ border: '3px solid rgba(255,255,255,.8)', borderRadius: '1rem', background: '#fff', boxShadow: '0 8px 20px rgba(0,0,0,.14)', flexShrink: 0 }}>
              <Avatar name={profile.name} src={profile.avatar} size="xl" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, color: '#fff', fontSize: 'clamp(1.35rem, 3vw, 1.8rem)', lineHeight: 1.2 }}>{profile.name}</h1>
              <p style={{ margin: '0.35rem 0 0.8rem', color: 'rgba(255,255,255,.86)', fontSize: '0.9rem', fontWeight: 600 }}>{present(profile.department, 'Department not assigned')} · Intern</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,.13)', fontSize: '0.78rem' }}><RiTimeLine style={{ verticalAlign: '-2px' }} /> {present(profile.supervisor, 'No supervisor assigned')}</span>
                <span style={{ padding: '0.3rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,.13)', fontSize: '0.78rem' }}><RiMapPinLine style={{ verticalAlign: '-2px' }} /> {present(profile.location)}</span>
                {(startDate || endDate) && <span style={{ padding: '0.3rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,.13)', fontSize: '0.78rem' }}><RiCalendarEventLine style={{ verticalAlign: '-2px' }} /> {startDate || 'Start not set'} — {endDate || 'Ongoing'}</span>}
              </div>
            </div>
          </div>

          <div className="intern-profile-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(105px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem 1rem', border: '1px solid rgba(255,255,255,.28)', borderRadius: '0.875rem', background: 'rgba(255,255,255,.13)', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#fff' }}>{score == null ? '—' : `${score}/5`}</strong>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '.05em', color: 'rgba(255,255,255,.78)' }}>PERFORMANCE</span>
            </div>
            <div style={{ padding: '0.85rem 1rem', border: '1px solid rgba(255,255,255,.28)', borderRadius: '0.875rem', background: 'rgba(255,255,255,.13)', textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.5rem', color: '#fff' }}>{onboarding}%</strong>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '.05em', color: 'rgba(255,255,255,.78)' }}>ONBOARDING</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.25rem 1.75rem' }}>
        <div className="intern-detail-contact-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem 2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="intern-detail-contact-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem', color: 'var(--color-neutral-600)', fontSize: '0.84rem' }}>
            {profile.email && <a href={`mailto:${profile.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary-700)', textDecoration: 'none', fontWeight: 650 }}><RiMailLine /> {profile.email}</a>}
            {profile.phone && <a href={`tel:${profile.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'inherit', textDecoration: 'none' }}><RiPhoneLine /> {profile.phone}</a>}
            <span>{present(profile.university, 'Institution not provided')}{profile.major ? ` · ${profile.major}` : ''}</span>
          </div>
          <div className="intern-detail-header-actions" style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            <ActionButton icon={RiCheckboxCircleLine} onClick={() => navigate(`${ROUTES.SUPERVISOR_ONBOARDING}?intern=${encodeURIComponent(profile.id)}`)}>Review onboarding</ActionButton>
            <ActionButton primary icon={RiTaskLine} onClick={() => navigate(`${ROUTES.SUPERVISOR_TASKS}?action=new&intern=${encodeURIComponent(profile.id)}`)}>Assign task</ActionButton>
          </div>
        </div>

        {profile.internships?.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Internship history</span>
            {profile.internships.map((period) => (
              <span key={period.id} style={{ padding: '0.3rem 0.65rem', borderRadius: 999, background: period.status === 'active' ? 'var(--color-primary-50)' : 'var(--color-neutral-100)', color: period.status === 'active' ? 'var(--color-primary-700)' : 'var(--color-neutral-600)', fontSize: '0.75rem', fontWeight: 700 }}>
                {period.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default InternProfileHeader;
