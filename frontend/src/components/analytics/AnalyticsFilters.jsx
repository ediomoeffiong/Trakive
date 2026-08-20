/**
 * @file AnalyticsFilters.jsx
 * @description Interactive filter bar with dropdown controls, active filter chips, and Reset action.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiFilter3Line,
  RiRefreshLine,
  RiCloseLine,
  RiCalendarLine,
  RiBuilding4Line,
  RiUserStarLine,
  RiGroupLine,
  RiUser3Line,
  RiCheckboxCircleLine,
} from 'react-icons/ri';
import { useAnalyticsStore } from '../../store';
import { mockFilterOptions } from '../../data';

export const AnalyticsFilters = () => {
  const { filters, setFilter, resetFilters } = useAnalyticsStore();
  const [collapsedMobile, setCollapsedMobile] = useState(true);

  // Calculate count of active filters (non-default)
  const activeCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'dateRange') return value !== 'this_month';
    return value && !value.startsWith('All');
  }).length;

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Top row: Label & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RiFilter3Line style={{ fontSize: '1.125rem' }} />
          </span>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Analytics Filter Controls
            </h4>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              Refine metrics by cohort, department, cycle, or supervisor
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-danger-600)',
                background: 'var(--color-danger-50)',
                border: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <RiRefreshLine /> Reset Filters
            </button>
          )}

          {/* Mobile Collapse Toggle */}
          <button
            onClick={() => setCollapsedMobile((prev) => !prev)}
            className="lg-hidden"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-neutral-700)',
              background: 'var(--color-neutral-100)',
              border: 'none',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            {collapsedMobile ? 'Show Filter Controls' : 'Hide Filters'}
          </button>
        </div>
      </div>

      {/* Filter Select Controls Grid */}
      <div
        className={['analytics-filters-grid', collapsedMobile ? 'mobile-hidden' : '']
          .filter(Boolean)
          .join(' ')}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {/* Date Range */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
            <RiCalendarLine style={{ display: 'inline', marginRight: '0.25rem' }} /> Reporting Period
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilter('dateRange', e.target.value)}
            style={selectStyle}
          >
            {mockFilterOptions.dateRanges.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
            <RiBuilding4Line style={{ display: 'inline', marginRight: '0.25rem' }} /> Department
          </label>
          <select
            value={filters.department}
            onChange={(e) => setFilter('department', e.target.value)}
            style={selectStyle}
          >
            {mockFilterOptions.departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Batch / Cohort */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
            <RiGroupLine style={{ display: 'inline', marginRight: '0.25rem' }} /> Internship Cohort
          </label>
          <select
            value={filters.batch}
            onChange={(e) => setFilter('batch', e.target.value)}
            style={selectStyle}
          >
            {mockFilterOptions.batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
        </div>

        {/* Supervisor */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
            <RiUserStarLine style={{ display: 'inline', marginRight: '0.25rem' }} /> Supervisor
          </label>
          <select
            value={filters.supervisor}
            onChange={(e) => setFilter('supervisor', e.target.value)}
            style={selectStyle}
          >
            {mockFilterOptions.supervisors.map((sup) => (
              <option key={sup} value={sup}>
                {sup}
              </option>
            ))}
          </select>
        </div>

        {/* Intern */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
            <RiUser3Line style={{ display: 'inline', marginRight: '0.25rem' }} /> Selected Intern
          </label>
          <select
            value={filters.intern}
            onChange={(e) => setFilter('intern', e.target.value)}
            style={selectStyle}
          >
            {mockFilterOptions.interns.map((int) => (
              <option key={int} value={int}>
                {int}
              </option>
            ))}
          </select>
        </div>

        {/* Task Status */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.25rem' }}>
            <RiCheckboxCircleLine style={{ display: 'inline', marginRight: '0.25rem' }} /> Task Status
          </label>
          <select
            value={filters.taskStatus}
            onChange={(e) => setFilter('taskStatus', e.target.value)}
            style={selectStyle}
          >
            {mockFilterOptions.taskStatuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--color-neutral-100)',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
              Active Filters:
            </span>

            {Object.entries(filters).map(([key, val]) => {
              const isDefault = key === 'dateRange' ? val === 'this_month' : !val || val.startsWith('All');
              if (isDefault) return null;

              return (
                <motion.span
                  key={key}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    background: 'var(--color-primary-50)',
                    color: 'var(--color-primary-700)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    borderRadius: '99px',
                    border: '1px solid var(--color-primary-200)',
                  }}
                >
                  <span style={{ textTransform: 'capitalize', color: 'var(--color-neutral-500)' }}>
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </span>
                  <span>{val}</span>
                  <RiCloseLine
                    onClick={() => setFilter(key, DEFAULT_FILTERS[key])}
                    style={{ cursor: 'pointer', fontSize: '0.875rem' }}
                    title="Remove filter"
                  />
                </motion.span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const selectStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.8125rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-neutral-300)',
  backgroundColor: '#ffffff',
  color: 'var(--color-neutral-800)',
  outline: 'none',
  transition: 'border-color 0.15s ease',
};
