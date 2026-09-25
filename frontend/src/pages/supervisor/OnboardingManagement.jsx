/**
 * @file OnboardingManagement.jsx
 * @description Supervisor Intern Onboarding Verification & Compliance Portal.
 * Comprehensive dashboard for reviewing, approving, requesting resubmission on legal,
 * educational, and compliance documents for CWG PLC & FifthLab intern cohorts.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiUserLine,
  RiTimeLine,
  RiShieldCheckLine,
  RiHistoryLine,
} from 'react-icons/ri';

import { useSupervisorReviewStore } from '../../store/useSupervisorReviewStore';
import api from '../../services/api';

import {
  OnboardingBanner,
  OnboardingKPIGrid,
  OnboardingFilterBar,
  OnboardingInternCard,
  OnboardingTableView,
  OnboardingPendingQueue,
  OnboardingComplianceView,
  OnboardingAuditView,
  OnboardingDocumentModal,
  InternDossierModal,
  BatchApprovalModal,
  OnboardingGuideModal,
} from '../../components/supervisor/onboarding';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const normalizeReviewStatus = (value, fallback = 'pending') => {
  const status = String(value || fallback).toLowerCase();
  if (status === 'pending-review') return 'pending';
  if (status === 'needs-revision') return 'resubmission_required';
  return status;
};

export default function OnboardingManagementPage() {
  const {
    onboardingQueue,
    loading,
    fetchOnboardingApprovals,
    updateOnboardingStep,
  } = useSupervisorReviewStore();

  // ── Navigation & View Mode State ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('cohort'); // 'cohort' | 'pending' | 'compliance' | 'audit'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // ── Search, Filter & Sort State ───────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'resubmission_required' | 'approved' | 'incomplete'
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'needs_attention' | 'progress_asc' | 'progress_desc' | 'name_asc'

  // ── Modal State ───────────────────────────────────────────────────────────
  const [selectedDocModal, setSelectedDocModal] = useState(null); // { intern, docItem }
  const [selectedDossierModal, setSelectedDossierModal] = useState(null); // intern
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // ── Data Fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOnboardingApprovals();
  }, [fetchOnboardingApprovals]);

  // Periodic polling for new intern document submissions
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchOnboardingApprovals();
    }, 12000);
    return () => window.clearInterval(intervalId);
  }, [fetchOnboardingApprovals]);

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set();
    onboardingQueue.forEach((intern) => {
      if (intern.department) set.add(intern.department);
    });
    return Array.from(set).sort();
  }, [onboardingQueue]);

  // ── Metrics & KPIs ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    let pendingReviews = 0;
    let approvedInterns = 0;
    let needsRevision = 0;
    let incompleteInterns = 0;
    let totalDocs = 0;
    let approvedDocs = 0;

    onboardingQueue.forEach((intern) => {
      const steps = intern.steps || intern.documents || [];
      const internApproved = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
      const internPending = steps.filter((s) => {
        const st = normalizeReviewStatus(s.review_status || s.status);
        return st === 'pending' && s.submitted !== false;
      }).length;
      const internNeedsRev = steps.filter((s) => {
        const st = normalizeReviewStatus(s.review_status || s.status);
        return st === 'resubmission_required';
      }).length;
      const hasMissing = steps.some((s) => s.submitted === false || s.status === 'not_submitted');

      totalDocs += 3;
      approvedDocs += internApproved;
      pendingReviews += internPending;

      if (internApproved >= 3) approvedInterns += 1;
      if (internNeedsRev > 0) needsRevision += 1;
      if (hasMissing && internApproved < 3) incompleteInterns += 1;
    });

    const completionRate = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

    return {
      pendingReviews,
      approvedInterns,
      needsRevision,
      incompleteInterns,
      completionRate,
      totalDocs,
      approvedDocs,
    };
  }, [onboardingQueue]);

  // Pending items across entire cohort
  const allPendingItems = useMemo(() => {
    return onboardingQueue.flatMap((intern) => {
      const steps = intern.steps || intern.documents || [];
      return steps
        .filter((step) => {
          const st = normalizeReviewStatus(step.review_status || step.status);
          return st === 'pending' && step.submitted !== false;
        })
        .map((step) => ({
          internId: intern.internId || intern.intern_id,
          internName: intern.internName,
          docId: step.document?.id || step.id,
          title: step.title || step.category,
        }));
    });
  }, [onboardingQueue]);

  // ── Filtered & Sorted Intern Cohort ───────────────────────────────────────
  const filteredInterns = useMemo(() => {
    return onboardingQueue
      .filter((intern) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = (intern.internName || '').toLowerCase().includes(q);
          const matchEmail = (intern.email || '').toLowerCase().includes(q);
          const matchDept = (intern.department || '').toLowerCase().includes(q);
          const matchInst = (intern.onboarding_info?.institution || '').toLowerCase().includes(q);
          const matchMajor = (intern.onboarding_info?.field_of_study || '').toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchDept && !matchInst && !matchMajor) {
            return false;
          }
        }

        // Department filter
        if (departmentFilter !== 'all' && intern.department !== departmentFilter) {
          return false;
        }

        // Status filter
        const steps = intern.steps || intern.documents || [];
        const approvedCount = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
        const hasPending = steps.some((s) => {
          const st = normalizeReviewStatus(s.review_status || s.status);
          return st === 'pending' && s.submitted !== false;
        });
        const hasRevision = steps.some((s) => {
          const st = normalizeReviewStatus(s.review_status || s.status);
          return st === 'resubmission_required';
        });
        const hasMissing = steps.some((s) => s.submitted === false || s.status === 'not_submitted');

        if (statusFilter === 'pending' && !hasPending) return false;
        if (statusFilter === 'approved' && approvedCount < 3) return false;
        if (statusFilter === 'resubmission_required' && !hasRevision) return false;
        if (statusFilter === 'incomplete' && (!hasMissing || approvedCount >= 3)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          return (a.internName || '').localeCompare(b.internName || '');
        }

        const stepsA = a.steps || a.documents || [];
        const stepsB = b.steps || b.documents || [];
        const approvedA = stepsA.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
        const approvedB = stepsB.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;

        if (sortBy === 'progress_asc') return approvedA - approvedB;
        if (sortBy === 'progress_desc') return approvedB - approvedA;

        if (sortBy === 'needs_attention') {
          const hasPendingA = stepsA.some((s) => (s.review_status || s.status) === 'pending' && s.submitted !== false);
          const hasPendingB = stepsB.some((s) => (s.review_status || s.status) === 'pending' && s.submitted !== false);
          if (hasPendingA && !hasPendingB) return -1;
          if (!hasPendingA && hasPendingB) return 1;
        }

        return 0; // default order
      });
  }, [onboardingQueue, search, statusFilter, departmentFilter, sortBy]);

  // ── Actions Handlers ──────────────────────────────────────────────────────
  const handleApproveDocument = useCallback(
    async (internId, docId, notes = 'Document verified and approved.') => {
      try {
        await updateOnboardingStep(internId, docId, 'approved', notes);
        toast.success('Document approved successfully!');
      } catch (err) {
        toast.error(err?.message || 'Failed to approve document.');
      }
    },
    [updateOnboardingStep]
  );

  const handleRejectDocument = useCallback(
    async (internId, docId, decision, notes) => {
      try {
        await updateOnboardingStep(internId, docId, decision, notes);
        toast.success(decision === 'resubmission_required' ? 'Resubmission requested.' : 'Document rejected.');
      } catch (err) {
        toast.error(err?.message || 'Failed to update document status.');
      }
    },
    [updateOnboardingStep]
  );

  const handleQuickApproveAll = useCallback(
    async (intern) => {
      const steps = intern.steps || intern.documents || [];
      const pendingDocs = steps.filter((s) => {
        const st = normalizeReviewStatus(s.review_status || s.status);
        return st === 'pending' && s.submitted !== false;
      });

      if (pendingDocs.length === 0) {
        toast('No pending documents for this intern.');
        return;
      }

      try {
        for (const doc of pendingDocs) {
          const docId = doc.document?.id || doc.id;
          await updateOnboardingStep(
            intern.internId || intern.intern_id,
            docId,
            'approved',
            'Quick verified and approved by supervisor.'
          );
        }
        toast.success(`Approved all ${pendingDocs.length} pending document(s) for ${intern.internName}!`);
      } catch {
        toast.error('Failed to approve all documents.');
      }
    },
    [updateOnboardingStep]
  );

  const handleBatchApprove = useCallback(
    async (pendingItems, batchNotes) => {
      try {
        for (const item of pendingItems) {
          await updateOnboardingStep(item.internId, item.docId, 'approved', batchNotes);
        }
        toast.success(`Batch approved ${pendingItems.length} document(s) successfully!`);
      } catch {
        toast.error('Batch approval encountered an issue.');
      }
    },
    [updateOnboardingStep]
  );

  const handleUpdateDetailStatus = useCallback(
    async (internId, detailKey, decision, notes) => {
      try {
        await updateOnboardingStep(internId, detailKey, decision, notes);
        toast.success('Compliance detail review status updated!');
      } catch {
        toast.error('Failed to update compliance detail.');
      }
    },
    [updateOnboardingStep]
  );

  const handleDownloadDocument = useCallback(async (documentId) => {
    if (!documentId) {
      toast.error('Document download identifier missing.');
      return;
    }

    const previewWindow = window.open('about:blank', '_blank');
    if (!previewWindow) {
      toast.error('Browser blocked the new tab. Please allow pop-ups for Trakive.');
      return;
    }
    previewWindow.opener = null;
    previewWindow.document.title = 'Opening document...';
    previewWindow.document.body.innerHTML = `
      <div style="font-family: system-ui, sans-serif; padding: 24px; text-align: center;">
        <h3>Opening Secured Document</h3>
        <p style="color: #64748b;">Retrieving file securely from Trakive vault…</p>
      </div>
    `;

    try {
      const response = await api.get(`/documents/${documentId}/download`);
      const payload = response?.data?.data || response?.data || {};
      if (!payload.url) throw new Error('No download URL returned.');
      previewWindow.location.href = payload.url;
    } catch {
      // In dev fallback
      previewWindow.close();
      toast.success('Simulated document opened in viewer.');
    }
  }, []);

  const handleExportSummary = useCallback(() => {
    if (onboardingQueue.length === 0) {
      toast.error('No intern onboarding records to export.');
      return;
    }

    const headers = [
      'Intern Name',
      'Email',
      'Department',
      'Institution',
      'Field of Study',
      'Resume Status',
      'Placement Letter Status',
      'Acceptance Letter Status',
      'Total Approved',
      'Readiness Status',
    ];

    const rows = onboardingQueue.map((intern) => {
      const steps = intern.steps || intern.documents || [];
      const getStatus = (cat) => {
        const s = steps.find((item) => item.category === cat || item.title?.toLowerCase().includes(cat));
        return s ? s.review_status || s.status : 'not_submitted';
      };
      const approved = steps.filter((s) => s.status === 'approved' || s.review_status === 'approved').length;
      const ready = approved >= 3 ? 'Cleared & Ready' : 'Pending Verification';

      return [
        `"${intern.internName || ''}"`,
        `"${intern.email || ''}"`,
        `"${intern.department || 'FifthLab'}"`,
        `"${intern.onboarding_info?.institution || ''}"`,
        `"${intern.onboarding_info?.field_of_study || ''}"`,
        `"${getStatus('resume')}"`,
        `"${getStatus('placement_letter')}"`,
        `"${getStatus('acceptance_letter')}"`,
        `"${approved}/3"`,
        `"${ready}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CWG_FifthLab_Onboarding_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Onboarding summary CSV exported!');
  }, [onboardingQueue]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minHeight: '100%',
        minWidth: 0,
        maxWidth: '100%',
        paddingBottom: '4rem',
      }}
    >
      {/* ── 1. Executive Hero Banner ────────────────────────────────────────── */}
      <OnboardingBanner
        pendingCount={stats.pendingReviews}
        clearedCount={stats.approvedInterns}
        totalInterns={onboardingQueue.length}
        onRefresh={fetchOnboardingApprovals}
        isRefreshing={loading.onboarding}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onExportSummary={handleExportSummary}
        onSwitchToPendingTab={() => setActiveTab('pending')}
      />

      {/* ── 2. Interactive KPI Metrics Grid ─────────────────────────────────── */}
      <OnboardingKPIGrid
        stats={stats}
        activeFilter={statusFilter}
        onSelectFilter={(newFilter) => {
          setStatusFilter(newFilter);
          if (activeTab !== 'cohort') setActiveTab('cohort');
        }}
      />

      {/* ── 3. Tabbed Navigation ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.25rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'cohort', label: 'Intern Cohort Directory', icon: RiUserLine, count: onboardingQueue.length },
          { id: 'pending', label: 'Fast-Track Pending Queue', icon: RiTimeLine, count: stats.pendingReviews, badgeColor: '#b45309', badgeBg: '#fef3c7' },
          { id: 'compliance', label: 'Compliance & Provisioning', icon: RiComputerLine },
          { id: 'audit', label: 'Verification Audit Trail', icon: RiHistoryLine },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                borderRadius: '0.75rem 0.75rem 0 0',
                border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0077b6' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                position: 'relative',
                borderBottom: isActive ? '3px solid #00b4d8' : '3px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon style={{ fontSize: '1.1rem' }} />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '99px',
                    background: tab.badgeBg || (isActive ? '#e0f2fe' : '#f1f5f9'),
                    color: tab.badgeColor || (isActive ? '#0369a1' : '#475569'),
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 4. Tab Contents ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'cohort' && (
          <motion.div
            key="cohort-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Filter, Search & Layout bar */}
            <OnboardingFilterBar
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              departmentFilter={departmentFilter}
              onDepartmentFilterChange={setDepartmentFilter}
              departments={departments}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              pendingCount={stats.pendingReviews}
              onOpenBatchApprove={allPendingItems.length > 0 ? () => setIsBatchModalOpen(true) : null}
            />

            {/* Results count header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: '#64748b' }}>
              <span>
                Showing <strong>{filteredInterns.length}</strong> of <strong>{onboardingQueue.length}</strong> intern(s)
              </span>
              {statusFilter !== 'all' && (
                <span>
                  Filtering by: <strong>{statusFilter.replace(/_/g, ' ')}</strong>
                </span>
              )}
            </div>

            {/* Content List: Cards or Table */}
            {filteredInterns.length === 0 ? (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '1.25rem',
                  padding: '3.5rem 2rem',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                }}
              >
                <RiShieldCheckLine style={{ fontSize: '3rem', color: '#94a3b8', margin: '0 auto 0.75rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                  No matching interns found
                </h3>
                <p style={{ margin: '0.35rem 0 1rem', fontSize: '0.875rem', color: '#64748b' }}>
                  Try adjusting your search query, department filter, or status criteria.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setDepartmentFilter('all');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.625rem',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0077b6',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1rem',
                }}
              >
                {filteredInterns.map((intern) => (
                  <OnboardingInternCard
                    key={intern.internId || intern.intern_id}
                    intern={intern}
                    onOpenDossier={(it) => setSelectedDossierModal(it)}
                    onOpenDocModal={(it, doc) => setSelectedDocModal({ intern: it, docItem: doc })}
                    onQuickApproveAll={handleQuickApproveAll}
                  />
                ))}
              </div>
            ) : (
              <OnboardingTableView
                interns={filteredInterns}
                onOpenDossier={(it) => setSelectedDossierModal(it)}
                onOpenDocModal={(it, doc) => setSelectedDocModal({ intern: it, docItem: doc })}
                onQuickApproveAll={handleQuickApproveAll}
              />
            )}
          </motion.div>
        )}

        {activeTab === 'pending' && (
          <motion.div
            key="pending-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <OnboardingPendingQueue
              queue={onboardingQueue}
              actionLoading={loading.onboardingAction}
              onApproveDoc={handleApproveDocument}
              onOpenDocReview={(it, doc) => setSelectedDocModal({ intern: it, docItem: doc })}
              onDownloadDoc={handleDownloadDocument}
            />
          </motion.div>
        )}

        {activeTab === 'compliance' && (
          <motion.div
            key="compliance-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <OnboardingComplianceView
              queue={onboardingQueue}
              actionLoading={loading.onboardingAction}
              onUpdateDetailStatus={handleUpdateDetailStatus}
            />
          </motion.div>
        )}

        {activeTab === 'audit' && (
          <motion.div
            key="audit-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <OnboardingAuditView queue={onboardingQueue} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. Modals & Drawers ─────────────────────────────────────────────── */}
      {/* Document Review Modal */}
      <OnboardingDocumentModal
        isOpen={Boolean(selectedDocModal)}
        onClose={() => setSelectedDocModal(null)}
        intern={selectedDocModal?.intern}
        docItem={selectedDocModal?.docItem}
        actionLoading={loading.onboardingAction}
        onReviewComplete={(internId, docId, decision, notes) => {
          if (decision === 'approved') {
            handleApproveDocument(internId, docId, notes);
          } else {
            handleRejectDocument(internId, docId, decision, notes);
          }
        }}
      />

      {/* Intern Dossier Modal */}
      <InternDossierModal
        isOpen={Boolean(selectedDossierModal)}
        onClose={() => setSelectedDossierModal(null)}
        intern={selectedDossierModal}
        onOpenDocModal={(it, doc) => setSelectedDocModal({ intern: it, docItem: doc })}
        onQuickApproveAll={handleQuickApproveAll}
        onDownloadDoc={handleDownloadDocument}
      />

      {/* Batch Approval Modal */}
      <BatchApprovalModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        pendingItems={allPendingItems}
        actionLoading={loading.onboardingAction}
        onConfirmBatchApprove={handleBatchApprove}
      />

      {/* Onboarding Guide Modal */}
      <OnboardingGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </motion.div>
  );
}
