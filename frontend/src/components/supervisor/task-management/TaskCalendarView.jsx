/**
 * @file TaskCalendarView.jsx
 * @description Monthly/weekly calendar view showing task due dates with colour-coded
 * priority dots, event cards, and task count indicators per day.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCalendarLine,
} from 'react-icons/ri';
import { useSupervisorTaskStore } from '../../../store/useSupervisorTaskStore';
import { TaskCalendarSkeleton } from './TaskSkeletonLoaders';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high:   '#f59e0b',
  medium: '#3b82f6',
  low:    '#22c55e',
};

const STATUS_BG = {
  draft:            '#f1f5f9',
  assigned:         '#dbeafe',
  'in-progress':    '#e0e7ff',
  'pending-review': '#fef3c7',
  'needs-revision': '#fee2e2',
  completed:        '#d1fae5',
  overdue:          '#fecaca',
};

// Build a flat date → tasks map from the tasks list
const buildTaskMap = (tasks) => {
  const map = {};
  tasks.forEach((task) => {
    if (!task.dueDate) return;
    if (!map[task.dueDate]) map[task.dueDate] = [];
    map[task.dueDate].push(task);
  });
  return map;
};

// Get calendar grid days for a given year/month (6 weeks, always)
const getCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const grid = [];

  // Pad from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    grid.push({ day: daysInPrev - i, month: month - 1 < 0 ? 11 : month - 1, year: month - 1 < 0 ? year - 1 : year, isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({ day: d, month, year, isCurrentMonth: true });
  }

  // Pad to next month
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    grid.push({ day: d, month: month + 1 > 11 ? 0 : month + 1, year: month + 1 > 11 ? year + 1 : year, isCurrentMonth: false });
  }

  return grid;
};

const formatDateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const DayCell = ({ day, month, year, isCurrentMonth, tasks = [], isToday, onDayClick, selectedDate }) => {
  const dateKey = formatDateKey(year, month, day);
  const isSelected = selectedDate === dateKey;
  const MAX_SHOW = 2;

  return (
    <motion.div
      whileHover={{ scale: 1.03, zIndex: 2 }}
      onClick={() => onDayClick(dateKey, tasks)}
      style={{
        minHeight: '80px',
        padding: '0.375rem',
        borderRadius: '0.625rem',
        background: isSelected ? '#eef2ff' : isToday ? '#f5f3ff' : '#fff',
        border: isSelected ? '1.5px solid #4f46e5' : isToday ? '1.5px solid #a5b4fc' : '1px solid var(--color-neutral-100)',
        cursor: tasks.length > 0 ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        position: 'relative',
        transition: 'all 0.12s ease',
      }}
    >
      {/* Day number */}
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: isToday ? 800 : isCurrentMonth ? 600 : 400,
          color: isToday ? '#4f46e5' : isCurrentMonth ? 'var(--color-neutral-700)' : 'var(--color-neutral-300)',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isToday ? '#e0e7ff' : 'transparent',
          flexShrink: 0,
        }}
      >
        {day}
      </span>

      {/* Task pills */}
      {tasks.slice(0, MAX_SHOW).map((task, i) => (
        <div
          key={task.id}
          title={task.title}
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            padding: '0.1rem 0.375rem',
            borderRadius: '0.25rem',
            background: STATUS_BG[task.status] || '#f1f5f9',
            color: 'var(--color-neutral-700)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            borderLeft: `2.5px solid ${PRIORITY_COLORS[task.priority] || '#94a3b8'}`,
          }}
        >
          {task.title}
        </div>
      ))}

      {/* Overflow badge */}
      {tasks.length > MAX_SHOW && (
        <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#4f46e5', padding: '0.1rem 0.25rem', background: '#eef2ff', borderRadius: '0.25rem' }}>
          +{tasks.length - MAX_SHOW} more
        </span>
      )}
    </motion.div>
  );
};

