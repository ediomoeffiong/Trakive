/**
 * @file Checkbox.jsx
 * @description Accessible custom styled checkbox with animated checkmark.
 */

import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @param {object}   props
 * @param {string}   [props.label]       Label text displayed to the right
 * @param {string}   [props.error]       Error message displayed below
 * @param {string}   [props.hint]        Hint text displayed below (muted)
 * @param {boolean}  [props.checked]     Controlled checked state
 * @param {function} [props.onChange]    Change handler
 * @param {boolean}  [props.disabled]    Disables interaction
 * @param {string}   [props.id]          ID for the native input (auto-generated if omitted)
 * @param {string}   [props.className]   Extra class names
 */
const Checkbox = ({
  label,
  error,
  hint,
  checked = false,
  onChange,
  disabled = false,
  id,
  className = '',
}) => {
  const autoId = useId();
  const inputId = id ?? `checkbox-${autoId}`;

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}
    >
      <label
        htmlFor={inputId}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.625rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          userSelect: 'none',
        }}
      >
        {/* Hidden native input */}
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, margin: 0 }}
        />

        {/* Styled checkbox box */}
        <span
          style={{
            position: 'relative',
            flexShrink: 0,
            width: '1.125rem',
            height: '1.125rem',
            borderRadius: '0.3125rem',
            border: `2px solid ${checked ? 'var(--color-primary-600)' : 'var(--color-neutral-300)'}`,
            background: checked ? 'var(--color-primary-600)' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          aria-hidden="true"
        >
          <AnimatePresence>
            {checked && (
              <motion.svg
                key="check"
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <path
                  d="M1 4L3.8 7L9 1"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </span>

        {/* Label text */}
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

      {/* Error message */}
      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-danger-600)',
            paddingLeft: '1.75rem',
          }}
        >
          {error}
        </span>
      )}

      {/* Hint text */}
      {!error && hint && (
        <span
          id={`${inputId}-hint`}
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-neutral-400)',
            paddingLeft: '1.75rem',
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
};

export default Checkbox;
