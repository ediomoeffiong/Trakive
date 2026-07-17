/**
 * @file ProgressBar.jsx
 * @description Linear progress bar component for Trakive.
 */

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const VARIANT_COLORS = {
  primary: 'var(--color-primary-600)',
  success: 'var(--color-success-500)',
  warning: 'var(--color-warning-500)',
  danger:  'var(--color-danger-500)',
};

const SIZE_HEIGHTS = { sm: '4px', md: '8px', lg: '12px' };

/**
 * @param {object} props
 * @param {number}  [props.value=0]           Current value (0–100)
 * @param {number}  [props.max=100]
 * @param {'primary'|'success'|'warning'|'danger'} [props.variant='primary']
 * @param {string}  [props.label]             Text label above the bar
 * @param {boolean} [props.showLabel=false]   Show percentage to the right
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.animated=true]
 * @param {string}  [props.className]
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'primary',
  label,
  showLabel = false,
  size = 'md',
  animated = true,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = VARIANT_COLORS[variant] ?? VARIANT_COLORS.primary;
  const height = SIZE_HEIGHTS[size] ?? SIZE_HEIGHTS.md;

  return (
    <div className={className} style={{ width: '100%' }}>
      {/* Top row: label + percentage */}
      {(label || showLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
          {label && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-neutral-700)' }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          width: '100%',
          height,
          background: 'var(--color-neutral-100)',
          borderRadius: '99px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: color,
            borderRadius: '99px',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
