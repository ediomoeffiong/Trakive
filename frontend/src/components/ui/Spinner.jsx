/**
 * @file Spinner.jsx
 * @description SVG circular spinner using stroke-dasharray technique.
 */

import { motion } from 'framer-motion';

const SIZE_MAP = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
};

/**
 * @param {object}  props
 * @param {'xs'|'sm'|'md'|'lg'} [props.size='md']      Spinner size
 * @param {string}  [props.color]                        CSS color (defaults to primary-600)
 * @param {string}  [props.className]                    Extra class names
 */
const Spinner = ({
  size = 'md',
  color = 'var(--color-primary-600)',
  className = '',
}) => {
  const px = SIZE_MAP[size] ?? SIZE_MAP.md;
  const strokeWidth = size === 'xs' ? 2.5 : size === 'sm' ? 2.5 : 3;
  const r = (px - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * 0.75; // 75% arc visible

  return (
    <motion.svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      className={className}
      aria-label="Loading"
      role="status"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      style={{ flexShrink: 0 }}
    >
      {/* Track */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke="var(--color-neutral-200)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${px / 2} ${px / 2})`}
      />
    </motion.svg>
  );
};

export default Spinner;
