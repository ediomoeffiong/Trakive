/**
 * @file InternManagement.jsx
 * @description HR Admin — Intern roster management with search, filters, profile drawer,
 * supervisor assignment modal, and status update modal.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  RiSearchLine, RiFilterLine, RiUserLine, RiEdit2Line,
  RiExchangeLine, RiCloseLine, RiGroupLine, RiShieldUserLine,
  RiArrowUpLine, RiArrowDownLine, RiEyeLine,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { mockSupervisors, mockDepartments, mockBatches } from '../../data';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const STATUS_COLORS = {
  active:   { bg: '#dcfce7', color: '#166534' },
  inactive: { bg: '#fee2e2', color: '#991b1b' },
  pending:  { bg: '#fef9c3', color: '#854d0e' },
};

// ── Assign Supervisor Modal ───────────────────────────────────────────────────
function AssignSupervisorModal({ intern, onClose, onAssign }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    await onAssign(intern.id, data.supervisorId);
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
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Assign Supervisor
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              for {intern?.name}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.4rem' }}>
              Select Supervisor
            </label>
            <select
              {...register('supervisorId', { required: true })}
              className="input-field"
              style={{ width: '100%' }}
            >
              <option value="">— Choose supervisor —</option>
              {mockSupervisors.filter(s => s.status === 'active').map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.department} ({s.internCount}/{s.maxCapacity} interns)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
                background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', color: '#fff',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Assigning…' : 'Assign Supervisor'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Status Update Modal ───────────────────────────────────────────────────────
function UpdateStatusModal({ intern, onClose, onUpdate }) {
  const [selected, setSelected] = useState(intern?.status || 'active');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    await onUpdate(intern.id, selected);
    setLoading(false);
    onClose();
  };

  const statuses = [
    { value: 'active',   label: 'Active',   desc: 'Intern is currently active.' },
    { value: 'inactive', label: 'Inactive',  desc: 'Internship ended or suspended.' },
    { value: 'pending',  label: 'Pending',   desc: 'Awaiting onboarding completion.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Update Internship Status
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {statuses.map((s) => (
            <label
              key={s.value}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.875rem', borderRadius: '0.75rem', cursor: 'pointer',
                border: `2px solid ${selected === s.value ? '#6366f1' : 'var(--color-neutral-200)'}`,
                background: selected === s.value ? '#eef2ff' : '#fff',
                transition: 'all 0.15s',
              }}
            >
              <input type="radio" name="status" value={s.value} checked={selected === s.value} onChange={() => setSelected(s.value)} style={{ marginTop: '2px' }} />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{s.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', color: '#fff',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Intern Profile Drawer ─────────────────────────────────────────────────────
function InternProfileDrawer({ intern, onClose, onAssign, onUpdateStatus }) {
  if (!intern) return null;
  const sc = STATUS_COLORS[intern.status] || STATUS_COLORS.pending;
  const supervisor = mockSupervisors.find(s => s.departmentId === `dept-${intern.department?.toLowerCase().replace(/\s/g,'')}`) || null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          width: '100%', maxWidth: '420px', height: '100%', background: '#fff',
          overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <Avatar name={intern.name} size="lg" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{intern.name}</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{intern.email}</p>
              <span style={{
                display: 'inline-block', marginTop: '0.35rem', padding: '0.15rem 0.6rem',
                borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700,
                background: sc.bg, color: sc.color,
              }}>
                {intern.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--color-neutral-100)' }} />

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'Department', value: intern.department },
            { label: 'Email', value: intern.email },
            { label: 'Batch', value: intern.batchId ? mockBatches.find(b => b.id === intern.batchId)?.name || intern.batchId : 'Unassigned' },
            { label: 'Joined', value: intern.joinedAt ? new Date(intern.joinedAt).toLocaleDateString() : '—' },
            { label: 'Last Active', value: intern.lastActive ? new Date(intern.lastActive).toLocaleString() : 'Never' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>{label}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', background: 'var(--color-neutral-100)' }} />

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <button
            onClick={() => onAssign(intern)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #c7d2fe',
              background: '#eef2ff', color: '#4338ca', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            <RiExchangeLine style={{ fontSize: '1.125rem' }} />
            Assign / Reassign Supervisor
          </button>
          <button
            onClick={() => onUpdateStatus(intern)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)',
              background: 'var(--color-neutral-50)', color: 'var(--color-neutral-700)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            <RiEdit2Line style={{ fontSize: '1.125rem' }} />
            Update Internship Status
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const InternManagement = () => {
  const {
    interns, internLoading, internFilters,
    loadInterns, setInternFilters, assignSupervisor, changeInternStatus,
  } = useHRStore();

  const [selectedIntern, setSelectedIntern] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => { loadInterns(); }, [loadInterns]);

  const handleSearch = (e) => {
    setInternFilters({ search: e.target.value });
    loadInterns({ search: e.target.value });
  };

  const handleFilter = (key, val) => {
    setInternFilters({ [key]: val });
    loadInterns({ [key]: val });
  };

  const handleSort = (field) => {
    const dir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDir(dir);
  };

  const sorted = [...interns].sort((a, b) => {
    const va = a[sortField] ?? '';
    const vb = b[sortField] ?? '';
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });

  const handleAssign = async (internId, supervisorId) => {
    const ok = await assignSupervisor(internId, supervisorId);
    if (ok) toast.success('Supervisor assigned successfully.');
    else toast.error('Failed to assign supervisor.');
  };

  const handleStatusUpdate = async (internId, status) => {
    const ok = await changeInternStatus(internId, status);
    if (ok) toast.success('Internship status updated.');
    else toast.error('Failed to update status.');
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <RiArrowUpLine style={{ fontSize: '0.75rem' }} /> : <RiArrowDownLine style={{ fontSize: '0.75rem' }} />;
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Intern Management
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              {interns.length} interns · search, filter and manage assignments
            </p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{
            background: '#fff', borderRadius: '1rem', padding: '1rem',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <input
              type="search"
              placeholder="Search interns by name or email…"
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
              value={internFilters.search}
              onChange={handleSearch}
            />
          </div>

          <select
            className="input-field"
            style={{ flex: '0 1 180px' }}
            value={internFilters.department}
            onChange={(e) => handleFilter('department', e.target.value)}
          >
            <option value="">All Departments</option>
            {mockDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>

          <select
            className="input-field"
            style={{ flex: '0 1 150px' }}
            value={internFilters.status}
            onChange={(e) => handleFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          <select
            className="input-field"
            style={{ flex: '0 1 180px' }}
            value={internFilters.batchId}
            onChange={(e) => handleFilter('batchId', e.target.value)}
          >
            <option value="">All Batches</option>
            {mockBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </motion.div>

        {/* Table */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible"
          style={{
            background: '#fff', borderRadius: '1rem',
            border: '1px solid var(--color-neutral-200)', overflow: 'hidden',
          }}
        >
          {internLoading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: '52px', borderRadius: '0.5rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <RiGroupLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />
              <p style={{ marginTop: '0.75rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>No interns found</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-neutral-100)', background: 'var(--color-neutral-50)' }}>
                    {[
                      { key: 'name', label: 'Intern' },
                      { key: 'department', label: 'Department' },
                      { key: 'status', label: 'Status' },
                      { key: 'batchId', label: 'Batch' },
                      { key: 'lastActive', label: 'Last Active' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        style={{
                          padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem',
                          fontWeight: 700, color: 'var(--color-neutral-500)', letterSpacing: '0.04em',
                          textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
                          userSelect: 'none',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {col.label} <SortIcon field={col.key} />
                        </span>
                      </th>
                    ))}
                    <th style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((intern, idx) => {
                    const sc = STATUS_COLORS[intern.status] || STATUS_COLORS.pending;
                    const batchName = mockBatches.find(b => b.id === intern.batchId)?.name || '—';
                    return (
                      <motion.tr
                        key={intern.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        style={{
                          borderBottom: '1px solid var(--color-neutral-100)',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-neutral-50)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Avatar name={intern.name} size="sm" />
                            <div>
                              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{intern.name}</p>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{intern.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                            background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)',
                          }}>
                            {intern.department}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700,
                            background: sc.bg, color: sc.color,
                          }}>
                            {intern.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                          {batchName}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                          {intern.lastActive ? new Date(intern.lastActive).toLocaleDateString() : 'Never'}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setSelectedIntern(intern)}
                              style={{ padding: '0.35rem 0.7rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                              title="View profile"
                            >
                              <RiEyeLine /> View
                            </button>
                            <button
                              onClick={() => setAssignTarget(intern)}
                              style={{ padding: '0.35rem 0.7rem', borderRadius: '0.5rem', border: '1px solid #c7d2fe', background: '#eef2ff', cursor: 'pointer', color: '#4338ca', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                              title="Assign supervisor"
                            >
                              <RiExchangeLine />
                            </button>
                            <button
                              onClick={() => setStatusTarget(intern)}
                              style={{ padding: '0.35rem 0.7rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: '#f8fafc', cursor: 'pointer', color: 'var(--color-neutral-600)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600 }}
                              title="Update status"
                            >
                              <RiEdit2Line />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals & Drawers */}
      <AnimatePresence>
        {selectedIntern && (
          <InternProfileDrawer
            intern={selectedIntern}
            onClose={() => setSelectedIntern(null)}
            onAssign={(i) => { setSelectedIntern(null); setAssignTarget(i); }}
            onUpdateStatus={(i) => { setSelectedIntern(null); setStatusTarget(i); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignTarget && (
          <AssignSupervisorModal
            intern={assignTarget}
            onClose={() => setAssignTarget(null)}
            onAssign={handleAssign}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusTarget && (
          <UpdateStatusModal
            intern={statusTarget}
            onClose={() => setStatusTarget(null)}
            onUpdate={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InternManagement;
