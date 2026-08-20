/**
 * @file SettingsSkeletons.jsx
 * @description Skeleton loading components for all Settings module pages.
 */

const SkeletonBox = ({ width = '100%', height = 16, style = {} }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius: 8, ...style }}
  />
);

// ── Dashboard Skeleton ────────────────────────────────────────────────────────
export const SettingsDashboardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    {/* Header */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <SkeletonBox width={200} height={28} />
      <SkeletonBox width={320} height={16} />
    </div>

    {/* Category grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '1rem',
    }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <SkeletonBox width={40} height={40} style={{ borderRadius: '50%' }} />
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="90%" height={12} />
          <SkeletonBox width="75%" height={12} />
        </div>
      ))}
    </div>
  </div>
);

// ── Form Skeleton ─────────────────────────────────────────────────────────────
export const SettingsFormSkeleton = ({ fields = 4 }) => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <SkeletonBox width={180} height={22} />
      <SkeletonBox width={300} height={14} />
    </div>
    <div style={{ height: 1, background: 'var(--color-neutral-100)' }} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <SkeletonBox width={100} height={13} />
          <SkeletonBox width="100%" height={40} style={{ borderRadius: 10 }} />
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <SkeletonBox width={120} height={38} style={{ borderRadius: 10 }} />
    </div>
  </div>
);

// ── Session Card Skeleton ─────────────────────────────────────────────────────
export const SessionCardSkeleton = () => (
  <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <SkeletonBox width={40} height={40} style={{ borderRadius: '50%', flexShrink: 0 }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <SkeletonBox width="50%" height={15} />
      <SkeletonBox width="70%" height={12} />
      <SkeletonBox width="40%" height={11} />
    </div>
    <SkeletonBox width={80} height={32} style={{ borderRadius: 8, flexShrink: 0 }} />
  </div>
);

export const SessionsListSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <SessionCardSkeleton key={i} />
    ))}
  </div>
);

// ── Toggle/Switch Row Skeleton ────────────────────────────────────────────────
export const SwitchRowSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <SkeletonBox width={160} height={15} />
      <SkeletonBox width={240} height={12} />
    </div>
    <SkeletonBox width={44} height={24} style={{ borderRadius: 99, flexShrink: 0 }} />
  </div>
);

export const SwitchGroupSkeleton = ({ rows = 5 }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
      <SkeletonBox width={160} height={20} />
      <SkeletonBox width={280} height={13} />
    </div>
    <div style={{ height: 1, background: 'var(--color-neutral-100)', marginBottom: '0.5rem' }} />
    {Array.from({ length: rows }).map((_, i) => (
      <SwitchRowSkeleton key={i} />
    ))}
  </div>
);
