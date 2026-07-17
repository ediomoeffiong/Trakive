/**
 * @file Button.jsx
 * @description Reusable Button component for Trakive.
 * Supports: variant, size, loading state, icon-only, as-link.
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variantClass = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  outline:   'btn-outline',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
};

const sizeClass = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

/**
 * @param {object}  props
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {boolean} [props.loading=false]  Shows spinner and disables interaction
 * @param {boolean} [props.iconOnly=false] Removes text padding
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
const Button = forwardRef(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const classes = [
      'btn',
      variantClass[variant] ?? variantClass.primary,
      sizeClass[size] ?? '',
      iconOnly ? 'btn-icon' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        whileTap={{ scale: 0.97 }}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {!iconOnly && children}
        {!loading && rightIcon}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
