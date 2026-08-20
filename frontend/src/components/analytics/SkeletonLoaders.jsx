/**
 * @file SkeletonLoaders.jsx
 * @description Loading skeleton components for Analytics widgets and cards.
 */

export const KPICardSkeleton = () => (
  <div
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
      <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '8px' }} />
    </div>
    <div className="skeleton" style={{ width: '120px', height: '32px', borderRadius: '6px' }} />
    <div className="skeleton" style={{ width: '140px', height: '12px', borderRadius: '4px' }} />
  </div>
);

export const ChartCardSkeleton = () => (
  <div
    style={{
      background: '#ffffff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '340px',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div className="skeleton" style={{ width: '180px', height: '18px', borderRadius: '4px' }} />
      <div className="skeleton" style={{ width: '240px', height: '12px', borderRadius: '4px' }} />
    </div>
    <div className="skeleton" style={{ flex: 1, width: '100%', borderRadius: '0.75rem' }} />
  </div>
);

export const AnalyticsDashboardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
    <div className="skeleton" style={{ width: '100%', height: '100px', borderRadius: '1rem' }} />
    <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '1rem' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
      <ChartCardSkeleton />
      <ChartCardSkeleton />
    </div>
  </div>
);
