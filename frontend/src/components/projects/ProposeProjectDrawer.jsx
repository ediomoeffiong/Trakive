/**
 * @file ProposeProjectDrawer.jsx
 * @description Intern's drawer to propose a project for supervisor approval.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import { Drawer, Button } from '../ui';
import { projectService } from '../../services/projectService';

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low'    },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High'   },
  { value: 'urgent', label: 'Urgent' },
];

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid var(--color-neutral-200)',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  background: 'var(--color-neutral-0, #fff)',
  color: 'var(--color-neutral-900)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--color-neutral-700)',
  marginBottom: '0.4rem',
};

const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '0' };

export function ProposeProjectDrawer({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    proposed_objectives: '',
    expected_outcome: '',
    priority: 'medium',
    start_date: '',
    due_date: '',
    notes: '',
  });
  const [milestones, setMilestones] = useState([{ title: '', due_date: '' }]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addMilestone = () => setMilestones((m) => [...m, { title: '', due_date: '' }]);
  const removeMilestone = (i) => setMilestones((m) => m.filter((_, idx) => idx !== i));
  const setMilestone = (i, field) => (e) =>
    setMilestones((m) => m.map((item, idx) => (idx === i ? { ...item, [field]: e.target.value } : item)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return toast.error('Project title is required');
    }

    const missingSections = [];

    // Check Start Date
    if (!form.start_date) {
      missingSections.push('Start Date');
    }

    // Check Due Date
    if (!form.due_date) {
      missingSections.push('Due Date');
    }

    // Check Milestones dates for selected/entered milestone sections
    milestones.forEach((m, idx) => {
      if (m.title.trim() && !m.due_date) {
        missingSections.push(`Milestone ${idx + 1} ("${m.title.trim()}") Due Date`);
      }
    });

    if (missingSections.length > 0) {
      return toast.error(
        `Please select a date for the following missing section(s): ${missingSections.join(', ')}`,
        { duration: 5000 }
      );
    }

    if (form.start_date && form.due_date && form.start_date > form.due_date) {
      return toast.error('Due Date cannot be before Start Date');
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        milestones: milestones.filter((m) => m.title.trim()),
      };
      await projectService.proposeProject(payload);
      toast.success('Project proposal submitted for supervisor review!');
      onSuccess?.();
      onClose();
      // Reset
      setForm({
        title: '',
        description: '',
        proposed_objectives: '',
        expected_outcome: '',
        priority: 'medium',
        start_date: '',
        due_date: '',
        notes: '',
      });
      setMilestones([{ title: '', due_date: '' }]);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Propose a Project" width="480px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '1rem 0' }}>

        {/* Title */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Project Title <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
          <input style={inputStyle} placeholder="e.g. Inventory Management System" value={form.title} onChange={set('title')} required />
        </div>

        {/* Description */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} placeholder="Brief description of the project..." value={form.description} onChange={set('description')} />
        </div>

        {/* Objectives */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Proposed Objectives</label>
          <textarea style={{ ...inputStyle, minHeight: '75px', resize: 'vertical' }} placeholder="What do you aim to achieve?" value={form.proposed_objectives} onChange={set('proposed_objectives')} />
        </div>

        {/* Expected Outcome */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Expected Outcome</label>
          <textarea style={{ ...inputStyle, minHeight: '75px', resize: 'vertical' }} placeholder="Describe the expected deliverables..." value={form.expected_outcome} onChange={set('expected_outcome')} />
        </div>

        {/* Priority + Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Priority</label>
            <select style={inputStyle} value={form.priority} onChange={set('priority')}>
              {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Start Date <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
            <input style={inputStyle} type="date" value={form.start_date} onChange={set('start_date')} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Due Date <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
            <input style={inputStyle} type="date" value={form.due_date} onChange={set('due_date')} />
          </div>
        </div>

        {/* Milestones */}
        <div style={fieldStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Milestones</label>
            <button type="button" onClick={addMilestone} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--color-primary-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              <RiAddLine /> Add
            </button>
          </div>
          {milestones.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
              <input style={{ ...inputStyle, flex: 1 }} placeholder={`Milestone ${i + 1} title`} value={m.title} onChange={setMilestone(i, 'title')} />
              <input style={{ ...inputStyle, width: '140px' }} type="date" value={m.due_date} onChange={setMilestone(i, 'due_date')} title="Milestone due date" />
              {milestones.length > 1 && (
                <button type="button" onClick={() => removeMilestone(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-500)', fontSize: '1rem', flexShrink: 0 }}>
                  <RiDeleteBinLine />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Additional Notes</label>
          <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Any extra context for your supervisor..." value={form.notes} onChange={set('notes')} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--color-neutral-100)' }}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading}>Submit Proposal</Button>
        </div>
      </form>
    </Drawer>
  );
}
