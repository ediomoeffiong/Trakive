/**
 * @file TaskList.jsx
 * @description Completely redesigned Task Runway — premium 2-column layout,
 * sticky filter sidebar, animated task cards, slide-in quick-view panel.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiSearchLine,
  RiArrowUpDownLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiArrowRightLine,
  RiRefreshLine,
  RiSparklingLine,
  RiGridLine,
  RiListCheck3,
  RiEyeLine,
  RiUser3Line,
  RiCloseLine,
  RiAlertLine,
  RiFireLine,
  RiArrowUpLine,
  RiFilterLine,
  RiBookOpenLine,
} from 'react-icons/ri';

import { useTaskStore, getFilteredAndSortedTasks } from '../store';
import {
  Badge, Button, ProgressBar, CircularProgress,
  Skeleton, Avatar, EmptyState, Drawer,
} from '../components/ui';
import { ROUTES } from '../constants';
import { mockCategories } from '../data/categories';

// ─── Design tokens ────────────────────────────────────────────────────────────

const PRIORITY_META = {
  urgent: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Urgent', icon: RiAlertLine },
  high:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'High',   icon: RiFireLine   },
  medium: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Medium', icon: RiArrowUpLine },
  low:    { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Low',    icon: null          },
};

const STATUS_META = {
  'assigned':       { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0',   bar: 'neutral'  },
  'in-progress':    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',   bar: 'primary'  },
  'submitted':      { color: '#d97706', bg: '#fffbeb', border: '#fde68a',   bar: 'warning'  },
  'under-review':   { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',   bar: 'warning'  },
  'completed':      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',   bar: 'success'  },
  'needs-revision': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca',   bar: 'danger'   },
};

const CATEGORY_COLORS = {
  development: '#3b82f6',
  research:    '#8b5cf6',
  design:      '#ec4899',
  training:    '#14b8a6',
  operations:  '#f59e0b',
  marketing:   '#10b981',
};

const STATUS_TABS = [
  { id: 'all',            label: 'All'           },
  { id: 'assigned',       label: 'Assigned'      },
  { id: 'in-progress',    label: 'In Progress'   },
  { id: 'submitted',      label: 'Submitted'     },
  { id: 'under-review',   label: 'Under Review'  },
  { id: 'needs-revision', label: 'Needs Revision'},
  { id: 'completed',      label: 'Completed'     },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusLabel(s) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getCategoryColor(cat) {
  return CATEGORY_COLORS[cat] ?? '#64748b';
}

function getPriorityAccentColor(p) {
  return PRIORITY_META[p]?.color ?? '#64748b';
}

function getEncouragement(pct) {
  if (pct === 100) return 'All deliverables finalised. Outstanding work! 🚀';
  if (pct >= 75)   return 'Phenomenal focus — almost at the finish line!';
  if (pct >= 50)   return 'Excellent progress. Halfway milestone reached!';
  if (pct >= 25)   return 'Nice start! Keep checking off requirements.';
  return "Welcome! Let's get started on your assignments.";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TasksSkeleton({ layout }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
      gap: '1rem',
    }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          background: '#fff', borderRadius: '1rem', padding: '1.5rem',
          border: '1px solid var(--color-neutral-100)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="80px" height="18px" />
            <Skeleton width="60px" height="18px" />
          </div>
          <Skeleton width="90%" height="22px" />
          <Skeleton width="100%" height="36px" />
          <Skeleton width="100%" height="6px" borderRadius="99px" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="90px" height="14px" />
            <Skeleton width="90px" height="28px" borderRadius="0.5rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Task Card (Grid) ──────────────────────────────────────────────────────────

function TaskCard({ task, onPreview, onOpen }) {
  const sm = STATUS_META[task.status] ?? STATUS_META.assigned;
  const pm = PRIORITY_META[task.priority] ?? PRIORITY_META.low;
  const catColor = getCategoryColor(task.category);
  const doneObj = task.objectives?.filter(o => o.checked).length ?? 0;
  const totalObj = task.objectives?.length ?? 0;
  const isOverdue = !task.completedAt && task.remainingDays < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.09)' }}
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: '1px solid var(--color-neutral-100)',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
      onClick={() => onOpen(task.id)}
    >
      {/* Priority stripe */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${pm.color} 0%, ${pm.color}88 100%)`,
      }} />

      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {/* Top meta row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: catColor, background: `${catColor}15`,
            padding: '0.2rem 0.5rem', borderRadius: '99px',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: catColor, flexShrink: 0 }} />
            {task.category}
          </span>

          {/* Priority pill */}
          <span style={{
            fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`,
            padding: '0.2rem 0.5rem', borderRadius: '99px',
          }}>
            {pm.label}
          </span>
        </div>

        {/* Title & description */}
        <div>
          <h3 style={{
            fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)',
            lineHeight: 1.35, marginBottom: '0.375rem',
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {task.title}
          </h3>
          <p style={{
            fontSize: '0.78rem', color: 'var(--color-neutral-500)', lineHeight: 1.55,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            margin: 0,
          }}>
            {task.description}
          </p>
        </div>

        {/* Objectives mini-bar */}
        {totalObj > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Objectives
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-neutral-500)' }}>
                {doneObj}/{totalObj}
              </span>
            </div>
            <ProgressBar value={totalObj > 0 ? Math.round((doneObj / totalObj) * 100) : 0} variant={sm.bar} size="xs" />
          </div>
        )}

        {/* Progress bar */}
        {task.progress !== undefined && task.status !== 'assigned' && totalObj === 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Progress</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-neutral-500)' }}>{task.progress}%</span>
            </div>
            <ProgressBar value={task.progress} variant={sm.bar} size="xs" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.875rem 1.25rem',
        borderTop: '1px solid var(--color-neutral-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {/* Status pill */}
          <span style={{
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
            padding: '0.15rem 0.5rem', borderRadius: '99px', display: 'inline-block',
          }}>
            {getStatusLabel(task.status)}
          </span>
          {/* Due date */}
          <span style={{
            fontSize: '0.7rem', fontWeight: 500,
            color: isOverdue ? '#dc2626' : task.remainingDays === 0 ? '#d97706' : 'var(--color-neutral-400)',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
          }}>
            <RiCalendarEventLine style={{ fontSize: '0.75rem' }} />
            {isOverdue
              ? `${Math.abs(task.remainingDays)}d overdue`
              : task.remainingDays === 0
              ? 'Due today'
              : task.remainingDays < 4 && !task.completedAt
              ? `${task.remainingDays}d left`
              : `Due ${task.dueDate}`
            }
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={e => { e.stopPropagation(); onPreview(task); }}
            style={{
              width: '32px', height: '32px', borderRadius: '0.5rem',
              background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-neutral-500)', fontSize: '0.9rem',
              transition: 'all 0.15s ease',
            }}
            title="Quick Preview"
          >
            <RiEyeLine />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onOpen(task.id); }}
            style={{
              padding: '0 0.875rem', height: '32px', borderRadius: '0.5rem',
              background: 'var(--color-neutral-900)', border: 'none',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              cursor: 'pointer', color: '#fff', fontSize: '0.725rem', fontWeight: 700,
              transition: 'background 0.15s ease',
            }}
          >
            Open <RiArrowRightLine style={{ fontSize: '0.85rem' }} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Task Row (List view) ──────────────────────────────────────────────────────

