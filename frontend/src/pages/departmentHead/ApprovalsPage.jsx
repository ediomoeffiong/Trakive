/**
 * @file ApprovalsPage.jsx
 * @description Department Head — Approval Requests Center.
 * Review, approve, or reject supervisor-submitted requests with full details,
 * comment capability via React Hook Form, and animated status transitions.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCheckboxCircleLine, RiCloseLine, RiSearchLine,
  RiTimeLine, RiCheckLine, RiAlertLine, RiFilterLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_CONFIG = {
  pending:  { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger',  label: 'Rejected' },
};

const PRIORITY_CONFIG = {
  high:   { color: '#dc2626', bg: '#fee2e2', label: 'High' },
  medium: { color: '#d97706', bg: '#fef3c7', label: 'Medium' },
  low:    { color: '#16a34a', bg: '#dcfce7', label: 'Low' },
};

const TYPE_LABELS = {
  intern_extension:      'Internship Extension',
  certificate_clearance: 'Certificate Clearance',
  budget_approval:       'Budget Approval',
  supervisor_reassignment: 'Supervisor Reassignment',
  tool_access:           'Tool Access',
  overtime_approval:     'Overtime Approval',
};

// ── Review Modal ───────────────────────────────────────────────────────────────
const ReviewModal = ({ approval, action, onClose, onSubmit, loading }) => {
  const isApprove = action === 'approve';
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ defaultValues: { comment: '' } });

  const submit = handleSubmit(async (data) => {
    await onSubmit(approval.id, data.comment, action);
    reset();
    onClose();
  });

  return (
    <Modal
      isOpen={!!approval && !!action}
      onClose={onClose}
      title={isApprove ? '✅ Approve Request' : '❌ Reject Request'}
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.625rem 1.25rem' }}>Cancel</button>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none',
              background: isApprove ? '#059669' : '#dc2626', color: '#fff',
              fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Processing…' : isApprove ? 'Confirm Approve' : 'Confirm Reject'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: 'var(--color-neutral-50)', borderRadius: '0.875rem', padding: '1rem' }}>
          <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>Request</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-neutral-900)' }}>{approval?.title}</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>by {approval?.requesterName} — {approval?.targetInternName}</p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>
            {isApprove ? 'Approval comment (optional)' : 'Rejection reason (required)'}
          </label>
          <textarea
            {...register('comment', { required: !isApprove ? 'Please provide a reason for rejection.' : false })}
            rows={4}
            placeholder={isApprove ? 'Add any notes or conditions for this approval…' : 'Explain why this request is being rejected…'}
            className="input-field"
            style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.5, padding: '0.75rem' }}
          />
          {errors.comment && (
            <p style={{ margin: '0.375rem 0 0', fontSize: '0.8125rem', color: '#dc2626' }}>{errors.comment.message}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ── Approval Card ──────────────────────────────────────────────────────────────
const ApprovalCard = ({ approval, onView }) => {
  const status = STATUS_CONFIG[approval.status] ?? STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[approval.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      layout
      style={{
        background: '#fff', borderRadius: '1rem', padding: '1.25rem',
        border: approval.status === 'pending' ? '1px solid #fde68a' : '1px solid var(--color-neutral-200)',
        boxShadow: approval.status === 'pending' ? '0 4px 20px rgba(245,158,11,0.12)' : '0 4px 16px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)', marginBottom: '0.25rem' }}>
            {TYPE_LABELS[approval.type] ?? approval.type}
          </p>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>{approval.title}</h4>
        </div>
        <span style={{ fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 99, background: priority.bg, color: priority.color, flexShrink: 0 }}>{priority.label}</span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
          From: <strong style={{ color: 'var(--color-neutral-800)' }}>{approval.requesterName}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
          Intern: <strong style={{ color: 'var(--color-neutral-800)' }}>{approval.targetInternName}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Submitted: {approval.dateSubmitted}</p>
      </div>

      {/* Status & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Badge variant={status.variant} dot>{status.label}</Badge>
        <button
          onClick={() => onView(approval)}
          style={{ padding: '0.4rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, border: '1px solid var(--color-primary-200)', borderRadius: '0.5rem', background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', cursor: 'pointer' }}
        >
          {approval.status === 'pending' ? 'Review' : 'View Details'}
        </button>
      </div>
    </motion.div>
  );
};

// ── Detail Drawer ──────────────────────────────────────────────────────────────
const ApprovalDrawer = ({ approval, onClose, onApprove, onReject, actionLoading }) => {
  if (!approval) return null;
  const status = STATUS_CONFIG[approval.status] ?? STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[approval.priority] ?? PRIORITY_CONFIG.medium;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 500, backdropFilter: 'blur(2px)' }} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 500, background: '#fff', zIndex: 501, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.0625rem', color: 'var(--color-neutral-900)' }}>Approval Request</h3>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '0.375rem', border: 'none', background: 'var(--color-neutral-100)', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--color-neutral-500)' }}><RiCloseLine /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <Badge variant={status.variant} dot>{status.label}</Badge>
              <span style={{ fontSize: '0.73rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: 99, background: priority.bg, color: priority.color }}>{priority.label} Priority</span>
              <span style={{ fontSize: '0.73rem', fontWeight: 600, padding: '0.2rem 0.625rem', borderRadius: 99, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }}>{TYPE_LABELS[approval.type]}</span>
            </div>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{approval.title}</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>{approval.description}</p>
          </div>

          <div style={{ background: 'var(--color-neutral-50)', borderRadius: '0.875rem', padding: '1rem' }}>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>Supervisor's Rationale</p>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.6, fontStyle: 'italic' }}>"{approval.rationale}"</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Requested By', value: approval.requesterName },
              { label: 'Role', value: approval.requesterRole },
              { label: 'Intern / Target', value: approval.targetInternName },
              { label: 'Date Submitted', value: approval.dateSubmitted },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-neutral-400)' }}>{label}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{value}</p>
              </div>
            ))}
          </div>

          {approval.reviewedBy && (
            <div style={{ background: approval.status === 'approved' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${approval.status === 'approved' ? '#bbf7d0' : '#fecaca'}`, borderRadius: '0.875rem', padding: '0.875rem 1rem' }}>
              <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: approval.status === 'approved' ? '#059669' : '#dc2626' }}>
                {approval.status === 'approved' ? '✅ Approved' : '❌ Rejected'} by {approval.reviewedBy} on {approval.reviewedAt}
              </p>
              {approval.reviewerComment && (
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.5, fontStyle: 'italic' }}>"{approval.reviewerComment}"</p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {approval.status === 'pending' && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => onReject(approval)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              ❌ Reject
            </button>
            <button
              onClick={() => onApprove(approval)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '0.625rem', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              ✅ Approve
            </button>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ApprovalsPage = () => {
  const { approvals, filters, loading, errors, fetchApprovals, setFilter, approveRequest, rejectRequest, setSelectedApproval, selectedApproval } = useDepartmentStore();
  const [search, setSearch] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject'
  const [modalApproval, setModalApproval] = useState(null);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const handleFilter = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchApprovals(), 0);
  };

  const filtered = approvals.filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.requesterName.toLowerCase().includes(q) || a.targetInternName.toLowerCase().includes(q);
  });

  const pending  = filtered.filter(a => a.status === 'pending');
  const resolved = filtered.filter(a => a.status !== 'pending');

  const handleAction = async (id, comment, action) => {
    try {
      if (action === 'approve') {
        await approveRequest(id, comment);
        toast.success('Request approved successfully.');
      } else {
        await rejectRequest(id, comment);
        toast.success('Request rejected.');
      }
      setSelectedApproval(null);
    } catch {
      toast.error('Action failed. Please try again.');
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>
          Decision Center
        </span>
        <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Department Approvals</h2>
        <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
          {pending.length > 0 ? (
            <><strong style={{ color: '#fcd34d' }}>{pending.length} requests</strong> pending your decision.</>
          ) : 'All caught up — no pending approvals.'}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total', value: approvals.length, color: '#7c3aed' },
          { label: 'Pending', value: approvals.filter(a => a.status === 'pending').length, color: '#f59e0b' },
          { label: 'Approved', value: approvals.filter(a => a.status === 'approved').length, color: '#10b981' },
          { label: 'Rejected', value: approvals.filter(a => a.status === 'rejected').length, color: '#dc2626' },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color }}>{value}</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search requests…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" style={{ paddingLeft: '2.25rem', height: '38px', width: '100%' }} />
        </div>
        <select value={filters.approvalStatus} onChange={(e) => handleFilter('approvalStatus', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filters.approvalType} onChange={(e) => handleFilter('approvalType', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filters.approvalPriority} onChange={(e) => handleFilter('approvalPriority', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading.approvals ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 180, background: '#e2e8f0', borderRadius: '1rem', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : errors.approvals ? (
        <EmptyState icon={<RiCheckboxCircleLine />} title="Failed to load approvals" description={errors.approvals} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<RiCheckboxCircleLine />} title="No requests found" description="No approval requests match your filters." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {pending.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                Pending Requests ({pending.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {pending.map(a => <ApprovalCard key={a.id} approval={a} onView={setSelectedApproval} />)}
              </div>
            </div>
          )}
          {resolved.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} />
                Resolved Requests ({resolved.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {resolved.map(a => <ApprovalCard key={a.id} approval={a} onView={setSelectedApproval} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <ApprovalDrawer
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        actionLoading={loading.action}
        onApprove={(a) => { setModalApproval(a); setModalAction('approve'); setSelectedApproval(null); }}
        onReject={(a) => { setModalApproval(a); setModalAction('reject'); setSelectedApproval(null); }}
      />

      <ReviewModal
        approval={modalApproval}
        action={modalAction}
        onClose={() => { setModalApproval(null); setModalAction(null); }}
        onSubmit={handleAction}
        loading={loading.action}
      />

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
};

export default ApprovalsPage;
