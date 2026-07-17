/**
 * @file Pagination.jsx
 * @description Page navigation component for Trakive.
 */

import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { motion } from 'framer-motion';

/**
 * @param {object}   props
 * @param {number}   props.currentPage
 * @param {number}   props.totalPages
 * @param {Function} props.onPageChange   Called with new page number
 * @param {number}   [props.maxVisible=5] Max page buttons visible before ellipsis
 * @param {string}   [props.className]
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis markers
  const buildPages = () => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end   = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    const pages = [];
    if (start > 1)          { pages.push(1); if (start > 2) pages.push('...'); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages)   { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  };

  const pages = buildPages();

  const btnBase = {
    minWidth: '36px',
    height: '36px',
    padding: '0 0.5rem',
    border: '1.5px solid var(--color-neutral-200)',
    borderRadius: '0.5rem',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    color: 'var(--color-neutral-600)',
    fontFamily: 'inherit',
  };

  return (
    <nav
      aria-label="Pagination"
      className={className}
      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        style={{
          ...btnBase,
          opacity: currentPage === 1 ? 0.4 : 1,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => currentPage !== 1 && (e.currentTarget.style.borderColor = 'var(--color-primary-400)', e.currentTarget.style.color = 'var(--color-primary-600)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-200)', e.currentTarget.style.color = 'var(--color-neutral-600)')}
      >
        <RiArrowLeftSLine style={{ fontSize: '1rem' }} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ ...btnBase, border: 'none', cursor: 'default', color: 'var(--color-neutral-400)' }}>
            …
          </span>
        ) : (
          <motion.button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            aria-label={`Page ${p}`}
            whileTap={{ scale: 0.95 }}
            style={{
              ...btnBase,
              background: p === currentPage ? 'var(--color-primary-600)' : '#fff',
              borderColor: p === currentPage ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
              color: p === currentPage ? '#fff' : 'var(--color-neutral-600)',
              fontWeight: p === currentPage ? 700 : 500,
            }}
          >
            {p}
          </motion.button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        style={{
          ...btnBase,
          opacity: currentPage === totalPages ? 0.4 : 1,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => currentPage !== totalPages && (e.currentTarget.style.borderColor = 'var(--color-primary-400)', e.currentTarget.style.color = 'var(--color-primary-600)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-neutral-200)', e.currentTarget.style.color = 'var(--color-neutral-600)')}
      >
        <RiArrowRightSLine style={{ fontSize: '1rem' }} />
      </button>
    </nav>
  );
};

export default Pagination;
