/**
 * @file AddWeeklyTaskDrawer.jsx
 * @description Intern drawer to add a task to their weekly plan.
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Drawer, Button } from '../ui';
import { weeklyPlanService } from '../../services/weeklyPlanService';
import { projectService } from '../../services/projectService';

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
];

const inputStyle = {
  width: '100%', padding: '0.6rem 0.75rem',
  border: '1px solid var(--color-neutral-200)', borderRadius: '0.5rem',
  fontSize: '0.875rem', background: 'var(--color-neutral-0, #fff)',
  color: 'var(--color-neutral-900)', outline: 'none', boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600,
  color: 'var(--color-neutral-700)', marginBottom: '0.4rem',
};
const fieldStyle = { display: 'flex', flexDirection: 'column' };

export function AddWeeklyTaskDrawer({ isOpen, onClose, onSuccess, weekStart }) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    project_id: '',
    milestone_id: '',
    priority: 'medium',
    due_date: '',
    notes: '',
  });

  // Fetch active projects for linking
  useEffect(() => {
    if (isOpen) {
      projectService.listProjects({ status: 'active', limit: 100 })
        .then((r) => setProjects(r.data || []))
        .catch(() => {});
    }
  }, [isOpen]);

  // Fetch milestones when project changes
  useEffect(() => {
    if (form.project_id) {
      projectService.getMilestones(form.project_id)
        .then((r) => setMilestones(r.data || []))
        .catch(() => setMilestones([]));
    } else {
      setMilestones([]);
    }
  }, [form.project_id]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      [field]: val,
      ...(field === 'project_id' ? { milestone_id: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Task title is required');
    if (!weekStart) return toast.error('Week start date is missing');

    setLoading(true);
    try {
      await weeklyPlanService.addWeeklyTask(weekStart, {
        title: form.title,
        description: form.description || undefined,
        project_id: form.project_id || undefined,
        milestone_id: form.milestone_id || undefined,
        priority: form.priority,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Task added to your weekly plan');
      onSuccess?.();
      onClose();
      setForm({ title: '', description: '', project_id: '', milestone_id: '', priority: 'medium', due_date: '', notes: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Add Task to Weekly Plan" width="460px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>

        <div style={fieldStyle}>
          <label style={labelStyle}>Task Title <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
          <input style={inputStyle} placeholder="e.g. Write API documentation" value={form.title} onChange={set('title')} required />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Optional details..." value={form.description} onChange={set('description')} />
        </div>

        {/* Link to project */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Link to Project (optional)</label>
          <select style={inputStyle} value={form.project_id} onChange={set('project_id')}>
            <option value="">— No project —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Milestone (conditional) */}
        {form.project_id && milestones.length > 0 && (
          <div style={fieldStyle}>
            <label style={labelStyle}>Link to Milestone (optional)</label>
            <select style={inputStyle} value={form.milestone_id} onChange={set('milestone_id')}>
              <option value="">— No milestone —</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={set('priority')}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Due Date</label>
            <input style={inputStyle} type="date" value={form.due_date} onChange={set('due_date')} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Notes</label>
          <input style={inputStyle} placeholder="Any extra notes..." value={form.notes} onChange={set('notes')} />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-neutral-100)' }}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading}>Add Task</Button>
        </div>
      </form>
    </Drawer>
  );
}
