/**
 * @file Loaders.jsx
 * @description Skeleton Loaders for Supervisor Dashboard sections.
 */

import { motion } from 'framer-motion';

const SkeletonBox = ({ height = '20px', width = '100%', borderRadius = '0.5rem', style = {} }) => (
  <div
    style={{
      height,
      width,
      borderRadius,
      backgroundColor: 'var(--color-neutral-200)',
      animation: 'pulse 1.5s infinite ease-in-out',
      ...style,
    }}
  />
);

export const KPICardsLoader = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBox height="42px" width="42px" borderRadius="0.75rem" />
          <SkeletonBox height="22px" width="60px" borderRadius="999px" />
        </div>
        <SkeletonBox height="14px" width="70%" />
        <SkeletonBox height="32px" width="40%" />
        <SkeletonBox height="12px" width="90%" />
      </div>
    ))}
  </div>
);

export const TableLoader = () => (
  <div
    style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <SkeletonBox height="24px" width="200px" />
      <SkeletonBox height="36px" width="300px" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <SkeletonBox height="40px" width="40px" borderRadius="50%" />
        <SkeletonBox height="20px" width="150px" />
        <SkeletonBox height="20px" width="120px" />
        <SkeletonBox height="20px" width="180px" />
        <SkeletonBox height="20px" width="80px" />
      </div>
    ))}
  </div>
);

export const ChartLoader = () => (
  <div
    style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      height: '300px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <SkeletonBox height="20px" width="250px" />
    <SkeletonBox height="200px" width="100%" />
  </div>
);

export const DashboardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
    <KPICardsLoader />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      <ChartLoader />
      <ChartLoader />
    </div>
    <TableLoader />
  </div>
);
