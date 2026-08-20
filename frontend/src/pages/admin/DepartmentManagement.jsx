/**
 * @file DepartmentManagement.jsx
 * @description HR Admin — Department overview cards, details drawer, create/edit modal.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiEdit2Line, RiCloseLine, RiBuildingLine,
  RiGroupLine, RiShieldUserLine, RiUser3Line,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';
import Avatar from '../../components/ui/Avatar';
import { mockSupervisors } from '../../data';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }) };

// ── Department Form Modal ─────────────────────────────────────────────────────
function DepartmentFormModal({ department, onClose, onSave }) {
  const isEdit = !!department;
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: department ? {
      name: department.name,
      description: department.description,
      leadId: department.leadId || '',
      capacity: department.capacity,
      color: department.color,
    } : { color: '#6366f1', capacity: 20 },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    const lead = mockSupervisors.find(s => s.id === data.leadId);
    const payload = {
      ...data,
      capacity: parseInt(data.capacity, 10),
      leadName: lead?.name || 'Vacant',
      leadTitle: lead?.title || '—',
    };
    await onSave(payload);
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
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {isEdit ? 'Edit Department' : 'Create Department'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Department Name *</label>
            <input {...register('name', { required: 'Name is required' })} className="input-field" style={{ width: '100%' }} placeholder="e.g. Engineering" />
            {errors.name && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.name.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Description</label>
            <textarea {...register('description')} className="input-field" rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Brief description of department responsibilities..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Department Lead</label>
              <select {...register('leadId')} className="input-field" style={{ width: '100%' }}>
                <option value="">— No lead assigned —</option>
                {mockSupervisors.filter(s => s.status === 'active').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Intern Capacity</label>
              <input {...register('capacity')} type="number" min={1} max={100} className="input-field" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Brand Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input {...register('color')} type="color" style={{ width: '48px', height: '38px', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', cursor: 'pointer' }} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>Used for department badge and charts</span>
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
              {loading ? 'Saving…' : isEdit ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Department Details Drawer ─────────────────────────────────────────────────
function DepartmentDetailsDrawer({ dept, onClose, onEdit }) {
  if (!dept) return null;
  const utilization = Math.round((dept.internCount / dept.capacity) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150, display: 'flex', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ width: '100%', maxWidth: '420px', height: '100%', background: '#fff', overflowY: 'auto', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span style={{ width: '44px', height: '44px', borderRadius: '0.75rem', background: `${dept.color}20`, border: `2px solid ${dept.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RiBuildingLine style={{ fontSize: '1.375rem', color: dept.color }} />
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{dept.name}</h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                Est. {new Date(dept.createdAt).getFullYear()}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        {dept.description && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{dept.description}</p>
        )}

        <div style={{ height: '1px', background: 'var(--color-neutral-100)' }} />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Interns', value: dept.internCount, icon: RiGroupLine, color: '#6366f1' },
            { label: 'Supervisors', value: dept.supervisorCount, icon: RiShieldUserLine, color: '#0ea5e9' },
            { label: 'Capacity', value: dept.capacity, icon: RiBuildingLine, color: '#f59e0b' },
            { label: 'Completion', value: `${dept.completionRate}%`, icon: RiGroupLine, color: '#10b981' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ padding: '0.875rem', background: 'var(--color-neutral-50)', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <Icon style={{ fontSize: '0.875rem', color }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
              </div>
              <p style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>Utilization</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: utilization > 80 ? '#ef4444' : '#10b981' }}>{utilization}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '99px', background: 'var(--color-neutral-100)' }}>
            <div style={{ height: '100%', borderRadius: '99px', background: dept.color, width: `${Math.min(utilization, 100)}%`, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--color-neutral-100)' }} />

        {/* Department Lead */}
        <div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department Lead</p>
          {dept.leadId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem', background: 'var(--color-neutral-50)', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)' }}>
              <Avatar name={dept.leadName} size="md" />
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{dept.leadName}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{dept.leadTitle}</p>
              </div>
            </div>
          ) : (
            <div style={{ padding: '0.875rem', background: '#fffbeb', borderRadius: '0.75rem', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <RiUser3Line style={{ fontSize: '1.25rem', color: '#92400e' }} />
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#92400e' }}>No lead assigned — position vacant</p>
            </div>
          )}
        </div>

        <button
          onClick={() => { onClose(); onEdit(dept); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
            padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #c7d2fe',
            background: '#eef2ff', color: '#4338ca', cursor: 'pointer', fontWeight: 700,
          }}
        >
          <RiEdit2Line /> Edit Department
        </button>
      </motion.aside>
    </motion.div>
  );
}

