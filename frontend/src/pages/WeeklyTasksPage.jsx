/**
 * @file WeeklyTasksPage.jsx
 * @description Intern's weekly task planner grouped by ISO week with submission flow.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiAddLine, RiSendPlaneLine,
  RiCheckboxCircleLine, RiCloseCircleLine, RiTimeLine, RiLoader4Line,
} from 'react-icons/ri';
import { Card, Button, EmptyState, Skeleton, Modal } from '../components/ui';
import { weeklyPlanService } from '../services/weeklyPlanService';
import { AddWeeklyTaskDrawer } from '../components/projects/AddWeeklyTaskDrawer';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';

// ── Week helpers ───────────────────────────────────────────────────────────────
function toISODate(date) {
  return date.toISOString().split('T')[0];
}

function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return toISODate(d);
}

function getSundayOfWeek(mondayStr) {
  const d = new Date(mondayStr);
  d.setUTCDate(d.getUTCDate() + 6);
  return toISODate(d);
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
}

function shiftWeek(weekStart, direction) {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + direction * 7);
  return toISODate(d);
}

// ── Status config ──────────────────────────────────────────────────────────────
const PLAN_STATUS = {
  open:              { label: 'Open',              color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
  submitted:         { label: 'Submitted',         color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)'  },
  reviewed:          { label: 'Reviewed',          color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
  requires_changes:  { label: 'Requires Changes',  color: '#d97706',                  bg: '#fef3c7'                  },
};

const EOW_OPTIONS = [
  { value: '',           label: '— Not set —'  },
  { value: 'ongoing',   label: 'Ongoing'       },
  { value: 'completed', label: 'Completed'     },
  { value: 'pending',   label: 'Pending'       },
  { value: 'not_done',  label: 'Not Done'      },
];

const EOW_STYLES = {
  completed: { color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
  not_done:  { color: 'var(--color-danger-600)',  bg: 'var(--color-danger-50)'   },
  pending:   { color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
  ongoing:   { color: '#d97706',                  bg: '#fef3c7'                  },
};

const SOURCE_STYLES = {
  supervisor_assigned: { label: 'Supervisor',  color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
  intern_created:      { label: 'Self',        color: 'var(--color-success-600)', bg: 'var(--color-success-50)' },
  project_task:        { label: 'Project',     color: '#7c3aed',                  bg: '#f5f3ff'                 },
};

// ── Task row component ─────────────────────────────────────────────────────────
function TaskRow({ task, locked, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const src = SOURCE_STYLES[task.task_source] || SOURCE_STYLES.intern_created;
  const eow = EOW_STYLES[task.end_of_week_status] || null;

  const handleStatusChange = async (e) => {
    const val = e.target.value;
    if (!val) return;
    setUpdating(true);
    try {
      await weeklyPlanService.updateTaskStatus(task.id, { end_of_week_status: val, weekly_note: task.weekly_note });
      onStatusChange?.();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

  return (
    <tr style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-neutral-900)', maxWidth: '200px' }}>
        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{task.title}</span>
        {task.weekly_note && <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', display: 'block', marginTop: '0.1rem' }}>{task.weekly_note}</span>}
      </td>
      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>{task.project_title || '—'}</td>
      <td style={{ padding: '0.75rem 1rem' }}>
        <span style={{ display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, color: src.color, background: src.bg }}>{src.label}</span>
      </td>
      <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>{formatDate(task.due_date)}</td>
      <td style={{ padding: '0.75rem 1rem', minWidth: '140px' }}>
        {locked ? (
          eow ? (
            <span style={{ display: 'inline-flex', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, color: eow.color, background: eow.bg, textTransform: 'capitalize' }}>
              {task.end_of_week_status.replace('_', ' ')}
            </span>
          ) : <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)' }}>Not set</span>
        ) : (
          <select
            defaultValue={task.end_of_week_status || ''}
            onChange={handleStatusChange}
            disabled={updating}
            style={{ padding: '0.3rem 0.5rem', borderRadius: '0.4rem', border: '1px solid var(--color-neutral-200)', fontSize: '0.8rem', color: 'var(--color-neutral-800)', background: 'var(--color-neutral-0, #fff)', cursor: 'pointer', outline: 'none' }}
          >
            {EOW_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
      </td>
    </tr>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function WeeklyTasksPage() {
  const [weekStart, setWeekStart] = useState(getMondayOfWeek());
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchWeekData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await weeklyPlanService.getWeeklyPlan(weekStart);
      const data = res.data || {};
      setPlan(data.plan || null);
      setTasks(data.tasks || []);
    } catch {
      toast.error('Failed to load weekly tasks');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => { fetchWeekData(); }, [fetchWeekData]);

  const handleSubmitReport = async () => {
    if (!plan) return;
    setSubmitting(true);
    try {
      await weeklyPlanService.submitWeeklyReport(plan.id);
      toast.success('Weekly report submitted for review!');
      setSubmitModal(false);
      fetchWeekData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const planStatus = plan?.status || 'open';
  const planCfg = PLAN_STATUS[planStatus] || PLAN_STATUS.open;
  const locked = ['submitted', 'reviewed'].includes(planStatus);

  const stats = {
    total:     tasks.length,
    completed: tasks.filter((t) => t.end_of_week_status === 'completed').length,
    ongoing:   tasks.filter((t) => t.end_of_week_status === 'ongoing').length,
    pending:   tasks.filter((t) => !t.end_of_week_status || t.end_of_week_status === 'pending').length,
    not_done:  tasks.filter((t) => t.end_of_week_status === 'not_done').length,
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.2rem' }}>Weekly Tasks</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', margin: 0 }}>Plan and track your week</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {!locked && (
            <Button size="sm" variant="ghost" onClick={() => setAddingTask(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <RiAddLine /> Add Task
            </Button>
          )}
          {planStatus === 'open' && tasks.length > 0 && (
            <Button size="sm" onClick={() => setSubmitModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RiSendPlaneLine /> Submit Report
            </Button>
          )}
        </div>
      </div>

      {/* Week navigator */}
      <Card style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setWeekStart(shiftWeek(weekStart, -1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.4rem', color: 'var(--color-neutral-600)', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
          <RiArrowLeftSLine />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '1rem', color: 'var(--color-neutral-900)' }}>
            {formatWeekRange(weekStart)}
          </p>
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, color: planCfg.color, background: planCfg.bg }}>
            {planCfg.label}
          </span>
        </div>
        <button onClick={() => setWeekStart(shiftWeek(weekStart, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.4rem', color: 'var(--color-neutral-600)', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
          <RiArrowRightSLine />
        </button>
      </Card>

      {/* Stats row */}
      {!loading && tasks.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--color-neutral-600)', bg: 'var(--color-neutral-50)' },
            { label: 'Completed', value: stats.completed, color: 'var(--color-success-600)', bg: 'var(--color-success-50)' },
            { label: 'Ongoing', value: stats.ongoing, color: '#d97706', bg: '#fef3c7' },
            { label: 'Pending', value: stats.pending, color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
            { label: 'Not Done', value: stats.not_done, color: 'var(--color-danger-600)', bg: 'var(--color-danger-50)' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '0.65rem 0.75rem', borderRadius: '0.6rem', background: s.bg, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: s.color, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Task table */}
      {loading ? (
        <Card style={{ padding: '1.25rem' }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height="2.5rem" style={{ marginBottom: '0.5rem' }} />)}
        </Card>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<RiTimeLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />}
          title="No tasks this week"
          description="Add tasks to track your work for this week"
          action={!locked && <Button onClick={() => setAddingTask(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RiAddLine /> Add Task</Button>}
        />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                {['Task', 'Project', 'Source', 'Due', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)', fontSize: '0.78rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} locked={locked} onStatusChange={fetchWeekData} />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Reviewed feedback */}
      {plan?.reviewer_feedback && (
        <Card style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-success-50)', border: '1px solid var(--color-success-100)' }}>
          <p style={{ margin: '0 0 0.25rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-success-700)' }}>Supervisor Feedback</p>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-success-700)', lineHeight: 1.5 }}>{plan.reviewer_feedback}</p>
        </Card>
      )}

      {/* Requires changes notice */}
      {planStatus === 'requires_changes' && (
        <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.6rem', fontSize: '0.85rem', color: '#92400e' }}>
          Your supervisor has requested changes. Update your tasks and resubmit.
          <Button size="sm" style={{ marginLeft: '1rem' }} onClick={() => setSubmitModal(true)}>
            Resubmit Report
          </Button>
        </div>
      )}

      {/* Add task drawer */}
      <AddWeeklyTaskDrawer
        isOpen={addingTask}
        onClose={() => setAddingTask(false)}
        onSuccess={fetchWeekData}
        weekStart={weekStart}
      />

      {/* Submit confirm modal */}
      <Modal isOpen={submitModal} onClose={() => setSubmitModal(false)} title="Submit Weekly Report?" maxWidth="420px">
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
          Your weekly report for <strong>{formatWeekRange(weekStart)}</strong> will be submitted to your supervisor for review.
          You will not be able to edit task statuses after submission.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={() => setSubmitModal(false)}>Cancel</Button>
          <Button onClick={handleSubmitReport} loading={submitting}>Submit Report</Button>
        </div>
      </Modal>
    </div>
  );
}
