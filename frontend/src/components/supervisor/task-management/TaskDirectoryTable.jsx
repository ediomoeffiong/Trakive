/**
 * @file TaskDirectoryTable.jsx
 * @description Advanced task directory with data table, multi-select, sorting, pagination,
 * priority/status badges, progress bars, assigned intern avatars, and responsive card layout.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiArrowUpDownLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckboxBlankLine,
  RiCheckboxFill,
  RiIndeterminateCircleLine,
  RiEyeLine,
  RiEdit2Line,
  RiFileCopyLine,
  RiUserAddLine,
  RiArchiveLine,
  RiDeleteBin6Line,
  RiMoreLine,
} from 'react-icons/ri';
import TaskEmptyState from './TaskEmptyStates';
import { TaskTableSkeleton } from './TaskSkeletonLoaders';

// ── Status style map ──────────────────────────────────────────────────────────
const STATUS_STYLES = {
  draft:          { bg: '#f1f5f9', text: '#475569', label: 'Draft' },
  assigned:       { bg: '#dbeafe', text: '#1e40af', label: 'Assigned' },
  'in-progress':  { bg: '#e0e7ff', text: '#3730a3', label: 'In Progress' },
  'pending-review': { bg: '#fef3c7', text: '#b45309', label: 'Pending Review' },
  'needs-revision': { bg: '#fef2f2', text: '#b91c1c', label: 'Needs Revision' },
  completed:      { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
  overdue:        { bg: '#fee2e2', text: '#991b1b', label: 'Overdue' },
  archived:       { bg: '#f3f4f6', text: '#6b7280', label: 'Archived' },
};

const PRIORITY_STYLES = {
  urgent: { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444', label: 'Urgent' },
  high:   { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b', label: 'High' },
  medium: { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6', label: 'Medium' },
  low:    { bg: '#f0fdf4', text: '#166534', dot: '#22c55e', label: 'Low' },
};

// ── Intern Avatar Stack ───────────────────────────────────────────────────────
const InternAvatarStack = ({ interns = [], max = 3 }) => {
  const visible = interns.slice(0, max);
  const extra = interns.length - max;
  const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706'];

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((intern, i) => (
        <div
          key={intern.id}
          title={intern.name}
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: COLORS[i % COLORS.length],
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            marginLeft: i > 0 ? '-6px' : 0,
            zIndex: visible.length - i,
            flexShrink: 0,
          }}
        >
          {intern.initials}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#e2e8f0',
            color: '#475569',
            fontSize: '0.625rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
            marginLeft: '-6px',
          }}
        >
          +{extra}
        </div>
      )}
      {interns.length === 0 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', fontStyle: 'italic' }}>
          Unassigned
        </span>
      )}
    </div>
  );
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const MiniProgress = ({ value = 0 }) => {
  const color = value >= 100 ? '#10b981' : value >= 60 ? '#4f46e5' : value >= 30 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <div
        style={{
          height: '6px',
          background: '#f1f5f9',
          borderRadius: '99px',
          overflow: 'hidden',
          width: '80px',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '99px' }}
        />
      </div>
      <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
        {value}%
      </span>
    </div>
  );
};

// ── Sort icon ─────────────────────────────────────────────────────────────────
const SortIcon = ({ field, activeSort }) => {
  if (activeSort?.field !== field) return <RiArrowUpDownLine style={{ opacity: 0.35 }} />;
  return activeSort.order === 'asc'
    ? <RiArrowUpLine style={{ color: '#4f46e5' }} />
    : <RiArrowDownLine style={{ color: '#4f46e5' }} />;
};

// ── Row action dropdown ───────────────────────────────────────────────────────
const RowActions = ({ task, onView, onEdit, onDuplicate, onAssign, onArchive, onDelete }) => {
  const [open, setOpen] = useState(false);

  const actions = [
    { id: 'view', label: 'View Details', icon: RiEyeLine, onClick: () => onView?.(task), color: '#4f46e5' },
    { id: 'edit', label: 'Edit', icon: RiEdit2Line, onClick: () => onEdit?.(task), color: '#7c3aed' },
    { id: 'duplicate', label: 'Duplicate', icon: RiFileCopyLine, onClick: () => onDuplicate?.(task), color: '#0891b2' },
    { id: 'assign', label: 'Assign', icon: RiUserAddLine, onClick: () => onAssign?.(task), color: '#059669' },
    { id: 'archive', label: 'Archive', icon: RiArchiveLine, onClick: () => onArchive?.(task), color: '#64748b', dividerBefore: true },
    { id: 'delete', label: 'Delete', icon: RiDeleteBin6Line, onClick: () => onDelete?.(task), color: '#dc2626' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ background: 'var(--color-neutral-100)' }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          borderRadius: '0.5rem',
          border: '1px solid var(--color-neutral-200)',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--color-neutral-500)',
          fontSize: '1rem',
        }}
        aria-label={`Actions for ${task.title}`}
      >
        <RiMoreLine />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 49 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -4 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                right: 0,
                top: '36px',
                zIndex: 50,
                background: '#fff',
                borderRadius: '0.75rem',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                border: '1px solid var(--color-neutral-200)',
                overflow: 'hidden',
                minWidth: '160px',
              }}
            >
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <div key={action.id}>
                    {action.dividerBefore && (
                      <div style={{ height: '1px', background: 'var(--color-neutral-100)', margin: '0.25rem 0' }} />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick();
                        setOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        width: '100%',
                        padding: '0.625rem 0.875rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: action.id === 'delete' ? '#dc2626' : 'var(--color-neutral-700)',
                        textAlign: 'left',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon style={{ color: action.color, fontSize: '0.9375rem' }} />
                      {action.label}
                    </button>
                  </div>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Mobile Task Card ──────────────────────────────────────────────────────────
const TaskCard = ({ task, isSelected, onToggleSelect, onView, onEdit, onDuplicate, onAssign, onArchive, onDelete }) => {
  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.draft;
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff',
        borderRadius: '0.875rem',
        padding: '1rem',
        border: isSelected ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
        boxShadow: isSelected ? '0 0 0 3px rgba(79,70,229,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        cursor: 'pointer',
      }}
      onClick={() => onView?.(task)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', flex: 1 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(task.id); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, color: isSelected ? '#4f46e5' : '#94a3b8', fontSize: '1.125rem' }}
          >
            {isSelected ? <RiCheckboxFill /> : <RiCheckboxBlankLine />}
          </button>
          <div>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>
              {task.title}
            </p>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>
              {task.category} • {task.department}
            </p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <RowActions task={task} onView={onView} onEdit={onEdit} onDuplicate={onDuplicate} onAssign={onAssign} onArchive={onArchive} onDelete={onDelete} />
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.text }}>
          {statusStyle.label}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: priorityStyle.bg, color: priorityStyle.text }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: priorityStyle.dot, flexShrink: 0 }} />
          {priorityStyle.label}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <InternAvatarStack interns={task.assignedInterns} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MiniProgress value={task.completionPercentage} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
            Due {task.dueDate}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: 'title',       label: 'Task',          sortable: true,  alwaysVisible: true },
  { key: 'interns',     label: 'Assigned',      sortable: false },
  { key: 'priority',    label: 'Priority',      sortable: true },
  { key: 'status',      label: 'Status',        sortable: true },
  { key: 'dueDate',     label: 'Due Date',      sortable: true },
  { key: 'progress',    label: 'Progress',      sortable: true },
  { key: 'submissions', label: 'Submissions',   sortable: false },
  { key: 'actions',     label: '',              sortable: false, alwaysVisible: true },
];

const TaskDirectoryTable = ({
  tasks = [],
  isLoading = false,
  selectedTaskIds = [],
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onView,
  onEdit,
  onDuplicate,
  onAssign,
  onArchive,
  onDelete,
  activeSort,
  onSortChange,
  currentPage = 1,
  totalPages = 1,
  totalTasks = 0,
  pageSize = 10,
  onPageChange,
  emptyType = 'no-tasks',
  onCreateFirst,
}) => {
  const [isMobileView, setIsMobileView] = useState(false);

  // Proper responsive effect
  useMemo(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsMobileView(window.innerWidth < 768);
      handleResize();
    }
  }, []);

  if (isLoading) return <TaskTableSkeleton rows={6} />;

  if (tasks.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <TaskEmptyState type={emptyType} onCTA={onCreateFirst} />
      </div>
    );
  }

  const isAllSelected = tasks.length > 0 && tasks.every((t) => selectedTaskIds.includes(t.id));
  const isPartialSelected = tasks.some((t) => selectedTaskIds.includes(t.id)) && !isAllSelected;

  const handleSort = (field) => {
    if (activeSort?.field === field) {
      onSortChange?.(field, activeSort.order === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange?.(field, 'asc');
    }
  };

  // ── Mobile card layout ──────────────────────────────────────────────────────
  if (isMobileView) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isSelected={selectedTaskIds.includes(task.id)}
            onToggleSelect={onToggleSelect}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onAssign={onAssign}
            onArchive={onArchive}
            onDelete={onDelete}
          />
        ))}
        {totalPages > 1 && (
          <PaginationBar currentPage={currentPage} totalPages={totalPages} totalTasks={totalTasks} pageSize={pageSize} onPageChange={onPageChange} />
        )}
      </div>
    );
  }

  // ── Desktop table layout ────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
      }}
    >
      {/* Table */}
      <div style={{ overflowX: 'auto', width: '100%', minWidth: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
              {/* Checkbox */}
              <th style={{ width: '44px', padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                <button
                  onClick={() => isAllSelected ? onClearSelection?.() : onSelectAll?.()}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isAllSelected ? '#4f46e5' : isPartialSelected ? '#4f46e5' : '#94a3b8', fontSize: '1.125rem', display: 'flex', alignItems: 'center' }}
                  aria-label={isAllSelected ? 'Deselect all' : 'Select all'}
                >
                  {isAllSelected ? <RiCheckboxFill /> : isPartialSelected ? <RiIndeterminateCircleLine /> : <RiCheckboxBlankLine />}
                </button>
              </th>

              {ALL_COLUMNS.filter((c) => c.key !== 'actions' || true).map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '0.75rem 0.875rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-neutral-500)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} activeSort={activeSort} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="popLayout">
              {tasks.map((task, rowIdx) => {
                const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.draft;
                const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
                const isSelected = selectedTaskIds.includes(task.id);

                return (
                  <motion.tr
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, delay: rowIdx * 0.02 }}
                    style={{
                      borderBottom: '1px solid var(--color-neutral-100)',
                      background: isSelected ? '#faf5ff' : rowIdx % 2 === 0 ? '#fff' : 'var(--color-neutral-50)',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? '#faf5ff' : rowIdx % 2 === 0 ? '#fff' : 'var(--color-neutral-50)'; }}
                    onClick={() => onView?.(task)}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onToggleSelect?.(task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: isSelected ? '#4f46e5' : '#94a3b8', fontSize: '1.125rem', display: 'flex', alignItems: 'center' }}
                      >
                        {isSelected ? <RiCheckboxFill /> : <RiCheckboxBlankLine />}
                      </button>
                    </td>

                    {/* Title */}
                    <td style={{ padding: '0.75rem 0.875rem', maxWidth: '260px' }}>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </p>
                      <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                        {task.category}
                      </p>
                    </td>

                    {/* Assigned interns */}
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <InternAvatarStack interns={task.assignedInterns} />
                    </td>

                    {/* Priority */}
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: priorityStyle.bg, color: priorityStyle.text }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: priorityStyle.dot, flexShrink: 0 }} />
                        {priorityStyle.label}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.text }}>
                        {statusStyle.label}
                      </span>
                    </td>

                    {/* Due date */}
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: task.status === 'overdue' ? '#dc2626' : 'var(--color-neutral-600)', fontWeight: task.status === 'overdue' ? 700 : 400 }}>
                        {task.dueDate}
                      </span>
                    </td>

                    {/* Progress */}
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <MiniProgress value={task.completionPercentage} />
                    </td>

                    {/* Submissions */}
                    <td style={{ padding: '0.75rem 0.875rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)', fontWeight: 600 }}>
                        {task.submissionCount}/{task.totalAssigned}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.75rem 0.875rem' }} onClick={(e) => e.stopPropagation()}>
                      <RowActions task={task} onView={onView} onEdit={onEdit} onDuplicate={onDuplicate} onAssign={onAssign} onArchive={onArchive} onDelete={onDelete} />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationBar currentPage={currentPage} totalPages={totalPages} totalTasks={totalTasks} pageSize={pageSize} onPageChange={onPageChange} />
      )}
    </motion.div>
  );
};