// ── Department Card ───────────────────────────────────────────────────────────
function DepartmentCard({ dept, onView, onEdit, index }) {
  const utilization = Math.round((dept.internCount / dept.capacity) * 100);

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgb(0 0 0 / 0.09)' }}
      style={{
        background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)',
        overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onClick={() => onView(dept)}
    >
      {/* Color top bar */}
      <div style={{ height: '4px', background: dept.color }} />

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '40px', height: '40px', borderRadius: '0.625rem', background: `${dept.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RiBuildingLine style={{ fontSize: '1.25rem', color: dept.color }} />
            </span>
            <div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{dept.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
                Active since {new Date(dept.createdAt).getFullYear()}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(dept); }}
            style={{ padding: '0.35rem', borderRadius: '0.5rem', border: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)', color: 'var(--color-neutral-500)', cursor: 'pointer' }}
          >
            <RiEdit2Line style={{ fontSize: '0.875rem' }} />
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
          {[
            { label: 'Interns', value: dept.internCount, icon: RiGroupLine },
            { label: 'Supervisors', value: dept.supervisorCount, icon: RiShieldUserLine },
            { label: 'Rate', value: `${dept.completionRate}%`, icon: RiBuildingLine },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center', padding: '0.5rem 0.25rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{value}</p>
              <p style={{ margin: 0, fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Capacity bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Capacity</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: dept.color }}>{utilization}%</span>
          </div>
          <div style={{ height: '5px', borderRadius: '99px', background: 'var(--color-neutral-100)' }}>
            <div style={{ height: '100%', borderRadius: '99px', background: dept.color, width: `${Math.min(utilization, 100)}%` }} />
          </div>
        </div>

        {/* Lead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid var(--color-neutral-100)' }}>
          <RiUser3Line style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)' }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
            {dept.leadId ? <strong>{dept.leadName}</strong> : <span style={{ color: '#92400e' }}>No lead assigned</span>}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const DepartmentManagement = () => {
  const { departments, departmentLoading, loadDepartments, addDepartment, editDepartment } = useHRStore();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const handleSave = async (data) => {
    if (editTarget) {
      const result = await editDepartment(editTarget.id, data);
      if (result.success) toast.success('Department updated.');
      else toast.error('Failed to update department.');
    } else {
      const result = await addDepartment(data);
      if (result.success) toast.success('Department created.');
      else toast.error('Failed to create department.');
    }
    setEditTarget(null);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Department Management</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              {departments.length} departments · manage leads, capacity, and statistics
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.125rem', borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            <RiAddLine /> New Department
          </button>
        </motion.div>

        {/* Grid */}
        {departmentLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {[...Array(8)].map((_, i) => <div key={i} style={{ height: '280px', borderRadius: '1rem', background: 'var(--color-neutral-100)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {departments.map((dept, idx) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                index={idx}
                onView={setViewTarget}
                onEdit={(d) => { setEditTarget(d); setShowForm(true); }}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <DepartmentFormModal
            department={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewTarget && (
          <DepartmentDetailsDrawer
            dept={viewTarget}
            onClose={() => setViewTarget(null)}
            onEdit={(d) => { setViewTarget(null); setEditTarget(d); setShowForm(true); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DepartmentManagement;
