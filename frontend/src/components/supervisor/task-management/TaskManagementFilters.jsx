/**
 * @file TaskManagementFilters.jsx
 * @description Multi-faceted filter panel for the Task Directory.
 * Supports status, priority, department, category, intern, and date range filters.
 * Shows active filter chips with remove functionality.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiRefreshLine,
} from 'react-icons/ri';
import { TASK_CATEGORIES } from '../../../data/taskCategories';

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'pending-review', label: 'Pending Review' },
  { value: 'needs-revision', label: 'Needs Revision' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'archived', label: 'Archived' },
];

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const DEPARTMENTS = [
  { value: 'all', label: 'All Departments' },
  { value: 'Frontend Engineering', label: 'Frontend Eng' },
  { value: 'Backend Engineering', label: 'Backend Eng' },
  { value: 'Backend Integration', label: 'Backend Integration' },
  { value: 'UX/UI Design', label: 'UX/UI Design' },
  { value: 'QA & Testing', label: 'QA & Testing' },
  { value: 'Design Systems', label: 'Design Systems' },
  { value: 'Program Management', label: 'Program Mgmt' },
];

const SORT_OPTIONS = [
  { value: 'dueDate_asc', label: 'Due Date (Earliest)' },
  { value: 'dueDate_desc', label: 'Due Date (Latest)' },
  { value: 'priority_desc', label: 'Priority (High → Low)' },
  { value: 'createdDate_desc', label: 'Newest First' },
  { value: 'createdDate_asc', label: 'Oldest First' },
  { value: 'title_asc', label: 'Title (A–Z)' },
];

const SelectFilter = ({ value, onChange, options, id }) => (
  <select
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: '0.5rem 0.75rem',
      borderRadius: '0.625rem',
      border: '1px solid var(--color-neutral-200)',
      background: '#fff',
      fontSize: '0.8125rem',
      color: 'var(--color-neutral-700)',
      cursor: 'pointer',
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.625rem center',
      paddingRight: '2rem',
      minWidth: '130px',
    }}
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const TaskManagementFilters = ({
  filters = {},
  activeFilterChips = [],
  search = '',
  onSearch,
  onFilterChange,
  onRemoveChip,
  onClearAll,
  onSortChange,
  activeSort,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const CATEGORY_OPTIONS = [
    { value: 'all', label: 'All Categories' },
    ...TASK_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  ];

  const hasActiveFilters = activeFilterChips.length > 0 || search;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* ── Search + Filter Toggle Row ───────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <RiSearchLine
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-neutral-400)',
              fontSize: '1rem',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5625rem 0.875rem 0.5625rem 2.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--color-neutral-200)',
              background: '#fff',
              fontSize: '0.875rem',
              color: 'var(--color-neutral-800)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#4f46e5'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; }}
          />
        </div>

        {/* Quick status pills */}
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {['all', 'in-progress', 'pending-review', 'overdue', 'completed'].map((status) => {
            const isActive = (filters.status || 'all') === status;
            const labels = { all: 'All', 'in-progress': 'Active', 'pending-review': 'Review', overdue: 'Overdue', completed: 'Done' };
            return (
              <motion.button
                key={status}
                whileTap={{ scale: 0.96 }}
                onClick={() => onFilterChange('status', status)}
                style={{
                  padding: '0.4375rem 0.875rem',
                  borderRadius: '0.625rem',
                  border: isActive ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
                  background: isActive ? '#eef2ff' : '#fff',
                  color: isActive ? '#4338ca' : 'var(--color-neutral-600)',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {labels[status]}
              </motion.button>
            );
          })}
        </div>

        {/* Advanced Filters toggle */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowFilters((p) => !p)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 0.875rem',
            borderRadius: '0.75rem',
            border: showFilters ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
            background: showFilters ? '#eef2ff' : '#fff',
            color: showFilters ? '#4338ca' : 'var(--color-neutral-600)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <RiFilterLine />
          Filters
          {activeFilterChips.length > 0 && (
            <span
              style={{
                background: '#4f46e5',
                color: '#fff',
                borderRadius: '9999px',
                fontSize: '0.6875rem',
                fontWeight: 800,
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
              }}
            >
              {activeFilterChips.length}
            </span>
          )}
        </motion.button>

        {/* Sort */}
        <SelectFilter
          id="task-sort"
          value={activeSort ? `${activeSort.field}_${activeSort.order}` : 'dueDate_asc'}
          onChange={(val) => {
            const [field, order] = val.split('_');
            onSortChange(field, order);
          }}
          options={SORT_OPTIONS}
        />
      </div>

      {/* ── Advanced Filter Panel ────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--color-neutral-200)',
                borderRadius: '0.875rem',
                padding: '1rem',
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>Priority</label>
                <SelectFilter
                  id="filter-priority"
                  value={filters.priority || 'all'}
                  onChange={(v) => onFilterChange('priority', v)}
                  options={PRIORITIES}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>Department</label>
                <SelectFilter
                  id="filter-department"
                  value={filters.department || 'all'}
                  onChange={(v) => onFilterChange('department', v)}
                  options={DEPARTMENTS}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>Category</label>
                <SelectFilter
                  id="filter-category"
                  value={filters.category || 'all'}
                  onChange={(v) => onFilterChange('category', v)}
                  options={CATEGORY_OPTIONS}
                />
              </div>

              {hasActiveFilters && (
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={onClearAll}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '0.625rem',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RiRefreshLine />
                    Clear All
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Filter Chips ──────────────────────────────────────────── */}
      <AnimatePresence>
        {activeFilterChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>
              Active filters:
            </span>
            {activeFilterChips.map((chip) => (
              <motion.span
                key={`${chip.key}-${chip.value}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.625rem',
                  borderRadius: '9999px',
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  color: '#4338ca',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ color: '#6b7280', fontWeight: 500 }}>{chip.label}:</span>
                {chip.value}
                <button
                  onClick={() => onRemoveChip(chip.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6366f1',
                    padding: 0,
                    width: '14px',
                    height: '14px',
                  }}
                  aria-label={`Remove ${chip.label} filter`}
                >
                  <RiCloseLine style={{ fontSize: '0.875rem' }} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagementFilters;
