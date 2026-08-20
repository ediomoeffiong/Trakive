/**
 * @file CreateTaskModal.jsx
 * @description Polished Create/Edit Task modal using React Hook Form.
 * Handles all task fields: title, description, category, priority, department,
 * assign interns, due date, estimated hours, tags, learning objectives, rubric, and attachments.
 */

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiAddLine,
  RiDeleteBin6Line,
  RiFileUploadLine,
  RiInformationLine,
  RiCheckLine,
} from 'react-icons/ri';
import { TASK_CATEGORIES } from '../../../data/taskCategories';
import { TASK_TAGS } from '../../../data/taskTags';
import { mockInternProfiles } from '../../../data/internProfiles';

const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const DEPARTMENTS = [
  'Frontend Engineering', 'Backend Engineering', 'Backend Integration',
  'UX/UI Design', 'QA & Testing', 'Design Systems', 'Program Management', 'All Departments',
];

const FormField = ({ label, required, error, children, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      {label}
      {required && <span style={{ color: '#ef4444' }}>*</span>}
      {hint && (
        <span title={hint} style={{ color: 'var(--color-neutral-400)', cursor: 'help' }}>
          <RiInformationLine style={{ fontSize: '0.875rem' }} />
        </span>
      )}
    </label>
    {children}
    {error && <p style={{ margin: 0, fontSize: '0.75rem', color: '#dc2626' }}>{error}</p>}
  </div>
);

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
  transition: 'border-color 0.15s ease',
};

const focusStyle = { borderColor: '#4f46e5', boxShadow: '0 0 0 3px rgba(79,70,229,0.1)' };

