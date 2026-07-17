/**
 * @file ReviewSkeletons.jsx
 * @description Skeleton loader components for the Performance Reviews module.
 */

// ── Shared pulse keyframe via inline style ─────────────────────────────────────

const pulse = {
  animation: 'pulse 1.5s ease-in-out infinite',
  background: 'linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-200) 50%, var(--color-neutral-100) 75%)',
  backgroundSize: '200% 100%',
};

const Box = ({ w = '100%', h = '1rem', r = '0.5rem', style = {} }) => (
  <div style={{ width: w, height: h, borderRadius: r, ...pulse, ...style }} />
);

// ── Review Card Skeleton ────────────────────────────────────────────────────────

export const ReviewCardSkeleton = () => (
  <div
    style={{
      background: 'var(--color-surface)',
      borderRadius: '1rem',
      border: '1px solid var(--color-border)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Box w="30%" h="1.25rem" />
        <Box w="65%" h="1.4rem" />
      </div>
      <Box w="3.5rem" h="3.5rem" r="50%" />
    </div>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Box w="8rem" h="1rem" />
      <Box w="7rem" h="1rem" />
    </div>
    <Box h="0.875rem" />
    <Box w="80%" h="0.875rem" />
    <Box w="6rem" h="1.75rem" r="99px" />
  </div>
);

// ── Review Card List Skeleton ──────────────────────────────────────────────────

export const ReviewCardListSkeleton = ({ count = 4 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '1.25rem',
    }}
  >
    {[...Array(count)].map((_, i) => (
      <ReviewCardSkeleton key={i} />
    ))}
  </div>
);

// ── Stats Bar Skeleton ──────────────────────────────────────────────────────────

export const ReviewStatsBarSkeleton = () => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        style={{
          flex: '1 1 160px',
          height: '7.5rem',
          borderRadius: '0.875rem',
          ...pulse,
        }}
      />
    ))}
  </div>
);

// ── Review Details Skeleton ─────────────────────────────────────────────────────

export const ReviewDetailSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    {/* Header */}
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Box w="20%" h="1rem" />
      <Box w="50%" h="2rem" />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Box w="8rem" h="1rem" />
        <Box w="7rem" h="1rem" />
        <Box w="6rem" h="1rem" />
      </div>
      <Box h="1rem" />
      <Box w="85%" h="1rem" />
      <Box w="70%" h="1rem" />
    </div>

    {/* Criteria */}
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: '1rem',
        border: '1px solid var(--color-border)',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <Box w="30%" h="1.5rem" />
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box w="8rem" h="1rem" />
            <Box w="3rem" h="1rem" />
          </div>
          <Box h="0.5rem" r="99px" />
          <Box w="80%" h="0.875rem" />
        </div>
      ))}
    </div>

    {/* Charts */}
    <Box h="18rem" r="1rem" />
  </div>
);

// ── Feedback Skeleton ───────────────────────────────────────────────────────────

export const FeedbackSkeleton = () => (
  <div
    style={{
      background: 'var(--color-surface)',
      borderRadius: '1rem',
      border: '1px solid var(--color-border)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    }}
  >
    <Box w="25%" h="1.5rem" />
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Box w="2.5rem" h="2.5rem" r="50%" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <Box w="40%" h="1rem" />
        <Box w="25%" h="0.75rem" />
      </div>
    </div>
    {[...Array(4)].map((_, i) => (
      <Box key={i} w={i % 2 === 0 ? '100%' : '80%'} h="0.875rem" />
    ))}
  </div>
);

// ── Self-Assessment Form Skeleton ──────────────────────────────────────────────

export const SelfAssessmentFormSkeleton = () => (
  <div
    style={{
      background: 'var(--color-surface)',
      borderRadius: '1rem',
      border: '1px solid var(--color-border)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}
  >
    <Box w="35%" h="1.5rem" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Box w="5rem" h="0.875rem" />
          <Box h="2.75rem" r="0.625rem" />
        </div>
      ))}
    </div>
    {[...Array(4)].map((_, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Box w="6rem" h="0.875rem" />
        <Box h="6rem" r="0.625rem" />
      </div>
    ))}
    <Box w="8rem" h="2.75rem" r="0.625rem" />
  </div>
);
