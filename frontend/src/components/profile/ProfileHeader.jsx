import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiBriefcase,
  FiCamera,
  FiChevronDown,
  FiCopy,
  FiEdit2,
  FiMapPin,
  FiMoreHorizontal,
  FiShield,
} from 'react-icons/fi';
import { useProfileStore } from '../../store/useProfileStore';
import ProfileAtAGlance from './ProfileAtAGlance';

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
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity' },
  { key: 'security', label: 'Security' },
];

const ADMIN_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'personal', label: 'Personal Info' },
  { key: 'documents', label: 'Documents' },
  { key: 'activity', label: 'Activity' },
  { key: 'security', label: 'Security' },
];

const STATUS_CONFIG = {
  Active: { tone: 'success', label: 'Active' },
  Completed: { tone: 'primary', label: 'Completed' },
  Paused: { tone: 'warning', label: 'Paused' },
  Pending: { tone: 'neutral', label: 'Pending' },
};

const getInitials = (profile) => {
  if (!profile?.fullName) return 'NU';

  return profile.fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;

  return (
    <span className={`profile-status-badge profile-status-badge-${config.tone}`}>
      <span aria-hidden="true" />
      {config.label}
    </span>
  );
};

const TabButton = ({ tab, isActive, onClick }) => (
  <button
    id={`profile-tab-${tab.key}`}
    className="profile-tab-button"
    onClick={onClick}
    role="tab"
    aria-selected={isActive}
    type="button"
  >
    {tab.label}
    {isActive && (
      <motion.span
        className="profile-tab-indicator"
        layoutId="profile-tab-indicator"
        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
      />
    )}
  </button>
);

const HeaderMetaItem = ({ icon: Icon, children }) => {
  if (!children) return null;

  return (
    <span className="profile-header-meta-item">
      <Icon aria-hidden="true" />
      {children}
    </span>
  );
};

const ProfileHeader = ({ completion, isSupervisorOverride = false }) => {
  const { profile, activeTab, setActiveTab, setAvatarModalOpen } = useProfileStore();
  const [moreOpen, setMoreOpen] = useState(false);

  const role = profile?.role;
  const isSupervisor = isSupervisorOverride || role === 'Supervisor';
  const isAdminProfile = role === 'HR Administrator' || role === 'Department Head';
  const tabs = isSupervisor ? SUPERVISOR_TABS : isAdminProfile ? ADMIN_TABS : INTERN_TABS;

  const completionPct = completion?.percentage ?? 0;
  const completionTone =
    completionPct >= 80 ? 'success' : completionPct >= 50 ? 'warning' : 'danger';

  const titleLine = [profile?.jobTitle || role, profile?.department].filter(Boolean).join(' / ');
  const locationLine = [profile?.city, profile?.state || profile?.country]
    .filter(Boolean)
    .join(', ');

  const handleCopyId = async () => {
    if (profile?.employeeId) {
      await navigator.clipboard?.writeText(profile.employeeId);
    }
    setMoreOpen(false);
  };

  const menuItems = [
    {
      label: 'Change Photo',
      icon: FiCamera,
      action: () => {
        setAvatarModalOpen(true);
        setMoreOpen(false);
      },
      show: true,
    },
    {
      label: 'Copy Employee ID',
      icon: FiCopy,
      action: handleCopyId,
      show: Boolean(profile?.employeeId),
    },
    {
      label: 'Security Settings',
      icon: FiShield,
      action: () => {
        setActiveTab('security');
        setMoreOpen(false);
      },
      show: true,
    },
  ].filter((item) => item.show);

  return (
    <motion.section
      className="card profile-header-card"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      aria-labelledby="profile-heading"
    >
      <div className="profile-header-main">
        <button
          className="profile-avatar-button"
          type="button"
          onClick={() => setAvatarModalOpen(true)}
          aria-label="Change profile photo"
        >
          <span
            className="profile-avatar-ring"
            data-tone={completionTone}
            style={{ '--profile-completion': `${completionPct}%` }}
          >
            <span className="profile-avatar-progress" />
            <span className="profile-avatar">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile?.fullName || 'Profile avatar'} />
              ) : (
                getInitials(profile)
              )}
            </span>
          </span>
          <span className="profile-avatar-camera" aria-hidden="true">
            <FiCamera />
          </span>
        </button>

        <div className="profile-header-identity">
          <div className="profile-header-title-row">
            <div className="profile-header-title-copy">
              <p className="profile-header-eyebrow">
                {profile?.organization || 'Trakive'}
                {profile?.employeeId ? ` / ${profile.employeeId}` : ''}
              </p>
              <h2 id="profile-heading">{profile?.fullName || 'New User'}</h2>
            </div>
            <StatusBadge status={profile?.status ?? 'Pending'} />
          </div>

          <div className="profile-header-meta">
            <HeaderMetaItem icon={FiBriefcase}>{titleLine}</HeaderMetaItem>
            <HeaderMetaItem icon={FiMapPin}>{locationLine}</HeaderMetaItem>
          </div>

          <div className="profile-completion-row">
            <div
              className="profile-completion-track"
              role="progressbar"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={completionPct}
              aria-label="Profile completion"
            >
              <motion.span
                className={`profile-completion-fill profile-completion-${completionTone}`}
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
            <span className={`profile-completion-label profile-completion-text-${completionTone}`}>
              {completionPct}% complete
            </span>
          </div>
        </div>

        <div className="profile-header-actions">
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => setActiveTab('personal')}
            id="edit-profile-btn"
          >
            <FiEdit2 aria-hidden="true" />
            Edit Profile
          </button>

          <div className="profile-more-menu-wrap">
            <button
              className="btn btn-outline btn-sm btn-icon profile-more-button"
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              aria-label="More profile actions"
              aria-expanded={moreOpen}
            >
              <FiMoreHorizontal aria-hidden="true" />
              <FiChevronDown aria-hidden="true" className="profile-more-chevron" />
            </button>

            {moreOpen && (
              <>
                <button
                  className="profile-menu-scrim"
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="profile-actions-menu" role="menu">
                  {menuItems.map((item) => (
                    <button key={item.label} type="button" onClick={item.action} role="menuitem">
                      <item.icon aria-hidden="true" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ProfileAtAGlance />

      <div className="profile-tabs-scroll" role="tablist" aria-label="Profile sections">
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default ProfileHeader;
