/**
 * @file AuthHeader.jsx
 * @description Standard title and subtitle block for auth pages.
 */

const AuthHeader = ({ title, subtitle, className = '', ...props }) => {
  return (
    <div
      className={`auth-header ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1.75rem',
        ...props.style,
      }}
      {...props}
    >
      <h2
        style={{
          fontSize: '1.625rem',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          color: 'var(--color-neutral-900)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-neutral-500)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default AuthHeader;
