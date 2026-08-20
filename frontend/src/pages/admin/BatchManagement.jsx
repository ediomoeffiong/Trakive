/**
 * @file BatchManagement.jsx
 * @description HR Admin — Internship batch management with create batch modal and intern assignment drawer.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiCloseLine, RiFoldersLine, RiGroupLine,
  RiCalendarLine, RiCheckLine,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }) };

const STATUS_STYLES = {
  active:    { bg: '#dcfce7', color: '#166534', dot: '#16a34a', label: 'Active' },
  upcoming:  { bg: '#fef9c3', color: '#854d0e', dot: '#ca8a04', label: 'Upcoming' },
  completed: { bg: '#f3f4f6', color: '#374151', dot: '#6b7280', label: 'Completed' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Create Batch Modal ────────────────────────────────────────────────────────
function CreateBatchModal({ onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: '', description: '', startDate: '', endDate: '' },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    await onSave(data);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 24 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Create Internship Batch</h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>Define a new cohort for intern assignment</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Batch Name *</label>
            <input {...register('name', { required: 'Batch name is required' })} className="input-field" style={{ width: '100%' }} placeholder="e.g. Batch 2026-B5" />
            {errors.name && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Description</label>
            <textarea {...register('description')} className="input-field" rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Describe this batch's focus and scope…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Start Date *</label>
              <input {...register('startDate', { required: 'Start date is required' })} type="date" className="input-field" style={{ width: '100%' }} />
              {errors.startDate && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.startDate.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>End Date *</label>
              <input {...register('endDate', { required: 'End date is required' })} type="date" className="input-field" style={{ width: '100%' }} />
              {errors.endDate && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.endDate.message}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem', borderRadius: '0.625rem', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', color: '#fff',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating…' : 'Create Batch'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Assign Interns Drawer ─────────────────────────────────────────────────────
function AssignInternsDrawer({ batch, interns, onClose, onAssign }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const unassignedInterns = interns.filter(i => !i.batchId);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssign = async () => {
    if (!selected.length) return;
    setLoading(true);
    await onAssign(batch.id, selected);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 440 }} animate={{ x: 0 }} exit={{ x: 440 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: '100%', maxWidth: '440px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--color-neutral-100)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Assign Interns</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                to {batch?.name} · {selected.length} selected
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
              <RiCloseLine />
            </button>
          </div>
        </div>

        {/* Intern list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {unassignedInterns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-neutral-400)' }}>
              <RiGroupLine style={{ fontSize: '2rem' }} />
              <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>All interns are already assigned to batches</p>
            </div>
          ) : unassignedInterns.map(intern => {
            const isSelected = selected.includes(intern.id);
            return (
              <div
                key={intern.id}
                onClick={() => toggleSelect(intern.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer',
                  border: `2px solid ${isSelected ? '#6366f1' : 'var(--color-neutral-200)'}`,
                  background: isSelected ? '#eef2ff' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? '#6366f1' : 'var(--color-neutral-300)'}`,
                  background: isSelected ? '#6366f1' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <RiCheckLine style={{ color: '#fff', fontSize: '0.75rem' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{intern.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{intern.department} · {intern.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1, padding: '0.625rem' }}>Cancel</button>
          <button
            onClick={handleAssign}
            disabled={loading || !selected.length}
            style={{
              flex: 2, padding: '0.625rem', borderRadius: '0.75rem', border: 'none',
              background: selected.length ? 'linear-gradient(135deg, #6366f1, #0ea5e9)' : 'var(--color-neutral-200)',
              color: selected.length ? '#fff' : 'var(--color-neutral-400)',
              fontWeight: 700, cursor: selected.length && !loading ? 'pointer' : 'not-allowed',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Assigning…' : `Assign ${selected.length} Intern${selected.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

// ── Batch Card ────────────────────────────────────────────────────────────────
function BatchCard({ batch, onAssignInterns, index }) {
  const ss = STATUS_STYLES[batch.status] || STATUS_STYLES.upcoming;
  const durationDays = batch.startDate && batch.endDate
    ? Math.round((new Date(batch.endDate) - new Date(batch.startDate)) / 86400000)
    : null;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgb(0 0 0 / 0.09)' }}
      style={{
        background: '#fff', borderRadius: '1rem', padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            width: '40px', height: '40px', borderRadius: '0.625rem',
            background: `${batch.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RiFoldersLine style={{ fontSize: '1.25rem', color: batch.color }} />
          </span>
          <div>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{batch.name}</p>
            {batch.description && <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{batch.description}</p>}
          </div>
        </div>
        <span style={{ padding: '0.2rem 0.625rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700, background: ss.bg, color: ss.color, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ss.dot }} />
          {ss.label}
        </span>
      </div>

      {/* Date range */}
      {batch.startDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
          <RiCalendarLine style={{ fontSize: '1rem', color: 'var(--color-neutral-400)' }} />
          {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
          {durationDays && <span style={{ color: 'var(--color-neutral-400)' }}>({durationDays} days)</span>}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
        {[
          { label: 'Interns', value: batch.totalInterns },
          { label: 'Supervisors', value: batch.supervisorCount },
          { label: 'Completion', value: batch.status === 'completed' ? `${batch.completionRate}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center', padding: '0.5rem', background: 'var(--color-neutral-50)', borderRadius: '0.625rem' }}>
            <p style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{value}</p>
            <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Departments */}
      {batch.departments?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {batch.departments.map(d => (
            <span key={d} style={{ padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 600, background: 'var(--color-neutral-100)', color: 'var(--color-neutral-600)' }}>
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {batch.status !== 'completed' && (
        <button
          onClick={() => onAssignInterns(batch)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            padding: '0.625rem', borderRadius: '0.75rem', border: '1px solid #c7d2fe',
            background: '#eef2ff', color: '#4338ca', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
          }}
        >
          <RiGroupLine /> Assign Interns
        </button>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const BatchManagement = () => {
  const { batches, batchLoading, batchStatusFilter, loadBatches, setBatchStatusFilter, addBatch, assignInterns, interns, loadInterns } = useHRStore();
  const [showCreate, setShowCreate] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);

  useEffect(() => { loadBatches(); loadInterns(); }, [loadBatches, loadInterns]);

  const handleCreate = async (data) => {
    const result = await addBatch(data);
    if (result.success) toast.success('Batch created successfully.');
    else toast.error('Failed to create batch.');
  };

  const handleAssign = async (batchId, internIds) => {
    const result = await assignInterns(batchId, internIds);
    if (result.success) toast.success(`${result.assignedCount} intern(s) assigned.`);
    else toast.error('Failed to assign interns.');
  };

  const filtered = batchStatusFilter
    ? batches.filter(b => b.status === batchStatusFilter)
    : batches;

  const stats = {
    active: batches.filter(b => b.status === 'active').length,
    upcoming: batches.filter(b => b.status === 'upcoming').length,
    completed: batches.filter(b => b.status === 'completed').length,
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Internship Batches</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              {stats.active} active · {stats.upcoming} upcoming · {stats.completed} completed
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.125rem', borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            }}
          >
            <RiAddLine /> Create Batch
          </button>
        </motion.div>

        {/* Filter tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: '', label: `All (${batches.length})` },
            { key: 'active', label: `Active (${stats.active})` },
            { key: 'upcoming', label: `Upcoming (${stats.upcoming})` },
            { key: 'completed', label: `Completed (${stats.completed})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setBatchStatusFilter(tab.key); loadBatches({ status: tab.key }); }}
              style={{
                padding: '0.45rem 0.875rem', borderRadius: '0.5rem',
                border: `1px solid ${batchStatusFilter === tab.key ? '#10b981' : 'var(--color-neutral-200)'}`,
                background: batchStatusFilter === tab.key ? '#ecfdf5' : 'var(--color-neutral-50)',
                color: batchStatusFilter === tab.key ? '#065f46' : 'var(--color-neutral-600)',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        {batchLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: '300px', borderRadius: '1rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filtered.map((batch, idx) => (
              <BatchCard key={batch.id} batch={batch} index={idx} onAssignInterns={setAssignTarget} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateBatchModal onClose={() => setShowCreate(false)} onSave={handleCreate} />}
      </AnimatePresence>

      <AnimatePresence>
        {assignTarget && (
          <AssignInternsDrawer
            batch={assignTarget}
            interns={interns}
            onClose={() => setAssignTarget(null)}
            onAssign={handleAssign}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default BatchManagement;
