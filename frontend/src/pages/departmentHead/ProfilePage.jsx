/**
 * @file ProfilePage.jsx
 * @description Department Head profile and account management page.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../../store/useProfileStore';
import {
  ProfileHeader,
  PersonalInfoForm,
  AvatarUploadModal,
  DocumentsSection,
  SecurityOverview,
  AccountActivityTimeline,
} from '../../components/profile';
import { ProfileHeaderSkeleton } from '../../components/profile/ProfileSkeletons';

const tabPanelVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const formatDate = (str) => {
  if (!str) return '-';
  try {
    return new Date(str).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return str;
  }
};

const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
    <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
      {label}
    </span>
    <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)', fontWeight: 500 }}>
      {value || '-'}
    </span>
  </div>
);

const DeptHeadOverviewTab = ({ setActiveTab }) => {
  const { profile } = useProfileStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.25rem' }}
        className="overview-grid"
      >
        <div className="card p-6 profile-about-card" tabIndex={0}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
              About
            </h3>
            <button className="btn btn-outline btn-sm profile-about-edit" onClick={() => setActiveTab('personal')}>
              Edit
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            {profile?.bio || 'No bio added yet.'}
          </p>
          <div style={{ display: 'grid', gap: '0.625rem' }}>
            <DetailRow label="Email" value={profile?.email} />
            <DetailRow label="Phone" value={profile?.phone} />
            <DetailRow label="Role" value={`${profile?.jobTitle || profile?.role || 'Department Head'}${profile?.department ? ` (${profile.department})` : ''}`} />
            <DetailRow label="Location" value={[profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ')} />
            <DetailRow label="Date Joined" value={profile?.dateJoined ? formatDate(profile.dateJoined) : ''} />
          </div>
        </div>

        <div className="card p-6">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '1rem' }}>
            Department Head Details
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <DetailRow label="Employee ID" value={profile?.employeeId} />
            <DetailRow label="Role" value={profile?.role} />
            <DetailRow label="Department" value={profile?.department} />
            <DetailRow label="Work Location" value={profile?.workLocation} />
            <DetailRow label="Account Status" value={profile?.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const {
    loadingProfile,
    completion,
    activeTab,
    setActiveTab,
    avatarModalOpen,
    setAvatarModalOpen,
    fetchAll,
  } = useProfileStore();

  useEffect(() => {
    fetchAll('Department Head');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DeptHeadOverviewTab setActiveTab={setActiveTab} />;
      case 'personal':
        return <PersonalInfoForm />;
      case 'documents':
        return <DocumentsSection />;
      case 'activity':
        return <AccountActivityTimeline />;
      case 'security':
        return <SecurityOverview />;
      default:
        return <DeptHeadOverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <motion.div className="profile-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <h1 className="sr-only">Department Head Profile - Trakive</h1>

      {loadingProfile ? <ProfileHeaderSkeleton /> : <ProfileHeader completion={completion} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabPanelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {avatarModalOpen && <AvatarUploadModal onClose={() => setAvatarModalOpen(false)} />}
      </AnimatePresence>

      <style>{`
        .profile-about-card { position: relative; }
        .profile-about-edit {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-2px);
          transition: opacity 0.16s ease, transform 0.16s ease;
        }
        .profile-about-card:hover .profile-about-edit,
        .profile-about-card:focus-within .profile-about-edit {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          .overview-grid { grid-template-columns: 1fr !important; }
          .profile-about-edit {
            opacity: 1;
            pointer-events: auto;
            transform: none;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ProfilePage;