const TagSelector = ({ value = [], onChange }) => {
  const [input, setInput] = useState('');

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Selected tags */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {value.map((tag) => (
            <span
              key={tag}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: '#eef2ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #c7d2fe' }}
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', padding: 0, display: 'flex' }}>
                <RiCloseLine style={{ fontSize: '0.75rem' }} />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(input); } if (e.key === ',') { e.preventDefault(); addTag(input); } }}
          placeholder="Type a tag and press Enter"
          style={{ ...inputStyle, flex: 1 }}
          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
          onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
        />
        <button
          type="button"
          onClick={() => addTag(input)}
          style={{ padding: '0.625rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}
        >
          Add
        </button>
      </div>
      {/* Suggestions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {TASK_TAGS.filter((t) => !value.includes(t.value)).slice(0, 8).map((tag) => (
          <button
            key={tag.value}
            type="button"
            onClick={() => addTag(tag.value)}
            style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', border: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)', fontSize: '0.6875rem', fontWeight: 500, cursor: 'pointer', color: 'var(--color-neutral-600)' }}
          >
            + {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const InternSelector = ({ value = [], onChange, interns = [] }) => {
  const toggleIntern = (intern) => {
    const exists = value.some((i) => i.id === intern.id);
    onChange(exists ? value.filter((i) => i.id !== intern.id) : [...value, { id: intern.id, name: intern.name, initials: intern.initials || intern.name.split(' ').map((n) => n[0]).join('').toUpperCase() }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.75rem',
          background: '#fff',
        }}
      >
        {interns.map((intern, i) => {
          const isSelected = value.some((v) => v.id === intern.id);
          return (
            <div
              key={intern.id}
              onClick={() => toggleIntern(intern)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                cursor: 'pointer',
                background: isSelected ? '#f5f3ff' : 'transparent',
                borderBottom: i < interns.length - 1 ? '1px solid var(--color-neutral-100)' : 'none',
                transition: 'background 0.1s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {intern.initials || intern.name?.split(' ').map((n) => n[0]).join('') || '??'}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>{intern.name}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{intern.department || intern.role || 'Intern'}</p>
                </div>
              </div>
              {isSelected && <RiCheckLine style={{ color: '#4f46e5', fontSize: '1rem' }} />}
            </div>
          );
        })}
      </div>
      {value.length > 0 && (
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600 }}>
          {value.length} intern(s) selected
        </p>
      )}
    </div>
  );
};

const CreateTaskModal = ({ isOpen, onClose, editingTask, onSubmit, isLoading }) => {
  const [activeSection, setActiveSection] = useState('basic');

  const interns = mockInternProfiles || [];

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      category: 'Engineering',
      priority: 'medium',
      department: 'Frontend Engineering',
      assignedInterns: [],
      estimatedHours: 8,
      dueDate: '',
      tags: [],
      learningObjectives: [''],
      submissionRequirements: '',
      rubric: [{ criterion: '', maxScore: 10, description: '' }],
      status: 'assigned',
    },
  });

  const { fields: objectiveFields, append: addObjective, remove: removeObjective } = useFieldArray({ control, name: 'learningObjectives' });
  const { fields: rubricFields, append: addRubric, remove: removeRubric } = useFieldArray({ control, name: 'rubric' });

  useEffect(() => {
    if (editingTask) {
      reset({
        ...editingTask,
        learningObjectives: editingTask.learningObjectives?.map((o) => o) || [''],
        rubric: editingTask.rubric?.length ? editingTask.rubric : [{ criterion: '', maxScore: 10, description: '' }],
      });
    } else {
      reset({
        title: '', description: '', instructions: '', category: 'Engineering', priority: 'medium',
        department: 'Frontend Engineering', assignedInterns: [], estimatedHours: 8, dueDate: '',
        tags: [], learningObjectives: [''], submissionRequirements: '', rubric: [{ criterion: '', maxScore: 10, description: '' }], status: 'assigned',
      });
    }
  }, [editingTask, reset, isOpen]);

  const onFormSubmit = async (data) => {
    try {
      await onSubmit({ ...data, learningObjectives: data.learningObjectives.filter(Boolean) });
      toast.success(editingTask ? 'Task updated successfully!' : 'Task created successfully!');
      onClose();
    } catch {
      toast.error('Failed to save task. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    const data = watch();
    try {
      await onSubmit({ ...data, status: 'draft', learningObjectives: data.learningObjectives?.filter(Boolean) || [] });
      toast.success('Task saved as draft.');
      onClose();
    } catch {
      toast.error('Failed to save draft.');
    }
  };

  const SECTIONS = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'assignment', label: 'Assignment' },
    { id: 'objectives', label: 'Objectives' },
    { id: 'rubric', label: 'Rubric' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 201,
              width: 'min(700px, 95vw)',
              maxHeight: '90vh',
              background: '#fff',
              borderRadius: '1.25rem',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-neutral-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
                background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)',
                color: '#fff',
              }}
            >
              <div>
                <h2 id="task-modal-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800 }}>
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#c7d2fe' }}>
                  {editingTask ? 'Update task details and assignment' : 'Define a new task and assign it to interns'}
                </p>
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.125rem' }} aria-label="Close modal">
                <RiCloseLine />
              </button>
            </div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-neutral-200)', flexShrink: 0, overflowX: 'auto' }}>
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeSection === sec.id ? '2px solid #4f46e5' : '2px solid transparent',
                    color: activeSection === sec.id ? '#4f46e5' : 'var(--color-neutral-500)',
                    fontWeight: activeSection === sec.id ? 700 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit(onFormSubmit)} style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* ── Basic Info section ─────────────────────────────────── */}
                {activeSection === 'basic' && (
                  <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <FormField label="Task Title" required error={errors.title?.message}>
                      <input
                        {...register('title', { required: 'Task title is required', minLength: { value: 5, message: 'Minimum 5 characters' } })}
                        placeholder="e.g. Build User Authentication UI"
                        style={{ ...inputStyle }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </FormField>

                    <FormField label="Description" required error={errors.description?.message}>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={3}
                        placeholder="Provide a clear overview of what this task entails..."
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </FormField>

                    <FormField label="Instructions" hint="Step-by-step instructions for the intern">
                      <textarea
                        {...register('instructions')}
                        rows={4}
                        placeholder="1. Step one&#10;2. Step two&#10;3. Step three..."
                        style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </FormField>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <FormField label="Category" required>
                        <select {...register('category', { required: true })} style={{ ...inputStyle }}>
                          {TASK_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </FormField>

                      <FormField label="Priority" required>
                        <select {...register('priority', { required: true })} style={{ ...inputStyle }}>
                          {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                        </select>
                      </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <FormField label="Department" required>
                        <select {...register('department', { required: true })} style={{ ...inputStyle }}>
                          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </FormField>

                      <FormField label="Due Date" required error={errors.dueDate?.message}>
                        <input
                          type="date"
                          {...register('dueDate', { required: 'Due date is required' })}
                          style={{ ...inputStyle }}
                          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <FormField label="Estimated Hours" hint="Expected time to complete this task">
                        <input
                          type="number"
                          min={1}
                          max={200}
                          {...register('estimatedHours', { min: 1, max: 200 })}
                          style={{ ...inputStyle }}
                          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                        />
                      </FormField>

                      <FormField label="Status">
                        <select {...register('status')} style={{ ...inputStyle }}>
                          <option value="draft">Draft</option>
                          <option value="assigned">Publish & Assign</option>
                        </select>
                      </FormField>
                    </div>

                    <FormField label="Tags" hint="Press Enter or comma to add a tag">
                      <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => <TagSelector value={field.value} onChange={field.onChange} />}
                      />
                    </FormField>

                    <FormField label="Submission Requirements">
                      <textarea
                        {...register('submissionRequirements')}
                        rows={2}
                        placeholder="e.g. Submit a GitHub PR link, screenshots, and a Loom walkthrough..."
                        style={{ ...inputStyle, resize: 'vertical' }}
                        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </FormField>

                    {/* File attachments placeholder */}
                    <FormField label="Attachments" hint="Attach reference files (UI only)">
                      <div
                        style={{
                          border: '2px dashed var(--color-neutral-200)',
                          borderRadius: '0.875rem',
                          padding: '1.5rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          color: 'var(--color-neutral-400)',
                          transition: 'border-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#faf5ff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-neutral-200)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <RiFileUploadLine style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#6366f1' }} />
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-neutral-600)' }}>
                          Drop files here or <span style={{ color: '#4f46e5', fontWeight: 700 }}>browse</span>
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem' }}>PDF, Figma, images, docs up to 25MB</p>
                      </div>
                    </FormField>
                  </motion.div>
                )}

                {/* ── Assignment section ────────────────────────────────── */}
                {activeSection === 'assignment' && (
                  <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ padding: '0.875rem 1rem', background: '#eef2ff', borderRadius: '0.875rem', border: '1px solid #c7d2fe' }}>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#3730a3', fontWeight: 600 }}>
                        Select the interns you want to assign this task to. You can assign to one or multiple interns.
                      </p>
                    </div>
                    <FormField label="Assign Interns">
                      <Controller
                        name="assignedInterns"
                        control={control}
                        render={({ field }) => (
                          <InternSelector value={field.value} onChange={field.onChange} interns={interns} />
                        )}
                      />
                    </FormField>
                  </motion.div>
                )}

                {/* ── Learning Objectives section ───────────────────────── */}
                {activeSection === 'objectives' && (
                  <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                      Define what interns will learn by completing this task.
                    </p>
                    {objectiveFields.map((field, index) => (
                      <div key={field.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4f46e5', minWidth: '1.5rem' }}>{index + 1}.</span>
                        <input
                          {...register(`learningObjectives.${index}`)}
                          placeholder={`Learning objective ${index + 1}...`}
                          style={{ ...inputStyle, flex: 1 }}
                          onFocus={(e) => Object.assign(e.target.style, focusStyle)}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--color-neutral-200)'; e.target.style.boxShadow = 'none'; }}
                        />
                        {objectiveFields.length > 1 && (
                          <button type="button" onClick={() => removeObjective(index)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', color: '#dc2626', display: 'flex' }}>
                            <RiDeleteBin6Line />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addObjective('')}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.875rem', border: '1.5px dashed #c7d2fe', borderRadius: '0.75rem', background: '#fafafa', color: '#4f46e5', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                    >
                      <RiAddLine /> Add Objective
                    </button>
                  </motion.div>
                )}

                {/* ── Rubric section ────────────────────────────────────── */}
                {activeSection === 'rubric' && (
                  <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                      Define grading criteria. Total score is the sum of all max scores.
                    </p>
                    {rubricFields.map((field, index) => (
                      <div key={field.id} style={{ background: 'var(--color-neutral-50)', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', display: 'block', marginBottom: '0.25rem' }}>Criterion</label>
                            <input {...register(`rubric.${index}.criterion`)} placeholder="e.g. Code Quality" style={{ ...inputStyle }} />
                          </div>
                          <div style={{ width: '90px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', display: 'block', marginBottom: '0.25rem' }}>Max Score</label>
                            <input type="number" {...register(`rubric.${index}.maxScore`, { min: 1, max: 100 })} style={{ ...inputStyle }} />
                          </div>
                          {rubricFields.length > 1 && (
                            <button type="button" onClick={() => removeRubric(index)} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', color: '#dc2626', display: 'flex', marginTop: '1.5rem' }}>
                              <RiDeleteBin6Line />
                            </button>
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)', display: 'block', marginBottom: '0.25rem' }}>Description</label>
                          <input {...register(`rubric.${index}.description`)} placeholder="What does scoring full marks look like?" style={{ ...inputStyle }} />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addRubric({ criterion: '', maxScore: 10, description: '' })}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.875rem', border: '1.5px dashed #c7d2fe', borderRadius: '0.75rem', background: '#fafafa', color: '#4f46e5', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
                    >
                      <RiAddLine /> Add Criterion
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--color-neutral-200)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexShrink: 0,
                  background: 'var(--color-neutral-50)',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-600)', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="button" onClick={handleSaveDraft} disabled={isLoading} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1.5px dashed #c7d2fe', background: '#faf5ff', fontSize: '0.875rem', fontWeight: 600, color: '#7c3aed', cursor: 'pointer' }}>
                    Save Draft
                  </button>
                </div>
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '0.625rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? 'Saving...' : editingTask ? 'Update Task' : 'Create & Assign'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
