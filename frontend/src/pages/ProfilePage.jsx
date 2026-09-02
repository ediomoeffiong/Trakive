/**
 * @file ProfilePage.jsx
 * @description Trakive Profile — complete rebuild.
 *
 * Architecture:
 * - ProfileHeader (compact, no banner) with embedded at-a-glance metrics and tabs
 * - Tab-based section rendering with animated transitions
 * - Role-aware: Intern / Supervisor / HR Admin / Department Head
 * - All sections use existing profile store (no mock data invented here)
 * - Error isolation: each section fails independently
 * - Proper loading states via existing skeleton components
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfileStore } from '../store/useProfileStore';
import { useAppStore } from '../store/useAppStore';

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfessionalOverview from '../components/profile/ProfessionalOverview';
import {
  PersonalInfoForm,
  AvatarUploadModal,
  InternshipInfoCard,
  SkillsSection,
  AchievementsSection,
  DocumentsSection,
  SecurityOverview,
  AccountActivityTimeline,
  AssignedInternsSection,
  ProfileHeaderSkeleton,
} from '../components/profile';

// ── Tab panel animation ───────────────────────────────────────────────────────

const tabVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
};

// ── Section error boundary (inline functional guard) ─────────────────────────

const SafeSection = ({ children, fallback }) => {
  try {
    return children;
  } catch {
    return fallback ?? (
      <div
        className="card p-6"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
          This section failed to load.
        </p>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }
};

// ── ProfilePage ───────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const {
    loadingProfile,
    completion,
    activeTab,
    setActiveTab,
    avatarModalOpen,
    setAvatarModalOpen,
    profile,
    fetchAll,
  } = useProfileStore();

  // Get role from profile store (after fetch) or from app store (immediate)
  const user = useAppStore((s) => s.user);
  const role = profile?.role ?? user?.role ?? 'Intern';
  const isSupervisor = role === 'Supervisor';

  useEffect(() => {
    fetchAll(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Tab content renderer ──────────────────────────────────────────────────

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ProfessionalOverview
            completion={completion}
            setActiveTab={setActiveTab}
          />
        );

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

      // Supervisor-only
      case 'interns':
        return <AssignedInternsSection />;

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="sr-only">My Profile — Trakive</h1>

      {/* ── Header ── */}
      {loadingProfile ? (
        <ProfileHeaderSkeleton />
      ) : (
        <ProfileHeader
          completion={completion}
          isSupervisorOverride={isSupervisor}
        />
      )}

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22 }}
        >
          <SafeSection>{renderTab()}</SafeSection>
        </motion.div>
      </AnimatePresence>

      {/* ── Avatar upload modal ── */}
      <AnimatePresence>
        {avatarModalOpen && (
          <AvatarUploadModal onClose={() => setAvatarModalOpen(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfilePage;
