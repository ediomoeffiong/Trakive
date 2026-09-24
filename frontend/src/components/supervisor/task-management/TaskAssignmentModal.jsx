/**
 * @file TaskAssignmentModal.jsx
 * @description Assignment modal for assigning tasks to individual interns,
 * multiple interns, entire departments, or internship batches.
 * Shows a live summary before confirming.
 */

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiUserAddLine,
  RiCheckboxFill,
  RiCheckboxBlankLine,
  RiSearchLine,
  RiLoader3Line,
} from 'react-icons/ri';
import { internManagementService } from '../../../services/internManagementService';

const ASSIGN_MODES = [
  { id: 'individual', label: 'Individual', icon: RiUserAddLine, desc: 'Select specific interns' },
];

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

const getInternInitials = (intern) => {
  if (intern?.initials) return intern.initials;
  if (!intern?.name) return '??';
  return intern.name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase() || '??';
};

const getInternColor = (id) => {
  if (!id) return '#00b4d8';
  const str = String(id);
  const code = str.charCodeAt(str.length - 1) || 0;
  return COLORS[Math.abs(code - 48) % COLORS.length] || '#00b4d8';
};

const InternCard = ({ intern, isSelected, onToggle }) => {
  if (!intern) return null;
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onToggle(intern)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 0.875rem',
        borderRadius: '0.75rem',
        border: isSelected ? '1.5px solid #00b4d8' : '1px solid var(--color-neutral-200)',
        background: isSelected ? '#e6faff' : '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: getInternColor(intern.id),
          color: '#fff',
          fontSize: '0.8125rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getInternInitials(intern)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {intern.name || 'Unnamed Intern'}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          {intern.department || intern.role || 'Intern'}
        </p>
      </div>
      <div style={{ color: isSelected ? '#00b4d8' : '#cbd5e1', fontSize: '1.125rem', flexShrink: 0 }}>
        {isSelected ? <RiCheckboxFill /> : <RiCheckboxBlankLine />}
      </div>
    </motion.div>
  );
};

const AssignmentSummary = ({ task, selectedInterns, mode }) => {
  const count = Array.isArray(selectedInterns) ? selectedInterns.length : 0;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #e6faff 0%, #cffafe 100%)',
        borderRadius: '0.875rem',
        padding: '1rem',
        border: '1px solid #67e8f9',
      }}
    >
      <h4 style={{ margin: '0 0 0.625rem', fontSize: '0.875rem', fontWeight: 700, color: '#0077b6' }}>
        Assignment Summary
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {task && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#0077b6', fontWeight: 500 }}>Task:</span>
            <span style={{ color: '#075985', fontWeight: 700, textAlign: 'right', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title || 'Task'}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
          <span style={{ color: '#0077b6', fontWeight: 500 }}>Mode:</span>
          <span style={{ color: '#075985', fontWeight: 700, textTransform: 'capitalize' }}>{mode}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
          <span style={{ color: '#0077b6', fontWeight: 500 }}>Interns to assign:</span>
          <span
            style={{
              background: '#00b4d8',
              color: '#fff',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.1rem 0.5rem',
            }}
          >
            {count}
          </span>
        </div>
      </div>
    </div>
  );
};

