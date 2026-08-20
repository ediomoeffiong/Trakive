/**
 * @file TasksPage.jsx
 * @description Department Head — Task Monitoring Page.
 * Read-only oversight view showing all tasks across department teams
 * with filtering by status, priority, supervisor, and a detail drawer.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiTaskLine, RiSearchLine, RiCloseLine, RiCheckboxCircleLine,
  RiTimeLine, RiProgress4Line, RiAlarmWarningLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_CONFIG = {
  completed:      { variant: 'success', label: 'Completed',     icon: RiCheckboxCircleLine },
  in_progress:    { variant: 'primary', label: 'In Progress',   icon: RiProgress4Line },
  pending_review: { variant: 'warning', label: 'Pending Review', icon: RiTimeLine },
  overdue:        { variant: 'danger',  label: 'Overdue',       icon: RiAlarmWarningLine },
};

const PRIORITY_CONFIG = {
  high:   { color: '#dc2626', bg: '#fee2e2' },
  medium: { color: '#d97706', bg: '#fef3c7' },
  low:    { color: '#16a34a', bg: '#dcfce7' },
};

// ── Task Detail Drawer ─────────────────────────────────────────────────────────
const TaskDrawer = ({ task, onClose }) => {
  if (!task) return null;
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.in_progress;
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, backdropFilter: 'blur(2px)' }} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 460, background: '#fff', zIndex: 501, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-neutral-900)' }}>Task Details</h3>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '0.375rem', border: 'none', background: 'var(--color-neutral-100)', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-500)' }}><RiCloseLine /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <Badge variant={status.variant}>{status.label}</Badge>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 99, background: priority.bg, color: priority.color, textTransform: 'capitalize' }}>{task.priority} Priority</span>
            </div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>{task.title}</h4>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{task.description}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-600)' }}>Completion</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-primary-600)' }}>{task.completionRate}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${task.completionRate}%` }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ height: '100%', background: task.completionRate === 100 ? '#10b981' : 'linear-gradient(90deg, #4f46e5, #818cf8)', borderRadius: 99 }} />
            </div>
          </div>

          {/* Metadata grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Intern', value: task.internName },
              { label: 'Supervisor', value: task.supervisorName },
              { label: 'Track', value: task.track },
              { label: 'Due Date', value: task.dueDate },
              { label: 'Created', value: task.createdAt },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>{label}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Task Row ───────────────────────────────────────────────────────────────────
const TaskRow = ({ task, onView }) => {
  const status = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.in_progress;
  const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ backgroundColor: '#f8fafc' }}
      style={{ borderBottom: '1px solid var(--color-neutral-100)', cursor: 'pointer' }}
      onClick={() => onView(task)}
    >
      <td style={{ padding: '0.875rem 1rem' }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-neutral-900)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</p>
        <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{task.track}</p>
      </td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-700)' }}>{task.internName}</td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>{task.supervisorName}</td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 99, background: priority.bg, color: priority.color, textTransform: 'capitalize' }}>{task.priority}</span>
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <Badge variant={status.variant}>{status.label}</Badge>
      </td>
      <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: task.status === 'overdue' ? '#dc2626' : 'var(--color-neutral-700)', fontWeight: task.status === 'overdue' ? 700 : 400 }}>{task.dueDate}</td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: 6, background: 'var(--color-neutral-200)', borderRadius: 99, overflow: 'hidden', minWidth: 60 }}>
            <div style={{ width: `${task.completionRate}%`, height: '100%', background: task.completionRate === 100 ? '#10b981' : '#6366f1', borderRadius: 99 }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-600)', flexShrink: 0 }}>{task.completionRate}%</span>
        </div>
      </td>
      <td style={{ padding: '0.875rem 1rem' }}>
        <button onClick={(e) => { e.stopPropagation(); onView(task); }} style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, border: '1px solid var(--color-primary-200)', borderRadius: '0.5rem', background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', cursor: 'pointer' }}>
          View
        </button>
      </td>
    </motion.tr>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const TasksPage = () => {
  const { tasks, taskStats, supervisors, filters, loading, errors, fetchTasks, fetchSupervisors, setFilter, setSelectedTask, selectedTask } = useDepartmentStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
    if (!supervisors.length) fetchSupervisors();
  }, [fetchTasks, fetchSupervisors]);

  const handleSearch = (value) => {
    setSearch(value);
    setFilter('taskSearch', value);
    setTimeout(() => fetchTasks(), 0);
  };

  const handleFilter = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchTasks(), 0);
  };

  const STATUSES = [
    { value: 'all', label: 'All Status' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const PRIORITIES = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
          Task Monitoring
        </span>
        <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Department Tasks</h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
          Read-only overview of <strong style={{ color: '#fff' }}>{taskStats?.total ?? tasks.length} tasks</strong> across all engineering tracks.
        </p>
      </div>

      {/* Stats */}
      {taskStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total', value: taskStats.total, color: '#4f46e5' },
            { label: 'Active', value: taskStats.active, color: '#0ea5e9' },
            { label: 'Completed', value: taskStats.completed, color: '#10b981' },
            { label: 'Pending Review', value: taskStats.pendingReview, color: '#f59e0b' },
            { label: 'Overdue', value: taskStats.overdue, color: '#dc2626' },
          ].map(({ label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search tasks, interns, supervisors..." value={search} onChange={(e) => handleSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', height: '38px', width: '100%' }} />
        </div>
        <select value={filters.taskStatus} onChange={(e) => handleFilter('taskStatus', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filters.taskPriority} onChange={(e) => handleFilter('taskPriority', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={filters.taskSupervisor} onChange={(e) => handleFilter('taskSupervisor', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Supervisors</option>
          {supervisors.map(sv => <option key={sv.id} value={sv.id}>{sv.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading.tasks ? (
          <div style={{ padding: '2rem' }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ height: 52, background: '#f1f5f9', borderRadius: '0.5rem', marginBottom: '0.75rem', animation: 'pulse 1.5s ease infinite' }} />)}
          </div>
        ) : errors.tasks ? (
          <EmptyState icon={<RiTaskLine />} title="Failed to load tasks" description={errors.tasks} />
        ) : tasks.length === 0 ? (
          <EmptyState icon={<RiTaskLine />} title="No tasks found" description="Try adjusting your search or filters." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-neutral-50)' }}>
                  {['Task', 'Intern', 'Supervisor', 'Priority', 'Status', 'Due Date', 'Progress', ''].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => <TaskRow key={task.id} task={task} onView={setSelectedTask} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
};

export default TasksPage;