const PaginationBar = ({ currentPage, totalPages, totalTasks, pageSize, onPageChange }) => {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalTasks);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1rem',
        borderTop: '1px solid var(--color-neutral-100)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
        Showing <strong>{start}–{end}</strong> of <strong>{totalTasks}</strong> tasks
      </span>
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-neutral-200)',
            background: '#fff',
            fontSize: '0.8125rem',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? 'var(--color-neutral-300)' : 'var(--color-neutral-700)',
          }}
        >
          Prev
        </motion.button>

        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const page = i + 1;
          return (
            <motion.button
              key={page}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange?.(page)}
              style={{
                padding: '0.4rem 0.625rem',
                borderRadius: '0.5rem',
                border: page === currentPage ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
                background: page === currentPage ? '#eef2ff' : '#fff',
                fontSize: '0.8125rem',
                fontWeight: page === currentPage ? 700 : 400,
                color: page === currentPage ? '#4338ca' : 'var(--color-neutral-700)',
                cursor: 'pointer',
                minWidth: '32px',
              }}
            >
              {page}
            </motion.button>
          );
        })}

        <motion.button
          whileTap={{ scale: 0.95 }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-neutral-200)',
            background: '#fff',
            fontSize: '0.8125rem',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? 'var(--color-neutral-300)' : 'var(--color-neutral-700)',
          }}
        >
          Next
        </motion.button>
      </div>
    </div>
  );
};

export default TaskDirectoryTable;
