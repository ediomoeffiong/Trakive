/**
 * @file CreateProjectDrawer.jsx
 * @description Multi-step supervisor drawer for creating and assigning a project.
 */
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiArrowLeftLine, RiArrowRightLine, RiAddLine, RiDeleteBinLine, RiCheckLine } from 'react-icons/ri';
import { Drawer, Button } from '../ui';
import { projectService } from '../../services/projectService';
import api from '../../services/api';

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

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
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.4rem' };
const fieldStyle = { display: 'flex', flexDirection: 'column' };

const STEPS = ['Details', 'Assign Interns', 'Milestones', 'Review'];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.72rem', fontWeight: 700,
            background: i < current ? 'var(--color-success-500)' : i === current ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
            color: i <= current ? '#fff' : 'var(--color-neutral-500)',
          }}>
            {i < current ? <RiCheckLine /> : i + 1}
          </div>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: i === current ? 'var(--color-primary-600)' : 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
            {label}
          </span>
          {i < STEPS.length - 1 && <div style={{ flex: 1, height: '1px', background: i < current ? 'var(--color-success-500)' : 'var(--color-neutral-200)' }} />}
        </div>
      ))}
    </div>
  );
}

export function CreateProjectDrawer({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [interns, setInterns] = useState([]);
  const [selectedInterns, setSelectedInterns] = useState([]);

  const [details, setDetails] = useState({ title: '', description: '', priority: 'medium', start_date: '', due_date: '', notes: '' });
  const [milestones, setMilestones] = useState([{ title: '', due_date: '' }]);

  useEffect(() => {
    if (isOpen) {
      api.get('/interns', { params: { limit: 100, status: 'active' } })
        .then((r) => setInterns(r.data?.data || []))
        .catch(() => {});
    }
  }, [isOpen]);

  const setDetail = (field) => (e) => setDetails((d) => ({ ...d, [field]: e.target.value }));
  const addMilestone = () => setMilestones((m) => [...m, { title: '', due_date: '' }]);
  const removeMilestone = (i) => setMilestones((m) => m.filter((_, idx) => idx !== i));
  const setMilestone = (i, field) => (e) =>
    setMilestones((m) => m.map((item, idx) => idx === i ? { ...item, [field]: e.target.value } : item));
  const toggleIntern = (id) =>
    setSelectedInterns((sel) => sel.includes(id) ? sel.filter((s) => s !== id) : [...sel, id]);

  const canNext = () => {
    if (step === 0) return details.title.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (step === 0) {
      if (!details.title.trim()) return toast.error('Project title is required');
      const missing = [];
      if (!details.start_date) missing.push('Start Date');
      if (!details.due_date) missing.push('Due Date');
      if (missing.length > 0) {
        return toast.error(`Please select a date for the following missing section(s): ${missing.join(', ')}`);
      }
      if (details.start_date > details.due_date) {
        return toast.error('Due Date cannot be before Start Date');
      }
    } else if (step === 2) {
      const missingMilestoneDates = [];
      milestones.forEach((m, idx) => {
        if (m.title.trim() && !m.due_date) {
          missingMilestoneDates.push(`Milestone ${idx + 1} ("${m.title.trim()}") Due Date`);
        }
      });
      if (missingMilestoneDates.length > 0) {
        return toast.error(`Please select a date for the following missing section(s): ${missingMilestoneDates.join(', ')}`);
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!details.title.trim()) return toast.error('Project title is required');
    const missing = [];
    if (!details.start_date) missing.push('Start Date');
    if (!details.due_date) missing.push('Due Date');
    milestones.forEach((m, idx) => {
      if (m.title.trim() && !m.due_date) {
        missing.push(`Milestone ${idx + 1} ("${m.title.trim()}") Due Date`);
      }
    });
    if (missing.length > 0) {
      return toast.error(`Please select a date for the following missing section(s): ${missing.join(', ')}`);
    }

    setLoading(true);
    try {
      await projectService.createProject({
        ...details,
        intern_ids: selectedInterns,
        milestones: milestones.filter((m) => m.title.trim()),
      });
      toast.success('Project created and interns notified!');
      onSuccess?.();
      handleClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setDetails({ title: '', description: '', priority: 'medium', start_date: '', due_date: '', notes: '' });
    setMilestones([{ title: '', due_date: '' }]);
    setSelectedInterns([]);
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} title="Create Project" width="520px">
      <div style={{ padding: '0.5rem 0' }}>
        <StepIndicator current={step} />

        {/* Step 0: Details */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Title <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
              <input style={inputStyle} placeholder="Project name" value={details.title} onChange={setDetail('title')} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Project brief..." value={details.description} onChange={setDetail('description')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Priority</label>
                <select style={inputStyle} value={details.priority} onChange={setDetail('priority')}>
                  {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Start Date <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
                <input style={inputStyle} type="date" value={details.start_date} onChange={setDetail('start_date')} />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Due Date <span style={{ color: 'var(--color-danger-500)' }}>*</span></label>
                <input style={inputStyle} type="date" value={details.due_date} onChange={setDetail('due_date')} />
              </div>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Additional notes..." value={details.notes} onChange={setDetail('notes')} />
            </div>
          </div>
        )}

        {/* Step 1: Assign Interns */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-500)', marginBottom: '0.75rem' }}>
              Select one or more interns to assign to this project. They will be notified.
            </p>
            {interns.length === 0 ? (
              <p style={{ color: 'var(--color-neutral-400)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
                No active interns found.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px', overflowY: 'auto' }}>
                {interns.map((intern) => {
                  const name = `${intern.first_name || ''} ${intern.last_name || ''}`.trim() || intern.email;
                  const selected = selectedInterns.includes(intern.id);
                  return (
                    <div
                      key={intern.id}
                      onClick={() => toggleIntern(intern.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem',
                        border: `1.5px solid ${selected ? 'var(--color-primary-400)' : 'var(--color-neutral-200)'}`,
                        borderRadius: '0.6rem', cursor: 'pointer',
                        background: selected ? 'var(--color-primary-50)' : 'var(--color-neutral-0, #fff)',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: selected ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
                        color: selected ? '#fff' : 'var(--color-neutral-500)',
                        fontSize: '0.75rem', fontWeight: 700,
                      }}>
                        {selected ? <RiCheckLine /> : name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-neutral-900)' }}>{name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{intern.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Milestones */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-500)', margin: 0 }}>
                Define key milestones for this project.
              </p>
              <button type="button" onClick={addMilestone} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.78rem', color: 'var(--color-primary-600)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                <RiAddLine /> Add
              </button>
            </div>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder={`Milestone ${i + 1}`} value={m.title} onChange={setMilestone(i, 'title')} />
                <input style={{ ...inputStyle, width: '140px' }} type="date" value={m.due_date} onChange={setMilestone(i, 'due_date')} />
                {milestones.length > 1 && (
                  <button type="button" onClick={() => removeMilestone(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-500)', flexShrink: 0 }}>
                    <RiDeleteBinLine />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.9rem', background: 'var(--color-neutral-50)', borderRadius: '0.6rem' }}>
              <p style={{ fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-neutral-900)' }}>{details.title}</p>
              {details.description && <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-500)', margin: 0 }}>{details.description}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ padding: '0.6rem 0.8rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', margin: '0 0 0.15rem' }}>Priority</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>{details.priority}</p>
              </div>
              <div style={{ padding: '0.6rem 0.8rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', margin: '0 0 0.15rem' }}>Interns Assigned</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{selectedInterns.length}</p>
              </div>
              <div style={{ padding: '0.6rem 0.8rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', margin: '0 0 0.15rem' }}>Start Date</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{details.start_date || '—'}</p>
              </div>
              <div style={{ padding: '0.6rem 0.8rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', margin: '0 0 0.15rem' }}>Due Date</p>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{details.due_date || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-100)' }}>
          <Button variant="ghost" onClick={step === 0 ? handleClose : () => setStep(step - 1)} type="button">
            {step === 0 ? 'Cancel' : <><RiArrowLeftLine style={{ marginRight: '0.3rem' }} /> Back</>}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canNext()} type="button">
              Next <RiArrowRightLine style={{ marginLeft: '0.3rem' }} />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Create Project
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
