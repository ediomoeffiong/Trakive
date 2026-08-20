/**
 * @file TaskAssignmentModal.jsx
 * @description Assignment modal for assigning tasks to individual interns,
 * multiple interns, entire departments, or internship batches.
 * Shows a live summary before confirming.
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiUserAddLine,
  RiGroupLine,
  RiBuilding2Line,
  RiCheckboxFill,
  RiCheckboxBlankLine,
  RiCheckLine,
  RiSearchLine,
  RiLoader3Line,
} from 'react-icons/ri';
import { mockInternProfiles } from '../../../data/internProfiles';

const ASSIGN_MODES = [
  { id: 'individual', label: 'Individual', icon: RiUserAddLine, desc: 'Select specific interns' },
  { id: 'department', label: 'By Department', icon: RiBuilding2Line, desc: 'Assign to a full department' },
  { id: 'batch', label: 'By Batch', icon: RiGroupLine, desc: 'Assign to an internship batch' },
];

const DEPARTMENTS = [
  'Frontend Engineering', 'Backend Engineering', 'Backend Integration',
  'UX/UI Design', 'QA & Testing', 'Design Systems', 'Program Management',
];

const BATCHES = ['Batch 2026-A', 'Batch 2026-B', 'Batch 2025-C'];

const COLORS = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

const InternCard = ({ intern, isSelected, onToggle }) => (
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
      border: isSelected ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
      background: isSelected ? '#f5f3ff' : '#fff',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }}
  >
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: COLORS[Math.abs(intern.id?.charCodeAt(intern.id.length - 1) - 48) % COLORS.length] || '#4f46e5',
        color: '#fff',
        fontSize: '0.8125rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {intern.initials || intern.name?.split(' ').map((n) => n[0]).join('') || '??'}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {intern.name}
      </p>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
        {intern.department || intern.role || 'Intern'}
      </p>
    </div>
    <div style={{ color: isSelected ? '#4f46e5' : '#cbd5e1', fontSize: '1.125rem', flexShrink: 0 }}>
      {isSelected ? <RiCheckboxFill /> : <RiCheckboxBlankLine />}
    </div>
  </motion.div>
);

const AssignmentSummary = ({ task, selectedInterns, mode, department, batch }) => {
  const count = mode === 'individual' ? selectedInterns.length : mode === 'department' ? mockInternProfiles?.filter((i) => i.department === department).length || 0 : 5;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        borderRadius: '0.875rem',
        padding: '1rem',
        border: '1px solid #c4b5fd',
      }}
    >
      <h4 style={{ margin: '0 0 0.625rem', fontSize: '0.875rem', fontWeight: 700, color: '#5b21b6' }}>
        Assignment Summary
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {task && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#6d28d9', fontWeight: 500 }}>Task:</span>
            <span style={{ color: '#4c1d95', fontWeight: 700, textAlign: 'right', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
          <span style={{ color: '#6d28d9', fontWeight: 500 }}>Mode:</span>
          <span style={{ color: '#4c1d95', fontWeight: 700, textTransform: 'capitalize' }}>{mode}</span>
        </div>
        {mode === 'department' && department && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#6d28d9', fontWeight: 500 }}>Department:</span>
            <span style={{ color: '#4c1d95', fontWeight: 700 }}>{department}</span>
          </div>
        )}
        {mode === 'batch' && batch && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: '#6d28d9', fontWeight: 500 }}>Batch:</span>
            <span style={{ color: '#4c1d95', fontWeight: 700 }}>{batch}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
          <span style={{ color: '#6d28d9', fontWeight: 500 }}>Interns to assign:</span>
          <span
            style={{
              background: '#4f46e5',
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
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const allInterns = mockInternProfiles || [];

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

  const canConfirm = () => {
    if (mode === 'individual') return selectedInterns.length > 0;
    if (mode === 'department') return !!selectedDept;
    if (mode === 'batch') return !!selectedBatch;
    return false;
  };

  const handleConfirm = async () => {
    if (!canConfirm()) {
      toast.error('Please select at least one intern or option.');
      return;
    }

    const internIds =
      mode === 'individual'
        ? selectedInterns.map((i) => i.id)
        : mode === 'department'
        ? allInterns.filter((i) => i.department === selectedDept).map((i) => i.id)
        : allInterns.slice(0, 5).map((i) => i.id);

    try {
      await onAssign?.({ taskId: task?.id, internIds, mode, message });
      toast.success(`Task assigned to ${internIds.length} intern(s) successfully!`);
      setSelectedInterns([]);
      setSelectedDept('');
      setSelectedBatch('');
      setMessage('');
      onClose();
    } catch {
      toast.error('Failed to assign task. Please try again.');
    }
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
              width: 'min(640px, 95vw)',
              maxHeight: '88vh',
              background: '#fff',
              borderRadius: '1.25rem',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-modal-title"
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)', color: '#fff' }}>
              <div>
                <h2 id="assign-modal-title" style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800 }}>Assign Task</h2>
                {task && (
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: '#c7d2fe', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                    {task.title}
                  </p>
                )}
              </div>
              <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.125rem' }}>
                <RiCloseLine />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Mode selector */}
              <div>
                <p style={{ margin: '0 0 0.625rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignment Mode</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
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
                        border: mode === id ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
                        background: mode === id ? '#eef2ff' : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon style={{ fontSize: '1.25rem', color: mode === id ? '#4f46e5' : '#94a3b8' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: mode === id ? '#4338ca' : 'var(--color-neutral-700)' }}>{label}</span>
                      <span style={{ fontSize: '0.6875rem', color: mode === id ? '#6366f1' : 'var(--color-neutral-400)' }}>{desc}</span>
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
                    {filteredInterns.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem', padding: '1.5rem' }}>No interns found.</p>
                    ) : (
                      filteredInterns.map((intern) => (
                        <InternCard key={intern.id} intern={intern} isSelected={selectedInterns.some((i) => i.id === intern.id)} onToggle={toggleIntern} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Department mode */}
              {mode === 'department' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-600)' }}>Select Department</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {DEPARTMENTS.map((dept) => (
                      <motion.button
                        key={dept}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedDept(dept)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 0.875rem',
                          borderRadius: '0.75rem',
                          border: selectedDept === dept ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
                          background: selectedDept === dept ? '#eef2ff' : '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.8125rem',
                          fontWeight: selectedDept === dept ? 700 : 400,
                          color: selectedDept === dept ? '#4338ca' : 'var(--color-neutral-700)',
                        }}
                      >
                        {selectedDept === dept && <RiCheckLine style={{ color: '#4f46e5', flexShrink: 0 }} />}
                        {dept}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Batch mode */}
              {mode === 'batch' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-600)' }}>Select Internship Batch</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {BATCHES.map((batch) => (
                      <motion.button
                        key={batch}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedBatch(batch)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.875rem 1rem',
                          borderRadius: '0.875rem',
                          border: selectedBatch === batch ? '1.5px solid #4f46e5' : '1px solid var(--color-neutral-200)',
                          background: selectedBatch === batch ? '#eef2ff' : '#fff',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <RiGroupLine style={{ fontSize: '1.25rem', color: selectedBatch === batch ? '#4f46e5' : '#94a3b8' }} />
                        <div>
                          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: selectedBatch === batch ? '#4338ca' : 'var(--color-neutral-800)' }}>{batch}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>~15 interns in this batch</p>
                        </div>
                        {selectedBatch === batch && <RiCheckLine style={{ color: '#4f46e5', marginLeft: 'auto' }} />}
                      </motion.button>
                    ))}
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
              <AssignmentSummary task={task} selectedInterns={selectedInterns} mode={mode} department={selectedDept} batch={selectedBatch} />
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-neutral-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexShrink: 0, background: 'var(--color-neutral-50)' }}>
              <button onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-200)', background: '#fff', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-600)', cursor: 'pointer' }}>
                Cancel
              </button>
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}
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
                  background: canConfirm() ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#e2e8f0',
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
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskAssignmentModal;
