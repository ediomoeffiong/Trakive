/**
 * @file OnboardingDashboard.jsx
 * @description Fully redesigned premium Intern Onboarding Dashboard for Trakive.
 *
 * Design:
 * - Sticky sidebar with radial progress ring + stats
 * - Timeline-based step list inside category groups
 * - Category tab switcher (not just accordion)
 * - "Up Next" spotlight card
 * - Completion celebration overlay
 * - Smooth Framer Motion throughout
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  RiCheckboxCircleFill,
  RiTimeLine,
  RiShieldCheckFill,
  RiArrowRightLine,
  RiAwardFill,
  RiRefreshLine,
  RiCloseLine,
  RiSparklingLine,
  RiLoader4Line,
  RiAlertLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiPlayCircleLine,
} from 'react-icons/ri';

import { CircularProgress, Skeleton, Badge, Button } from '../components/ui';
import { useOnboardingStore } from '../store';
import { ROUTES } from '../constants';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_META = {
  'Welcome':           { icon: '👋', accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', tag: 'indigo' },
  'HR Documents':      { icon: '📄', accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a', tag: 'amber'  },
  'Company Policies':  { icon: '📋', accent: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', tag: 'emerald'},
  'IT Setup':          { icon: '💻', accent: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', tag: 'blue'   },
  'Team Introduction': { icon: '🤝', accent: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', tag: 'violet' },
  'Training':          { icon: '🎓', accent: '#14b8a6', bg: '#f0fdfa', border: '#99f6e4', tag: 'teal'   },
};

const ORDERED_CATEGORIES = [
  'Welcome', 'HR Documents', 'Company Policies', 'IT Setup', 'Team Introduction', 'Training',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMins(mins) {
  if (!mins) return '—';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function motivationalMessage(pct) {
  if (pct === 100) return "You've nailed every step. Ready to ship! 🚀";
  if (pct >= 75)  return 'Almost there — just a few items left.';
  if (pct >= 50)  return 'Halfway through. Great momentum!';
  if (pct >= 25)  return 'Good start! Build on this energy.';
  return "Your onboarding journey starts here. Let's go!";
}

const STATUS_META = {
  not_started:           { label: 'Not Started',     color: '#94a3b8', bg: '#f1f5f9', border: '#e2e8f0' },
  in_progress:           { label: 'In Progress',     color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  completed:             { label: 'Completed',       color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  awaiting_verification: { label: 'Awaiting Review', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  verified:              { label: 'Verified',        color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  rejected:              { label: 'Needs Attention', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      {/* Sidebar skeleton */}
      <div style={{
        width: '280px', flexShrink: 0,
        background: '#fff', borderRadius: '1.25rem', padding: '2rem',
        border: '1px solid var(--color-neutral-100)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
      }}>
        <Skeleton width="140px" height="140px" borderRadius="50%" />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Skeleton width="60%" height="1.5rem" style={{ margin: '0 auto' }} />
          <Skeleton width="80%" height="0.875rem" style={{ margin: '0 auto' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%' }}>
          {[0,1,2,3].map(i => <Skeleton key={i} height="56px" borderRadius="0.75rem" />)}
        </div>
      </div>
      {/* Main skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Skeleton height="48px" borderRadius="0.75rem" />
        {[0,1,2].map(i => (
          <div key={i} style={{
            background: '#fff', borderRadius: '1rem', padding: '1.5rem',
            border: '1px solid var(--color-neutral-100)',
            display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <Skeleton width="40%" height="1.25rem" />
            {[0,1].map(j => (
              <div key={j} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Skeleton width="36px" height="36px" borderRadius="50%" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Skeleton width="65%" height="0.9rem" />
                  <Skeleton width="40%" height="0.75rem" />
                </div>
                <Skeleton width="80px" height="28px" borderRadius="0.5rem" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step Row (Timeline item) ─────────────────────────────────────────────────

function StepRow({ step, index, isLast, categoryAccent, onOpen }) {
  const isDone = step.status === 'completed' || step.status === 'verified';
  const isRejected = step.status === 'rejected';
  const isInProgress = step.status === 'in_progress';
  const isAwaiting = step.status === 'awaiting_verification';
  const meta = STATUS_META[step.status] || STATUS_META.not_started;
  const estTime = step.estimatedTime ?? step.duration ?? 0;

  const dotColor = isDone
    ? '#16a34a'
    : isInProgress ? categoryAccent
    : isAwaiting ? '#d97706'
    : isRejected ? '#dc2626'
    : '#cbd5e1';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05, ease: 'easeOut' }}
      style={{ display: 'flex', gap: '0', position: 'relative' }}
    >
      {/* Timeline track */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px', flexShrink: 0 }}>
        {/* Dot */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: meta.bg, border: `2px solid ${meta.border}`,
          transition: 'all 0.2s ease', zIndex: 1,
          boxShadow: isDone ? '0 0 0 4px rgba(22,163,74,0.1)' : isInProgress ? `0 0 0 4px ${categoryAccent}22` : 'none',
        }}>
          {isDone
            ? <RiCheckLine style={{ color: '#16a34a', fontSize: '1rem' }} />
            : isInProgress
            ? <RiLoader4Line style={{ color: categoryAccent, fontSize: '1rem' }} />
            : isAwaiting
            ? <RiTimeLine style={{ color: '#d97706', fontSize: '1rem' }} />
            : isRejected
            ? <RiAlertLine style={{ color: '#dc2626', fontSize: '1rem' }} />
            : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#cbd5e1' }} />
          }
        </div>
        {/* Connector line */}
        {!isLast && (
          <div style={{
            width: '2px', flex: 1, minHeight: '24px',
            background: isDone
              ? `linear-gradient(to bottom, ${dotColor}60, ${dotColor}20)`
              : 'var(--color-neutral-100)',
            marginTop: '2px',
          }} />
        )}
      </div>

      {/* Card content */}
      <motion.button
        onClick={() => onOpen(step.id)}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.15 }}
        style={{
          flex: 1, textAlign: 'left', background: 'transparent', border: 'none',
          cursor: 'pointer', paddingBottom: isLast ? '0' : '1.25rem',
          paddingLeft: '0.875rem', paddingTop: '0.25rem',
        }}
      >
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-neutral-100)',
          borderRadius: '0.875rem',
          padding: '0.875rem 1rem',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          boxShadow: 'var(--shadow-card)',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
            e.currentTarget.style.borderColor = 'var(--color-neutral-200)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            e.currentTarget.style.borderColor = 'var(--color-neutral-100)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                <span style={{
                  fontSize: '0.875rem', fontWeight: 600,
                  color: isDone ? 'var(--color-neutral-400)' : 'var(--color-neutral-900)',
                  textDecoration: isDone ? 'line-through' : 'none',
                  textDecorationColor: 'var(--color-neutral-300)',
                }}>
                  {step.title}
                </span>
                {step.requiresVerification && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    fontSize: '0.625rem', fontWeight: 700, color: '#7c3aed',
                    background: '#f5f3ff', border: '1px solid #ddd6fe',
                    padding: '0.1rem 0.4rem', borderRadius: '99px',
                  }}>
                    <RiShieldCheckFill style={{ fontSize: '0.625rem' }} /> Verified
                  </span>
                )}
              </div>
              <p style={{
                fontSize: '0.78rem', color: 'var(--color-neutral-500)',
                lineHeight: 1.55, margin: 0, overflow: 'hidden',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {step.shortDescription ?? step.description ?? ''}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
                {estTime > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 500,
                  }}>
                    <RiTimeLine style={{ fontSize: '0.75rem' }} />
                    {formatMins(estTime)}
                  </span>
                )}
                {step.dueDate && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
                    Due {new Date(step.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
              {/* Status pill */}
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, color: meta.color,
                background: meta.bg, border: `1px solid ${meta.border}`,
                padding: '0.2rem 0.55rem', borderRadius: '99px', whiteSpace: 'nowrap',
              }}>
                {meta.label}
              </span>
              {/* Arrow */}
              <RiArrowRightSLine style={{
                fontSize: '1rem', color: 'var(--color-neutral-300)',
                transition: 'color 0.15s',
              }} />
            </div>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

// ─── Category Panel ───────────────────────────────────────────────────────────

function CategoryPanel({ name, steps, onOpen, isActive }) {
  const meta = CATEGORY_META[name] ?? { icon: '📁', accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' };
  const total = steps.length;
  const done  = steps.filter(s => s.status === 'completed' || s.status === 'verified').length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  if (!isActive) return null;

  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
    >
      {/* Category Header Card */}
      <div style={{
        background: `linear-gradient(135deg, ${meta.bg} 0%, #fff 100%)`,
        border: `1px solid ${meta.border}`,
        borderRadius: '1rem',
        padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{
          width: '3rem', height: '3rem', borderRadius: '0.875rem',
          background: '#fff', border: `1.5px solid ${meta.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
          boxShadow: `0 4px 12px ${meta.accent}25`,
        }}>
          {meta.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.375rem 0' }}>
            {name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '6px', background: 'var(--color-neutral-200)', borderRadius: '99px', overflow: 'hidden', maxWidth: '160px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                style={{ height: '100%', background: meta.accent, borderRadius: '99px' }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
              {done}/{total} completed
            </span>
            {pct === 100 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                fontSize: '0.65rem', fontWeight: 700, color: '#16a34a',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                padding: '0.15rem 0.5rem', borderRadius: '99px',
              }}>
                <RiCheckboxCircleFill style={{ fontSize: '0.7rem' }} /> All done!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Steps Timeline */}
      <div style={{ padding: '0 0.25rem' }}>
        {steps.map((step, i) => (
          <StepRow
            key={step.id}
            step={step}
            index={i}
            isLast={i === steps.length - 1}
            categoryAccent={meta.accent}
            onOpen={onOpen}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Sidebar Progress Panel ───────────────────────────────────────────────────

function ProgressSidebar({ stats, categories, activeCategory, onCategoryChange, onReset }) {
  return (
    <div style={{
      width: '264px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '1rem',
      position: 'sticky', top: '88px', alignSelf: 'flex-start',
    }}>
      {/* Progress Ring Card */}
      <div style={{
        background: 'linear-gradient(145deg, #1e293b 0%, #1e3a8a 100%)',
        borderRadius: '1.25rem',
        padding: '1.75rem 1.5rem',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(37,99,235,0.2)',
      }}>
        {/* Decorative glow */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '140px', height: '140px',
          background: 'rgba(99,102,241,0.3)', borderRadius: '50%', filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
          <RiSparklingLine style={{ color: '#93c5fd', fontSize: '0.9rem' }} />
          <span style={{ fontSize: '0.675rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Your Journey
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
          <CircularProgress
            value={stats.percentage}
            size={120}
            strokeWidth={12}
            variant={stats.percentage === 100 ? 'success' : 'primary'}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {stats.percentage}% Complete
          </div>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
            {motivationalMessage(stats.percentage)}
          </p>
          {stats.estimatedTimeRemaining > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              marginTop: '0.75rem', fontSize: '0.72rem', fontWeight: 600, color: '#bfdbfe',
              background: 'rgba(255,255,255,0.1)', borderRadius: '99px',
              padding: '0.3rem 0.7rem',
            }}>
              <RiTimeLine style={{ fontSize: '0.8rem' }} />
              {formatMins(stats.estimatedTimeRemaining)} remaining
            </div>
          )}
        </div>

        {/* Mini stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
          {[
            { v: stats.total,     l: 'Total',     c: '#e2e8f0' },
            { v: stats.completed, l: 'Done',       c: '#86efac' },
            { v: stats.verified,  l: 'Verified',   c: '#a5b4fc' },
            { v: stats.remaining, l: 'Remaining',  c: '#fde68a' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '0.625rem',
              padding: '0.6rem 0.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.2rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category navigation */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--color-neutral-100)',
        borderRadius: '1.25rem',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-card)',
      }}>
        <h4 style={{
          fontSize: '0.675rem', fontWeight: 700, color: 'var(--color-neutral-400)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem',
        }}>
          Categories
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {categories.map(({ name, steps }) => {
            const meta = CATEGORY_META[name] ?? { icon: '📁', accent: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' };
            const done = steps.filter(s => s.status === 'completed' || s.status === 'verified').length;
            const total = steps.length;
            const isActive = activeCategory === name;
            return (
              <button
                key={name}
                onClick={() => onCategoryChange(name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.75rem', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isActive ? meta.bg : 'transparent',
                  transition: 'background 0.15s ease',
                  outline: isActive ? `1.5px solid ${meta.border}` : 'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{meta.icon}</span>
                <span style={{ flex: 1, fontSize: '0.8rem', fontWeight: 600, color: isActive ? meta.accent : 'var(--color-neutral-700)' }}>
                  {name}
                </span>
                <span style={{
                  fontSize: '0.675rem', fontWeight: 700,
                  color: done === total ? '#16a34a' : 'var(--color-neutral-400)',
                }}>
                  {done}/{total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          fontSize: '0.78rem', fontWeight: 600,
          color: 'var(--color-neutral-500)', background: '#fff',
          border: '1px solid var(--color-neutral-200)',
          padding: '0.625rem 1rem', borderRadius: '0.875rem',
          cursor: 'pointer', transition: 'all 0.15s ease', width: '100%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-neutral-50)'; e.currentTarget.style.color = 'var(--color-neutral-700)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--color-neutral-500)'; }}
      >
        <RiRefreshLine style={{ fontSize: '0.875rem' }} /> Reset Demo
      </button>
    </div>
  );
}

// ─── Celebration Overlay ──────────────────────────────────────────────────────

function CelebrationOverlay({ stats, onClose, onGoToDashboard }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        style={{
          background: '#fff', borderRadius: '1.5rem', maxWidth: '440px', width: '100%',
          padding: '2.5rem 2rem', position: 'relative', textAlign: 'center',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)', overflow: 'hidden',
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
          width: '300px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* SVG confetti */}
        {!reduced && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
            {['#f59e0b','#6366f1','#10b981','#f43f5e','#3b82f6','#8b5cf6','#14b8a6'].map((c, i) => (
              <motion.circle
                key={i}
                cx={`${8 + i * 14}%`} cy="0" r={3 + (i % 3)}
                fill={c}
                initial={{ cy: '-5%', opacity: 0 }}
                animate={{ cy: '110%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.8 + i * 0.3, delay: i * 0.12, repeat: Infinity, repeatDelay: 1 }}
              />
            ))}
          </svg>
        )}

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
            border: 'none', cursor: 'pointer', width: '2rem', height: '2rem',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-neutral-400)',
          }}
          aria-label="Close"
        >
          <RiCloseLine style={{ fontSize: '1.25rem' }} />
        </button>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.15, damping: 12, stiffness: 280 }}
          style={{
            width: '5.5rem', height: '5.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            position: 'relative', zIndex: 1,
          }}
        >
          <RiAwardFill style={{ color: '#fff', fontSize: '2.5rem' }} />
        </motion.div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block', fontSize: '0.68rem', fontWeight: 800, color: '#6366f1',
            background: '#eef2ff', border: '1px solid #c7d2fe',
            padding: '0.25rem 0.75rem', borderRadius: '99px', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: '0.875rem',
          }}>
            Onboarding Complete 🎉
          </span>

          <h2 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>
            You're All Set!
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: '32ch', margin: '0 auto 1.75rem' }}>
            You've completed all {stats.total} onboarding steps. Time to start building great things with your team!
          </p>

          {/* Summary stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem', marginBottom: '1.75rem',
            background: 'var(--color-neutral-50)', borderRadius: '1rem',
            padding: '1rem', border: '1px solid var(--color-neutral-100)',
          }}>
            {[
              { v: stats.completed, l: 'Completed', c: '#16a34a' },
              { v: stats.verified,  l: 'Verified',  c: '#7c3aed' },
              { v: stats.total,     l: 'Total',     c: 'var(--color-neutral-800)' },
            ].map(({ v, l, c }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-neutral-400)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <Button onClick={onGoToDashboard} style={{ width: '100%' }}>
              Continue to Dashboard <RiArrowRightLine />
            </Button>
            <Button variant="ghost" onClick={onClose} style={{ width: '100%' }}>
              Review Steps
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OnboardingDashboard() {
  const navigate = useNavigate();
  const {
    steps, loading, error,
    fetchSteps, resetOnboarding, getStats,
    celebrated, setCelebrated,
  } = useOnboardingStore();

  useEffect(() => { fetchSteps(); }, [fetchSteps]);

  const stats = getStats();

  const stepsByCategory = useMemo(() =>
    ORDERED_CATEGORIES.reduce((acc, cat) => {
      const catSteps = steps.filter(s => s.category === cat);
      if (catSteps.length) acc.push({ name: cat, steps: catSteps });
      return acc;
    }, []),
  [steps]);

  const [activeCategory, setActiveCategory] = useState(null);

  // Auto-select first category once data loads
  useEffect(() => {
    if (stepsByCategory.length && !activeCategory) {
      setActiveCategory(stepsByCategory[0].name);
    }
  }, [stepsByCategory, activeCategory]);

  const nextStep = steps.find(s => s.status !== 'completed' && s.status !== 'verified');

  // Trigger celebration at 100%
  useEffect(() => {
    if (steps.length > 0 && stats.percentage === 100 && !celebrated) {
      const t = setTimeout(() => setCelebrated(true), 800);
      return () => clearTimeout(t);
    }
  }, [stats.percentage, steps.length, celebrated, setCelebrated]);

  const handleOpen = useCallback(stepId => {
    navigate(`${ROUTES.ONBOARDING}/${stepId}`);
  }, [navigate]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '5rem 1rem', gap: '1rem', textAlign: 'center',
      }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%', background: '#fef2f2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
        }}>⚠️</div>
        <h3 style={{ color: 'var(--color-neutral-800)', fontSize: '1.125rem', fontWeight: 700 }}>Failed to Load</h3>
        <p style={{ color: 'var(--color-neutral-500)', maxWidth: '28ch', fontSize: '0.875rem' }}>{error}</p>
        <Button onClick={fetchSteps}>Try Again</Button>
      </div>
    );
  }

  if (!steps.length) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '5rem 1rem', gap: '1rem', textAlign: 'center',
      }}>
        <div style={{
          width: '4rem', height: '4rem', borderRadius: '50%', background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
        }}>📋</div>
        <h3 style={{ color: 'var(--color-neutral-800)', fontSize: '1.125rem', fontWeight: 700 }}>No Steps Yet</h3>
        <p style={{ color: 'var(--color-neutral-500)', maxWidth: '30ch', fontSize: '0.875rem' }}>
          Your supervisor hasn't assigned any onboarding tasks yet. Check back soon.
        </p>
      </div>
    );
  }

  const activeCategoryData = stepsByCategory.find(c => c.name === activeCategory);

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '4rem' }}>

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: '0.25rem' }}>
              Onboarding Checklist
            </h1>
            <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem' }}>
              Complete your onboarding before diving into assigned tasks.
            </p>
          </div>
        </motion.div>

        {/* ── "Up Next" Spotlight Banner ───────────────────────────────── */}
        <AnimatePresence>
          {nextStep && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                border: '1.5px solid #c7d2fe',
                borderRadius: '1.125rem',
                padding: '1.125rem 1.5rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
              }}
            >
              <div style={{
                width: '2.5rem', height: '2.5rem',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
              }}>
                <RiPlayCircleLine style={{ color: '#fff', fontSize: '1.25rem' }} />
              </div>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '0.2rem' }}>
                  Up Next
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-neutral-900)' }}>
                  {nextStep.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-neutral-500)', marginTop: '0.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>{nextStep.category}</span>
                  <span style={{ color: 'var(--color-neutral-300)' }}>·</span>
                  <span>{formatMins(nextStep.estimatedTime ?? nextStep.duration ?? 0)}</span>
                </div>
              </div>
              <Button
                onClick={() => navigate(`${ROUTES.ONBOARDING}/${nextStep.id}`)}
                style={{ flexShrink: 0 }}
                rightIcon={<RiArrowRightLine />}
              >
                Continue
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Layout: Sidebar + Content ───────────────────────────── */}
        <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>

          {/* Sidebar */}
          <ProgressSidebar
            stats={stats}
            categories={stepsByCategory}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onReset={resetOnboarding}
          />

          {/* Main Content Panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              {activeCategoryData && (
                <CategoryPanel
                  key={activeCategory}
                  name={activeCategoryData.name}
                  steps={activeCategoryData.steps}
                  onOpen={handleOpen}
                  isActive
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Completion Celebration ───────────────────────────────────────── */}
      <AnimatePresence>
        {celebrated && stats.percentage === 100 && (
          <CelebrationOverlay
            stats={stats}
            onClose={() => setCelebrated(false)}
            onGoToDashboard={() => { setCelebrated(false); navigate(ROUTES.DASHBOARD); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
