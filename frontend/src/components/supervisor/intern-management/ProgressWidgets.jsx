/**
 * @file ProgressWidgets.jsx
 * @description Animated progress monitoring widgets for an intern's profile.
 * Displays task completion, onboarding progress, review completion, overall progress,
 * and attendance using animated progress bars and circular indicators.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RiTaskLine,
  RiCheckboxMultipleLine,
  RiStarLine,
  RiPieChartLine,
  RiCalendarCheckLine,
  RiCheckLine,
} from 'react-icons/ri';
import { InternProgressLoader } from './InternSkeletonLoaders';

// ── Animated Circular Progress ────────────────────────────────────────────────
const CircularProgress = ({ percentage, size = 80, strokeWidth = 7, color = '#4f46e5', trackColor = '#e0e7ff' }) => {
  const [displayed, setDisplayed] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    let frame;
    let start;
    const duration = 900;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayed(Math.round(progress * percentage));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size < 72 ? '0.75rem' : '0.875rem',
          fontWeight: 800,
          color: 'var(--color-neutral-900)',
        }}
      >
        {displayed}%
      </div>
    </div>
  );
};

// ── Animated Linear Progress Bar ──────────────────────────────────────────────
const AnimatedBar = ({ percentage, color, label, sublabel }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{percentage}%</span>
    </div>
    <div style={{ height: '8px', background: 'var(--color-neutral-100)', borderRadius: '99px', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        style={{ height: '100%', background: color, borderRadius: '99px' }}
      />
    </div>
    {sublabel && (
      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{sublabel}</p>
    )}
  </div>
);

// ── Widget Card ───────────────────────────────────────────────────────────────
const WidgetCard = ({ icon: Icon, iconColor, iconBg, title, children, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: index * 0.06 }}
    style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '0.625rem',
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          flexShrink: 0,
        }}
      >
        <Icon />
      </div>
      <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{title}</h4>
    </div>
    {children}
  </motion.div>
);

// ── Milestone Item ────────────────────────────────────────────────────────────
const MilestoneItem = ({ milestone }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: milestone.completed ? '#dcfce7' : 'var(--color-neutral-100)',
        color: milestone.completed ? '#15803d' : 'var(--color-neutral-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        flexShrink: 0,
        border: `1px solid ${milestone.completed ? '#bbf7d0' : 'var(--color-neutral-200)'}`,
      }}
    >
      {milestone.completed && <RiCheckLine />}
    </div>
    <span
      style={{
        fontSize: '0.8125rem',
        color: milestone.completed ? 'var(--color-neutral-700)' : 'var(--color-neutral-400)',
        fontWeight: milestone.completed ? 600 : 400,
        textDecoration: !milestone.completed ? 'none' : 'none',
      }}
    >
      {milestone.title}
    </span>
    {milestone.date && (
      <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
        {milestone.date}
      </span>
    )}
  </div>
);

// ── Main ProgressWidgets Component ────────────────────────────────────────────
const ProgressWidgets = ({ progress, isLoading }) => {
  if (isLoading) return <InternProgressLoader />;
  if (!progress) return null;

  const { taskCompletion, onboardingCompletion, reviewCompletion, overallProgress, attendance, milestones } = progress;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Row 1: Circular Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {/* Overall Progress */}
        <WidgetCard icon={RiPieChartLine} iconColor="#4f46e5" iconBg="#eef2ff" title="Overall Progress" index={0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <CircularProgress percentage={overallProgress} color="#4f46e5" trackColor="#e0e7ff" />
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-700)', fontWeight: 500, lineHeight: 1.4 }}>
                {overallProgress >= 80
                  ? 'On track — excellent progress!'
                  : overallProgress >= 60
                  ? 'Good progress. Keep going!'
                  : 'Needs more attention.'}
              </p>
            </div>
          </div>
        </WidgetCard>

        {/* Task Completion */}
        <WidgetCard icon={RiTaskLine} iconColor="#059669" iconBg="#ecfdf5" title="Task Completion" index={1}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <CircularProgress percentage={taskCompletion.percentage} color="#10b981" trackColor="#d1fae5" />
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {taskCompletion.completed}/{taskCompletion.total}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Tasks completed</p>
            </div>
          </div>
        </WidgetCard>

        {/* Attendance */}
        <WidgetCard icon={RiCalendarCheckLine} iconColor="#d97706" iconBg="#fffbeb" title="Attendance" index={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <CircularProgress percentage={attendance.percentage} color="#f59e0b" trackColor="#fef3c7" />
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                {attendance.present}/{attendance.total}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
                🔥 {attendance.streak} day streak
              </p>
            </div>
          </div>
        </WidgetCard>
      </div>

      {/* Row 2: Linear Progress Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Onboarding Progress */}
        <WidgetCard icon={RiCheckboxMultipleLine} iconColor="#7c3aed" iconBg="#faf5ff" title="Onboarding Progress" index={3}>
          <AnimatedBar
            percentage={onboardingCompletion.percentage}
            color="linear-gradient(90deg, #7c3aed, #a78bfa)"
            label={`${onboardingCompletion.completed} of ${onboardingCompletion.total} modules`}
            sublabel={onboardingCompletion.percentage === 100 ? '✅ Fully onboarded' : `${onboardingCompletion.total - onboardingCompletion.completed} modules remaining`}
          />
        </WidgetCard>

        {/* Review Completion */}
        <WidgetCard icon={RiStarLine} iconColor="#dc2626" iconBg="#fef2f2" title="Review Completion" index={4}>
          <AnimatedBar
            percentage={reviewCompletion.percentage}
            color="linear-gradient(90deg, #dc2626, #f87171)"
            label={`${reviewCompletion.completed} of ${reviewCompletion.total} reviews done`}
            sublabel={reviewCompletion.completed < reviewCompletion.total ? `${reviewCompletion.total - reviewCompletion.completed} review(s) pending` : '✅ All reviews complete'}
          />
        </WidgetCard>
      </div>

      {/* Row 3: Milestones */}
      {milestones && milestones.length > 0 && (
        <WidgetCard icon={RiCheckboxMultipleLine} iconColor="#4f46e5" iconBg="#eef2ff" title="Internship Milestones" index={5}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {milestones.map((m) => (
              <MilestoneItem key={m.id} milestone={m} />
            ))}
          </div>
        </WidgetCard>
      )}
    </div>
  );
};

export default ProgressWidgets;
