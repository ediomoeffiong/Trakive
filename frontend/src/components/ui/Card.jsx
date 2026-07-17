/**
 * @file Card.jsx
 * @description Reusable Card container for Trakive.
 * Supports: interactive hover, padding variants, header/footer slots.
 */

import { motion } from 'framer-motion';

/**
 * @param {object} props
 * @param {boolean} [props.interactive=false] Enables lift-on-hover animation
 * @param {string}  [props.className]
 * @param {React.ReactNode} [props.header]
 * @param {React.ReactNode} [props.footer]
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md']
 * @param {React.ReactNode} props.children
 */
const paddingMap = { none: '0', sm: '1rem', md: '1.5rem', lg: '2rem' };

const Card = ({
  interactive = false,
  className = '',
  header,
  footer,
  padding = 'md',
  children,
  ...props
}) => {
  const classes = [
    'card',
    interactive ? 'card-interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const paddingValue = paddingMap[padding] ?? paddingMap.md;

  return (
    <motion.div
      className={classes}
      whileHover={interactive ? { y: -2, transition: { duration: 0.2 } } : undefined}
      {...props}
    >
      {header && (
        <div
          style={{
            padding: paddingValue,
            borderBottom: '1px solid var(--color-neutral-100)',
          }}
        >
          {header}
        </div>
      )}

      <div style={{ padding: paddingValue }}>{children}</div>

      {footer && (
        <div
          style={{
            padding: paddingValue,
            borderTop: '1px solid var(--color-neutral-100)',
          }}
        >
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
