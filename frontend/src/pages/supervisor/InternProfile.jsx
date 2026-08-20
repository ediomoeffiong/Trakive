/**
 * @file InternProfile.jsx
 * @description Detailed intern profile page for the Supervisor Portal.
 * Contains profile header, tab navigation, and 7 tab panels:
 * Overview | Tasks | Performance | Onboarding | Documents | Activity | Notes
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiTaskLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCalendarCheckLine,
} from 'react-icons/ri';
import { useInternManagementStore } from '../../store/useInternManagementStore';
import {
  InternProfileHeader,
  InternProfileTabs,
  ProgressWidgets,
  PerformanceSnapshot,
  ActivityTimeline,
  DocumentsOverview,
  SupervisorNotes,
} from '../../components/supervisor/intern-management';
import { InternProfileHeaderLoader, InternTabsLoader } from '../../components/supervisor/intern-management/InternSkeletonLoaders';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const tabPanelVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ profile, progress, isLoadingProgress }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    {/* Quick Info Cards */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
      {[
        {
          icon: RiTaskLine, color: '#4f46e5', bg: '#eef2ff',
          label: 'Current Task', value: profile?.currentTask ?? '—', sub: 'In progress',
        },
        {
          icon: RiCalendarCheckLine, color: '#059669', bg: '#ecfdf5',
          label: 'Internship Duration', value: profile?.duration ?? '—', sub: `${profile?.startDate} → ${profile?.endDate}`,
        },
        {
          icon: RiCheckboxCircleLine, color: '#7c3aed', bg: '#faf5ff',
          label: 'Batch', value: profile?.batch ?? '—', sub: profile?.contractType,
        },
        {
          icon: RiAlertLine, color: '#d97706', bg: '#fffbeb',
          label: 'University', value: profile?.university ? profile.university.split(' ').slice(0, 2).join(' ') : '—',
          sub: profile?.major,
        },
      ].map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            style={{
              background: '#fff',
              borderRadius: '0.875rem',
              padding: '1.125rem',
              border: '1px solid var(--color-neutral-200)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '0.625rem',
                background: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
            >
              <Icon />
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>{item.label}</p>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.value}
              </p>
              {item.sub && (
                <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{item.sub}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* Progress Section */}
    <ProgressWidgets progress={progress} isLoading={isLoadingProgress} />
  </div>
);

// ── Tasks Placeholder Tab ─────────────────────────────────────────────────────
const TasksTab = ({ profile }) => (
  <motion.div
    variants={tabPanelVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid var(--color-neutral-200)',
      textAlign: 'center',
    }}
  >
    <div style={{ maxWidth: '380px', margin: '0 auto', padding: '2rem 0' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#eef2ff',
          color: '#4f46e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <RiTaskLine />
      </div>
      <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
        Task Management
      </h4>
      <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
        Full task assignment, submission review, and feedback thread for{' '}
        <strong>{profile?.name}</strong> will be available in the Task Management module.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', justifyContent: 'center' }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '0.875rem' }}
          onClick={() => toast.success(`Opening task assignment for ${profile?.name}...`)}
        >
          Assign New Task
        </button>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem' }}
          onClick={() => toast.success(`Viewing all tasks for ${profile?.name}...`)}
        >
          View All Tasks
        </button>
      </div>
      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.875rem 1rem',
          background: 'var(--color-neutral-50)',
          borderRadius: '0.75rem',
          border: '1px solid var(--color-neutral-200)',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
          Current: {profile?.currentTask}
        </p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          In progress · Last active {profile?.lastActivity}
        </p>
      </div>
    </div>
  </motion.div>
);

// ── Onboarding Placeholder Tab ────────────────────────────────────────────────
const OnboardingTab = ({ profile, progress }) => (
  <motion.div
    variants={tabPanelVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid var(--color-neutral-200)',
    }}
  >
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={{ margin: '0 0 0.375rem 0', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
        Onboarding Progress
      </h4>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
        Full onboarding approval workflow will be available in the Onboarding module.
      </p>
    </div>

    {/* Progress summary */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
      {[
        { label: 'Overall Onboarding', value: `${profile?.onboardingProgress ?? 0}%`, color: '#4f46e5', bg: '#eef2ff' },
        { label: 'Modules Completed', value: progress ? `${progress.onboardingCompletion.completed}/${progress.onboardingCompletion.total}` : '—', color: '#059669', bg: '#ecfdf5' },
        { label: 'Reviews Passed', value: progress ? `${progress.reviewCompletion.completed}/${progress.reviewCompletion.total}` : '—', color: '#7c3aed', bg: '#faf5ff' },
      ].map((item, i) => (
        <div
          key={i}
          style={{
            padding: '1.125rem',
            borderRadius: '0.875rem',
            background: item.bg,
            border: `1px solid ${item.color}25`,
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.75rem', fontWeight: 900, color: item.color }}>{item.value}</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>{item.label}</p>
        </div>
      ))}
    </div>

    <button
      className="btn btn-primary"
      style={{ fontSize: '0.875rem' }}
      onClick={() => toast.success(`Opening onboarding approvals for ${profile?.name}...`)}
    >
      <RiCheckboxCircleLine style={{ marginRight: '0.375rem' }} />
      Approve Onboarding Steps
    </button>
  </motion.div>
);

// ── Main InternProfile Page ───────────────────────────────────────────────────
const InternProfilePage = () => {
  const { internId } = useParams();

  const {
    internProfile,
    progress,
    documents,
    notes,
    activity,
    performance,
    activeTab,
    loading,
    loadInternProfile,
    loadInternProgress,
    loadInternDocuments,
    loadInternActivity,
    loadInternPerformance,
    loadNotes,
    saveNote,
    deleteNote,
    pinNote,
    setActiveTab,
    resetProfileData,
  } = useInternManagementStore();

  // Load profile & overview data on mount
  useEffect(() => {
    if (internId) {
      loadInternProfile(internId);
      loadInternProgress(internId);
    }
    return () => resetProfileData();
  }, [internId]);

  // Lazy-load tab data on tab change
  useEffect(() => {
    if (!internId) return;
    switch (activeTab) {
      case 'performance':
        if (!performance) loadInternPerformance(internId);
        break;
      case 'documents':
        if (documents.length === 0) loadInternDocuments(internId);
        break;
      case 'activity':
        if (activity.length === 0) loadInternActivity(internId);
        break;
      case 'notes':
        if (notes.length === 0) loadNotes(internId);
        break;
      default:
        break;
    }
  }, [activeTab, internId]);

  if (loading.profile && !internProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '3rem' }}>
        <InternProfileHeaderLoader />
        <InternTabsLoader />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '5rem' }}
    >
      {/* Profile Header */}
      <InternProfileHeader profile={internProfile} performance={performance} />

      {/* Tab Navigation */}
      <InternProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Panel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabPanelVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {activeTab === 'overview' && (
            <OverviewTab
              profile={internProfile}
              progress={progress}
              isLoadingProgress={loading.progress}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksTab profile={internProfile} />
          )}

          {activeTab === 'performance' && (
            <PerformanceSnapshot
              performance={performance}
              isLoading={loading.performance}
            />
          )}

          {activeTab === 'onboarding' && (
            <OnboardingTab profile={internProfile} progress={progress} />
          )}

          {activeTab === 'documents' && (
            <DocumentsOverview
              documents={documents}
              isLoading={loading.documents}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityTimeline
              activities={activity}
              isLoading={loading.activity}
            />
          )}

          {activeTab === 'notes' && (
            <SupervisorNotes
              notes={notes}
              isLoading={loading.notes}
              internId={internId}
              onSaveNote={saveNote}
              onDeleteNote={deleteNote}
              onPinNote={pinNote}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default InternProfilePage;
