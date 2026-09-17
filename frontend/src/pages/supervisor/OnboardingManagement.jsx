/**
 * @file OnboardingManagement.jsx
 * @description Supervisor onboarding approvals page.
 */
import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiCheckboxMultipleLine, RiRefreshLine } from 'react-icons/ri';

import { useSupervisorReviewStore } from '../../store/useSupervisorReviewStore';
import {
  OnboardingApprovalsView,
  ReviewKPISummary,
} from '../../components/supervisor/reviews-approvals';

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

const getOnboardingReviewItems = (queue = []) =>
  queue.flatMap((intern) => {
    const docs = (intern.documents || intern.steps || [])
      .filter((item) => item?.submitted || item?.document || item?.review_status)
      .map((item) => ({
        status: normalizeReviewStatus(item.review_status || item.status || item.document?.review_status),
      }));

    const details = Object.values(intern.onboarding_details || {})
      .filter((detail) => detail?.status || detail?.review_status)
      .map((detail) => ({
        status: normalizeReviewStatus(detail.review_status),
      }));

    return [...docs, ...details];
  });

export default function OnboardingManagementPage() {
  const {
    onboardingQueue,
    loading,
    fetchOnboardingApprovals,
    updateOnboardingStep,
  } = useSupervisorReviewStore();

  useEffect(() => {
    fetchOnboardingApprovals();
  }, [fetchOnboardingApprovals]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchOnboardingApprovals();
    }, 8000);
    return () => window.clearInterval(intervalId);
  }, [fetchOnboardingApprovals]);

  const onboardingKpis = useMemo(() => {
    const items = getOnboardingReviewItems(onboardingQueue);
    return {
      pending: items.filter((item) => item.status === 'pending').length,
      approved: items.filter((item) => item.status === 'approved').length,
      needsRevision: items.filter((item) => item.status === 'resubmission_required').length,
      rejected: items.filter((item) => item.status === 'rejected').length,
      reviewsDue: items.filter((item) => item.status === 'pending').length,
      overdue: 0,
    };
  }, [onboardingQueue]);

  const handleApproveOnboarding = async (internId, stepId, notes) => {
    try {
      await updateOnboardingStep(internId, stepId, 'approved', notes);
      toast.success('Step approved successfully!');
    } catch {
      toast.error('Failed to approve step.');
    }
  };

  const handleRejectOnboarding = async (internId, stepId, notes, decision = 'rejected') => {
    try {
      await updateOnboardingStep(internId, stepId, decision === 'resubmission_required' ? 'resubmission_required' : 'rejected', notes);
      toast.success(decision === 'resubmission_required' ? 'Resubmission requested.' : 'Step rejected.');
    } catch {
      toast.error('Failed to reject step.');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: '100%', background: 'var(--color-neutral-50)', padding: 0, boxSizing: 'border-box', minWidth: 0, maxWidth: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.875rem', background: '#00b4d8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.25rem', boxShadow: '0 4px 16px rgba(0,180,216,0.3)' }}>
            <RiCheckboxMultipleLine />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-neutral-900)', lineHeight: 1.2 }}>
              Onboarding
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              Review onboarding steps, documents, and resubmissions
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={fetchOnboardingApprovals}
          title="Refresh"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5625rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
        >
          <RiRefreshLine style={{ fontSize: '1rem' }} />
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <ReviewKPISummary kpis={onboardingKpis} isLoading={loading.onboarding && onboardingQueue.length === 0} />
        <OnboardingApprovalsView
          queue={onboardingQueue}
          isLoading={loading.onboarding && onboardingQueue.length === 0}
          actionLoading={loading.onboardingAction}
          onApprove={handleApproveOnboarding}
          onReject={handleRejectOnboarding}
        />
      </div>
    </motion.div>
  );
}