function TaskRow({ task, onPreview, onOpen }) {
  const sm = STATUS_META[task.status] ?? STATUS_META.assigned;
  const pm = PRIORITY_META[task.priority] ?? PRIORITY_META.low;
  const catColor = getCategoryColor(task.category);
  const isOverdue = !task.completedAt && task.remainingDays < 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => onOpen(task.id)}
      style={{
        background: '#fff',
        borderRadius: '0.875rem',
        border: '1px solid var(--color-neutral-100)',
        padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        position: 'relative', overflow: 'hidden',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: 'var(--color-neutral-200)' }}
    >
      {/* Priority left border */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: pm.color, borderRadius: '0.875rem 0 0 0.875rem',
      }} />

      {/* Category dot */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '0.625rem', flexShrink: 0, marginLeft: '4px',
        background: `${catColor}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: catColor }} />
      </div>

      {/* Title & desc */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{
          fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 0 0.2rem',
        }}>
          {task.title}
        </h3>
        <span style={{
          fontSize: '0.675rem', fontWeight: 700, color: catColor,
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {task.category}
        </span>
      </div>

      {/* Status */}
      <span style={{
        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
        padding: '0.2rem 0.6rem', borderRadius: '99px', flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        {getStatusLabel(task.status)}
      </span>

      {/* Priority */}
      <span style={{
        fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase',
        color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`,
        padding: '0.2rem 0.5rem', borderRadius: '99px', flexShrink: 0,
      }}>
        {pm.label}
      </span>

      {/* Due */}
      <span style={{
        fontSize: '0.78rem', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap',
        color: isOverdue ? '#dc2626' : task.remainingDays === 0 ? '#d97706' : 'var(--color-neutral-400)',
      }}>
        {isOverdue
          ? `${Math.abs(task.remainingDays)}d overdue`
          : task.remainingDays === 0 ? 'Due today'
          : `Due ${task.dueDate}`}
      </span>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); onPreview(task); }}
          style={{
            width: '30px', height: '30px', borderRadius: '0.5rem',
            background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--color-neutral-500)', fontSize: '0.875rem',
          }}
        >
          <RiEyeLine />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onOpen(task.id); }}
          style={{
            padding: '0 0.75rem', height: '30px', borderRadius: '0.5rem',
            background: 'var(--color-neutral-900)', border: 'none',
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            cursor: 'pointer', color: '#fff', fontSize: '0.7rem', fontWeight: 700,
          }}
        >
          Open <RiArrowRightLine style={{ fontSize: '0.8rem' }} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Quick Preview Panel ───────────────────────────────────────────────────────

