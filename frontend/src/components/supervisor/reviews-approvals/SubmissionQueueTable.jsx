/**
 * @file SubmissionQueueTable.jsx
 * @description Filterable, sortable, paginated submission queue table for the
 * Supervisor Reviews & Approvals module.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSearchLine,
  RiFilter3Line,
  RiArrowUpLine,
  RiArrowDownLine,
  RiArrowUpDownLine,
  RiEyeLine,
  RiEdit2Line,
  RiCheckboxCircleLine,
  RiRefreshLine,
  RiCloseCircleLine,
  RiAlertLine,
  RiFileTextLine,
  RiArrowLeftLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { SubmissionTableSkeleton } from './ReviewSkeletonLoaders';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'pending-review': { label: 'Pending Review', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  approved:         { label: 'Approved',        bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
  'needs-revision': { label: 'Needs Revision',  bg: '#eef2ff', color: '#3730a3', dot: '#4f46e5' },
  rejected:         { label: 'Rejected',         bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', bg: '#fef2f2', color: '#dc2626' },
  high:   { label: 'High',   bg: '#fff7ed', color: '#c2410c' },
  medium: { label: 'Medium', bg: '#eef2ff', color: '#4338ca' },
  low:    { label: 'Low',    bg: '#f0fdf4', color: '#166534' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getInitialsBg = (initials = 'XX') => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#059669'];
  const idx = initials.charCodeAt(0) % colors.length;
  return colors[idx];
};

const SortIcon = ({ col, activeSort }) => {
  if (activeSort.key !== col) return <RiArrowUpDownLine style={{ opacity: 0.3, fontSize: '0.75rem' }} />;
  return activeSort.dir === 'asc'
    ? <RiArrowUpLine style={{ color: '#4f46e5', fontSize: '0.75rem' }} />
    : <RiArrowDownLine style={{ color: '#4f46e5', fontSize: '0.75rem' }} />;
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['pending-review'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  return (
    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 800, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {cfg.label}
    </span>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const SubmissionQueueTable = ({
  submissions = [],
  isLoading = false,
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onView,
  onReview,
  activeSort = { key: 'submittedAt', dir: 'desc' },
  onSortChange,
  currentPage = 1,
  totalPages = 1,
  totalSubmissions = 0,
  pageSize = 10,
  onPageChange,
  filters = {},
  onSearch,
  onFilterChange,
  onClearFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const allSelected = submissions.length > 0 && submissions.every((s) => selectedIds.includes(s.id));
  const someSelected = selectedIds.length > 0 && !allSelected;
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && k !== 'sortBy' && k !== 'sortDir' && v && v !== 'all').length;

  if (isLoading) return <SubmissionTableSkeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Filters Bar ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', fontSize: '1rem' }} />
            <input
              type="text"
              placeholder="Search intern, task…"
              value={filters.search || ''}
              onChange={(e) => onSearch?.(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5625rem 0.875rem 0.5625rem 2.25rem',
                borderRadius: '0.75rem',
                border: '1.5px solid var(--color-neutral-200)',
                fontSize: '0.875rem',
                color: 'var(--color-neutral-700)',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#4f46e5')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-neutral-200)')}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange?.('status', e.target.value)}
            style={{ padding: '0.5625rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending-review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="needs-revision">Needs Revision</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || 'all'}
            onChange={(e) => onFilterChange?.('priority', e.target.value)}
            style={{ padding: '0.5625rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Department Filter */}
          <select
            value={filters.department || 'all'}
            onChange={(e) => onFilterChange?.('department', e.target.value)}
            style={{ padding: '0.5625rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', background: '#fff', cursor: 'pointer', outline: 'none' }}
          >
            <option value="all">All Departments</option>
            <option value="Frontend Engineering">Frontend Engineering</option>
            <option value="Backend Engineering">Backend Engineering</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Data Science">Data Science</option>
            <option value="DevOps">DevOps</option>
            <option value="Product Management">Product Management</option>
          </select>

          {activeFilterCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClearFilters}
              style={{ padding: '0.5rem 0.875rem', borderRadius: '0.75rem', border: '1.5px solid #fee2e2', background: '#fef2f2', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear Filters ({activeFilterCount})
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>

        {/* Selection summary */}
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '0.625rem 1.25rem', background: '#eef2ff', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #e0e7ff' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#4338ca' }}>
                  {selectedIds.length} submission{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
                <button onClick={onClearSelection} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4338ca', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Responsive scroll wrapper */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--color-neutral-100)' }}>
                {/* Checkbox header */}
                <th style={{ padding: '0.875rem 1rem', width: '48px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={() => allSelected ? onClearSelection?.() : onSelectAll?.()}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5' }}
                  />
                </th>
                {[
                  { key: 'internName', label: 'Intern' },
                  { key: 'taskTitle', label: 'Task' },
                  { key: 'submittedAt', label: 'Submitted' },
                  { key: 'status', label: 'Status' },
                  { key: 'score', label: 'Score' },
                  { key: 'priority', label: 'Priority' },
                  { key: null, label: 'Actions' },
                ].map(({ key, label }) => (
                  <th
                    key={label}
                    onClick={() => key && onSortChange?.(key)}
                    style={{
                      padding: '0.875rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--color-neutral-500)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: key ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {label}
                      {key && <SortIcon col={key} activeSort={activeSort} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <RiFileTextLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />
                      <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-500)' }}>No submissions found</p>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-400)' }}>Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isSelected = selectedIds.includes(sub.id);
                  return (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        borderBottom: '1px solid var(--color-neutral-100)',
                        background: isSelected ? '#eef2ff' : '#fff',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = '#fff')}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(sub.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4f46e5' }}
                        />
                      </td>

                      {/* Intern */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: getInitialsBg(sub.internInitials),
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {sub.internInitials}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', whiteSpace: 'nowrap' }}>
                              {sub.internName}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
                              {sub.internDepartment}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Task */}
                      <td style={{ padding: '0.875rem 1rem', maxWidth: '260px' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.taskTitle}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                            {sub.taskCategory}
                          </span>
                          {sub.attemptNumber > 1 && (
                            <span style={{ padding: '0.1rem 0.375rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, background: '#fef3c7', color: '#92400e' }}>
                              Attempt #{sub.attemptNumber}
                            </span>
                          )}
                          {sub.isLate && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.625rem', fontWeight: 700, color: '#dc2626' }}>
                              <RiAlertLine style={{ fontSize: '0.7rem' }} /> Late
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                          {formatDate(sub.submittedAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <StatusBadge status={sub.status} />
                      </td>

                      {/* Score */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {sub.score != null ? (
                          <span
                            style={{
                              fontSize: '0.9375rem',
                              fontWeight: 800,
                              color: sub.score >= 90 ? '#059669' : sub.score >= 70 ? '#4f46e5' : '#d97706',
                            }}
                          >
                            {sub.score}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-300)' }}>—</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <PriorityBadge priority={sub.priority} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <motion.button
                            whileHover={{ scale: 1.1, background: '#eef2ff' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onView?.(sub)}
                            title="View details"
                            style={{ width: '30px', height: '30px', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: '#4f46e5', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <RiEyeLine />
                          </motion.button>
                          {sub.status === 'pending-review' && (
                            <motion.button
                              whileHover={{ scale: 1.1, background: '#ecfdf5' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => onReview?.(sub)}
                              title="Write review"
                              style={{ width: '30px', height: '30px', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: '#10b981', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <RiEdit2Line />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1.25rem',
              borderTop: '1px solid var(--color-neutral-100)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalSubmissions)} of {totalSubmissions} submissions
            </span>
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === 1}
                onClick={() => onPageChange?.(currentPage - 1)}
                style={{ width: '32px', height: '32px', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: currentPage === 1 ? 'var(--color-neutral-300)' : 'var(--color-neutral-600)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
              >
                <RiArrowLeftLine />
              </motion.button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                if (Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                  return i === 1 || i === totalPages - 2 ? (
                    <span key={page} style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)', padding: '0 0.25rem' }}>…</span>
                  ) : null;
                }
                return (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange?.(page)}
                    style={{ width: '32px', height: '32px', borderRadius: '0.5rem', border: isActive ? 'none' : '1px solid var(--color-neutral-200)', background: isActive ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#fff', color: isActive ? '#fff' : 'var(--color-neutral-600)', fontSize: '0.8125rem', fontWeight: isActive ? 800 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {page}
                  </motion.button>
                );
              })}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={currentPage === totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
                style={{ width: '32px', height: '32px', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: currentPage === totalPages ? 'var(--color-neutral-300)' : 'var(--color-neutral-600)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}
              >
                <RiArrowRightLine />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionQueueTable;
