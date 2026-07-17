/**
 * @file Radio.jsx
 * @description Accessible custom radio button group with animated fill dot.
 */

import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * @param {object}   props
 * @param {Array<{value: string, label: string}>} props.options  Radio options
 * @param {string}   props.value        Currently selected value
 * @param {function} props.onChange     Change handler receives native event
 * @param {string}   props.name         Input group name
 * @param {string}   [props.error]      Error message
 * @param {boolean}  [props.disabled]   Disables all radios
 * @param {string}   [props.className]  Extra class names
 */
const Radio = ({
  options = [],
  value,
  onChange,
  name,
  error,
  disabled = false,
  className = '',
}) => {
  const baseId = useId();

  return (
    <div
      className={className}
      role="radiogroup"
      style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
    >
      {options.map((option) => {
        const inputId = `${baseId}-${option.value}`;
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
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
            {/* Hidden native radio */}
            <input
              id={inputId}
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={onChange}
              disabled={disabled}
              aria-invalid={!!error}
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                opacity: 0,
                margin: 0,
              }}
            />

            {/* Styled radio circle */}
            <span
              aria-hidden="true"
              style={{
                position: 'relative',
                flexShrink: 0,
                width: '1.125rem',
                height: '1.125rem',
                borderRadius: '50%',
                border: `2px solid ${isSelected ? 'var(--color-primary-600)' : 'var(--color-neutral-300)'}`,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.15s',
              }}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    key="dot"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                    style={{
                      width: '0.5rem',
                      height: '0.5rem',
                      borderRadius: '50%',
                      background: 'var(--color-primary-600)',
                      display: 'block',
                    }}
                  />
                )}
              </AnimatePresence>
            </span>

            {/* Label text */}
            <span
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-neutral-700)',
                lineHeight: 1.5,
              }}
            >
              {option.label}
            </span>
          </label>
        );
      })}

      {/* Error message */}
      {error && (
        <span
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-danger-600)',
            marginTop: '0.125rem',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Radio;
