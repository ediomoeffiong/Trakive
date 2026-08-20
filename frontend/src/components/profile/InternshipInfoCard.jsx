/**
 * @file InternshipInfoCard.jsx
 * @description Displays internship details (ID, department, supervisor, dates, location, status)
 * using a clean reusable information card grid.
 */

import { motion } from 'framer-motion';
import { useProfileStore } from '../../store/useProfileStore';
import { InfoCardsSkeleton } from './ProfileSkeletons';

const InfoItem = ({ label, value, valueColor }) => (
  <div
    style={{
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-neutral-200)',
      borderRadius: '0.75rem',
      padding: '0.875rem 1rem',
    }}
  >
    <p
      style={{
        fontSize: '0.71rem',
        color: 'var(--color-neutral-500)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginBottom: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
      }}
    >
      {label}
    </p>
    <p
      style={{
        fontSize: '0.9rem',
        fontWeight: 600,
        color: valueColor ?? 'var(--color-neutral-800)',
      }}
    >
      {value || '—'}
    </p>
  </div>
);

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
};

const InternshipInfoCard = () => {
  const { internship, loadingInternship } = useProfileStore();

  if (loadingInternship) return <InfoCardsSkeleton />;

  if (!internship) return null;

  const formatDate = (str) => {
    if (!str) return '—';
    try {
      return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return str;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Internship Details Card ─────────────────────────────── */}
      <div className="card p-6 mb-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Internship Details</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
              Your current placement information
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <InfoItem label="Employee ID"   value={internship.employeeId} />
          <InfoItem label="Department"    value={internship.department} />
          <InfoItem label="Team"          value={internship.team} />
          <InfoItem label="Organisation"  value={internship.organization} />
          <InfoItem label="Start Date"    value={formatDate(internship.startDate)} />
          <InfoItem label="End Date"      value={formatDate(internship.endDate)} />
          <InfoItem
            label="Status"
            value={internship.status}
            valueColor={internship.statusColor}
          />
          <InfoItem label="Work Location"  value={internship.workLocation} />
          <InfoItem label="Work Hours"    value={internship.workHours} />
          <InfoItem label="Days / Week"   value={`${internship.daysPerWeek} days`} />
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: '1.25rem',
            background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.75rem',
            padding: '0.875rem 1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
              Internship Progress
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
              {internship.completionPercentage}%
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${internship.completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))',
                borderRadius: 99,
              }}
            />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.375rem' }}>
            {internship.weeksCompleted} of {internship.durationWeeks} weeks completed ·{' '}
            {internship.weeksRemaining} week{internship.weeksRemaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </div>

      {/* ── Supervisor Card ─────────────────────────────────────── */}
      <div className="card p-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Supervisor</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
              Your direct reporting manager
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Supervisor avatar */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {getInitials(internship.supervisor?.name)}
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
              {internship.supervisor?.name}
            </p>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-neutral-500)', marginTop: 1 }}>
              {internship.supervisor?.title}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
              <a
                href={`mailto:${internship.supervisor?.email}`}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-primary-600)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {internship.supervisor?.email}
              </a>
              <a
                href={`tel:${internship.supervisor?.phone}`}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-primary-600)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                {internship.supervisor?.phone}
              </a>
            </div>
          </div>
        </div>

        {/* HR Contact */}
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'var(--color-neutral-50)',
            borderRadius: '0.75rem',
            border: '1px solid var(--color-neutral-200)',
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-600)', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            HR Contact
          </p>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
            {internship.hrContact?.name} · {internship.hrContact?.title}
          </p>
          <a
            href={`mailto:${internship.hrContact?.email}`}
            style={{ fontSize: '0.8125rem', color: 'var(--color-primary-600)', textDecoration: 'none' }}
          >
            {internship.hrContact?.email}
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default InternshipInfoCard;
