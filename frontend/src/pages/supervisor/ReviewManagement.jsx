/**
 * @file ReviewManagement.jsx
 * @description Supervisor Reviews & Approvals — unified main page.
 * Orchestrates all views: Dashboard, Submission Queue, Onboarding Approvals,
 * Schedule Review, and Review History tabs.
 * Consumes useSupervisorReviewStore exclusively for state and async operations.
 */

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiDashboardLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiCalendarCheckLine,
  RiHistoryLine,
  RiRefreshLine,
} from 'react-icons/ri';

import { useSupervisorReviewStore } from '../../store/useSupervisorReviewStore';

import {
  ReviewKPISummary,
  SubmissionQueueTable,
  SubmissionDetailsDrawer,
  ReviewFormModal,
  OnboardingApprovalsView,
  ReviewSchedulerModal,
  ReviewScheduleView,
  ReviewHistoryView,
  ReviewBulkActionToolbar,
} from '../../components/supervisor/reviews-approvals';

import { mockSupervisorSubmissions, mockOnboardingApprovals } from '../../data';

// ── Page transition ───────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2 } },
};

// ── Quick-stats mini widget (Dashboard tab) ───────────────────────────────────
const QuickStatsRow = ({ upcoming, history }) => {
  const items = [
    { label: 'Reviews This Week', value: upcoming.filter((r) => { const d = new Date(r.scheduledAt); const now = new Date(); const diff = (d - now) / (1000 * 60 * 60 * 24); return diff >= 0 && diff <= 7; }).length, color: '#4f46e5' },
    { label: 'Completed Reviews', value: history.length, color: '#10b981' },
    { label: 'Avg Score', value: history.filter((r) => r.score).length > 0 ? Math.round(history.filter((r) => r.score).reduce((a, b) => a + b.score, 0) / history.filter((r) => r.score).length) : '—', color: '#f59e0b' },
    { label: 'Approval Rate', value: history.length > 0 ? `${Math.round((history.filter((r) => r.decision === 'approved').length / history.length) * 100)}%` : '—', color: '#06b6d4' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem' }}>
      {items.map(({ label, value, color }) => (
        <div key={label} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', marginTop: '0.25rem' }}>{label}</div>
        </div>
      ))}
    </div>
  );
};

// ── Recent Activity Feed (Dashboard tab) ─────────────────────────────────────
const RecentReviewsActivity = ({ submissions, history }) => {
  const items = [
    ...submissions.filter((s) => s.status === 'pending-review').slice(0, 3).map((s) => ({
      id: s.id, type: 'pending', name: s.internName, task: s.taskTitle, time: s.submittedAt, color: '#f59e0b', bg: '#fffbeb',
    })),
    ...history.slice(0, 3).map((r) => ({
      id: r.id, type: r.decision, name: r.internName, task: r.taskTitle, time: r.reviewedAt,
      color: r.decision === 'approved' ? '#10b981' : r.decision === 'needs-revision' ? '#4f46e5' : '#ef4444',
      bg: r.decision === 'approved' ? '#ecfdf5' : r.decision === 'needs-revision' ? '#eef2ff' : '#fef2f2',
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6);

  const typeLabel = (t) => ({ pending: 'Pending', approved: 'Approved', 'needs-revision': 'Revision', rejected: 'Rejected' })[t] || t;

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Recent Review Activity</h3>
      {items.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>No recent activity.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((item) => (
            <motion.div key={item.id + item.type} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, marginTop: '5px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <strong>{item.name}</strong> · {item.task}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                  {new Date(item.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 800, background: item.bg, color: item.color, flexShrink: 0 }}>
                {typeLabel(item.type)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Tab definitions ───────────────────────────────────────────────────────────
const buildTabs = (pendingSubmissions, pendingOnboarding) => [
  { id: 'dashboard',   label: 'Dashboard',           icon: RiDashboardLine },
  { id: 'submissions', label: 'Submission Queue',     icon: RiFileTextLine,     badge: pendingSubmissions },
  { id: 'onboarding',  label: 'Onboarding Approvals', icon: RiShieldCheckLine,  badge: pendingOnboarding },
  { id: 'schedule',    label: 'Schedule Review',      icon: RiCalendarCheckLine },
  { id: 'history',     label: 'Review History',       icon: RiHistoryLine },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const ReviewManagementPage = () => {
  const {
    // State
    activeTab,
    kpis,
    submissions,
    totalSubmissions,
    totalPages,
    currentPage,
    pageSize,
    selectedSubmission,
    selectedSubmissionIds,
    filters,
    activeSort,
    onboardingQueue,
    scheduledReviews,
    reviewHistory,
    historyFilters,
    scheduleFormData,
    reviewDraft,
    isDetailsDrawerOpen,
    isReviewModalOpen,
    isSchedulerModalOpen,
    loading,
    errors,

    // Actions
    setActiveTab,
    setSearch,
    setFilter,
    setSort,
    setPage,
    clearFilters,
    toggleSelectSubmission,
    selectAllSubmissions,
    clearSelection,
    openDetailsDrawer,
    closeDetailsDrawer,
    openReviewModal,
    closeReviewModal,
    openSchedulerModal,
    closeSchedulerModal,
    setReviewDraft,
    setScheduleField,
    setHistoryFilter,
    clearHistoryFilters,

    // Async
    loadDashboard,
    fetchSubmissions,
    fetchOnboardingApprovals,
    fetchScheduledReviews,
    fetchReviewHistory,
    submitReview,
    saveReviewDraft: saveDraft,
    updateOnboardingStep,
    createScheduledReview,
    cancelScheduledReview,
    bulkAction,
  } = useSupervisorReviewStore();

  const upcomingReviews = useMemo(
    () =>
      (scheduledReviews || [])
        .filter((r) => r.status === 'upcoming')
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
    [scheduledReviews]
  );

  const completedReviews = useMemo(
    () =>
      (scheduledReviews || [])
        .filter((r) => r.status === 'completed')
        .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)),
    [scheduledReviews]
  );

  const pendingOnboardingCount = useMemo(
    () =>
      (onboardingQueue || []).reduce(
        (acc, intern) => acc + intern.steps.filter((s) => s.status === 'pending-review').length,
        0
      ),
    [onboardingQueue]
  );

  const pendingSubmissionsCount = (submissions || []).filter((s) => s.status === 'pending-review').length;
  const TABS = buildTabs(pendingSubmissionsCount, pendingOnboardingCount);

  // ── Initial & tab-driven data loading ─────────────────────────────────────
  useEffect(() => {
    loadDashboard();
    fetchReviewHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'submissions') fetchSubmissions();
    if (activeTab === 'onboarding') fetchOnboardingApprovals();
    if (activeTab === 'schedule') fetchScheduledReviews();
    if (activeTab === 'history') fetchReviewHistory();
  }, [activeTab]);

  // Interns list for scheduler (derived from onboarding queue or submissions)
  const internsList = useMemo(() => {
    const seen = new Set();
    return mockSupervisorSubmissions.reduce((acc, s) => {
      if (!seen.has(s.internId)) {
        seen.add(s.internId);
        acc.push({ internId: s.internId, internName: s.internName, department: s.internDepartment });
      }
      return acc;
    }, []);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleKPIClick = (filterKey) => {
    setActiveTab('submissions');
    setFilter('status', filterKey);
  };

  const handleSubmitReview = async (submissionId, data) => {
    try {
      await submitReview(submissionId, data);
      toast.success('Review submitted successfully!');
      fetchReviewHistory();
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
  };

  const handleSaveDraft = async (submissionId) => {
    try {
      await saveDraft(submissionId);
      toast.success('Draft saved.');
    } catch {
      toast.error('Failed to save draft.');
    }
  };

  const handleApproveOnboarding = async (internId, stepId, notes) => {
    try {
      await updateOnboardingStep(internId, stepId, 'approved', notes);
      toast.success('Step approved successfully!');
    } catch {
      toast.error('Failed to approve step.');
    }
  };

  const handleRejectOnboarding = async (internId, stepId, notes) => {
    try {
      await updateOnboardingStep(internId, stepId, 'rejected', notes);
      toast.success('Step rejected.');
    } catch {
      toast.error('Failed to reject step.');
    }
  };

  const handleScheduleReview = async () => {
    try {
      await createScheduledReview();
      toast.success('Review scheduled successfully!');
    } catch {
      toast.error('Failed to schedule review.');
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      await cancelScheduledReview(scheduleId);
      toast.success('Review cancelled.');
    } catch {
      toast.error('Failed to cancel review.');
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'export') {
      toast.success(`Exporting ${selectedSubmissionIds.length} submission(s)...`);
      clearSelection();
      return;
    }
    try {
      await bulkAction(action);
      const labels = { approve: 'Approved', reject: 'Rejected', 'request-revision': 'Revision requested for' };
      toast.success(`${labels[action] || 'Updated'} ${selectedSubmissionIds.length} submission(s).`);
    } catch {
      toast.error('Bulk action failed. Please try again.');
    }
  };

  // ── History filter with client-side search ─────────────────────────────────
  const filteredHistory = useMemo(() => {
    let data = reviewHistory;
    if (historyFilters.internSearch) {
      const q = historyFilters.internSearch.toLowerCase();
      data = data.filter((r) => r.internName.toLowerCase().includes(q));
    }
    if (historyFilters.department) data = data.filter((r) => r.internDepartment === historyFilters.department);
    if (historyFilters.decision) data = data.filter((r) => r.decision === historyFilters.decision);
    return data;
  }, [reviewHistory, historyFilters]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100vh', background: 'var(--color-neutral-50)', padding: '1.5rem', boxSizing: 'border-box' }}
    >
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.875rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
            <RiFileTextLine />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 900, color: 'var(--color-neutral-900)', lineHeight: 1.2 }}>
              Reviews & Approvals
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              Evaluate submissions, verify onboarding, and schedule 1-on-1s
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { loadDashboard(); fetchReviewHistory(); }}
            title="Refresh"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5625rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <RiRefreshLine style={{ fontSize: '1rem' }} />
          </motion.button>
          <motion.button
            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(79,70,229,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => openSchedulerModal()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5625rem 1.125rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(79,70,229,0.28)' }}
          >
            <RiCalendarCheckLine /> Schedule Review
          </motion.button>
        </div>
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 0, background: '#fff', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-200)', padding: '0.3rem', marginBottom: '1.5rem', overflowX: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {TABS.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <motion.button
              key={id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '0.625rem',
                border: 'none',
                background: isActive ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'transparent',
                color: isActive ? '#fff' : 'var(--color-neutral-500)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                flex: '0 0 auto',
                boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.25)' : 'none',
              }}
              id={`tab-${id}`}
            >
              <Icon style={{ fontSize: '1rem' }} />
              {label}
              {badge > 0 && (
                <span style={{ background: isActive ? 'rgba(255,255,255,0.25)' : '#fee2e2', color: isActive ? '#fff' : '#dc2626', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 800, padding: '0.1rem 0.4rem', minWidth: '18px', textAlign: 'center' }}>
                  {badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* ── DASHBOARD ────────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ReviewKPISummary kpis={kpis} isLoading={loading.dashboard} onKPIClick={handleKPIClick} />
            <QuickStatsRow upcoming={upcomingReviews} history={reviewHistory} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <RecentReviewsActivity submissions={submissions} history={reviewHistory} />
              {/* Upcoming reviews mini widget */}
              <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1.25rem', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Upcoming Reviews</h3>
                  <button onClick={() => setActiveTab('schedule')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '0.8125rem', fontWeight: 700 }}>View all →</button>
                </div>
                {upcomingReviews.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>No upcoming reviews scheduled.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {upcomingReviews.slice(0, 4).map((r) => (
                      <div key={r.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.625rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-100)' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.2)' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900, lineHeight: 1 }}>{new Date(r.scheduledAt).getDate()}</span>
                          <span style={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>{new Date(r.scheduledAt).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{r.internName} · {new Date(r.scheduledAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUBMISSION QUEUE ─────────────────────────────────────────────── */}
        {activeTab === 'submissions' && (
          <motion.div key="submissions" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <SubmissionQueueTable
              submissions={submissions}
              isLoading={loading.submissions}
              selectedIds={selectedSubmissionIds}
              onToggleSelect={toggleSelectSubmission}
              onSelectAll={selectAllSubmissions}
              onClearSelection={clearSelection}
              onView={openDetailsDrawer}
              onReview={openReviewModal}
              activeSort={activeSort}
              onSortChange={setSort}
              currentPage={currentPage}
              totalPages={totalPages}
              totalSubmissions={totalSubmissions}
              pageSize={pageSize}
              onPageChange={setPage}
              filters={filters}
              onSearch={setSearch}
              onFilterChange={setFilter}
              onClearFilters={clearFilters}
            />
          </motion.div>
        )}

        {/* ── ONBOARDING APPROVALS ─────────────────────────────────────────── */}
        {activeTab === 'onboarding' && (
          <motion.div key="onboarding" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <OnboardingApprovalsView
              queue={onboardingQueue}
              isLoading={loading.onboarding}
              actionLoading={loading.onboardingAction}
              onApprove={handleApproveOnboarding}
              onReject={handleRejectOnboarding}
            />
          </motion.div>
        )}

        {/* ── SCHEDULE REVIEW ──────────────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <motion.div key="schedule" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ReviewScheduleView
              upcoming={upcomingReviews}
              completed={completedReviews}
              isLoading={loading.schedule}
              actionLoading={loading.scheduleAction}
              onScheduleNew={() => openSchedulerModal()}
              onCancel={handleCancelSchedule}
            />
          </motion.div>
        )}

        {/* ── REVIEW HISTORY ───────────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <motion.div key="history" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <ReviewHistoryView
              history={filteredHistory}
              isLoading={loading.history}
              filters={historyFilters}
              onFilterChange={setHistoryFilter}
              onClearFilters={clearHistoryFilters}
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Floating Bulk Action Toolbar ─────────────────────────────────────── */}
      <ReviewBulkActionToolbar
        selectedCount={selectedSubmissionIds.length}
        onClear={clearSelection}
        onAction={handleBulkAction}
        isLoading={loading.bulkAction}
      />

      {/* ── Submission Details Drawer ─────────────────────────────────────────── */}
      <SubmissionDetailsDrawer
        isOpen={isDetailsDrawerOpen}
        submission={selectedSubmission}
        isLoading={false}
        onClose={closeDetailsDrawer}
        onReview={(sub) => { closeDetailsDrawer(); openReviewModal(sub); }}
      />

      {/* ── Review Form Modal ─────────────────────────────────────────────────── */}
      <ReviewFormModal
        isOpen={isReviewModalOpen}
        submission={selectedSubmission}
        draft={reviewDraft}
        isLoading={loading.reviewAction}
        onClose={closeReviewModal}
        onDraftChange={setReviewDraft}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmitReview}
      />

      {/* ── Review Scheduler Modal ─────────────────────────────────────────────── */}
      <ReviewSchedulerModal
        isOpen={isSchedulerModalOpen}
        formData={scheduleFormData}
        interns={internsList}
        isLoading={loading.scheduleAction}
        onClose={closeSchedulerModal}
        onChange={setScheduleField}
        onSubmit={handleScheduleReview}
      />
    </motion.div>
  );
};

export default ReviewManagementPage;