function QuickPreviewPanel({ task, onClose, onOpen }) {
  if (!task) return null;
  const sm = STATUS_META[task.status] ?? STATUS_META.assigned;
  const pm = PRIORITY_META[task.priority] ?? PRIORITY_META.low;
  const catColor = getCategoryColor(task.category);
  const isOverdue = !task.completedAt && task.remainingDays < 0;

  return (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        width: '320px', flexShrink: 0,
        background: '#fff', borderRadius: '1.25rem',
        border: '1px solid var(--color-neutral-100)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: '88px', alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 120px)', overflow: 'hidden',
      }}
    >
      {/* Priority accent bar */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${pm.color}, ${pm.color}88)`, borderRadius: '1.25rem 1.25rem 0 0' }} />

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em',
            color: catColor, background: `${catColor}18`, padding: '0.2rem 0.5rem', borderRadius: '99px',
          }}>
            {task.category}
          </span>
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px', borderRadius: '50%', border: 'none',
              background: 'var(--color-neutral-100)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-neutral-500)', fontSize: '1rem',
            }}
          >
            <RiCloseLine />
          </button>
        </div>

        {/* Title */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
            {task.title}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', lineHeight: 1.65, margin: 0 }}>
            {task.fullDescription || task.description}
          </p>
        </div>

        {/* Status + Priority */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
            padding: '0.25rem 0.65rem', borderRadius: '99px',
          }}>
            {getStatusLabel(task.status)}
          </span>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
            color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`,
            padding: '0.25rem 0.65rem', borderRadius: '99px',
          }}>
            {pm.label} Priority
          </span>
        </div>

        {/* Meta info grid */}
        <div style={{
          background: 'var(--color-neutral-50)', borderRadius: '0.75rem',
          padding: '0.875rem', border: '1px solid var(--color-neutral-100)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem',
        }}>
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              Due Date
            </div>
            <div style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: isOverdue ? '#dc2626' : task.remainingDays === 0 ? '#d97706' : 'var(--color-neutral-700)',
            }}>
              {isOverdue ? `${Math.abs(task.remainingDays)}d overdue` : task.remainingDays === 0 ? 'Due today' : task.dueDate}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
              Est. Time
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
              {task.estimatedTime ?? '—'}
            </div>
          </div>
        </div>

        {/* Objectives */}
        {task.objectives?.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>
              Objectives
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {task.objectives.map(obj => (
                <div key={obj.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  background: obj.checked ? '#f0fdf4' : 'var(--color-neutral-50)',
                  border: `1px solid ${obj.checked ? '#bbf7d0' : 'var(--color-neutral-100)'}`,
                  borderRadius: '0.625rem',
                }}>
                  {obj.checked
                    ? <RiCheckboxCircleLine style={{ color: '#16a34a', fontSize: '1rem', flexShrink: 0 }} />
                    : <RiCheckboxBlankCircleLine style={{ color: '#cbd5e1', fontSize: '1rem', flexShrink: 0 }} />}
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 500, flex: 1,
                    color: obj.checked ? 'var(--color-neutral-400)' : 'var(--color-neutral-700)',
                    textDecoration: obj.checked ? 'line-through' : 'none',
                  }}>
                    {obj.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supervisor */}
        {task.supervisor && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem', background: 'var(--color-neutral-50)',
            border: '1px solid var(--color-neutral-100)', borderRadius: '0.75rem',
          }}>
            <Avatar src={task.supervisor.avatar} name={task.supervisor.name} size="sm" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                {task.supervisor.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-500)' }}>
                {task.supervisor.role}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-neutral-100)' }}>
        <Button onClick={() => onOpen(task.id)} style={{ width: '100%' }} rightIcon={<RiArrowRightLine />}>
          Open Task
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Filter Sidebar ────────────────────────────────────────────────────────────