const TaskAssignmentModal = ({ isOpen, task, onClose, onAssign, isLoading }) => {
  const [mode, setMode] = useState('individual');
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [allInterns, setAllInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    let mounted = true;
    const loadInterns = async () => {
      setLoadingInterns(true);
      try {
        const { interns } = await internManagementService.fetchInternList({ limit: 100 });
        if (!mounted) return;
        setAllInterns(
          (interns || []).map((intern) => ({
            id: intern.id || intern.internId,
            name: intern.name,
            department: intern.department || intern.role || 'Intern',
            initials: intern.name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'IN',
          }))
        );
      } catch {
        if (mounted) setAllInterns([]);
      } finally {
        if (mounted) setLoadingInterns(false);
      }
    };
    loadInterns();
    return () => { mounted = false; };
  }, [isOpen]);

  const filteredInterns = useMemo(() => {
    if (!search) return allInterns;
    const q = search.toLowerCase();
    return allInterns.filter(
      (i) => i.name?.toLowerCase().includes(q) || i.department?.toLowerCase().includes(q)
    );
  }, [search, allInterns]);

  const toggleIntern = (intern) => {
    setSelectedInterns((prev) =>
      prev.some((i) => i.id === intern.id)
        ? prev.filter((i) => i.id !== intern.id)
        : [...prev, intern]
    );
  };

  const handleSelectAll = () => {
    if (selectedInterns.length === filteredInterns.length) {
      setSelectedInterns([]);
    } else {
      setSelectedInterns([...filteredInterns]);
    }
  };

  const canConfirm = () => selectedInterns.length > 0;

  const handleConfirm = async () => {
    if (!canConfirm()) {
      toast.error('Please select at least one intern or option.');
      return;
    }

    const internIds = selectedInterns.map((i) => i.id);

    try {
      await onAssign?.({ taskId: task?.id, internIds, mode, message });
      toast.success(`Task assigned to ${internIds.length} intern(s) successfully!`);
      setSelectedInterns([]);
      setMessage('');
      onClose();
    } catch {
      toast.error('Failed to assign task. Please try again.');
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
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 201,
              width: 'min(640px, 95vw)',
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
            aria-labelledby="assign-modal-title"
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#00b4d8', color: '#fff' }}>
              <div>
                <h2 id="assign-modal-title" style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: '#ffffff' }}>Assign Task</h2>
                {task && (
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#e0f7fc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                    {task.title}
                  </p>
                )}
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.125rem' }}>
                <RiCloseLine />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Mode selector */}
              <div>
                <p style={{ margin: '0 0 0.625rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignment Mode</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.625rem' }}>
                  {ASSIGN_MODES.map(({ id, label, icon: Icon, desc }) => (
                    <motion.button
                      key={id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setMode(id); setSelectedInterns([]); }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.875rem 0.5rem',
                        borderRadius: '0.875rem',
                        border: mode === id ? '1.5px solid #00b4d8' : '1px solid var(--color-neutral-200)',
                        background: mode === id ? '#e6faff' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon style={{ fontSize: '1.25rem', color: mode === id ? '#00b4d8' : '#94a3b8' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: mode === id ? '#0077b6' : 'var(--color-neutral-700)' }}>{label}</span>
                      <span style={{ fontSize: '0.6875rem', color: mode === id ? '#0096c7' : 'var(--color-neutral-400)' }}>{desc}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Individual mode — intern list */}
              {mode === 'individual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Search + select all */}
                  <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', fontSize: '0.875rem', pointerEvents: 'none' }} />
                      <input
                        type="text"
                        placeholder="Search interns..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', fontSize: '0.8125rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button
                      onClick={handleSelectAll}
                      style={{ padding: '0.5rem 0.875rem', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', background: '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}
                    >
                      {selectedInterns.length === filteredInterns.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto' }}>
                    {loadingInterns ? (
                      <p style={{ textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem', padding: '1.5rem' }}>Loading interns...</p>
                    ) : filteredInterns.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem', padding: '1.5rem' }}>No interns found in your department yet.</p>
                    ) : (
                      filteredInterns.map((intern) => (
                        <InternCard key={intern.id} intern={intern} isSelected={selectedInterns.some((i) => i.id === intern.id)} onToggle={toggleIntern} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Optional message */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-600)', marginBottom: '0.35rem' }}>
                  Message to Interns <span style={{ fontWeight: 400, color: 'var(--color-neutral-400)' }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Add a personal note or instructions for the assigned interns..."
                  style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', fontSize: '0.875rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              {/* Live summary */}
              <AssignmentSummary task={task} selectedInterns={selectedInterns} mode={mode} />
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexShrink: 0, background: 'var(--color-neutral-50)' }}>
              <button onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-600)', cursor: 'pointer' }}>
                Cancel
              </button>
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,180,216,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={!canConfirm() || isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: canConfirm() ? '#00b4d8' : '#e2e8f0',
                  color: canConfirm() ? '#fff' : '#94a3b8',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: canConfirm() && !isLoading ? 'pointer' : 'not-allowed',
                }}
              >
                {isLoading ? <RiLoader3Line style={{ animation: 'spin 1s linear infinite' }} /> : <RiUserAddLine />}
                {isLoading ? 'Assigning...' : 'Confirm Assignment'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TaskAssignmentModal;
