/**
 * @file Skeleton.jsx
 * @description Shimmer loading placeholder with animated gradient.
 */

const shimmerKeyframes = `
@keyframes trakive-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
}
`;

// Inject keyframes once into the document head
if (typeof document !== 'undefined') {
  const styleId = 'trakive-skeleton-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = shimmerKeyframes;
    document.head.appendChild(style);
  }
}

/**
 * @param {object}  props
 * @param {string|number} [props.width='100%']      Width of each skeleton bar
 * @param {string|number} [props.height='1rem']     Height of each skeleton bar
 * @param {string}  [props.borderRadius='0.375rem'] Border radius
 * @param {string}  [props.className]               Extra class names
 * @param {number}  [props.count=1]                 Number of skeleton lines to render
 */
const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  className = '',
  count = 1,
  style: styleProp = {},
}) => {
  const baseStyle = {
    width,
    height,
    borderRadius,
    background:
      'linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-neutral-100) 50%, var(--color-neutral-200) 75%)',
    backgroundSize: '600px 100%',
    animation: 'trakive-shimmer 1.4s infinite linear',
    display: 'block',
    ...styleProp,
  };

  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <span
          key={i}
          className={className}
          style={{
            ...baseStyle,
            marginTop: i > 0 ? '0.5rem' : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

export default Skeleton;
