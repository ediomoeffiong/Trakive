/**
 * @file Badge.jsx
 * @description Status badge component for Trakive.
 * Supports semantic colour variants and optional dot indicator.
 */

/**
 * @param {object} props
 * @param {'primary'|'success'|'warning'|'danger'|'neutral'} [props.variant='neutral']
 * @param {boolean} [props.dot=false]  Show a coloured dot before text
 * @param {string}  [props.className]
 * @param {React.ReactNode} props.children
 */
const Badge = ({
  variant = 'neutral',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  const classes = ['badge', `badge-${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const dotColors = {
    primary: 'var(--color-primary-600)',
    success: 'var(--color-success-500)',
    warning: 'var(--color-warning-500)',
    danger:  'var(--color-danger-500)',
    neutral: 'var(--color-neutral-500)',
  };

  return (
    <span className={classes} {...props}>
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColors[variant] ?? dotColors.neutral,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
