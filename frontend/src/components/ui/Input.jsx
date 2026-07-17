/**
 * @file Input.jsx
 * @description Reusable form Input for Trakive.
 * Integrates with React Hook Form via forwardRef.
 * Supports: label, error message, left/right addons, help text.
 */

import { forwardRef } from 'react';

/**
 * @param {object} props
 * @param {string}  [props.label]
 * @param {string}  [props.error]        Validation error message
 * @param {string}  [props.hint]         Help text below the input
 * @param {React.ReactNode} [props.leftAddon]
 * @param {React.ReactNode} [props.rightAddon]
 * @param {string}  [props.className]
 * @param {string}  props.id             Required for label association
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      className = '',
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-neutral-700)',
            }}
          >
            {label}
          </label>
        )}

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftAddon && (
            <span
              style={{
                position: 'absolute',
                left: '0.75rem',
                color: 'var(--color-neutral-400)',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {leftAddon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={['input-field', error ? 'error' : '', className]
              .filter(Boolean)
              .join(' ')}
            style={{
              paddingLeft: leftAddon ? '2.375rem' : undefined,
              paddingRight: rightAddon ? '2.375rem' : undefined,
            }}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />

          {rightAddon && (
            <span
              style={{
                position: 'absolute',
                right: '0.75rem',
                color: 'var(--color-neutral-400)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {rightAddon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            style={{ fontSize: '0.8125rem', color: 'var(--color-danger-600)', margin: 0 }}
          >
            {error}
          </p>
        )}

        {!error && hint && (
          <p
            id={`${inputId}-hint`}
            style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