const AgendaView = ({ taskMap, year, month }) => {
  const entries = Object.entries(taskMap)
    .filter(([dateKey]) => {
      const [y, m] = dateKey.split('-').map(Number);
      return y === year && m - 1 === month;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
        No tasks due this month.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {entries.map(([dateKey, tasks]) => (
        <div key={dateKey} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ minWidth: '70px', textAlign: 'right', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
              {new Date(dateKey + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </p>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  padding: '0.625rem 0.875rem',
                  background: '#fff',
                  borderRadius: '0.625rem',
                  border: '1px solid var(--color-neutral-200)',
                  borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#94a3b8'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.title}
                </p>
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: STATUS_BG[task.status] || '#f1f5f9', color: 'var(--color-neutral-600)' }}>
                    {task.status?.replace(/-/g, ' ')}
                  </span>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: `${PRIORITY_COLORS[task.priority] || '#94a3b8'}20`, color: PRIORITY_COLORS[task.priority] || '#94a3b8' }}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Selected Day Panel ────────────────────────────────────────────────────────
const DayDetailPanel = ({ dateKey, tasks, onClose }) => {
  if (!tasks || tasks.length === 0) return null;
  const date = new Date(dateKey + 'T12:00:00');

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      style={{
        width: '260px',
        flexShrink: 0,
        background: '#fff',
        borderRadius: '0.875rem',
        border: '1px solid var(--color-neutral-200)',
        padding: '1rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        alignSelf: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RiCalendarLine style={{ color: '#4f46e5', fontSize: '1rem' }} />
          <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>
            {date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', fontSize: '1rem', padding: 0, display: 'flex' }}>
          ×
        </button>
      </div>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontWeight: 600 }}>
        {tasks.length} task{tasks.length !== 1 ? 's' : ''} due
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              padding: '0.625rem',
              background: 'var(--color-neutral-50)',
              borderRadius: '0.625rem',
              border: '1px solid var(--color-neutral-100)',
              borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#94a3b8'}`,
            }}
          >
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)', lineHeight: 1.3 }}>{task.title}</p>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ padding: '0.1rem 0.375rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, background: STATUS_BG[task.status] || '#f1f5f9', color: 'var(--color-neutral-600)' }}>
                {task.status?.replace(/-/g, ' ')}
              </span>
              <span style={{ padding: '0.1rem 0.375rem', borderRadius: '9999px', fontSize: '0.625rem', fontWeight: 700, color: PRIORITY_COLORS[task.priority] || '#94a3b8', background: `${PRIORITY_COLORS[task.priority] || '#94a3b8'}15` }}>
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const TaskCalendarView = () => {
  const { tasks, loading } = useSupervisorTaskStore();
  const [viewMode, setViewMode] = useState('month'); // month | agenda
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateTasks, setSelectedDateTasks] = useState([]);

  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const taskMap = useMemo(() => buildTaskMap(tasks), [tasks]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const goToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDayClick = (dateKey, dayTasks) => {
    if (dayTasks.length === 0) { setSelectedDate(null); return; }
    setSelectedDate(dateKey);
    setSelectedDateTasks(dayTasks);
  };

  if (loading.tasks) return <TaskCalendarSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Calendar Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: '1rem',
          border: '1px solid var(--color-neutral-200)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header controls */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={prevMonth} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-neutral-600)' }}>
              <RiArrowLeftSLine style={{ fontSize: '1.125rem' }} />
            </motion.button>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)', minWidth: '160px', textAlign: 'center' }}>
              {MONTHS[currentMonth]} {currentYear}
            </h3>
            <motion.button whileTap={{ scale: 0.92 }} onClick={nextMonth} style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-neutral-600)' }}>
              <RiArrowRightSLine style={{ fontSize: '1.125rem' }} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={goToday} style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-neutral-600)' }}>
              Today
            </motion.button>
          </div>

          {/* Priority legend */}
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
              <span key={priority} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--color-neutral-600)', fontWeight: 600, textTransform: 'capitalize' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                {priority}
              </span>
            ))}
          </div>

          {/* View mode */}
          <div style={{ display: 'flex', border: '1px solid var(--color-neutral-200)', borderRadius: '0.625rem', overflow: 'hidden' }}>
            {['month', 'agenda'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.4rem 0.875rem',
                  border: 'none',
                  background: viewMode === mode ? '#4f46e5' : '#fff',
                  color: viewMode === mode ? '#fff' : 'var(--color-neutral-600)',
                  fontWeight: viewMode === mode ? 700 : 400,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          {/* Calendar grid or agenda */}
          <div style={{ flex: 1, padding: '1rem' }}>
            {viewMode === 'month' ? (
              <>
                {/* Weekday headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.375rem', marginBottom: '0.375rem' }}>
                  {WEEKDAYS.map((d) => (
                    <div key={d} style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-neutral-400)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0' }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.375rem' }}>
                  {calendarDays.map(({ day, month, year: y, isCurrentMonth }, idx) => {
                    const dateKey = formatDateKey(y, month, day);
                    const dayTasks = taskMap[dateKey] || [];
                    const isToday = dateKey === todayKey;
                    return (
                      <DayCell
                        key={idx}
                        day={day}
                        month={month}
                        year={y}
                        isCurrentMonth={isCurrentMonth}
                        tasks={dayTasks}
                        isToday={isToday}
                        selectedDate={selectedDate}
                        onDayClick={handleDayClick}
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <AgendaView taskMap={taskMap} year={currentYear} month={currentMonth} />
            )}
          </div>

          {/* Day detail side panel */}
          <AnimatePresence>
            {selectedDate && selectedDateTasks.length > 0 && (
              <div style={{ padding: '1rem 1rem 1rem 0' }}>
                <DayDetailPanel dateKey={selectedDate} tasks={selectedDateTasks} onClose={() => setSelectedDate(null)} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Overdue', count: tasks.filter((t) => t.status === 'overdue').length, color: '#ef4444' },
            { label: 'Due this month', count: Object.entries(taskMap).filter(([dk]) => { const [y, m] = dk.split('-').map(Number); return y === currentYear && m - 1 === currentMonth; }).length, color: '#3b82f6' },
            { label: 'Completed this month', count: tasks.filter((t) => t.status === 'completed').length, color: '#10b981' },
          ].map(({ label, count, color }) => (
            <span key={label} style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              <strong style={{ color, fontSize: '0.9375rem' }}>{count}</strong> {label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCalendarView;
