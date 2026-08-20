/**
 * @file InternDirectory.jsx
 * @description Advanced intern directory with search, multi-filter, sorting, bulk selection,
 * pagination, column visibility toggle, and responsive mobile card layout.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiSearchLine,
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiEyeLine,
  RiTaskLine,
  RiCalendarEventLine,
  RiStarFill,
  RiCheckboxBlankLine,
  RiCheckboxFill,
  RiIndeterminateCircleLine,
  RiSettings3Line,
} from 'react-icons/ri';
import Avatar from '../../ui/Avatar';
import InternManagementFilters from './InternManagementFilters';
import BulkActionToolbar from './BulkActionToolbar';
import { InternTableLoader } from './InternSkeletonLoaders';
import InternEmptyState from './InternEmptyStates';
import { ROUTES } from '../../../constants';

const STATUS_STYLES = {
  Active: { bg: '#dcfce7', text: '#15803d' },
  'Pending Review': { bg: '#fef3c7', text: '#b45309' },
  'Needs Help': { bg: '#fee2e2', text: '#b91c1c' },
  'On Leave': { bg: '#f3f4f6', text: '#4b5563' },
};

const ALL_COLUMNS = [
  { key: 'name', label: 'Intern', sortable: true, alwaysVisible: true },
  { key: 'internId', label: 'ID', sortable: false },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'role', label: 'Role', sortable: false },
  { key: 'currentTask', label: 'Current Task', sortable: false },
  { key: 'performanceScore', label: 'Score', sortable: true },
  { key: 'onboardingProgress', label: 'Onboarding', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'lastActivity', label: 'Last Active', sortable: false },
  { key: 'actions', label: 'Actions', sortable: false, alwaysVisible: true },
];

const SortIcon = ({ field, currentField, currentOrder }) => {
  if (field !== currentField) return <RiArrowUpDownLine style={{ opacity: 0.4 }} />;
  return currentOrder === 'asc' ? <RiArrowUpLine style={{ color: '#4f46e5' }} /> : <RiArrowDownLine style={{ color: '#4f46e5' }} />;
};

const InternDirectory = ({
  interns = [],
  isLoading = false,
  filters,
  search,
  activeFilterChips,
  selectedInterns,
  onSearchChange,
  onFilterChange,
  onClearFilter,
  onClearAllFilters,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState(
    ALL_COLUMNS.filter((c) => !['internId', 'role'].includes(c.key)).map((c) => c.key),
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const pageSize = 8;

  const sortedInterns = useMemo(() => {
    return [...interns].sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortOrder === 'asc' ? -1 : 1;
      if (va > vb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [interns, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedInterns.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedInterns.slice(start, start + pageSize);
  }, [sortedInterns, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const isAllSelected = paginated.length > 0 && paginated.every((i) => selectedInterns.includes(i.id));
  const isPartialSelected = paginated.some((i) => selectedInterns.includes(i.id)) && !isAllSelected;

  const toggleColumnVisibility = (key) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const isColVisible = (key) => {
    const col = ALL_COLUMNS.find((c) => c.key === key);
    return col?.alwaysVisible || visibleColumns.includes(key);
  };

  if (isLoading) return <InternTableLoader />;

  const emptyType = search || activeFilterChips.length > 0 ? 'no-search-results' : 'no-interns';

  return (
    <>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '1rem',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--color-neutral-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                Intern Directory
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                {sortedInterns.length} intern{sortedInterns.length !== 1 ? 's' : ''} found
                {activeFilterChips.length > 0 && ' (filtered)'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '240px' }}>
                <RiSearchLine
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-neutral-400)',
                    fontSize: '1rem',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search name, ID, task..."
                  value={search}
                  onChange={(e) => { onSearchChange(e.target.value); setCurrentPage(1); }}
                  className="input-field"
                  style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.8125rem' }}
                />
              </div>

              {/* Column visibility toggle */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowColumnMenu((p) => !p)}
                  style={{ height: '36px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  title="Toggle columns"
                >
                  <RiSettings3Line />
                  Columns
                </button>

                <AnimatePresence>
                  {showColumnMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 0.5rem)',
                        right: 0,
                        background: '#fff',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: '0.75rem',
                        padding: '0.75rem',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        zIndex: 50,
                        minWidth: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem',
                      }}
                    >
                      {ALL_COLUMNS.filter((c) => !c.alwaysVisible).map((col) => (
                        <label
                          key={col.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                            color: 'var(--color-neutral-700)',
                            cursor: 'pointer',
                            padding: '0.25rem 0.375rem',
                            borderRadius: '0.375rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(col.key)}
                            onChange={() => toggleColumnVisibility(col.key)}
                            style={{ accentColor: '#4f46e5' }}
                          />
                          {col.label}
                        </label>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <InternManagementFilters
            filters={filters}
            onFilterChange={(key, val) => { onFilterChange(key, val); setCurrentPage(1); }}
            onClearFilter={onClearFilter}
            onClearAll={() => { onClearAllFilters(); setCurrentPage(1); }}
            activeFilterChips={activeFilterChips}
          />
        </div>

        {/* ── Desktop Table ─────────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto', width: '100%', minWidth: 0 }} className="hide-on-mobile">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-neutral-50)',
                  borderBottom: '1px solid var(--color-neutral-200)',
                  color: 'var(--color-neutral-600)',
                  fontSize: '0.7125rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {/* Select all checkbox */}
                <th style={{ padding: '0.75rem 0.625rem', width: '38px' }}>
                  <button
                    onClick={isAllSelected ? onClearSelection : () => onSelectAll(paginated.map((i) => i.id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', display: 'flex', fontSize: '1.1rem' }}
                    aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? (
                      <RiCheckboxFill />
                    ) : isPartialSelected ? (
                      <RiIndeterminateCircleLine style={{ color: '#6366f1' }} />
                    ) : (
                      <RiCheckboxBlankLine style={{ color: 'var(--color-neutral-400)' }} />
                    )}
                  </button>
                </th>

                {ALL_COLUMNS.map((col) =>
                  !isColVisible(col.key) ? null : (
                    <th
                      key={col.key}
                      style={{
                        padding: '0.75rem 0.625rem',
                        fontWeight: 700,
                        cursor: col.sortable ? 'pointer' : 'default',
                        whiteSpace: 'nowrap',
                        textAlign: col.key === 'actions' ? 'right' : 'left',
                      }}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: col.key === 'actions' ? 'flex-end' : 'flex-start' }}>
                        {col.label}
                        {col.sortable && <SortIcon field={col.key} currentField={sortField} currentOrder={sortOrder} />}
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              <AnimatePresence mode="wait">
                {paginated.length === 0 ? (
                  <tr key="empty">
                    <td colSpan={12} style={{ padding: '2rem' }}>
                      <InternEmptyState type={emptyType} />
                    </td>
                  </tr>
                ) : (
                  paginated.map((intern, idx) => {
                    const statusStyle = STATUS_STYLES[intern.status] || STATUS_STYLES.Active;
                    const isSelected = selectedInterns.includes(intern.id);

                    return (
                      <motion.tr
                        key={intern.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, delay: idx * 0.03 }}
                        whileHover={{ backgroundColor: isSelected ? '#eef2ff' : 'var(--color-neutral-50)' }}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#f0f4ff' : 'transparent',
                          transition: 'background-color 0.15s ease',
                        }}
                        onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '0.75rem 0.625rem' }} onClick={(e) => { e.stopPropagation(); onToggleSelect(intern.id); }}>
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#4f46e5', fontSize: '1.1rem' }}
                            aria-label={isSelected ? `Deselect ${intern.name}` : `Select ${intern.name}`}
                          >
                            {isSelected ? <RiCheckboxFill /> : <RiCheckboxBlankLine style={{ color: 'var(--color-neutral-300)' }} />}
                          </button>
                        </td>

                        {/* Intern Name */}
                        {isColVisible('name') && (
                          <td style={{ padding: '0.75rem 0.625rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <Avatar name={intern.name} src={intern.avatar} size="md" />
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-neutral-900)', fontSize: '0.8125rem' }}>
                                  {intern.name}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.7125rem', color: 'var(--color-neutral-400)' }}>
                                  {intern.email}
                                </p>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Intern ID */}
                        {isColVisible('internId') && (
                          <td style={{ padding: '0.75rem 0.625rem' }}>
                            <span style={{ fontSize: '0.7125rem', fontFamily: 'monospace', color: 'var(--color-neutral-500)', background: 'var(--color-neutral-100)', padding: '0.15rem 0.35rem', borderRadius: '0.375rem' }}>
                              {intern.internId}
                            </span>
                          </td>
                        )}

                        {/* Department */}
                        {isColVisible('department') && (
                          <td style={{ padding: '0.75rem 0.625rem', color: 'var(--color-neutral-700)', fontWeight: 500, fontSize: '0.78125rem', whiteSpace: 'nowrap' }}>
                            {intern.department}
                          </td>
                        )}

                        {/* Role */}
                        {isColVisible('role') && (
                          <td style={{ padding: '0.75rem 0.625rem', color: 'var(--color-neutral-600)', fontSize: '0.78125rem', whiteSpace: 'nowrap' }}>
                            {intern.role}
                          </td>
                        )}

                        {/* Current Task */}
                        {isColVisible('currentTask') && (
                          <td style={{ padding: '0.75rem 0.625rem', maxWidth: '160px' }}>
                            <p style={{ margin: 0, fontSize: '0.78125rem', color: 'var(--color-neutral-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {intern.currentTask}
                            </p>
                          </td>
                        )}

                        {/* Performance Score */}
                        {isColVisible('performanceScore') && (
                          <td style={{ padding: '0.75rem 0.625rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, color: 'var(--color-neutral-800)', fontSize: '0.8125rem' }}>
                              <RiStarFill style={{ color: '#f59e0b', fontSize: '0.85rem' }} />
                              {intern.performanceScore}
                            </div>
                          </td>
                        )}

                        {/* Onboarding Progress */}
                        {isColVisible('onboardingProgress') && (
                          <td style={{ padding: '0.75rem 0.625rem', minWidth: '95px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span style={{ fontSize: '0.7125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
                                {intern.onboardingProgress}%
                              </span>
                              <div style={{ height: '5px', width: '100%', background: 'var(--color-neutral-200)', borderRadius: '99px', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${intern.onboardingProgress}%` }}
                                  transition={{ duration: 0.6, ease: 'easeOut' }}
                                  style={{
                                    height: '100%',
                                    background: intern.onboardingProgress === 100
                                      ? 'linear-gradient(90deg, #10b981, #059669)'
                                      : 'linear-gradient(90deg, #4f46e5, #818cf8)',
                                    borderRadius: '99px',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Status */}
                        {isColVisible('status') && (
                          <td style={{ padding: '0.75rem 0.625rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '9999px',
                                fontSize: '0.7125rem',
                                fontWeight: 600,
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.text,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {intern.status}
                            </span>
                          </td>
                        )}

                        {/* Last Active */}
                        {isColVisible('lastActivity') && (
                          <td style={{ padding: '0.75rem 0.625rem', fontSize: '0.7125rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>
                            {intern.lastActivity}
                          </td>
                        )}

                        {/* Actions */}
                        {isColVisible('actions') && (
                          <td style={{ padding: '0.75rem 0.625rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.15rem' }}>
                              <button
                                className="btn btn-ghost btn-icon"
                                title="View Profile"
                                onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
                                style={{ fontSize: '0.95rem', padding: '0.25rem', color: '#4f46e5' }}
                              >
                                <RiEyeLine />
                              </button>
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Assign Task"
                                onClick={() => toast.success(`Opening task assignment for ${intern.name}...`)}
                                style={{ fontSize: '0.95rem', padding: '0.25rem', color: '#059669' }}
                              >
                                <RiTaskLine />
                              </button>
                              <button
                                className="btn btn-ghost btn-icon"
                                title="Schedule Review"
                                onClick={() => toast.success(`Opening review scheduler for ${intern.name}...`)}
                                style={{ fontSize: '0.95rem', padding: '0.25rem', color: '#7c3aed' }}
                              >
                                <RiCalendarEventLine />
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card Layout ─────────────────────────────────────────── */}
        <div className="show-on-mobile">
          {paginated.length === 0 ? (
            <InternEmptyState type={emptyType} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1rem' }}>
              {paginated.map((intern, idx) => {
                const statusStyle = STATUS_STYLES[intern.status] || STATUS_STYLES.Active;
                const isSelected = selectedInterns.includes(intern.id);

                return (
                  <motion.div
                    key={intern.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: idx * 0.04 }}
                    style={{
                      background: isSelected ? '#f0f4ff' : '#fff',
                      border: `1px solid ${isSelected ? '#c7d2fe' : 'var(--color-neutral-200)'}`,
                      borderRadius: '0.875rem',
                      padding: '1rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/supervisor/interns/${intern.id}`)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar name={intern.name} src={intern.avatar} size="md" />
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-neutral-900)' }}>{intern.name}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{intern.department}</p>
                        </div>
                      </div>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          flexShrink: 0,
                        }}
                      >
                        {intern.status}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 0.625rem 0', fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                      📋 {intern.currentTask}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', fontWeight: 700 }}>
                        <RiStarFill style={{ color: '#f59e0b' }} />
                        {intern.performanceScore}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginBottom: '0.2rem' }}>
                          <span>Onboarding</span>
                          <span>{intern.onboardingProgress}%</span>
                        </div>
                        <div style={{ height: '5px', background: 'var(--color-neutral-200)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${intern.onboardingProgress}%`,
                              background: 'linear-gradient(90deg, #4f46e5, #818cf8)',
                              borderRadius: '99px',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {sortedInterns.length > 0 && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid var(--color-neutral-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8125rem',
              color: 'var(--color-neutral-500)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span>
              Showing {sortedInterns.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
              {Math.min(currentPage * pageSize, sortedInterns.length)} of {sortedInterns.length} interns
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ padding: '0.35rem 0.625rem', fontSize: '0.8125rem', minWidth: '32px' }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedInterns.length}
        selectedInterns={selectedInterns}
        onClear={onClearSelection}
      />
    </>
  );
};

export default InternDirectory;
