/**
 * @file AnnouncementsManagement.jsx
 * @description HR Admin — Create, edit, delete, publish/unpublish, and pin announcements.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  RiAddLine, RiEdit2Line, RiDeleteBinLine, RiCloseLine,
  RiMegaphoneLine, RiPushpinLine, RiEyeLine, RiEyeOffLine,
  RiSearchLine, RiFilterLine,
} from 'react-icons/ri';
import useHRStore from '../../store/useHRStore';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }) };

const STATUS_STYLES = {
  published: { bg: '#dcfce7', color: '#166534', label: 'Published' },
  draft:     { bg: '#fef9c3', color: '#854d0e', label: 'Draft' },
  archived:  { bg: '#f3f4f6', color: '#6b7280', label: 'Archived' },
};

const CATEGORIES = ['All', 'Performance', 'Onboarding', 'Policy', 'Training', 'Benefits', 'General'];
const AUDIENCES  = ['All', 'Interns', 'Supervisors', 'HR Team', 'Department Heads'];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Announcement Form Modal ───────────────────────────────────────────────────
function AnnouncementFormModal({ announcement, onClose, onSave }) {
  const isEdit = !!announcement;
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: announcement ? {
      title: announcement.title,
      content: announcement.content,
      category: announcement.category,
      targetAudience: announcement.targetAudience,
      status: announcement.status,
      pinned: announcement.pinned,
    } : { status: 'draft', pinned: false, category: 'General', targetAudience: ['All'] },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    // ensure targetAudience is an array
    const payload = {
      ...data,
      targetAudience: Array.isArray(data.targetAudience) ? data.targetAudience : [data.targetAudience],
    };
    await onSave(payload);
    setLoading(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 24 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              {isEdit ? 'Edit Announcement' : 'Create Announcement'}
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
              {isEdit ? 'Update announcement content and settings' : 'Draft a new organization-wide announcement'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--color-neutral-400)' }}>
            <RiCloseLine />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Announcement Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="input-field" style={{ width: '100%' }}
              placeholder="e.g. Q3 Performance Review Period — Important Dates"
            />
            {errors.title && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.title.message}</p>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Content *</label>
            <textarea
              {...register('content', { required: 'Content is required' })}
              className="input-field" rows={6} style={{ width: '100%', resize: 'vertical' }}
              placeholder="Write your announcement content here…"
            />
            {errors.content && <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: '#ef4444' }}>{errors.content.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Category</label>
              <select {...register('category')} className="input-field" style={{ width: '100%' }}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Target Audience</label>
              <select {...register('targetAudience')} className="input-field" style={{ width: '100%' }}>
                {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>Publish Status</label>
              <select {...register('status')} className="input-field" style={{ width: '100%' }}>
                <option value="draft">Save as Draft</option>
                <option value="published">Publish Now</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input {...register('pinned')} type="checkbox" id="pinned-check" style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              <label htmlFor="pinned-check" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', cursor: 'pointer' }}>
                Pin to top
              </label>
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
              {loading ? 'Saving…' : isEdit ? 'Update' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteModal({ announcement, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        style={{ background: '#fff', borderRadius: '1rem', padding: '1.5rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RiDeleteBinLine style={{ color: '#dc2626', fontSize: '1.25rem' }} />
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>Delete Announcement</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>This action cannot be undone.</p>
          </div>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-700)', marginBottom: '1.25rem' }}>
          Are you sure you want to delete "<strong>{announcement?.title}</strong>"?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Cancel</button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); onClose(); }}
            disabled={loading}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: '0.625rem', border: 'none',
              background: '#dc2626', color: '#fff', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Announcement Card ─────────────────────────────────────────────────────────
function AnnouncementCard({ ann, index, onEdit, onDelete, onTogglePublish, onTogglePin }) {
  const ss = STATUS_STYLES[ann.status] || STATUS_STYLES.draft;
  const audiences = Array.isArray(ann.targetAudience) ? ann.targetAudience : [ann.targetAudience];

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      style={{
        background: '#fff', borderRadius: '1rem', padding: '1.25rem',
        border: `1px solid ${ann.pinned ? '#c7d2fe' : 'var(--color-neutral-200)'}`,
        boxShadow: ann.pinned ? '0 0 0 2px #eef2ff' : '0 1px 4px rgb(0 0 0 / 0.04)',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
            {ann.pinned && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', fontWeight: 700, color: '#4338ca', background: '#eef2ff', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                <RiPushpinLine style={{ fontSize: '0.75rem' }} /> Pinned
              </span>
            )}
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '99px', fontSize: '0.6875rem', fontWeight: 700, background: ss.bg, color: ss.color }}>
              {ss.label}
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-neutral-400)', background: 'var(--color-neutral-100)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
              {ann.category}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>
            {ann.title}
          </h3>
        </div>
      </div>

      {/* Content preview */}
      <p style={{
        margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {ann.content}
      </p>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          By {ann.author} · {formatDate(ann.createdAt)}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>·</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          Audience: {audiences.join(', ')}
        </span>
        {ann.status === 'published' && (
          <>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
              {ann.viewCount} views
            </span>
          </>
        )}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-neutral-100)', paddingTop: '0.875rem' }}>
        <button
          onClick={() => onTogglePublish(ann.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid',
            borderColor: ann.status === 'published' ? '#fde68a' : '#a7f3d0',
            background: ann.status === 'published' ? '#fffbeb' : '#ecfdf5',
            color: ann.status === 'published' ? '#92400e' : '#065f46',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
          }}
        >
          {ann.status === 'published' ? <><RiEyeOffLine />Unpublish</> : <><RiEyeLine />Publish</>}
        </button>
        <button
          onClick={() => onTogglePin(ann.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
            border: `1px solid ${ann.pinned ? '#c7d2fe' : 'var(--color-neutral-200)'}`,
            background: ann.pinned ? '#eef2ff' : 'var(--color-neutral-50)',
            color: ann.pinned ? '#4338ca' : 'var(--color-neutral-600)',
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
          }}
        >
          <RiPushpinLine />{ann.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button
          onClick={() => onEdit(ann)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
            border: '1px solid var(--color-neutral-200)', background: 'var(--color-neutral-50)',
            color: 'var(--color-neutral-700)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
          }}
        >
          <RiEdit2Line />Edit
        </button>
        <button
          onClick={() => onDelete(ann)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
            border: '1px solid #fecaca', background: '#fff5f5',
            color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, marginLeft: 'auto',
          }}
        >
          <RiDeleteBinLine />Delete
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const AnnouncementsManagement = () => {
  const {
    announcements, announcementFilter, announcementSearch, announcementLoading,
    setAnnouncementFilter, setAnnouncementSearch, addAnnouncement, editAnnouncement,
    publishAnnouncement, removeAnnouncement, togglePinAnnouncement,
  } = useHRStore();

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filtered = announcements
    .filter(a => announcementFilter === 'all' || a.status === announcementFilter)
    .filter(a => categoryFilter === 'All' || a.category === categoryFilter)
    .filter(a => !announcementSearch || a.title.toLowerCase().includes(announcementSearch.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handleSave = async (data) => {
    let result;
    if (editTarget) {
      result = await editAnnouncement(editTarget.id, data);
      if (result.success) toast.success('Announcement updated.');
      else toast.error('Failed to update announcement.');
    } else {
      result = await addAnnouncement(data);
      if (result.success) toast.success(`Announcement ${data.status === 'published' ? 'published' : 'saved as draft'}.`);
      else toast.error('Failed to create announcement.');
    }
    setEditTarget(null);
  };

  const handleTogglePublish = async (id) => {
    const ok = await publishAnnouncement(id);
    if (ok) toast.success('Publication status updated.');
    else toast.error('Failed to update status.');
  };

  const handleDelete = async () => {
    const ok = await removeAnnouncement(deleteTarget.id);
    if (ok) toast.success('Announcement deleted.');
    else toast.error('Failed to delete.');
    setDeleteTarget(null);
  };

  const handleTogglePin = (id) => {
    togglePinAnnouncement(id);
    toast.success('Pin status updated.');
  };

  const counts = {
    all: announcements.length,
    published: announcements.filter(a => a.status === 'published').length,
    draft: announcements.filter(a => a.status === 'draft').length,
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>Announcements</h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
              {counts.published} published · {counts.draft} draft · {counts.all} total
            </p>
          </div>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.125rem', borderRadius: '0.75rem', border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)', color: '#fff',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
              boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
            }}
          >
            <RiAddLine /> New Announcement
          </button>
        </motion.div>

        {/* Filters bar */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--color-neutral-200)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <RiSearchLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <input
              type="search"
              placeholder="Search announcements…"
              className="input-field"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
              value={announcementSearch}
              onChange={(e) => setAnnouncementSearch(e.target.value)}
            />
          </div>

          {/* Status tabs */}
          {[{ key: 'all', label: `All (${counts.all})` }, { key: 'published', label: `Published (${counts.published})` }, { key: 'draft', label: `Draft (${counts.draft})` }].map(tab => (
            <button
              key={tab.key}
              onClick={() => setAnnouncementFilter(tab.key)}
              style={{
                padding: '0.45rem 0.875rem', borderRadius: '0.5rem',
                border: `1px solid ${announcementFilter === tab.key ? '#6366f1' : 'var(--color-neutral-200)'}`,
                background: announcementFilter === tab.key ? '#eef2ff' : 'var(--color-neutral-50)',
                color: announcementFilter === tab.key ? '#4338ca' : 'var(--color-neutral-600)',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}

          {/* Category filter */}
          <select
            className="input-field"
            style={{ flex: '0 1 160px' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </motion.div>

        {/* Announcements list */}
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)' }}>
            <RiMegaphoneLine style={{ fontSize: '2.5rem', color: 'var(--color-neutral-300)' }} />
            <p style={{ marginTop: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)' }}>No announcements found</p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>Try a different filter or create a new announcement.</p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {filtered.map((ann, idx) => (
              <AnnouncementCard
                key={ann.id}
                ann={ann}
                index={idx}
                onEdit={(a) => { setEditTarget(a); setShowForm(true); }}
                onDelete={setDeleteTarget}
                onTogglePublish={handleTogglePublish}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <AnnouncementFormModal
            announcement={editTarget}
            onClose={() => { setShowForm(false); setEditTarget(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            announcement={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AnnouncementsManagement;
