/**
 * @file CircularProgress.jsx
 * @description SVG circular progress indicator for Trakive.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const VARIANT_COLORS = {
  primary: 'var(--color-primary-600)',
  success: 'var(--color-success-500)',
  warning: 'var(--color-warning-500)',
  danger:  'var(--color-danger-500)',
};

/**
 * @param {object} props
 * @param {number}  [props.value=0]        Progress value 0–100
 * @param {number}  [props.size=80]        Diameter in px
 * @param {number}  [props.strokeWidth=8]
 * @param {'primary'|'success'|'warning'|'danger'} [props.variant='primary']
 * @param {boolean} [props.showValue=true] Show percentage in center
 * @param {string}  [props.label]          Text label below the circle
 * @param {string}  [props.className]
 */
const CircularProgress = ({
  value = 0,
  size = 80,
  strokeWidth = 8,
  variant = 'primary',
  showValue = true,
  label,
  className = '',
}) => {
  const pct = Math.min(100, Math.max(0, value));
  const color = VARIANT_COLORS[variant] ?? VARIANT_COLORS.primary;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-neutral-200)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>

        {/* Center value */}
        {showValue && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontSize: size < 60 ? '0.75rem' : '1rem',
              fontWeight: 700,
              color: 'var(--color-neutral-800)',
            }}>
              {Math.round(pct)}%
            </span>
          </div>
        )}
      </div>

      {label && (
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
};

export default CircularProgress;
