/**
 * @file TaskSkeletonLoaders.jsx
 * @description Pulse skeleton loaders for the Supervisor Task Management module.
 * Matches exact dimensions of KPI cards, task tables, calendar grid, and submission lists.
 */

import { motion } from 'framer-motion';

const pulse = {
  animate: { opacity: [0.5, 1, 0.5] },
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
};

const SkeletonBox = ({ width = '100%', height = 16, rounded = 'md', style = {} }) => (
  <motion.div
    {...pulse}
    style={{
      width,
      height,
      borderRadius: rounded === 'full' ? '9999px' : rounded === 'md' ? '6px' : rounded === 'lg' ? '10px' : '4px',
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      flexShrink: 0,
      ...style,
    }}
  />
);

// ── Task KPI Card Skeleton ────────────────────────────────────────────────────
export const TaskKPISkeletonCard = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonBox width={42} height={42} rounded="lg" />
      <SkeletonBox width={60} height={22} rounded="full" />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <SkeletonBox width="60%" height={12} />
      <SkeletonBox width="40%" height={28} rounded="lg" />
      <SkeletonBox width="75%" height={11} />
    </div>
  </div>
);

export const TaskKPISkeletonGrid = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '1rem',
    }}
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <TaskKPISkeletonCard key={i} />
    ))}
  </div>
);

// ── Task Table Skeleton ────────────────────────────────────────────────────────
const TableRowSkeleton = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '40px 1fr 140px 100px 90px 100px 90px 80px',
      gap: '1rem',
      padding: '0.875rem 1rem',
      borderBottom: '1px solid var(--color-neutral-100)',
      alignItems: 'center',
    }}
  >
    <SkeletonBox width={20} height={20} rounded="md" />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <SkeletonBox width="80%" height={13} />
      <SkeletonBox width="55%" height={11} />
    </div>
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      <SkeletonBox width={24} height={24} rounded="full" />
      <SkeletonBox width={24} height={24} rounded="full" />
    </div>
    <SkeletonBox width={80} height={22} rounded="full" />
    <SkeletonBox width={60} height={22} rounded="full" />
    <SkeletonBox width={90} height={12} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <SkeletonBox width="80%" height={8} rounded="full" />
      <SkeletonBox width="50%" height={10} />
    </div>
    <SkeletonBox width={60} height={28} rounded="lg" />
  </div>
);

export const TaskTableSkeleton = ({ rows = 6 }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      border: '1px solid var(--color-neutral-200)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <div
      style={{
        padding: '1rem',
        borderBottom: '1px solid var(--color-neutral-200)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        background: 'var(--color-neutral-50)',
      }}
    >
      <SkeletonBox width={240} height={36} rounded="lg" />
      <SkeletonBox width={120} height={36} rounded="lg" />
      <SkeletonBox width={100} height={36} rounded="lg" />
      <div style={{ marginLeft: 'auto' }}>
        <SkeletonBox width={120} height={36} rounded="lg" />
      </div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <TableRowSkeleton key={i} />
    ))}
  </div>
);

// ── Task Details Skeleton ──────────────────────────────────────────────────────
export const TaskDetailsSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <SkeletonBox width={80} height={22} rounded="full" />
      <SkeletonBox width={60} height={22} rounded="full" />
      <SkeletonBox width={70} height={22} rounded="full" />
    </div>
    <SkeletonBox width="85%" height={28} rounded="lg" />
    <SkeletonBox width="95%" height={14} />
    <SkeletonBox width="88%" height={14} />
    <SkeletonBox width="75%" height={14} />
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBox key={i} width={80} height={34} rounded="lg" />
      ))}
    </div>
    <div
      style={{
        background: 'var(--color-neutral-50)',
        borderRadius: '0.875rem',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <SkeletonBox width={36} height={36} rounded="full" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <SkeletonBox width="40%" height={12} />
            <SkeletonBox width="60%" height={10} />
          </div>
          <SkeletonBox width={70} height={22} rounded="full" />
        </div>
      ))}
    </div>
  </div>
);

// ── Calendar Skeleton ──────────────────────────────────────────────────────────
export const TaskCalendarSkeleton = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      border: '1px solid var(--color-neutral-200)',
      padding: '1.25rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    }}
  >
    {/* Header controls */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <SkeletonBox width={200} height={32} rounded="lg" />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <SkeletonBox width={80} height={32} rounded="lg" />
        <SkeletonBox width={80} height={32} rounded="lg" />
        <SkeletonBox width={80} height={32} rounded="lg" />
      </div>
    </div>
    {/* Day headers */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
        <SkeletonBox key={i} width="100%" height={16} />
      ))}
    </div>
    {/* Calendar grid */}
    {Array.from({ length: 5 }).map((_, row) => (
      <div
        key={row}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}
      >
        {Array.from({ length: 7 }).map((_, col) => (
          <div
            key={col}
            style={{
              background: 'var(--color-neutral-50)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              height: '80px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <SkeletonBox width={20} height={20} rounded="full" />
            {Math.random() > 0.6 && <SkeletonBox width="90%" height={14} rounded="md" />}
            {Math.random() > 0.75 && <SkeletonBox width="70%" height={14} rounded="md" />}
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ── Submission Monitoring Skeleton ─────────────────────────────────────────────
export const SubmissionMonitoringSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {/* Status summary row */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#fff',
            borderRadius: '0.875rem',
            padding: '1rem',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <SkeletonBox width={36} height={36} rounded="full" />
          <SkeletonBox width="70%" height={24} rounded="lg" />
          <SkeletonBox width="90%" height={12} />
        </div>
      ))}
    </div>
    {/* Submission cards */}
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: '#fff',
          borderRadius: '0.875rem',
          padding: '1.25rem',
          border: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SkeletonBox width={40} height={40} rounded="full" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <SkeletonBox width="45%" height={13} />
            <SkeletonBox width="70%" height={11} />
          </div>
          <SkeletonBox width={90} height={28} rounded="lg" />
        </div>
        <SkeletonBox width="90%" height={12} />
        <SkeletonBox width="75%" height={12} />
      </div>
    ))}
  </div>
);

// ── Template Card Skeleton ─────────────────────────────────────────────────────
export const TemplateCardSkeleton = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '0.875rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <SkeletonBox width="60%" height={16} />
      <SkeletonBox width={60} height={22} rounded="full" />
    </div>
    <SkeletonBox width="90%" height={12} />
    <SkeletonBox width="80%" height={12} />
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <SkeletonBox width={60} height={22} rounded="full" />
      <SkeletonBox width={80} height={22} rounded="full" />
    </div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <SkeletonBox width={90} height={34} rounded="lg" />
      <SkeletonBox width={80} height={34} rounded="lg" />
    </div>
  </div>
);

export const TemplatesGridSkeleton = ({ count = 6 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <TemplateCardSkeleton key={i} />
    ))}
  </div>
);
