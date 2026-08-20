/**
 * @file TaskTemplatesModal.jsx
 * @description Template manager allowing supervisors to browse, preview, create,
 * duplicate, edit, delete, and instantiate task templates into active assignments.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiAddLine,
  RiFileCopyLine,
  RiDeleteBin6Line,
  RiArrowRightLine,
  RiTimeLine,
  RiStarLine,
  RiSearchLine,
  RiLayoutGridLine,
} from 'react-icons/ri';
import { TemplatesGridSkeleton } from './TaskSkeletonLoaders';
import { TASK_CATEGORIES } from '../../../data/taskCategories';

const DIFFICULTY_STYLES = {
  Beginner:     { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  Intermediate: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Advanced:     { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
};

const getCategoryColor = (category) => {
  const cat = TASK_CATEGORIES.find((c) => c.value === category);
  return cat ? { color: cat.color, bg: cat.bg } : { color: '#4f46e5', bg: '#eef2ff' };
};

const TemplateCard = ({ template, onUse, onDuplicate, onDelete, onPreview, isSelected }) => {
  const diff = DIFFICULTY_STYLES[template.difficulty] || DIFFICULTY_STYLES.Intermediate;
  const catStyle = getCategoryColor(template.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
      style={{
        background: '#fff',
        borderRadius: '0.875rem',
        padding: '1.125rem',
        border: isSelected ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
        boxShadow: isSelected ? '0 0 0 3px rgba(79,70,229,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
      onClick={() => onPreview(template)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>
            {template.name}
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {template.description}
          </p>
        </div>
      </div>

      {/* Tags row */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.color}30` }}>
          {template.category}
        </span>
        <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
          {template.difficulty}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
          <RiTimeLine /> {template.estimatedHours}h
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RiStarLine style={{ color: '#f59e0b' }} />
          Used {template.usageCount} times
        </span>
      </div>

      {/* Actions */}
      <div
        style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-neutral-100)', paddingTop: '0.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onUse(template)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.5rem',
            borderRadius: '0.625rem',
            border: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Use Template <RiArrowRightLine />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, background: '#eef2ff' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onDuplicate(template)}
          title="Duplicate"
          style={{ padding: '0.5rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RiFileCopyLine />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, background: '#fef2f2' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onDelete(template)}
          title="Delete"
          style={{ padding: '0.5rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RiDeleteBin6Line />
        </motion.button>
      </div>
    </motion.div>
  );
};

const TemplatePreviewPanel = ({ template, onClose, onUse }) => {
  if (!template) return null;
  const diff = DIFFICULTY_STYLES[template.difficulty] || DIFFICULTY_STYLES.Intermediate;
  const catStyle = getCategoryColor(template.category);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      style={{
        width: '280px',
        flexShrink: 0,
        background: 'var(--color-neutral-50)',
        borderLeft: '1px solid var(--color-neutral-200)',
        padding: '1.25rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>Preview</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', fontSize: '1rem', display: 'flex' }}>
          <RiCloseLine />
        </button>
      </div>

      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>{template.name}</h4>
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: catStyle.bg, color: catStyle.color }}>{template.category}</span>
          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: diff.bg, color: diff.color }}>{template.difficulty}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{template.description}</p>
      </div>

      {template.learningObjectives?.length > 0 && (
        <div>
          <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Learning Objectives</p>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {template.learningObjectives.map((obj, i) => (
              <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {template.defaultInstructions && (
        <div>
          <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructions Preview</p>
          <div style={{ background: '#fff', borderRadius: '0.625rem', padding: '0.625rem', border: '1px solid var(--color-neutral-200)' }}>
            <pre style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-600)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
              {template.defaultInstructions.substring(0, 200)}{template.defaultInstructions.length > 200 ? '...' : ''}
            </pre>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.375rem', marginTop: 'auto', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>~{template.estimatedHours}h · Used {template.usageCount}×</span>
      </div>

      <motion.button
        whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onUse(template)}
        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.875rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
      >
        Use This Template
      </motion.button>
    </motion.div>
  );
};

const TaskTemplatesModal = ({
  isOpen,
  templates = [],
  isLoading = false,
  onClose,
  onUseTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onCreateTemplate,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const filtered = templates.filter((t) => {
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUse = (template) => {
    onUseTemplate?.(template);
    toast.success(`Template "${template.name}" loaded into task form.`);
    onClose();
  };

  const handleDelete = (template) => {
    if (window.confirm(`Delete template "${template.name}"? This cannot be undone.`)) {
      onDeleteTemplate?.(template.id);
      toast.success('Template deleted.');
      if (previewTemplate?.id === template.id) setPreviewTemplate(null);
    }
  };

  const handleDuplicate = (template) => {
    onDuplicateTemplate?.(template);
    toast.success(`Duplicated "${template.name}".`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 201,
              width: 'min(900px, 96vw)',
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
            aria-labelledby="templates-modal-title"
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                  <RiLayoutGridLine />
                </div>
                <div>
                  <h2 id="templates-modal-title" style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800 }}>Task Templates</h2>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#c7d2fe' }}>{templates.length} templates available</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onCreateTemplate}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  <RiAddLine /> New Template
                </motion.button>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.125rem' }}>
                  <RiCloseLine />
                </button>
              </div>
            </div>

            {/* Search + filters */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {['all', ...TASK_CATEGORIES.map((c) => c.value)].map((cat) => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: categoryFilter === cat ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
                      background: categoryFilter === cat ? '#eef2ff' : '#fff',
                      color: categoryFilter === cat ? '#4338ca' : 'var(--color-neutral-600)',
                      fontWeight: categoryFilter === cat ? 700 : 400,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                {isLoading ? (
                  <TemplatesGridSkeleton />
                ) : filtered.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
                    No templates found. <button onClick={onCreateTemplate} style={{ color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>Create one →</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.875rem' }}>
                    <AnimatePresence>
                      {filtered.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={previewTemplate?.id === template.id}
                          onUse={handleUse}
                          onDuplicate={handleDuplicate}
                          onDelete={handleDelete}
                          onPreview={setPreviewTemplate}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Preview panel */}
              <AnimatePresence>
                {previewTemplate && (
                  <TemplatePreviewPanel
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                    onUse={handleUse}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskTemplatesModal;
