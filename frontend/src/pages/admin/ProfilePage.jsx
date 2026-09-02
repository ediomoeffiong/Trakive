/**
 * @file ProfilePage.jsx
 * @description HR Administrator profile and account management page.
 * Revamped: content-driven card heights, InfoRow layout, clean empty states.
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

// ── Shared InfoRow ────────────────────────────────────────────────────────────

const InfoRow = ({ label, value, placeholder }) => {
  const display = value || null;
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid var(--color-neutral-100)',
    }}>
      <span style={{ fontSize: '0.775rem', color: 'var(--color-neutral-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: '0.8125rem',
        color: display ? 'var(--color-neutral-700)' : 'var(--color-neutral-400)',
        fontWeight: display ? 500 : 400,
        textAlign: 'right',
        fontStyle: display ? 'normal' : 'italic',
      }}>
        {display ?? (placeholder || 'Not provided')}
      </span>
    </div>
  );
};

// ── HR Overview Tab ───────────────────────────────────────────────────────────

const HROverviewTab = ({ setActiveTab }) => {
  const { profile } = useProfileStore();

  const locationStr = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        className="overview-grid"
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.25rem', alignItems: 'start' }}
      >
        {/* About card */}
        <div className="card p-6 profile-about-card" tabIndex={0}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>About</h3>
            <button
              className="btn btn-outline btn-sm profile-about-edit"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setActiveTab('personal')}
            >
              Edit
            </button>
          </div>

          {/* Bio */}
          {profile?.bio ? (
            <p style={{ fontSize: '0.8375rem', color: 'var(--color-neutral-600)', lineHeight: 1.65, marginBottom: '0.875rem' }}>
              {profile.bio}
            </p>
          ) : (
            <div style={{
              marginBottom: '0.875rem',
              padding: '0.625rem 0.75rem',
              background: 'var(--color-neutral-50)',
              border: '1px dashed var(--color-neutral-200)',
              borderRadius: '0.5rem',
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>No bio added yet.</p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', marginTop: '0.25rem', padding: '0.2rem 0' }}
                onClick={() => setActiveTab('personal')}
              >
                Add a short bio →
              </button>
            </div>
          )}

          <div>
            <InfoRow label="Email" value={profile?.email} placeholder="No email set" />
            <InfoRow label="Phone" value={profile?.phone} placeholder="No phone number added" />
            <InfoRow
              label="Role"
              value={`${profile?.jobTitle || profile?.role || 'HR Administrator'}${profile?.department ? ` (${profile.department})` : ''}`}
            />
            <InfoRow label="Location" value={locationStr || null} placeholder="No location added" />
          </div>
        </div>

        {/* HR Details card */}
        <div className="card p-6">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)', marginBottom: '0.875rem' }}>
            HR Details
          </h3>
          <div>
            <InfoRow label="Employee ID" value={profile?.employeeId} />
            <InfoRow label="Role" value={profile?.role} />
            <InfoRow label="Department" value={profile?.department} />
            <InfoRow label="Work Location" value={profile?.workLocation} />
            <InfoRow label="Account Status" value={profile?.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const HRProfilePage = () => {
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
    fetchAll('HR Administrator');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <HROverviewTab setActiveTab={setActiveTab} />;
      case 'personal':
        return <PersonalInfoForm />;
      case 'documents':
        return <DocumentsSection />;
      case 'activity':
        return <AccountActivityTimeline />;
      case 'security':
        return <SecurityOverview />;
      default:
        return <HROverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <motion.div className="profile-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <h1 className="sr-only">HR Administrator Profile - Trakive</h1>

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

export default HRProfilePage;
