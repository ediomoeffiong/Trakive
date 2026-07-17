/**
 * @file Breadcrumb.jsx
 * @description Accessible breadcrumb navigation component.
 */

import { Link } from 'react-router-dom';
import { RiArrowRightSLine } from 'react-icons/ri';

/**
 * @param {object} props
 * @param {Array<{label: string, to?: string, href?: string}>} props.items
 * @param {React.ReactNode} [props.separator]  Default: chevron icon
 * @param {string} [props.className]
 */
const Breadcrumb = ({ items = [], separator, className = '' }) => {
  const sep = separator ?? (
    <RiArrowRightSLine
      aria-hidden
      style={{ color: 'var(--color-neutral-300)', fontSize: '1rem', flexShrink: 0 }}
    />
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          flexWrap: 'wrap',
        }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;

          return (
            <li
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {isLast ? (
                <span
                  aria-current="page"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-neutral-800)',
                  }}
                >
                  {item.label}
                </span>
              ) : item.to ? (
                <Link
                  to={item.to}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-500)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-600)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-500)')}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href ?? '#'}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-500)',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-600)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-neutral-500)')}
                >
                  {item.label}
                </a>
              )}
              {!isLast && sep}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
