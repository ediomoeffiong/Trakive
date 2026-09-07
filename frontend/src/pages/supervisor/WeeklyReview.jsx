/**
 * @file WeeklyReview.jsx
 * @description Supervisor's weekly review page — view and review intern weekly submissions.
 */
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  RiArrowLeftSLine, RiArrowRightSLine, RiCheckboxCircleLine,
  RiCloseCircleLine, RiTimeLine, RiLoader4Line, RiUser3Line,
  RiRefreshLine, RiCalendarCheckLine,
} from 'react-icons/ri';
import { Card, Button, EmptyState, Skeleton, Modal } from '../../components/ui';
import { weeklyPlanService } from '../../services/weeklyPlanService';

// ── Week helpers ──────────────────────────────────────────────────────────────
function toISODate(d) { return d.toISOString().split('T')[0]; }

function getMondayOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return toISODate(d);
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
}

function shiftWeek(weekStart, dir) {
  const d = new Date(weekStart);
  d.setUTCDate(d.getUTCDate() + dir * 7);
  return toISODate(d);
}

// ── Config ────────────────────────────────────────────────────────────────────
const PLAN_STATUS_STYLES = {
  open:             { label: 'Open',             color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
  submitted:        { label: 'Submitted',        color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)'  },
  reviewed:         { label: 'Reviewed',         color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
  requires_changes: { label: 'Changes Requested', color: '#d97706',                  bg: '#fef3c7'                  },
};

const EOW_STYLES = {
  completed: { label: 'Completed', color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
  not_done:  { label: 'Not Done',  color: 'var(--color-danger-600)',  bg: 'var(--color-danger-50)'   },
  pending:   { label: 'Pending',   color: 'var(--color-neutral-500)', bg: 'var(--color-neutral-100)' },
  ongoing:   { label: 'Ongoing',   color: '#d97706',                  bg: '#fef3c7'                  },
};

const SOURCE_STYLES = {
  supervisor_assigned: { label: 'Supervisor',  color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
  intern_created:      { label: 'Self',        color: 'var(--color-success-600)', bg: 'var(--color-success-50)' },
  project_task:        { label: 'Project',     color: '#7c3aed',                  bg: '#f5f3ff'                 },
};

// ── Review modal ──────────────────────────────────────────────────────────────
function ReviewModal({ plan, onClose, onComplete }) {
  const [action, setAction] = useState('reviewed');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await weeklyPlanService.reviewWeeklyReport(plan.id, { action, feedback: feedback || undefined });
      toast.success(action === 'reviewed' ? 'Report reviewed!' : 'Changes requested — intern notified');
      onComplete?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to review report');
    } finally {
      setLoading(false);
    }
  };

  const TAB_BTN = (val, label, activeColor = 'var(--color-primary-600)') => ({
    flex: 1, padding: '0.5rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
    border: 'none', borderRadius: '0.35rem',
    background: action === val ? activeColor : 'transparent',
    color: action === val ? '#fff' : 'var(--color-neutral-600)',
    transition: 'all 0.12s ease',
  });

  return (
    <Modal isOpen={!!plan} onClose={onClose} title="Review Weekly Report" maxWidth="480px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-neutral-600)' }}>
          Week: <strong>{plan && formatWeekRange(plan.week_start)}</strong> — {plan?.intern_first_name} {plan?.intern_last_name}
        </p>

        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--color-neutral-100)', borderRadius: '0.5rem', padding: '0.25rem' }}>
          <button style={TAB_BTN('reviewed', '✓ Approve', 'var(--color-success-600)')} onClick={() => setAction('reviewed')}>✓ Approve</button>
          <button style={TAB_BTN('changes_requested', '⟳ Request Changes', '#d97706')} onClick={() => setAction('changes_requested')}>⟳ Request Changes</button>
        </div>

        {action === 'reviewed' && (
          <p style={{ fontSize: '0.82rem', color: 'var(--color-success-600)', margin: 0, background: 'var(--color-success-50)', padding: '0.6rem 0.8rem', borderRadius: '0.5rem' }}>
            The intern's weekly report will be marked as reviewed.
          </p>
        )}

        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-neutral-700)', marginBottom: '0.4rem' }}>
            Feedback {action === 'changes_requested' && <span style={{ color: 'var(--color-danger-500)' }}>*</span>}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={action === 'reviewed' ? 'Optional feedback for the intern...' : 'Describe the changes needed...'}
            style={{ width: '100%', minHeight: '90px', padding: '0.6rem 0.75rem', border: '1px solid var(--color-neutral-200)', borderRadius: '0.5rem', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box', background: 'var(--color-neutral-0, #fff)', color: 'var(--color-neutral-900)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>
            {action === 'reviewed' ? 'Approve Report' : 'Request Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Intern plan card ──────────────────────────────────────────────────────────
function InternPlanCard({ plan, onReview }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = PLAN_STATUS_STYLES[plan.status] || PLAN_STATUS_STYLES.open;
  const stats = plan.stats || {};
  const tasks = Array.isArray(plan.tasks) ? plan.tasks : [];
  const canReview = plan.status === 'submitted';

  return (
    <Card style={{ padding: '1.1rem 1.25rem', marginBottom: '0.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-700)', flexShrink: 0 }}>
            {(plan.intern_first_name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-neutral-900)' }}>
              {plan.intern_first_name} {plan.intern_last_name}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{plan.intern_email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ display: 'inline-flex', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
            {statusCfg.label}
          </span>
          {canReview && (
            <Button size="sm" onClick={() => onReview(plan)} style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}>
              Review
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
        {[
          { label: 'Total',     val: stats.total || 0,     color: 'var(--color-neutral-600)', bg: 'var(--color-neutral-100)' },
          { label: 'Completed', val: stats.completed || 0, color: 'var(--color-success-600)', bg: 'var(--color-success-50)'  },
          { label: 'Ongoing',   val: stats.ongoing || 0,   color: '#d97706',                  bg: '#fef3c7'                  },
          { label: 'Not Done',  val: stats.not_done || 0,  color: 'var(--color-danger-600)',  bg: 'var(--color-danger-50)'   },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.6rem', borderRadius: '999px', background: s.bg }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: s.color }}>{s.val}</span>
            <span style={{ fontSize: '0.72rem', color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Expand / collapse task list */}
      {tasks.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--color-primary-600)', fontWeight: 600, padding: 0 }}
          >
            {expanded ? '▲ Hide tasks' : `▼ Show ${tasks.length} task${tasks.length > 1 ? 's' : ''}`}
          </button>

          {expanded && (
            <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-100)' }}>
                    {['Task', 'Project', 'Source', 'Due', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-neutral-600)', fontSize: '0.75rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => {
                    const src = SOURCE_STYLES[t.task_source] || SOURCE_STYLES.intern_created;
                    const eow = EOW_STYLES[t.end_of_week_status];
                    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
                    return (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
                        <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: 'var(--color-neutral-900)', maxWidth: '180px' }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-neutral-500)' }}>{t.project_title || '—'}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          <span style={{ display: 'inline-flex', padding: '0.15rem 0.45rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600, color: src.color, background: src.bg }}>{src.label}</span>
                        </td>
                        <td style={{ padding: '0.5rem 0.75rem', color: 'var(--color-neutral-500)', whiteSpace: 'nowrap' }}>{formatDate(t.due_date)}</td>
                        <td style={{ padding: '0.5rem 0.75rem' }}>
                          {eow ? (
                            <span style={{ display: 'inline-flex', padding: '0.15rem 0.45rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 600, color: eow.color, background: eow.bg }}>{eow.label}</span>
                          ) : <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WeeklyReview() {
  const [weekStart, setWeekStart] = useState(getMondayOfWeek());
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await weeklyPlanService.supervisorView({
        week_start: weekStart,
        status: statusFilter || undefined,
        limit: 50,
      });
      setPlans(res.data || []);
    } catch {
      toast.error('Failed to load weekly plans');
    } finally {
      setLoading(false);
    }
  }, [weekStart, statusFilter]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const submitted = plans.filter((p) => p.status === 'submitted').length;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.2rem' }}>Weekly Review</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-neutral-500)', margin: 0 }}>Review your interns' weekly task submissions</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchPlans} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RiRefreshLine /> Refresh
        </Button>
      </div>

      {/* Pending badge */}
      {submitted > 0 && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)', borderRadius: '0.6rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--color-primary-700)', fontWeight: 600 }}>
          📋 {submitted} report{submitted > 1 ? 's' : ''} awaiting your review this week
        </div>
      )}

      {/* Week navigator */}
      <Card style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setWeekStart(shiftWeek(weekStart, -1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', padding: '0.25rem 0.5rem', borderRadius: '0.4rem' }}>
          <RiArrowLeftSLine />
        </button>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--color-neutral-900)' }}>
          {formatWeekRange(weekStart)}
        </p>
        <button onClick={() => setWeekStart(shiftWeek(weekStart, 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', padding: '0.25rem 0.5rem', borderRadius: '0.4rem' }}>
          <RiArrowRightSLine />
        </button>
      </Card>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { value: '',                label: 'All'              },
          { value: 'submitted',       label: 'Submitted'        },
          { value: 'reviewed',        label: 'Reviewed'         },
          { value: 'requires_changes',label: 'Changes Requested'},
          { value: 'open',            label: 'Open'             },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: '999px', border: '1.5px solid',
              borderColor: statusFilter === opt.value ? 'var(--color-primary-500)' : 'var(--color-neutral-200)',
              background: statusFilter === opt.value ? 'var(--color-primary-50)' : 'var(--color-neutral-0, #fff)',
              color: statusFilter === opt.value ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Plans list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map((i) => (
            <Card key={i} style={{ padding: '1.1rem' }}>
              <Skeleton height="1rem" width="40%" style={{ marginBottom: '0.5rem' }} />
              <Skeleton height="0.75rem" width="70%" />
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<RiCalendarCheckLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />}
          title="No submissions this week"
          description="No interns have submitted their weekly report for this period"
        />
      ) : (
        plans.map((plan) => (
          <InternPlanCard key={plan.id} plan={plan} onReview={setReviewTarget} />
        ))
      )}

      <ReviewModal
        plan={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onComplete={() => { setReviewTarget(null); fetchPlans(); }}
      />
    </div>
  );
}
