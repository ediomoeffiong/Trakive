/**
 * @file InternProfile.jsx
 * @description Detailed intern profile page for the Supervisor Portal.
 * Contains profile header, tab navigation, and 7 tab panels:
 * Overview | Tasks | Performance | Onboarding | Documents | Activity | Notes
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiTaskLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiCalendarCheckLine,
  RiArrowRightLine,
  RiAddCircleLine,
} from 'react-icons/ri';
import { useInternManagementStore } from '../../store/useInternManagementStore';
import { ROUTES } from '../../constants';
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
          icon: RiTaskLine, color: '#0284c7', bg: '#e0f2fe',
          label: 'Current Task', value: profile?.currentTask ?? '—', sub: 'In progress',
        },
        {
          icon: RiCalendarCheckLine, color: '#059669', bg: '#ecfdf5',
          label: 'Internship Duration', value: profile?.duration ?? '—', sub: `${profile?.startDate} to ${profile?.endDate}`,
        },
        {
          icon: RiCheckboxCircleLine, color: '#0891b2', bg: '#ecfeff',
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

const taskStatusStyle = (status = '') => {
  const normalized = String(status).toLowerCase();
  if (['completed', 'done', 'reviewed'].includes(normalized)) return { bg: '#dcfce7', text: '#15803d', label: 'Completed' };
  if (['ongoing', 'in_progress', 'in-progress'].includes(normalized)) return { bg: '#e0f2fe', text: '#0369a1', label: 'In Progress' };
  if (['blocked', 'not_done'].includes(normalized)) return { bg: '#fee2e2', text: '#b91c1c', label: 'Blocked' };
  return { bg: '#fef3c7', text: '#b45309', label: 'Pending' };
};

// ── Tasks Tab ────────────────────────────────────────────────────────────────
const TasksTab = ({ profile, tasks, plans, isLoading, onAssignTask, onViewAllTasks }) => (
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
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
      <div>
        <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
          Tasks for {profile?.name || 'Intern'}
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} across {plans.length} weekly plan{plans.length !== 1 ? 's' : ''}.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          onClick={onAssignTask}
        >
          <RiAddCircleLine />
          Assign New Task
        </button>
        <button
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
          onClick={onViewAllTasks}
        >
          View All Tasks
          <RiArrowRightLine />
        </button>
      </div>
    </div>

    {isLoading ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={{ height: 72, borderRadius: '0.75rem', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }} />
        ))}
      </div>
    ) : tasks.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: 'var(--color-neutral-50)', borderRadius: '0.875rem', border: '1px dashed var(--color-neutral-200)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', margin: '0 auto 1rem' }}>
          <RiTaskLine />
        </div>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>No tasks assigned yet</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>Assign the first task from Task Management.</p>
      </div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.slice(0, 8).map((task) => {
          const status = taskStatusStyle(task.status);
          return (
            <div
              key={`${task.planId || 'plan'}-${task.id}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '0.875rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--color-neutral-200)',
                background: 'var(--color-neutral-50)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 800, color: 'var(--color-neutral-900)', fontSize: '0.9rem' }}>{task.title}</p>
                <p style={{ margin: '0.2rem 0 0', color: 'var(--color-neutral-500)', fontSize: '0.75rem' }}>
                  Week: {task.weekStart || 'N/A'} {task.dueDate ? `· Due ${task.dueDate}` : ''}
                </p>
              </div>
              <span style={{ alignSelf: 'center', padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800, background: status.bg, color: status.text }}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    )}
  </motion.div>
);

// ── Onboarding Placeholder Tab ────────────────────────────────────────────────
const OnboardingTab = ({ profile, progress, onOpenOnboarding }) => (
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
        { label: 'Overall Onboarding', value: `${progress?.onboardingCompletion?.percentage ?? profile?.onboardingProgress ?? 0}%`, color: '#0284c7', bg: '#e0f2fe' },
        { label: 'Modules Completed', value: progress ? `${progress.onboardingCompletion.completed}/${progress.onboardingCompletion.total}` : '—', color: '#059669', bg: '#ecfdf5' },
        { label: 'Reviews Passed', value: progress ? `${progress.reviewCompletion.completed}/${progress.reviewCompletion.total}` : '—', color: '#0891b2', bg: '#ecfeff' },
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
      onClick={onOpenOnboarding}
    >
      <RiCheckboxCircleLine style={{ marginRight: '0.375rem' }} />
      Approve Onboarding Steps
    </button>
  </motion.div>
);

// ── Main InternProfile Page ───────────────────────────────────────────────────
const InternProfilePage = () => {
  const { internId } = useParams();
  const navigate = useNavigate();

  const {
    internProfile,
    progress,
    documents,
    notes,
    activity,
    performance,
    tasks,
    weeklyPlans,
    activeTab,
    loading,
    loadInternProfile,
    loadInternProgress,
    loadInternDocuments,
    loadInternActivity,
    loadInternPerformance,
    loadInternTasks,
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
      case 'tasks':
        if (tasks.length === 0) loadInternTasks(internId);
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

  const taskQuery = `intern=${encodeURIComponent(internId || '')}`;

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
            <TasksTab
              profile={internProfile}
              tasks={tasks}
              plans={weeklyPlans}
              isLoading={loading.tasks}
              onAssignTask={() => navigate(`${ROUTES.SUPERVISOR_TASKS}?action=new&${taskQuery}`)}
              onViewAllTasks={() => navigate(`${ROUTES.SUPERVISOR_TASKS}?tab=weekly&${taskQuery}`)}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceSnapshot
              performance={performance}
              isLoading={loading.performance}
            />
          )}

          {activeTab === 'onboarding' && (
            <OnboardingTab
              profile={internProfile}
              progress={progress}
              onOpenOnboarding={() => navigate(`${ROUTES.SUPERVISOR_ONBOARDING}?${taskQuery}`)}
            />
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
