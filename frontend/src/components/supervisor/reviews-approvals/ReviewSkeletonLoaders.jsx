/**
 * @file ReviewSkeletonLoaders.jsx
 * @description Shimmer skeleton loaders for the Supervisor Reviews & Approvals module.
 */

const Shimmer = ({ style = {} }) => (
  <div
    style={{
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      borderRadius: '0.5rem',
      ...style,
    }}
  />
);

// Inject shimmer keyframes once
if (typeof document !== 'undefined' && !document.getElementById('shimmer-kf')) {
  const style = document.createElement('style');
  style.id = 'shimmer-kf';
  style.textContent = `@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
  document.head.appendChild(style);
}

export const KPICardSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Shimmer style={{ width: '36px', height: '36px', borderRadius: '0.75rem' }} />
          <Shimmer style={{ width: '48px', height: '20px' }} />
        </div>
        <Shimmer style={{ width: '60%', height: '28px' }} />
        <Shimmer style={{ width: '80%', height: '14px' }} />
      </div>
    ))}
  </div>
);

export const SubmissionTableSkeleton = ({ rows = 7 }) => (
  <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
    {/* Header */}
    <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 2fr 120px 100px 80px 80px 100px', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Shimmer key={i} style={{ height: '14px', width: '80%' }} />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 2fr 120px 100px 80px 80px 100px', gap: '1rem', padding: '1rem 1.25rem', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
        <Shimmer style={{ width: '16px', height: '16px', borderRadius: '4px' }} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Shimmer style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Shimmer style={{ width: '70%', height: '13px' }} />
            <Shimmer style={{ width: '50%', height: '11px' }} />
          </div>
        </div>
        <Shimmer style={{ width: '85%', height: '13px' }} />
        <Shimmer style={{ width: '90px', height: '13px' }} />
        <Shimmer style={{ width: '70px', height: '22px', borderRadius: '9999px' }} />
        <Shimmer style={{ width: '40px', height: '13px' }} />
        <Shimmer style={{ width: '60px', height: '22px', borderRadius: '9999px' }} />
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <Shimmer style={{ width: '28px', height: '28px', borderRadius: '0.375rem' }} />
          <Shimmer style={{ width: '28px', height: '28px', borderRadius: '0.375rem' }} />
        </div>
      </div>
    ))}
  </div>
);

export const OnboardingCardSkeleton = ({ count = 4 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Shimmer style={{ width: '44px', height: '44px', borderRadius: '50%' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Shimmer style={{ width: '60%', height: '15px' }} />
            <Shimmer style={{ width: '40%', height: '12px' }} />
          </div>
        </div>
        <Shimmer style={{ width: '100%', height: '8px', borderRadius: '9999px' }} />
        {Array.from({ length: 3 }).map((_, j) => (
          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem', background: '#f8fafc', borderRadius: '0.5rem' }}>
            <Shimmer style={{ width: '50%', height: '13px' }} />
            <Shimmer style={{ width: '60px', height: '22px', borderRadius: '9999px' }} />
          </div>
        ))}
      </div>
    ))}
  </div>
);

export const ScheduleCardSkeleton = ({ count = 4 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Shimmer style={{ width: '56px', height: '56px', borderRadius: '0.875rem', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Shimmer style={{ width: '50%', height: '15px' }} />
          <Shimmer style={{ width: '35%', height: '12px' }} />
          <Shimmer style={{ width: '40%', height: '12px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Shimmer style={{ width: '64px', height: '30px', borderRadius: '0.5rem' }} />
          <Shimmer style={{ width: '64px', height: '30px', borderRadius: '0.5rem' }} />
        </div>
      </div>
    ))}
  </div>
);

export const HistoryTimelineSkeleton = ({ count = 5 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', gap: '1rem' }}>
        <Shimmer style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Shimmer style={{ width: '40%', height: '15px' }} />
            <Shimmer style={{ width: '80px', height: '22px', borderRadius: '9999px' }} />
          </div>
          <Shimmer style={{ width: '30%', height: '12px' }} />
          <Shimmer style={{ width: '90%', height: '12px' }} />
          <Shimmer style={{ width: '75%', height: '12px' }} />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            {Array.from({ length: 3 }).map((_, j) => (
              <Shimmer key={j} style={{ width: '80px', height: '22px', borderRadius: '9999px' }} />
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const DrawerDetailsSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Shimmer style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Shimmer style={{ width: '45%', height: '16px' }} />
        <Shimmer style={{ width: '30%', height: '13px' }} />
      </div>
    </div>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Shimmer style={{ width: '25%', height: '12px' }} />
        <Shimmer style={{ width: '100%', height: '60px', borderRadius: '0.75rem' }} />
      </div>
    ))}
  </div>
);
