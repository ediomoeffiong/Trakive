/**
 * @file SupervisorManagement.jsx
 * @description HR Admin — Supervisor roster with create/edit modal, department assignment, and intern viewer drawer.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  RiSearchLine, RiAddLine, RiEdit2Line, RiCloseLine,
  RiShieldUserLine, RiGroupLine, RiStarLine, RiBuildingLine,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';
import Avatar from '../../components/ui/Avatar';
import { mockDepartments } from '../../data';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ── Create / Edit Supervisor Modal ────────────────────────────────────────────
function SupervisorFormModal({ supervisor, onClose, onSave }) {
  const isEdit = !!supervisor;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: supervisor ? {
      name: supervisor.name,
      email: supervisor.email,
      title: supervisor.title,
      departmentId: supervisor.departmentId,
      phone: supervisor.phone,
      specializations: supervisor.specializations?.join(', '),
      maxCapacity: supervisor.maxCapacity,
    } : {},
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = {
      ...data,
      specializations: data.specializations ? data.specializations.split(',').map(s => s.trim()) : [],
      maxCapacity: parseInt(data.maxCapacity, 10),
      department: mockDepartments.find(d => d.id === data.departmentId)?.name || '',
    };
    await onSave(payload);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 24 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              {isEdit ? 'Edit Supervisor' : 'Add New Supervisor'}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              {isEdit ? 'Update supervisor profile details' : 'Create a new supervisor account'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Full Name *</label>
              <input {...register('name', { required: 'Name is required' })} className="input-field" style={{ width: '100%' }} placeholder="e.g. Dr. Ada Okafor" />
              {errors.name && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.name.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Email *</label>
              <input {...register('email', { required: 'Email is required' })} type="email" className="input-field" style={{ width: '100%' }} placeholder="supervisor@trakive.com" />
              {errors.email && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.email.message}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Title *</label>
              <input {...register('title', { required: true })} className="input-field" style={{ width: '100%' }} placeholder="e.g. Engineering Lead" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Phone</label>
              <input {...register('phone')} className="input-field" style={{ width: '100%' }} placeholder="+234 800 000 0000" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Department *</label>
              <select {...register('departmentId', { required: true })} className="input-field" style={{ width: '100%' }}>
                <option value="">— Select department —</option>
                {mockDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Max Intern Capacity</label>
              <input {...register('maxCapacity')} type="number" min={1} max={20} className="input-field" style={{ width: '100%' }} placeholder="10" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Specializations (comma-separated)</label>
            <input {...register('specializations')} className="input-field" style={{ width: '100%' }} placeholder="React, Node.js, System Design" />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem', borderRadius: '0.625rem', border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff',
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Supervisor'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Supervisor Interns Drawer ─────────────────────────────────────────────────
function SupervisorInternsDrawer({ supervisor, allInterns, onClose }) {
  if (!supervisor) return null;
  const assigned = allInterns.filter(i => i.role === 'Intern' && i.department === supervisor.department);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: '100%', maxWidth: '400px', height: '100%', background: '#fff', overflowY: 'auto', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              {supervisor.name}'s Interns
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              {assigned.length} intern{assigned.length !== 1 ? 's' : ''} · {supervisor.department}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assigned.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-neutral-400)' }}>
              <RiGroupLine style={{ fontSize: '2rem' }} />
              <p style={{ margin: '0.5rem 0 0', fontWeight: 600 }}>No interns assigned</p>
            </div>
          ) : assigned.map(intern => (
            <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)' }}>
              <Avatar name={intern.name} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{intern.name}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{intern.email}</p>
              </div>
              <span style={{
                padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700,
                background: intern.status === 'active' ? '#dcfce7' : '#fee2e2',
                color: intern.status === 'active' ? '#166534' : '#991b1b',
              }}>
                {intern.status}
              </span>
            </div>
          ))}
        </div>
      </motion.aside>
    </motion.div>
  );
}

// ── Supervisor Card ───────────────────────────────────────────────────────────
function SupervisorCard({ supervisor, onEdit, onViewInterns, index }) {
  const dept = mockDepartments.find(d => d.id === supervisor.departmentId);
  const utilization = Math.round((supervisor.internCount / supervisor.maxCapacity) * 100);
  const barColor = utilization > 80 ? '#ef4444' : utilization > 60 ? '#f59e0b' : '#10b981';

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      style={{
        background: '#fff', borderRadius: '1rem', padding: '1.25rem',
        border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: '1rem',
        boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
      }}
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgb(0 0 0 / 0.08)' }}
    >
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Avatar name={supervisor.name} size="md" />
          <div>
            <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{supervisor.name}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{supervisor.title}</p>
          </div>
        </div>
        <span style={{
          padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700,
          background: supervisor.status === 'active' ? '#dcfce7' : '#fee2e2',
          color: supervisor.status === 'active' ? '#166534' : '#991b1b',
        }}>
          {supervisor.status}
        </span>
      </div>

      {/* Department tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: dept?.color || '#6366f1', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{supervisor.department}</span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.625rem', background: 'var(--color-neutral-50)', borderRadius: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{supervisor.internCount}</p>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>Interns</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.625rem', background: 'var(--color-neutral-50)', borderRadius: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{supervisor.rating.toFixed(1)}</p>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>Rating</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '0.625rem', background: 'var(--color-neutral-50)', borderRadius: '0.625rem' }}>
          <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{supervisor.completedCycles}</p>
          <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>Cycles</p>
        </div>
      </div>

      {/* Capacity bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Capacity</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: barColor }}>{utilization}%</span>
        </div>
        <div style={{ height: '6px', borderRadius: '99px', background: 'var(--color-neutral-100)' }}>
          <div style={{ height: '100%', borderRadius: '99px', background: barColor, width: `${utilization}%`, transition: 'width 0.6s ease' }} />
        </div>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
          {supervisor.internCount} / {supervisor.maxCapacity} interns
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.625rem', borderTop: '1px solid var(--color-neutral-100)', paddingTop: '0.875rem' }}>
        <button
          onClick={() => onViewInterns(supervisor)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)', color: 'var(--color-neutral-700)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
        >
          <RiGroupLine /> Interns
        </button>
        <button
          onClick={() => onEdit(supervisor)}
          style={{ flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: '1px solid #bae6fd', background: '#e0f2fe', color: '#0369a1', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
        >
          <RiEdit2Line /> Edit
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const SupervisorManagement = () => {
  const { supervisors, supervisorLoading, supervisorFilters, loadSupervisors, setSupervisorFilters, addSupervisor, editSupervisor, interns, loadInterns } = useHRStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [internsDrawer, setInternsDrawer] = useState(null);

  useEffect(() => { loadSupervisors(); loadInterns(); }, [loadSupervisors, loadInterns]);

  const handleSearch = (e) => {
    setSupervisorFilters({ search: e.target.value });
    loadSupervisors({ search: e.target.value });
  };

  const handleSave = async (data) => {
    if (editTarget) {
      const result = await editSupervisor(editTarget.id, data);
      if (result.success) toast.success('Supervisor updated.');
      else toast.error('Failed to update supervisor.');
    } else {
      const result = await addSupervisor(data);
      if (result.success) toast.success('Supervisor added successfully.');
      else toast.error('Failed to add supervisor.');
    }
    setEditTarget(null);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Supervisor Management</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              {supervisors.length} supervisors across {mockDepartments.length} departments
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.125rem', borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
            }}
          >
            <RiAddLine /> Add Supervisor
          </button>
        </motion.div>

        {/* Search + Filter */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <input
              type="search"
              placeholder="Search supervisors…"
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
              value={supervisorFilters.search}
              onChange={handleSearch}
            />
          </div>
          <select
            className="input-field"
            style={{ flex: '0 1 180px' }}
            value={supervisorFilters.department}
            onChange={(e) => { setSupervisorFilters({ department: e.target.value }); loadSupervisors({ department: e.target.value }); }}
          >
            <option value="">All Departments</option>
            {mockDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
          <select
            className="input-field"
            style={{ flex: '0 1 150px' }}
            value={supervisorFilters.status}
            onChange={(e) => { setSupervisorFilters({ status: e.target.value }); loadSupervisors({ status: e.target.value }); }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </motion.div>

        {/* Cards Grid */}
        {supervisorLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '320px', borderRadius: '1rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : supervisors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)' }}>
            <RiShieldUserLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />
            <p style={{ marginTop: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)' }}>No supervisors found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {supervisors.map((sup, idx) => (
              <SupervisorCard
                key={sup.id}
                supervisor={sup}
                index={idx}
                onEdit={(s) => { setEditTarget(s); setShowForm(true); }}
                onViewInterns={setInternsDrawer}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <SupervisorFormModal
            supervisor={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {internsDrawer && (
          <SupervisorInternsDrawer
            supervisor={internsDrawer}
            allInterns={interns}
            onClose={() => setInternsDrawer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SupervisorManagement;
