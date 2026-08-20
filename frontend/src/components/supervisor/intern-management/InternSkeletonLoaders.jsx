/**
 * @file InternSkeletonLoaders.jsx
 * @description Skeleton loaders for all Intern Management module sections.
 * Follows the same SkeletonBox pattern established in the Supervisor Dashboard Loaders.jsx.
 */

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

// ── KPI Cards skeleton ────────────────────────────────────────────────────────
export const InternKPILoader = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: '#fff',
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
          <SkeletonBox height="22px" width="64px" borderRadius="999px" />
        </div>
        <SkeletonBox height="13px" width="70%" />
        <SkeletonBox height="30px" width="45%" />
        <SkeletonBox height="12px" width="85%" />
      </div>
    ))}
  </div>
);

// ── Table skeleton ─────────────────────────────────────────────────────────────
export const InternTableLoader = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
      <SkeletonBox height="24px" width="220px" />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <SkeletonBox height="36px" width="200px" borderRadius="0.5rem" />
        <SkeletonBox height="36px" width="140px" borderRadius="0.5rem" />
        <SkeletonBox height="36px" width="120px" borderRadius="0.5rem" />
      </div>
    </div>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-neutral-100)' }}>
        <SkeletonBox height="40px" width="40px" borderRadius="50%" />
        <SkeletonBox height="20px" width="140px" />
        <SkeletonBox height="20px" width="100px" />
        <SkeletonBox height="20px" width="180px" />
        <SkeletonBox height="20px" width="80px" />
        <SkeletonBox height="8px" width="100px" borderRadius="999px" />
        <SkeletonBox height="22px" width="70px" borderRadius="999px" />
      </div>
    ))}
  </div>
);

// ── Profile header skeleton ────────────────────────────────────────────────────
export const InternProfileHeaderLoader = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid var(--color-neutral-200)',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      flexWrap: 'wrap',
    }}
  >
    <SkeletonBox height="96px" width="96px" borderRadius="50%" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <SkeletonBox height="28px" width="240px" />
      <SkeletonBox height="16px" width="180px" />
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <SkeletonBox height="22px" width="90px" borderRadius="999px" />
        <SkeletonBox height="22px" width="80px" borderRadius="999px" />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBox key={i} height="36px" width="120px" borderRadius="0.5rem" />
      ))}
    </div>
  </div>
);

// ── Tab skeleton ──────────────────────────────────────────────────────────────
export const InternTabsLoader = () => (
  <div
    style={{
      background: '#fff',
      borderRadius: '1rem',
      padding: '1.25rem',
      border: '1px solid var(--color-neutral-200)',
    }}
  >
    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.75rem' }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBox key={i} height="32px" width="90px" borderRadius="0.5rem" />
      ))}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SkeletonBox height="20px" width="60%" />
      <SkeletonBox height="20px" width="80%" />
      <SkeletonBox height="20px" width="45%" />
    </div>
  </div>
);

// ── Timeline skeleton ─────────────────────────────────────────────────────────
export const InternTimelineLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: '0.875rem' }}>
        <SkeletonBox height="32px" width="32px" borderRadius="50%" />
        <div
          style={{
            flex: 1,
            background: 'var(--color-neutral-50)',
            borderRadius: '0.75rem',
            padding: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            border: '1px solid var(--color-neutral-200)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <SkeletonBox height="14px" width="160px" />
            <SkeletonBox height="14px" width="80px" />
          </div>
          <SkeletonBox height="12px" width="90%" />
        </div>
      </div>
    ))}
  </div>
);

// ── Notes skeleton ────────────────────────────────────────────────────────────
export const InternNotesLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <SkeletonBox height="16px" width="200px" />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <SkeletonBox height="26px" width="26px" borderRadius="0.375rem" />
            <SkeletonBox height="26px" width="26px" borderRadius="0.375rem" />
          </div>
        </div>
        <SkeletonBox height="12px" width="100%" />
        <SkeletonBox height="12px" width="75%" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonBox height="20px" width="80px" borderRadius="999px" />
          <SkeletonBox height="12px" width="100px" />
        </div>
      </div>
    ))}
  </div>
);

// ── Documents skeleton ────────────────────────────────────────────────────────
export const InternDocumentsLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.25rem',
          background: '#fff',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.75rem',
        }}
      >
        <SkeletonBox height="40px" width="40px" borderRadius="0.625rem" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SkeletonBox height="14px" width="180px" />
          <SkeletonBox height="12px" width="120px" />
        </div>
        <SkeletonBox height="22px" width="70px" borderRadius="999px" />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <SkeletonBox height="30px" width="60px" borderRadius="0.375rem" />
          <SkeletonBox height="30px" width="80px" borderRadius="0.375rem" />
        </div>
      </div>
    ))}
  </div>
);

// ── Progress widgets skeleton ─────────────────────────────────────────────────
export const InternProgressLoader = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid var(--color-neutral-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
          alignItems: 'center',
        }}
      >
        <SkeletonBox height="80px" width="80px" borderRadius="50%" />
        <SkeletonBox height="14px" width="120px" />
        <SkeletonBox height="12px" width="80px" />
      </div>
    ))}
  </div>
);
