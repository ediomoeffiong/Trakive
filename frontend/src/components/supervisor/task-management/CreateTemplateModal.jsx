import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RiCloseLine, RiLayoutGridLine } from 'react-icons/ri';
import { TASK_CATEGORIES } from '../../../data/taskCategories';
import { STANDARD_DEPARTMENTS } from '../../../utils/departments';

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.75rem',
  border: '1px solid var(--color-neutral-200)',
  background: '#fff',
  fontSize: '0.875rem',
  color: 'var(--color-neutral-800)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>{label}</label>
    {children}
    {error && <p style={{ margin: 0, color: '#dc2626', fontSize: '0.75rem' }}>{error}</p>}
  </div>
);

const CreateTemplateModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: 'Engineering',
      department: 'All Departments',
      defaultPriority: 'medium',
      submissionRequirements: '',
      objectives: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        description: '',
        category: 'Engineering',
        department: 'All Departments',
        defaultPriority: 'medium',
        submissionRequirements: '',
        objectives: '',
      });
    }
  }, [isOpen, reset]);

  const submit = async (data) => {
    try {
      const objectivesList = data.objectives
        ? data.objectives
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];
      await onSubmit({
        name: data.name,
        description: data.description,
        category: data.category,
        department: data.department,
        defaultPriority: data.defaultPriority,
        submissionRequirements: data.submissionRequirements,
        objectives: objectivesList,
        learningObjectives: objectivesList,
        rubric: [],
        tags: [],
      });
      toast.success('Template created.');
      onClose();
    } catch {
      toast.error('Failed to create template.');
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(680px, 95vw)',
              maxHeight: '88vh',
              background: '#fff',
              borderRadius: '1.25rem',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-modal-title"
          >
            <div style={{ padding: '1.25rem 1.5rem', background: '#00b4d8', color: '#fff', display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <RiLayoutGridLine style={{ fontSize: '1.25rem' }} />
                <div>
                  <h2 id="template-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#fff' }}>Create Template</h2>
                  <p style={{ margin: '0.2rem 0 0', color: '#e0f7fc', fontSize: '0.8125rem' }}>Save a reusable task blueprint for future assignments</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close modal" style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.5rem', color: '#fff', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={handleSubmit(submit)} style={{ overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                <Field label="Template Name" error={errors.name?.message}>
                  <input {...register('name', { required: 'Template name is required', minLength: { value: 5, message: 'Minimum 5 characters' } })} style={inputStyle} placeholder="e.g. API Endpoint Documentation" />
                </Field>

                <Field label="Description" error={errors.description?.message}>
                  <textarea {...register('description', { required: 'Description is required' })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What should this template help supervisors assign?" />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <Field label="Category">
                    <select {...register('category')} style={inputStyle}>
                      {TASK_CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Department">
                    <select {...register('department')} style={inputStyle}>
                      <option value="All Departments">All Departments</option>
                      {STANDARD_DEPARTMENTS.map((department) => <option key={department.name} value={department.name}>{department.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Default Priority">
                    <select {...register('defaultPriority')} style={inputStyle}>
                      {['urgent', 'high', 'medium', 'low'].map((priority) => <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label="Objectives & Deliverables">
                  <textarea {...register('objectives')} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="One item per line (e.g. Deliverable 1, Acceptance criterion 2)..." />
                </Field>

                <Field label="Submission Requirements">
                  <textarea {...register('submissionRequirements')} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What should interns submit? (e.g. Pull request link, Figma preview, report)" />
                </Field>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-600)', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: '#00b4d8', color: '#fff', fontWeight: 800, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CreateTemplateModal;
