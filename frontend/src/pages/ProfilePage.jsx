/**
 * @file ProfilePage.jsx
 * @description User Profile & Account Management page.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../store/useProfileStore';
import {
  ProfileHeader,
  ProfileCompletionCard,
  PersonalInfoForm,
  AvatarUploadModal,
  InternshipInfoCard,
  SkillsSection,
  AchievementsSection,
  DocumentsSection,
  SecurityOverview,
  AccountActivityTimeline,
} from '../components/profile';
import { ProfileHeaderSkeleton } from '../components/profile/ProfileSkeletons';

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

const OverviewTab = ({ completion, setActiveTab }) => {
  const { profile, skills, internship } = useProfileStore();

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
            <DetailRow label="Location" value={[profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ')} />
            <DetailRow label="Date of Birth" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : ''} />
          </div>
        </div>

        <div className="card p-6">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '1rem' }}>
            Internship
          </h3>
          <div style={{ display: 'grid', gap: '0.625rem' }}>
            <DetailRow label="Employee ID" value={internship?.employeeId} />
            <DetailRow label="Department" value={internship?.department} />
            <DetailRow label="Supervisor" value={internship?.supervisor?.name} />
            <DetailRow label="Duration" value={`${formatDate(internship?.startDate)} - ${formatDate(internship?.endDate)}`} />
            <DetailRow label="Location" value={internship?.workLocation} />
          </div>
        </div>
      </div>

      <ProfileCompletionCard
        completion={completion}
        onActionClick={(key) => {
          const tabMap = {
            avatar: () => useProfileStore.getState().setAvatarModalOpen(true),
            personal_info: () => setActiveTab('personal'),
            bio: () => setActiveTab('personal'),
            skills: () => setActiveTab('skills'),
            documents: () => setActiveTab('documents'),
            id_document: () => setActiveTab('documents'),
          };
          tabMap[key]?.();
        }}
      />

      {skills.length > 0 && (
        <div className="card p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
              Top Skills
            </h3>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }} onClick={() => setActiveTab('skills')}>
              View all
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.625rem' }}>
            {skills.slice(0, 6).map((skill) => (
              <div
                key={skill.id}
                style={{
                  background: 'var(--color-neutral-50)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{skill.name}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>{skill.percentage}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${skill.percentage}%`, height: '100%', background: skill.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab completion={completion} setActiveTab={setActiveTab} />;
      case 'personal':
        return <PersonalInfoForm />;
      case 'internship':
        return <InternshipInfoCard />;
      case 'skills':
        return <SkillsSection />;
      case 'achievements':
        return <AchievementsSection />;
      case 'documents':
        return <DocumentsSection />;
      case 'security':
        return <SecurityOverview />;
      case 'activity':
        return <AccountActivityTimeline />;
      default:
        return null;
    }
  };

  return (
    <motion.div className="profile-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <h1 className="sr-only">My Profile - Trakive</h1>

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
        .profile-about-card {
          position: relative;
        }

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
          .overview-grid {
            grid-template-columns: 1fr !important;
          }

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
