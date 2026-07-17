/**
 * @file Divider.jsx
 * @description Horizontal or vertical divider line, optionally with a center label.
 */

/**
 * @param {object}                    props
 * @param {string}                    [props.label]              Optional center text label
 * @param {'horizontal'|'vertical'}   [props.orientation='horizontal']
 * @param {string}                    [props.className]          Extra class names
 */
const Divider = ({
  label,
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <span
        className={className}
        role="separator"
        aria-orientation="vertical"
        style={{
          display: 'inline-block',
          width: 1,
          height: '100%',
          background: 'var(--color-neutral-200)',
          flexShrink: 0,
        }}
      />
    );
  }

  if (label) {
    return (
      <div
        className={className}
        role="separator"
        aria-orientation="horizontal"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          width: '100%',
        }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'var(--color-neutral-200)',
          }}
        />
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-neutral-400)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            flex: 1,
            height: 1,
            background: 'var(--color-neutral-200)',
          }}
        />
      </div>
    );
  }

  return (
    <hr
      className={className}
      role="separator"
      aria-orientation="horizontal"
      style={{
        border: 'none',
        borderTop: '1px solid var(--color-neutral-200)',
        margin: 0,
        width: '100%',
      }}
    />
  );
};

export default Divider;
