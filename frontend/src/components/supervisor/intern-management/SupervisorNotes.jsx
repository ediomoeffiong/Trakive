/**
 * @file SupervisorNotes.jsx
 * @description Private supervisor notes section for an intern profile.
 * Supports create, edit, delete, pin, and search notes.
 * Uses React Hook Form for note creation/editing.
 */

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiAddLine,
  RiSearchLine,
  RiPushpinLine,
  RiPushpin2Fill,
  RiEditLine,
  RiDeleteBinLine,
  RiCloseLine,
  RiStickyNoteLine,
  RiSaveLine,
} from 'react-icons/ri';
import { InternNotesLoader } from './InternSkeletonLoaders';
import InternEmptyState from './InternEmptyStates';

const NOTE_CATEGORIES = ['Performance', 'Technical', 'Communication', 'Review', 'Onboarding', 'Support Needed', 'Achievement', 'Action Required', 'Context', 'Observation', 'Leave Management', 'Improvement'];
const NOTE_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#64748b'];

const NoteFormModal = ({ existingNote, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: existingNote?.title || '',
      content: existingNote?.content || '',
      category: existingNote?.category || 'Performance',
      color: existingNote?.color || '#4f46e5',
    },
  });

  const onSubmit = async (data) => {
    await onSave({ ...data, id: existingNote?.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        style={{
          background: '#fff',
          borderRadius: '1rem',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
            {existingNote ? 'Edit Note' : 'New Private Note'}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ color: 'var(--color-neutral-500)' }}
          >
            <RiCloseLine style={{ fontSize: '1.25rem' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
              Note Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="input-field"
              placeholder="e.g. Mid-term Review Notes"
              style={{ width: '100%' }}
            />
            {errors.title && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.title.message}</p>}
          </div>

          {/* Content */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
              Note Content *
            </label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              className="input-field"
              placeholder="Write your private note here..."
              rows={5}
              style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
            />
            {errors.content && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.content.message}</p>}
          </div>

          {/* Category + Color Row */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                Category
              </label>
              <select {...register('category')} className="input-field" style={{ width: '100%' }}>
                {NOTE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', height: '38px' }}>
                {NOTE_COLORS.map((c) => (
                  <label key={c} style={{ cursor: 'pointer' }}>
                    <input type="radio" {...register('color')} value={c} style={{ display: 'none' }} />
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: c,
                        border: '2px solid transparent',
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RiSaveLine />
              {isSubmitting ? 'Saving...' : existingNote ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ── Note Card ─────────────────────────────────────────────────────────────────
const NoteCard = ({ note, onEdit, onDelete, onPin, index }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      style={{
        background: '#ffffff',
        borderRadius: '0.875rem',
        padding: '1.125rem 1.25rem',
        border: `1px solid ${note.isPinned ? note.color + '40' : 'var(--color-neutral-200)'}`,
        boxShadow: note.isPinned ? `0 0 0 2px ${note.color}15` : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Pin accent */}
      {note.isPinned && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: note.color,
            borderRadius: '4px 0 0 4px',
          }}
        />
      )}

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
          {note.isPinned && <RiPushpin2Fill style={{ color: note.color, fontSize: '0.9rem', flexShrink: 0 }} />}
          <h5
            style={{
              margin: 0,
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {note.title}
          </h5>
        </div>

        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
          <button
            className="btn btn-ghost btn-icon"
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
            onClick={() => onPin(note.id)}
            style={{ fontSize: '0.9375rem', padding: '0.3rem', color: note.isPinned ? note.color : 'var(--color-neutral-400)' }}
          >
            {note.isPinned ? <RiPushpin2Fill /> : <RiPushpinLine />}
          </button>
          <button
            className="btn btn-ghost btn-icon"
            title="Edit note"
            onClick={() => onEdit(note)}
            style={{ fontSize: '0.9375rem', padding: '0.3rem', color: 'var(--color-neutral-500)' }}
          >
            <RiEditLine />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            title="Delete note"
            onClick={() => setConfirmDelete(true)}
            style={{ fontSize: '0.9375rem', padding: '0.3rem', color: '#ef4444' }}
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </div>

      {/* Content */}
      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
        {note.content}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span
          style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '99px',
            fontSize: '0.7rem',
            fontWeight: 700,
            background: `${note.color}18`,
            color: note.color,
          }}
        >
          {note.category}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>{createdDate}</span>
      </div>

      {/* Delete Confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.96)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              borderRadius: '0.875rem',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              Delete this note?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8125rem', background: '#ef4444', borderColor: '#ef4444' }}
                onClick={() => { onDelete(note.id); setConfirmDelete(false); }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main SupervisorNotes ──────────────────────────────────────────────────────
const SupervisorNotes = ({ notes = [], isLoading = false, internId, onSaveNote, onDeleteNote, onPinNote }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const filtered = q
      ? notes.filter((n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.category.toLowerCase().includes(q))
      : notes;
    // Pinned notes always appear first
    return [...filtered].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes, searchQuery]);

  const handleSave = async (noteData) => {
    const result = await onSaveNote(internId, noteData);
    if (result?.success) {
      toast.success(noteData.id ? 'Note updated!' : 'Note saved!');
      setShowModal(false);
      setEditingNote(null);
    } else {
      toast.error('Failed to save note.');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDelete = async (noteId) => {
    const result = await onDeleteNote(internId, noteId);
    if (result?.success) {
      toast.success('Note deleted.');
    }
  };

  const handlePin = async (noteId) => {
    await onPinNote(internId, noteId);
  };

  if (isLoading) return <InternNotesLoader />;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.875rem' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RiStickyNoteLine style={{ color: '#d97706' }} />
            Private Supervisor Notes
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
            Only visible to you. {notes.length} note{notes.length !== 1 ? 's' : ''} saved.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Notes */}
          <div style={{ position: 'relative' }}>
            <RiSearchLine
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-neutral-400)',
                fontSize: '0.9rem',
              }}
            />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', height: '36px', fontSize: '0.8125rem', width: '200px' }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setEditingNote(null); setShowModal(true); }}
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RiAddLine />
            Add Note
          </motion.button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        notes.length === 0 ? (
          <InternEmptyState
            type="no-notes"
            action={{ label: 'Add First Note', onClick: () => { setEditingNote(null); setShowModal(true); } }}
          />
        ) : (
          <InternEmptyState type="no-search-results" message="No notes match your search query." />
        )
      ) : (
        <motion.div
          layout
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}
        >
          <AnimatePresence>
            {filteredNotes.map((note, idx) => (
              <NoteCard
                key={note.id}
                note={note}
                index={idx}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Note Form Modal */}
      <AnimatePresence>
        {showModal && (
          <NoteFormModal
            existingNote={editingNote}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditingNote(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SupervisorNotes;
