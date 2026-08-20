/**
 * @file InternManagementFilters.jsx
 * @description Advanced filter panel with active filter chips for the Intern Directory.
 * Supports: Department, Status, Performance Range, Onboarding Status, Batch.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { RiFilter3Line, RiCloseLine } from 'react-icons/ri';

const DEPARTMENTS = ['All', 'Frontend Engineering', 'Backend Engineering', 'UI/UX Design', 'DevOps', 'Product Management', 'Data Science'];
const STATUSES = ['All', 'Active', 'Pending Review', 'Needs Help', 'On Leave'];
const ONBOARDING_STATUSES = ['All', 'Complete', 'In Progress', 'Not Started'];
const BATCHES = ['All', 'Spring 2026', 'Summer 2026'];

const selectStyle = {
  height: '36px',
  fontSize: '0.8125rem',
  padding: '0 0.625rem',
  minWidth: '120px',
  borderRadius: '0.5rem',
  border: '1px solid var(--color-neutral-200)',
  background: '#ffffff',
  color: 'var(--color-neutral-800)',
  cursor: 'pointer',
  outline: 'none',
};

const InternManagementFilters = ({ filters, onFilterChange, onClearFilter, onClearAll, activeFilterChips }) => {
  return (
    <div>
      {/* Filter Controls Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-neutral-500)', fontSize: '0.8125rem', fontWeight: 600 }}>
          <RiFilter3Line />
          Filters
        </div>

        <select
          value={filters.department}
          onChange={(e) => onFilterChange('department', e.target.value)}
          style={selectStyle}
          aria-label="Filter by department"
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          style={selectStyle}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </select>

        <select
          value={filters.onboardingStatus}
          onChange={(e) => onFilterChange('onboardingStatus', e.target.value)}
          style={selectStyle}
          aria-label="Filter by onboarding status"
        >
          {ONBOARDING_STATUSES.map((o) => (
            <option key={o} value={o}>{o === 'All' ? 'All Onboarding' : o}</option>
          ))}
        </select>

        <select
          value={filters.batch}
          onChange={(e) => onFilterChange('batch', e.target.value)}
          style={selectStyle}
          aria-label="Filter by batch"
        >
          {BATCHES.map((b) => (
            <option key={b} value={b}>{b === 'All' ? 'All Batches' : b}</option>
          ))}
        </select>

        {/* Performance Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--color-neutral-500)', fontWeight: 500 }}>Score:</span>
          <input
            type="number"
            placeholder="Min"
            min="1"
            max="5"
            step="0.1"
            value={filters.performanceMin}
            onChange={(e) => onFilterChange('performanceMin', e.target.value)}
            style={{ ...selectStyle, width: '60px', minWidth: 'auto', padding: '0 0.4rem' }}
            aria-label="Minimum performance score"
          />
          <span style={{ color: 'var(--color-neutral-400)' }}>–</span>
          <input
            type="number"
            placeholder="Max"
            min="1"
            max="5"
            step="0.1"
            value={filters.performanceMax}
            onChange={(e) => onFilterChange('performanceMax', e.target.value)}
            style={{ ...selectStyle, width: '60px', minWidth: 'auto', padding: '0 0.4rem' }}
            aria-label="Maximum performance score"
          />
        </div>

        {activeFilterChips.length > 0 && (
          <button
            onClick={onClearAll}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', padding: '0.25rem 0.5rem' }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {activeFilterChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.875rem' }}
          >
            {activeFilterChips.map((chip) => (
              <motion.span
                key={chip.key}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#eef2ff',
                  color: '#4338ca',
                  border: '1px solid #c7d2fe',
                }}
              >
                {chip.label}
                <button
                  onClick={() => onClearFilter(chip.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6366f1',
                    padding: 0,
                    lineHeight: 1,
                    fontSize: '0.875rem',
                  }}
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <RiCloseLine />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InternManagementFilters;
