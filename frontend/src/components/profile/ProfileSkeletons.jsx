/**
 * @file ProfileSkeletons.jsx
 * @description Shimmer skeleton loaders for profile sections.
 */

import Skeleton from '../ui/Skeleton';

// ── Profile Header Skeleton ────────────────────────────────────────────────────

export const ProfileHeaderSkeleton = () => (
  <div className="card p-6 mb-6">
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      {/* Avatar */}
      <Skeleton width={100} height={100} borderRadius="50%" />
      {/* Info */}
      <div className="flex-1 w-full">
        <Skeleton width="55%" height="1.75rem" className="mb-2" />
        <Skeleton width="35%" height="1rem" className="mb-1" />
        <Skeleton width="45%" height="1rem" className="mb-4" />
        {/* Stats row */}
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={100} height={60} borderRadius="0.75rem" />
          ))}
        </div>
      </div>
    </div>
    {/* Tab nav */}
    <div className="flex gap-2 mt-6 overflow-x-auto">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} width={90} height={34} borderRadius="2rem" />
      ))}
    </div>
  </div>
);

// ── Info Cards Skeleton ─────────────────────────────────────────────────────────

export const InfoCardsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="card p-4">
        <Skeleton width="40%" height="0.75rem" className="mb-2" />
        <Skeleton width="70%" height="1rem" />
      </div>
    ))}
  </div>
);

// ── Skills Skeleton ─────────────────────────────────────────────────────────────

export const SkillsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="card p-4 flex items-center gap-4">
        <Skeleton width={40} height={40} borderRadius="0.625rem" />
        <div className="flex-1">
          <Skeleton width="40%" height="0.875rem" className="mb-2" />
          <Skeleton width="100%" height="6px" borderRadius="99px" />
        </div>
        <Skeleton width={70} height={24} borderRadius="99px" />
      </div>
    ))}
  </div>
);

// ── Documents Skeleton ──────────────────────────────────────────────────────────

export const DocumentsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="card p-4 flex items-center gap-4">
        <Skeleton width={44} height={44} borderRadius="0.625rem" />
        <div className="flex-1">
          <Skeleton width="50%" height="0.875rem" className="mb-1" />
          <Skeleton width="30%" height="0.75rem" />
        </div>
        <div className="flex gap-2">
          <Skeleton width={32} height={32} borderRadius="0.5rem" />
          <Skeleton width={32} height={32} borderRadius="0.5rem" />
        </div>
      </div>
    ))}
  </div>
);

// ── Activity Timeline Skeleton ──────────────────────────────────────────────────

export const ActivityTimelineSkeleton = () => (
  <div className="relative space-y-0">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4 pb-6">
        <div className="flex flex-col items-center">
          <Skeleton width={36} height={36} borderRadius="50%" />
          {i < 5 && <div style={{ width: 2, flex: 1, background: 'var(--color-neutral-200)', marginTop: 4 }} />}
        </div>
        <div className="flex-1 pt-1">
          <Skeleton width="50%" height="0.875rem" className="mb-1" />
          <Skeleton width="75%" height="0.75rem" className="mb-1" />
          <Skeleton width="30%" height="0.7rem" />
        </div>
      </div>
    ))}
  </div>
);

// ── Generic Section Skeleton ────────────────────────────────────────────────────

export const SectionSkeleton = () => (
  <div className="card p-6">
    <div className="flex justify-between items-center mb-5">
      <Skeleton width="30%" height="1.25rem" />
      <Skeleton width={80} height={32} borderRadius="0.625rem" />
    </div>
    <Skeleton count={3} height="0.875rem" />
  </div>
);
