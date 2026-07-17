/**
 * @file Avatar.jsx
 * @description User avatar component for Trakive.
 * Renders an image if provided, otherwise falls back to initials.
 */

/**
 * @param {object} props
 * @param {string}  [props.src]       Image URL
 * @param {string}  [props.name]      Full name — used to generate initials fallback
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md']
 * @param {string}  [props.className]
 * @param {boolean} [props.online]    Show a green online indicator dot
 */

const sizeMap = {
  xs: { width: '24px',  height: '24px',  fontSize: '0.625rem' },
  sm: { width: '32px',  height: '32px',  fontSize: '0.75rem'  },
  md: { width: '40px',  height: '40px',  fontSize: '0.9rem'   },
  lg: { width: '48px',  height: '48px',  fontSize: '1rem'     },
  xl: { width: '64px',  height: '64px',  fontSize: '1.25rem'  },
};

const dotSizeMap = {
  xs: { width: '7px',  height: '7px',  border: '1.5px solid #fff' },
  sm: { width: '9px',  height: '9px',  border: '2px solid #fff'   },
  md: { width: '11px', height: '11px', border: '2px solid #fff'   },
  lg: { width: '13px', height: '13px', border: '2px solid #fff'   },
  xl: { width: '15px', height: '15px', border: '2px solid #fff'   },
};

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = '',
  online,
  ...props
}) => {
  const dims = sizeMap[size] ?? sizeMap.md;
  const dotDims = dotSizeMap[size] ?? dotSizeMap.md;
  const initials = getInitials(name);

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      className={className}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          style={{
            ...dims,
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span
          style={{
            ...dims,
            borderRadius: '50%',
            background: 'var(--color-primary-600)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: dims.fontSize,
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
          aria-label={name || 'Avatar'}
        >
          {initials || '?'}
        </span>
      )}

      {online !== undefined && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            ...dotDims,
            borderRadius: '50%',
            background: online
              ? 'var(--color-success-500)'
              : 'var(--color-neutral-300)',
          }}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
