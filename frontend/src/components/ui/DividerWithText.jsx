/**
 * @file DividerWithText.jsx
 * @description Standard horizontal divider line with centered label text.
 */

const DividerWithText = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`flex items-center my-4 ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1.25rem 0',
        width: '100%',
        ...props.style,
      }}
      {...props}
    >
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: 'var(--color-neutral-200)',
        }}
      />
      <span
        style={{
          padding: '0 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-neutral-400)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {children}
      </span>
      <div
        style={{
          flex: 1,
          height: '1px',
          backgroundColor: 'var(--color-neutral-200)',
        }}
      />
    </div>
  );
};

export default DividerWithText;
