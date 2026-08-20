/**
 * @file ProfileHeader.jsx
 * @description Profile header with avatar, role summary, quick statistics, and tab navigation.
 */

import { motion } from 'framer-motion';
import { useProfileStore } from '../../store/useProfileStore';

const INTERN_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'internship', label: 'Internship' },
  { key: 'skills', label: 'Skills' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'documents', label: 'Documents' },
  { key: 'security', label: 'Security' },
  { key: 'activity', label: 'Activity' },
];

const SUPERVISOR_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'interns', label: 'Assigned Interns' },
  { key: 'activity', label: 'Activity' },
  { key: 'documents', label: 'Documents' },
  { key: 'security', label: 'Security' },
];

const ADMIN_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity' },
  { key: 'security', label: 'Security' },
];

const getInitials = (profile) => {
  if (!profile?.fullName) return '?';
  return profile.fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const ProfileHeader = ({ completion, isSupervisorOverride = false }) => {
  const {
    profile,
    internship,
    assignedInterns,
    skills,
    documents,
    activeTab,
    setActiveTab,
    setAvatarModalOpen,
  } = useProfileStore();

  const role = profile?.role;
  const isSupervisor = isSupervisorOverride || role === 'Supervisor';
  const isAdminProfile = role === 'HR Administrator' || role === 'Department Head';
  const tabs = isSupervisor ? SUPERVISOR_TABS : isAdminProfile ? ADMIN_TABS : INTERN_TABS;

  const quickStats = isSupervisor
    ? [
        { label: 'Assigned Interns', value: assignedInterns?.stats?.totalAssigned ?? 0 },
        { label: 'Pending Reviews', value: assignedInterns?.stats?.pendingReviews ?? 0 },
        { label: 'Documents', value: documents?.length ?? 0 },
      ]
    : isAdminProfile
      ? [
          { label: 'Documents', value: documents.length },
          { label: 'Security', value: profile?.twoFactorEnabled ? '2FA On' : '2FA Off' },
          { label: 'Status', value: profile?.status ?? 'Pending' },
        ]
      : [
          { label: 'Skills', value: skills.length },
          { label: 'Documents', value: documents.length },
          { label: 'Progress', value: `${internship?.completionPercentage ?? 0}%` },
        ];

  const avatarGradient = isSupervisor
    ? 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)'
    : 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)';

  const effectiveCompletion = completion?.percentage ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card mb-6 profile-header-card"
      style={{ overflow: 'hidden' }}
    >
      <div
        style={{
          height: 96,
          background: isSupervisor
            ? 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)'
            : 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          position: 'relative',
        }}
      />

      <div style={{ padding: '0 1.5rem 1.25rem', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '1rem',
            marginTop: -40,
            marginBottom: '1rem',
          }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: '4px solid #fff',
                overflow: 'hidden',
                background: avatarGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                position: 'relative',
              }}
              onClick={() => setAvatarModalOpen(true)}
              role="button"
              aria-label="Change profile photo"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setAvatarModalOpen(true)}
            >
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile?.fullName || 'Profile avatar'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                  {getInitials(profile)}
                </span>
              )}
              <div className="avatar-edit-overlay">Edit</div>
            </motion.div>

            <svg
              style={{ position: 'absolute', top: -4, left: -4, pointerEvents: 'none' }}
              width={88}
              height={88}
              viewBox="0 0 88 88"
            >
              <circle cx={44} cy={44} r={41} fill="none" stroke="var(--color-neutral-200)" strokeWidth={3} />
              <motion.circle
                cx={44}
                cy={44}
                r={41}
                fill="none"
                stroke={effectiveCompletion >= 80 ? '#22c55e' : effectiveCompletion >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 41}
                initial={{ strokeDashoffset: 2 * Math.PI * 41 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 41 - (2 * Math.PI * 41 * effectiveCompletion) / 100 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                style={{ transformOrigin: '44px 44px', transform: 'rotate(-90deg)' }}
              />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                marginBottom: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profile?.fullName || 'New User'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
              {profile?.jobTitle || profile?.role || 'Intern'}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              {[profile?.department, profile?.organization].filter(Boolean).join(' - ') || 'Profile setup pending'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginLeft: 'auto', marginTop: '2.75rem' }}>
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--color-neutral-50)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: '0.625rem',
                  padding: '0.625rem 0.875rem',
                  textAlign: 'center',
                  minWidth: 84,
                }}
              >
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-800)', lineHeight: 1.2 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600, marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-success">{profile?.status ?? 'Pending'}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            ID: {profile?.employeeId || '-'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
            Location: {profile?.workLocation || '-'}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              border: '1px solid var(--color-primary-200)',
            }}
          >
            Role: {profile?.role || 'Intern'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '0.125rem' }} role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`profile-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.4375rem 0.875rem',
                borderRadius: '2rem',
                fontSize: '0.8125rem',
                fontWeight: activeTab === tab.key ? 700 : 500,
                border: activeTab === tab.key ? '1px solid var(--color-primary-600)' : '1px solid var(--color-neutral-200)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                background: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-neutral-50)',
                color: activeTab === tab.key ? '#fff' : 'var(--color-neutral-600)',
                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
              aria-selected={activeTab === tab.key}
              role="tab"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .avatar-edit-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.42);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          opacity: 0;
          transition: opacity 0.2s;
        }

        [role="button"]:hover .avatar-edit-overlay,
        [role="button"]:focus-visible .avatar-edit-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </motion.div>
  );
};

export default ProfileHeader;
