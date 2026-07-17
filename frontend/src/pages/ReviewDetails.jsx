/**
 * @file ReviewDetails.jsx
 * @description Full detail page for a single performance review.
 * Displays header, timeline, criteria, feedback, strengths, charts, goals, and self-assessment form.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiUser3Line,
  RiCalendarEventLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiFileEditLine,
  RiBarChartLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
} from 'react-icons/ri';

import { useReviewStore } from '../store';
import { Breadcrumb } from '../components/ui';
import {
  EvaluationCriteria,
  SupervisorFeedback,
  SelfAssessmentForm,
  PerformanceTrendCharts,
  GoalsList,
  ReviewTimeline,
  StrengthsAndImprovements,
  ReviewDetailSkeleton,
  FeedbackSkeleton,
  SelfAssessmentFormSkeleton,
  NoFeedbackEmpty,
  NoSelfAssessmentEmpty,
} from '../components/reviews';
import { ROUTES } from '../constants';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const STATUS_CONFIG = {
  published:                 { label: 'Published',          icon: <RiCheckboxCircleLine />, color: 'var(--color-success-600)',  bg: 'var(--color-success-50)' },
  scheduled:                 { label: 'Scheduled',          icon: <RiTimeLine />,            color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
  'pending-self-assessment': { label: 'Self-Assessment Due', icon: <RiFileEditLine />,        color: 'var(--color-warning-600)', bg: 'var(--color-warning-50)' },
};

const getScoreColor = (score) => {
  if (!score) return 'var(--color-neutral-400)';
  if (score >= 88) return 'var(--color-success-500)';
  if (score >= 75) return 'var(--color-primary-500)';
  return 'var(--color-warning-500)';
};

// ── Collapsible Section ────────────────────────────────────────────────────────

const CollapsibleSection = ({ title, emoji, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
          {emoji} {title}
        </span>
        <span style={{ color: 'var(--color-neutral-400)', fontSize: '1.1rem' }}>
          {open ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.75rem 1.75rem' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Page Component ─────────────────────────────────────────────────────────────

export default function ReviewDetails() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const {
    currentReview,
    performanceTrends,
    radarData,
    goals,
    loadingReviewDetails,
    loadingTrends,
    loadingGoals,
    submittingSelfAssessment,
    selfAssessmentSubmitted,
    reviewDetailError,
    fetchReviewDetails,
    fetchPerformanceTrends,
    fetchDevelopmentGoals,
    submitSelfAssessment,
    resetSelfAssessment,
  } = useReviewStore();

  useEffect(() => {
    fetchReviewDetails(reviewId);
    fetchPerformanceTrends();
    fetchDevelopmentGoals();
    resetSelfAssessment();
  }, [reviewId, fetchReviewDetails, fetchPerformanceTrends, fetchDevelopmentGoals, resetSelfAssessment]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loadingReviewDetails) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Back link skeleton */}
        <div style={{ width: '8rem', height: '1rem', borderRadius: '0.5rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <ReviewDetailSkeleton />
        <FeedbackSkeleton />
        <SelfAssessmentFormSkeleton />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (reviewDetailError) {
    return (
      <div
        style={{
          padding: '2rem',
          borderRadius: '1rem',
          background: 'var(--color-danger-50)',
          border: '1px solid var(--color-danger-200)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--color-danger-700)', fontWeight: 600, marginBottom: '1rem' }}>
          ⚠️ {reviewDetailError}
        </p>
        <button
          onClick={() => navigate(ROUTES.REVIEWS)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '0.625rem',
            background: 'var(--color-primary-600)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <RiArrowLeftLine /> Back to Reviews
        </button>
      </div>
    );
  }

  if (!currentReview) return null;

  const statusConfig = STATUS_CONFIG[currentReview.status] ?? STATUS_CONFIG.scheduled;
  const scoreColor   = getScoreColor(currentReview.overallScore);

  const hasSelfAssessment = currentReview.selfAssessment?.submitted;
  const showSelfAssessmentForm = currentReview.status === 'pending-self-assessment';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(ROUTES.REVIEWS)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.875rem',
            color: 'var(--color-neutral-500)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontWeight: 500,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary-600)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-neutral-500)'; }}
        >
          <RiArrowLeftLine /> Back to Reviews
        </button>

        <Breadcrumb
          items={[
            { label: 'Dashboard', to: ROUTES.DASHBOARD },
            { label: 'Performance Reviews', to: ROUTES.REVIEWS },
            { label: currentReview.title },
          ]}
        />
      </div>

      {/* ── Review Header Card ────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background: 'var(--color-surface)',
          borderRadius: '1rem',
          border: '1px solid var(--color-border)',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))`,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Status + period tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-primary-600)',
                  background: 'var(--color-primary-50)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '99px',
                }}
              >
                {currentReview.period}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: statusConfig.color,
                  background: statusConfig.bg,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '99px',
                }}
              >
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>

            {/* Title */}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: 0, lineHeight: 1.25 }}>
              {currentReview.title}
            </h1>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                <RiUser3Line /> {currentReview.reviewerName} · {currentReview.reviewerRole}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                <RiCalendarEventLine /> {formatDate(currentReview.reviewDate)}
              </span>
              {currentReview.publishedAt && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
                  <RiCheckboxCircleLine style={{ color: 'var(--color-success-500)' }} />
                  Published {formatDate(currentReview.publishedAt)}
                </span>
              )}
            </div>

            {/* Overall summary */}
            {currentReview.overallSummary && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--color-neutral-600)',
                  margin: 0,
                  lineHeight: 1.7,
                  padding: '1rem',
                  background: 'var(--color-neutral-50)',
                  borderRadius: '0.75rem',
                  borderLeft: '3px solid var(--color-primary-400)',
                }}
              >
                {currentReview.overallSummary}
              </p>
            )}
          </div>

          {/* Score */}
          {currentReview.overallScore !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '6rem',
                  height: '6rem',
                  borderRadius: '50%',
                  background:
                    currentReview.overallScore >= 88 ? 'var(--color-success-50)' :
                    currentReview.overallScore >= 75 ? 'var(--color-primary-50)' : 'var(--color-warning-50)',
                  border: `3px solid ${scoreColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                  {currentReview.overallScore}
                </span>
                <span style={{ fontSize: '0.65rem', color: scoreColor, fontWeight: 600 }}>/ 100</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
                Overall Score
              </span>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Review Timeline */}
        {currentReview.timeline && currentReview.timeline.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <ReviewTimeline events={currentReview.timeline} />
          </motion.div>
        )}

        {/* Evaluation Criteria */}
        {currentReview.evaluationCriteria && currentReview.evaluationCriteria.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <EvaluationCriteria criteria={currentReview.evaluationCriteria} />
          </motion.div>
        )}

        {/* Strengths & Improvements */}
        {currentReview.evaluationCriteria && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StrengthsAndImprovements
              strengths={currentReview.strengths ?? []}
              improvements={currentReview.improvementAreas ?? []}
            />
          </motion.div>
        )}

        {/* Supervisor Feedback */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {currentReview.supervisorFeedback ? (
            <SupervisorFeedback
              reviewerName={currentReview.reviewerName}
              reviewerRole={currentReview.reviewerRole}
              reviewerAvatar={currentReview.reviewerAvatar}
              feedback={currentReview.supervisorFeedback}
            />
          ) : (
            <div style={{ background: 'var(--color-surface)', borderRadius: '1rem', border: '1px solid var(--color-border)' }}>
              <NoFeedbackEmpty />
            </div>
          )}
        </motion.div>

        {/* Performance Trend Charts */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <PerformanceTrendCharts
            trends={performanceTrends}
            radarData={radarData}
          />
        </motion.div>

        {/* Development Goals */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GoalsList goals={goals} />
        </motion.div>

        {/* Self-Assessment */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <CollapsibleSection
            title="Self-Assessment"
            emoji="📝"
            defaultOpen={showSelfAssessmentForm || !hasSelfAssessment}
          >
            {showSelfAssessmentForm || !hasSelfAssessment ? (
              <SelfAssessmentForm
                reviewId={reviewId}
                onSubmit={submitSelfAssessment}
                submitting={submittingSelfAssessment}
                submitted={selfAssessmentSubmitted}
              />
            ) : (
              // Display submitted self-assessment as read-only
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    background: 'var(--color-success-50)',
                    border: '1px solid var(--color-success-200)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-success-700)',
                    fontWeight: 500,
                  }}
                >
                  ✓ Self-assessment submitted on {new Date(currentReview.selfAssessment.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                {/* Ratings */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'Productivity',   value: currentReview.selfAssessment.productivityRating },
                    { label: 'Communication',  value: currentReview.selfAssessment.communicationRating },
                    { label: 'Teamwork',       value: currentReview.selfAssessment.teamworkRating },
                    { label: 'Initiative',     value: currentReview.selfAssessment.initiativeRating },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: 'var(--color-neutral-50)',
                        borderRadius: '0.75rem',
                        padding: '0.875rem',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>{label}</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-600)' }}>
                        {value} <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', fontWeight: 400 }}>/ 10</span>
                      </span>
                    </div>
                  ))}
                </div>

                {/* Narrative fields */}
                {[
                  { label: 'Overall Reflection', value: currentReview.selfAssessment.overallReflection },
                  { label: 'Key Achievements',   value: currentReview.selfAssessment.achievements },
                  { label: 'Challenges Faced',   value: currentReview.selfAssessment.challenges },
                  { label: 'Goals for Next Period', value: currentReview.selfAssessment.nextGoals },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', margin: '0 0 0.375rem' }}>
                      {label}
                    </h4>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-neutral-600)',
                        lineHeight: 1.7,
                        margin: 0,
                        padding: '0.875rem',
                        background: 'var(--color-neutral-50)',
                        borderRadius: '0.625rem',
                        border: '1px solid var(--color-border)',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>
        </motion.div>
      </div>
    </motion.div>
  );
}
