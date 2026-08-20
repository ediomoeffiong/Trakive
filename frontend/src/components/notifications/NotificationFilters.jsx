/**
 * @file NotificationFilters.jsx
 * @description Filter bar for the notifications page.
 * Provides status tabs (All / Unread / Read) and category filter dropdown.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiFilter3Line, RiCloseLine, RiCheckLine } from 'react-icons/ri';
import { useNotificationStore } from '../../store';
import { notificationCategories } from '../../data/notificationCategories';

// ── Status tabs ──────────────────────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

const NotificationFilters = () => {
  const filters = useNotificationStore((s) => s.filters);
  const setFilter = useNotificationStore((s) => s.setFilter);
  const resetFilters = useNotificationStore((s) => s.resetFilters);
  const searchQuery = useNotificationStore((s) => s.searchQuery);

  const [categoryOpen, setCategoryOpen] = useState(false);

  const hasActiveFilters =
    filters.status !== 'all' || filters.category !== 'all' || searchQuery;

  const selectedCategory = notificationCategories.find(
    (c) => c.key === filters.category
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Status filter tabs */}
      <div
        style={{
          display: 'flex',
          background: 'var(--color-neutral-100)',
          borderRadius: '0.625rem',
          padding: '3px',
          gap: '2px',
        }}
        role="tablist"
        aria-label="Filter by read status"
      >
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={filters.status === tab.key}
            onClick={() => setFilter('status', tab.key)}
            style={{
              position: 'relative',
              padding: '0.3rem 0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              color:
                filters.status === tab.key
                  ? 'var(--color-neutral-900)'
                  : 'var(--color-neutral-500)',
              transition: 'color 0.15s',
              zIndex: 1,
            }}
          >
            {filters.status === tab.key && (
              <motion.span
                layoutId="notif-filter-tab"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '0.5rem',
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category filter dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setCategoryOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={categoryOpen}
          id="category-filter-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.375rem 0.875rem',
            borderRadius: '0.625rem',
            border: `1px solid ${filters.category !== 'all' ? 'var(--color-primary-400)' : 'var(--color-neutral-200)'}`,
            background: filters.category !== 'all' ? 'var(--color-primary-50)' : '#fff',
            color:
              filters.category !== 'all'
                ? 'var(--color-primary-700)'
                : 'var(--color-neutral-600)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <RiFilter3Line />
          {selectedCategory ? selectedCategory.label : 'Category'}
          {filters.category !== 'all' && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setFilter('category', 'all');
              }}
              style={{ display: 'flex', alignItems: 'center' }}
              aria-label="Clear category filter"
            >
              <RiCloseLine style={{ fontSize: '0.875rem' }} />
            </span>
          )}
        </button>

        <AnimatePresence>
          {categoryOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 200 }}
                onClick={() => setCategoryOpen(false)}
                aria-hidden
              />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                role="listbox"
                aria-label="Select category"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  width: 220,
                  background: '#fff',
                  borderRadius: '0.75rem',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  border: '1px solid var(--color-neutral-200)',
                  zIndex: 201,
                  overflow: 'hidden',
                  padding: '0.25rem',
                }}
              >
                {/* All option */}
                <button
                  role="option"
                  aria-selected={filters.category === 'all'}
                  onClick={() => { setFilter('category', 'all'); setCategoryOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-neutral-700)',
                    background: filters.category === 'all' ? 'var(--color-primary-50)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  All Categories
                  {filters.category === 'all' && <RiCheckLine style={{ color: 'var(--color-primary-600)' }} />}
                </button>

                <div style={{ height: 1, background: 'var(--color-neutral-100)', margin: '0.25rem 0' }} />

                {/* Category options */}
                {notificationCategories.map((cat) => (
                  <button
                    key={cat.key}
                    role="option"
                    aria-selected={filters.category === cat.key}
                    onClick={() => { setFilter('category', cat.key); setCategoryOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--color-neutral-700)',
                      background: filters.category === cat.key ? 'var(--color-primary-50)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: cat.color,
                          flexShrink: 0,
                        }}
                      />
                      {cat.label}
                    </span>
                    {filters.category === cat.key && (
                      <RiCheckLine style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Reset filters */}
      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={resetFilters}
          className="btn btn-ghost"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-neutral-500)',
            padding: '0.375rem 0.75rem',
            gap: '0.3rem',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <RiCloseLine />
          Clear filters
        </motion.button>
      )}
    </div>
  );
};

export default NotificationFilters;
