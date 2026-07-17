/**
 * @file Switch.jsx
 * @description Pill-shaped animated toggle switch component.
 */

import { useId } from 'react';
import { motion } from 'framer-motion';

const SIZE_MAP = {
  sm: { track: { width: 32, height: 18 }, thumb: 12, thumbOffset: 2 },
  md: { track: { width: 44, height: 24 }, thumb: 16, thumbOffset: 4 },
  lg: { track: { width: 56, height: 30 }, thumb: 20, thumbOffset: 5 },
};

/**
 * @param {object}           props
 * @param {boolean}          [props.checked]        Controlled on/off state
 * @param {function}         [props.onChange]       Change handler
 * @param {boolean}          [props.disabled]       Disables interaction
 * @param {string}           [props.label]          Label text to the right
 * @param {'sm'|'md'|'lg'}   [props.size='md']      Switch size
 * @param {string}           [props.id]             Input id (auto-generated if omitted)
 * @param {string}           [props.className]      Extra class names
 */
const Switch = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  id,
  className = '',
}) => {
  const autoId = useId();
  const inputId = id ?? `switch-${autoId}`;
  const { track, thumb, thumbOffset } = SIZE_MAP[size] ?? SIZE_MAP.md;
  const travelX = track.width - thumb - thumbOffset * 2;

  return (
    <label
      htmlFor={inputId}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      {/* Hidden native checkbox */}
      <input
        id={inputId}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          margin: 0,
        }}
      />

      {/* Track */}
      <motion.span
        aria-hidden="true"
        animate={{
          backgroundColor: checked
            ? 'var(--color-primary-600)'
            : 'var(--color-neutral-200)',
        }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          width: track.width,
          height: track.height,
          borderRadius: track.height,
          padding: thumbOffset,
          boxSizing: 'border-box',
        }}
      >
        {/* Thumb */}
        <motion.span
          layout
          animate={{ x: checked ? travelX : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            display: 'block',
            width: thumb,
            height: thumb,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}
        />
      </motion.span>

      {/* Label */}
      {label && (
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-neutral-700)',
            lineHeight: 1.5,
          }}
        >
          {label}
        </span>
      )}
    </label>
  );
};

export default Switch;