function FilterSidebar({ tasks, filters, onCategory, onPriority, onReset }) {
  return (
    <div style={{
      width: '220px', flexShrink: 0,
      background: '#fff', borderRadius: '1.25rem',
      border: '1px solid var(--color-neutral-100)',
      padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      position: 'sticky', top: '88px', alignSelf: 'flex-start',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}>
      {/* Category */}
      <div>
        <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>
          Category
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {[{ id: 'all', label: 'All Categories', color: '#64748b' }, ...mockCategories.map(c => ({ id: c.id, label: c.label, color: CATEGORY_COLORS[c.id] ?? '#64748b' }))].map(cat => {
            const count = cat.id === 'all' ? tasks.length : tasks.filter(t => t.category === cat.id).length;
            const isActive = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.625rem', borderRadius: '0.625rem', border: 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isActive ? `${cat.color}15` : 'transparent',
                  outline: isActive ? `1.5px solid ${cat.color}40` : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: isActive ? cat.color : 'var(--color-neutral-700)' }}>
                  {cat.label}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-neutral-400)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-neutral-100)' }} />

      {/* Priority */}
      <div>
        <h4 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>
          Priority
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {['all', 'urgent', 'high', 'medium', 'low'].map(prio => {
            const pm = PRIORITY_META[prio] ?? { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'All' };
            const count = prio === 'all' ? tasks.length : tasks.filter(t => t.priority === prio).length;
            const isActive = filters.priority === prio;
            const label = prio === 'all' ? 'All Priorities' : pm.label;
            return (
              <button
                key={prio}
                onClick={() => onPriority(prio)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0.625rem', borderRadius: '0.625rem', border: 'none',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: isActive && prio !== 'all' ? pm.bg : isActive ? 'var(--color-neutral-100)' : 'transparent',
                  outline: isActive && prio !== 'all' ? `1.5px solid ${pm.border}` : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive && prio !== 'all' ? pm.bg : isActive ? 'var(--color-neutral-100)' : 'transparent'; }}
              >
                <span style={{
                  width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                  background: prio === 'all' ? '#94a3b8' : pm.color,
                }} />
                <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: isActive && prio !== 'all' ? pm.color : 'var(--color-neutral-700)' }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-neutral-400)' }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          padding: '0.5rem 0.75rem', borderRadius: '0.75rem',
          border: '1px solid var(--color-neutral-200)', background: '#fff',
          fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-neutral-500)',
          cursor: 'pointer', transition: 'all 0.15s ease', width: '100%',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
      >
        <RiRefreshLine style={{ fontSize: '0.875rem' }} /> Reset Filters
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TaskList() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const { tasks, filters, sort, loadingTasks, fetchTasks, setFilter, setSort, resetFilters } = useTaskStore();

  const [layout, setLayout] = useState('grid'); // 'grid' | 'list'
  const [previewTask, setPreviewTask] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Ctrl+K shortcut for search
  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleOpen = useCallback(taskId => {
    navigate(ROUTES.TASK_DETAILS.replace(':taskId', taskId));
  }, [navigate]);

  const handleReset = useCallback(async () => {
    resetFilters();
    await fetchTasks();
  }, [resetFilters, fetchTasks]);

  // Derived stats
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inReview  = tasks.filter(t => t.status === 'under-review' || t.status === 'submitted').length;
  const remaining = total - completed;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = getFilteredAndSortedTasks({ tasks, filters, sort });

  const activeFilterCount = [
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.category !== 'all',
    !!filters.searchQuery,
  ].filter(Boolean).length;

  // Mobile filter content (reused in drawer)
  const MobileFilterContent = () => (
    <FilterSidebar
      tasks={tasks}
      filters={filters}
      onCategory={v => { setFilter('category', v); setMobileFilterOpen(false); }}
      onPriority={v => { setFilter('priority', v); setMobileFilterOpen(false); }}
      onReset={() => { resetFilters(); setMobileFilterOpen(false); }}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
            Task Runway
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Complete your assigned duties and track progress reviews.
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            background: '#fff', border: '1px solid var(--color-neutral-200)',
            borderRadius: '0.75rem', padding: '0.5rem 0.875rem',
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-600)',
            cursor: 'pointer', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
        >
          <RiRefreshLine style={{ fontSize: '0.95rem' }} /> Reset Demo
        </button>
      </motion.div>

      {/* ── Hero Stats Banner ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)',
          borderRadius: '1.125rem', padding: '1.75rem 2rem',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(37,99,235,0.22)',
        }}
      >
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(99,102,241,0.25)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30px', left: '35%', width: '140px', height: '140px', background: 'rgba(59,130,246,0.18)', borderRadius: '50%', filter: 'blur(35px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {/* Donut */}
          <div style={{ flexShrink: 0 }}>
            <CircularProgress value={pct} size={104} strokeWidth={10} variant={pct === 100 ? 'success' : 'primary'} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <RiSparklingLine style={{ color: '#93c5fd', fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your Runway
              </span>
            </div>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', margin: '0 0 0.3rem', lineHeight: 1.15 }}>
              {pct}% Complete
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.55, margin: '0 0 0.75rem', maxWidth: '36ch' }}>
              {getEncouragement(pct)}
            </p>
            {remaining > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                fontSize: '0.75rem', fontWeight: 600, color: '#bfdbfe',
                background: 'rgba(255,255,255,0.1)', borderRadius: '99px', padding: '0.3rem 0.75rem',
              }}>
                <RiTimeLine style={{ fontSize: '0.85rem' }} />
                {remaining} task{remaining !== 1 ? 's' : ''} remaining
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', flexShrink: 0 }}>
            {[
              { v: total,     l: 'Total',     c: '#e2e8f0' },
              { v: completed, l: 'Completed', c: '#86efac' },
              { v: inReview,  l: 'In Review',  c: '#a5b4fc' },
              { v: remaining, l: 'Remaining',  c: '#fde68a' },
            ].map(({ v, l, c }) => (
              <div key={l} style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: '0.625rem',
                padding: '0.625rem 0.875rem', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.09)', minWidth: '80px',
              }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: c, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.2rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', borderRadius: '1rem', padding: '0.875rem 1.25rem',
        border: '1px solid var(--color-neutral-100)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <RiSearchLine style={{
            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-neutral-400)', fontSize: '0.9rem', pointerEvents: 'none',
          }} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tasks…"
            value={filters.searchQuery}
            onChange={e => setFilter('searchQuery', e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.25rem', paddingRight: '4rem',
              paddingTop: '0.5rem', paddingBottom: '0.5rem',
              background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
              borderRadius: '0.625rem', fontSize: '0.8125rem', fontWeight: 500,
              color: 'var(--color-neutral-800)', outline: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-primary-400)'; e.target.style.background = '#fff'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.background = 'var(--color-neutral-50)'; }}
          />
          <kbd style={{
            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-neutral-400)',
            background: 'var(--color-neutral-100)', border: '1px solid var(--color-neutral-200)',
            borderRadius: '4px', padding: '0.1rem 0.3rem', letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}>
            Ctrl+K
          </kbd>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--color-neutral-200)', flexShrink: 0 }} />

        {/* Sort */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.625rem', padding: '0.4rem 0.75rem',
        }}>
          <RiArrowUpDownLine style={{ color: 'var(--color-neutral-400)', fontSize: '0.85rem' }} />
          <select
            value={sort.sortBy}
            onChange={e => {
              const v = e.target.value;
              const order = v === 'newest' || v === 'priority' || v === 'status' ? 'desc' : 'asc';
              setSort(v, order);
            }}
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-neutral-700)', cursor: 'pointer',
            }}
          >
            <option value="dueDate">Due Date</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">A–Z</option>
            <option value="status">By Status</option>
          </select>
        </div>

        {/* Layout toggle */}
        <div style={{
          display: 'flex', background: 'var(--color-neutral-50)',
          border: '1px solid var(--color-neutral-200)', borderRadius: '0.625rem', padding: '3px',
        }}>
          {[
            { v: 'grid', Icon: RiGridLine, label: 'Grid' },
            { v: 'list', Icon: RiListCheck3, label: 'List' },
          ].map(({ v, Icon, label }) => (
            <button
              key={v}
              onClick={() => setLayout(v)}
              title={label}
              style={{
                width: '30px', height: '28px', borderRadius: '0.4rem', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: layout === v ? '#fff' : 'transparent',
                color: layout === v ? 'var(--color-neutral-900)' : 'var(--color-neutral-400)',
                boxShadow: layout === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.95rem',
              }}
            >
              <Icon />
            </button>
          ))}
        </div>

        {/* Mobile filter button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          style={{
            display: 'none', // shown via media query workaround below
            alignItems: 'center', gap: '0.375rem',
            padding: '0.4rem 0.75rem', borderRadius: '0.625rem',
            background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
            fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-neutral-700)', cursor: 'pointer',
          }}
          id="mobile-filter-btn"
        >
          <RiFilterLine /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {/* ── Status Tab Strip ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.375rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {STATUS_TABS.map(tab => {
          const count = tab.id === 'all' ? tasks.length : tasks.filter(t => t.status === tab.id).length;
          const isActive = filters.status === tab.id;
          const sm = STATUS_META[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => setFilter('status', tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.4rem 0.875rem', borderRadius: '99px', border: 'none',
                whiteSpace: 'nowrap', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700,
                background: isActive
                  ? (sm ? sm.bg : 'var(--color-neutral-900)')
                  : '#fff',
                color: isActive
                  ? (sm ? sm.color : '#fff')
                  : 'var(--color-neutral-500)',
                border: `1px solid ${isActive && sm ? sm.border : 'var(--color-neutral-200)'}`,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
              <span style={{
                fontSize: '0.6rem', fontWeight: 800,
                background: isActive && sm ? `${sm.color}22` : 'var(--color-neutral-100)',
                color: isActive && sm ? sm.color : 'var(--color-neutral-500)',
                padding: '0.1rem 0.35rem', borderRadius: '99px',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Main Body: Sidebar + Content (+ Preview) ─────────────────── */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Filter Sidebar (desktop) */}
        <div style={{ display: 'block' }} className="task-filter-sidebar">
          <FilterSidebar
            tasks={tasks}
            filters={filters}
            onCategory={v => setFilter('category', v)}
            onPriority={v => setFilter('priority', v)}
            onReset={resetFilters}
          />
        </div>

        {/* Task grid / list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loadingTasks ? (
            <TasksSkeleton layout={layout} />
          ) : filtered.length === 0 ? (
            <div style={{
              background: '#fff', borderRadius: '1rem', padding: '4rem 2rem',
              border: '1px solid var(--color-neutral-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <EmptyState
                icon={<RiBookOpenLine />}
                title={filters.searchQuery ? 'No results found' : 'No tasks match'}
                description={
                  filters.searchQuery
                    ? `No tasks matching "${filters.searchQuery}".`
                    : 'Adjust your filters or check back later.'
                }
                action={
                  activeFilterCount > 0 ? (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  ) : null
                }
              />
            </div>
          ) : (
            <motion.div
              layout
              style={{
                display: 'grid',
                gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                gap: layout === 'grid' ? '1rem' : '0.625rem',
              }}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(task =>
                  layout === 'grid' ? (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPreview={t => setPreviewTask(previewTask?.id === t.id ? null : t)}
                      onOpen={handleOpen}
                    />
                  ) : (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onPreview={t => setPreviewTask(previewTask?.id === t.id ? null : t)}
                      onOpen={handleOpen}
                    />
                  )
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Quick Preview Panel */}
        <AnimatePresence>
          {previewTask && (
            <QuickPreviewPanel
              key="preview"
              task={previewTask}
              onClose={() => setPreviewTask(null)}
              onOpen={handleOpen}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Tasks"
        side="right"
        width="280px"
        footer={<Button fullWidth onClick={() => setMobileFilterOpen(false)}>Apply</Button>}
      >
        <MobileFilterContent />
      </Drawer>
    </div>
  );
}
