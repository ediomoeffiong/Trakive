/**
 * @file AnnouncementsPage.jsx
 * @description Department Head — Announcements Management.
 * Create, edit, publish/draft, and delete department-wide announcements
 * with audience targeting, category tagging, and a compose modal.
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiMegaphoneLine, RiAddCircleLine, RiEditLine,
  RiDeleteBinLine, RiCloseLine, RiGlobalLine,
  RiEyeLine, RiDraftLine,
} from 'react-icons/ri';
import { useDepartmentStore } from '../../store/useDepartmentStore';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const CATEGORY_CONFIG = {
  urgent:   { variant: 'danger',  label: 'Urgent',   color: '#dc2626' },
  workshop: { variant: 'primary', label: 'Workshop', color: '#4f46e5' },
  general:  { variant: 'neutral', label: 'General',  color: '#6b7280' },
  reminder: { variant: 'warning', label: 'Reminder', color: '#d97706' },
};

const AUDIENCE_CONFIG = {
  department_wide: { label: 'Department-Wide', icon: '🏛️' },
  supervisors_only: { label: 'Supervisors Only', icon: '👔' },
  interns_only:    { label: 'Interns Only',    icon: '🎓' },
};

// ── Compose Modal ──────────────────────────────────────────────────────────────
const ComposeModal = ({ isOpen, existing, onClose, onSave, loading }) => {
  const isEdit = !!existing;
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: existing ?? { title: '', content: '', category: 'general', audience: 'department_wide' },
  });

  const submit = handleSubmit(async (data) => {
    await onSave(existing?.id, data);
    reset();
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '✏️ Edit Announcement' : '📢 New Announcement'}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '0.625rem 1.25rem' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none', background: 'var(--color-primary-600)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Save as Draft'}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>Title *</label>
          <input {...register('title', { required: 'Title is required' })} placeholder="Announcement title…" className="input-field" style={{ width: '100%', height: 42 }} />
          {errors.title && <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{errors.title.message}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>Category</label>
            <select {...register('category')} className="input-field" style={{ width: '100%', height: 42 }}>
              <option value="general">General</option>
              <option value="urgent">Urgent</option>
              <option value="workshop">Workshop</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>Audience</label>
            <select {...register('audience')} className="input-field" style={{ width: '100%', height: 42 }}>
              <option value="department_wide">Department-Wide</option>
              <option value="supervisors_only">Supervisors Only</option>
              <option value="interns_only">Interns Only</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.5rem' }}>Content *</label>
          <textarea {...register('content', { required: 'Content is required', minLength: { value: 20, message: 'Content must be at least 20 characters.' } })} rows={6} placeholder="Write the announcement content here…" className="input-field" style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.875rem', lineHeight: 1.6, padding: '0.75rem' }} />
          {errors.content && <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#dc2626' }}>{errors.content.message}</p>}
        </div>
      </div>
    </Modal>
  );
};

// ── Announcement Card ──────────────────────────────────────────────────────────
const AnnouncementCard = ({ ann, onEdit, onDelete, onTogglePublish, actionLoading }) => {
  const cat = CATEGORY_CONFIG[ann.category] ?? CATEGORY_CONFIG.general;
  const aud = AUDIENCE_CONFIG[ann.audience] ?? AUDIENCE_CONFIG.department_wide;
  const isDraft = ann.status === 'draft';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      style={{
        background: isDraft ? '#fafaf9' : '#fff', borderRadius: '1rem', padding: '1.25rem',
        border: isDraft ? '1px dashed var(--color-neutral-300)' : ann.pinned ? '1px solid #fde68a' : '1px solid var(--color-neutral-200)',
        boxShadow: isDraft ? 'none' : '0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {ann.pinned && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 99, background: '#fef3c7', color: '#92400e' }}>📌 Pinned</span>}
          <Badge variant={cat.variant}>{cat.label}</Badge>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>{aud.icon} {aud.label}</span>
          {isDraft && <Badge variant="neutral">Draft</Badge>}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          {new Date(ann.datePosted).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)', lineHeight: 1.3 }}>{ann.title}</h4>
      <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ann.content}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>
          {!isDraft && (
            <>
              <span>👁 {ann.viewCount} views</span>
              <span>❤️ {ann.likes} likes</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onTogglePublish(ann.id, ann.status)}
            disabled={actionLoading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, border: `1px solid ${isDraft ? '#bbf7d0' : 'var(--color-neutral-200)'}`, borderRadius: '0.5rem', background: isDraft ? '#f0fdf4' : 'var(--color-neutral-50)', color: isDraft ? '#059669' : 'var(--color-neutral-600)', cursor: 'pointer' }}
          >
            {isDraft ? <><RiEyeLine /> Publish</> : <><RiDraftLine /> Unpublish</>}
          </button>
          <button
            onClick={() => onEdit(ann)}
            style={{ display: 'flex', alignItems: 'center', padding: '0.375rem 0.625rem', fontSize: '0.9rem', border: '1px solid var(--color-neutral-200)', borderRadius: '0.5rem', background: 'var(--color-neutral-50)', color: 'var(--color-neutral-600)', cursor: 'pointer' }}
          >
            <RiEditLine />
          </button>
          <button
            onClick={() => onDelete(ann.id)}
            style={{ display: 'flex', alignItems: 'center', padding: '0.375rem 0.625rem', fontSize: '0.9rem', border: '1px solid #fca5a5', borderRadius: '0.5rem', background: '#fff5f5', color: '#dc2626', cursor: 'pointer' }}
          >
            <RiDeleteBinLine />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AnnouncementsPage = () => {
  const { announcements, filters, loading, errors, fetchAnnouncements, setFilter, createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePublishAnnouncement } = useDepartmentStore();
  const [composeOpen, setComposeOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const handleFilter = (key, value) => {
    setFilter(key, value);
    setTimeout(() => fetchAnnouncements(), 0);
  };

  const handleSave = async (id, data) => {
    try {
      if (id) {
        await updateAnnouncement(id, data);
        toast.success('Announcement updated.');
      } else {
        await createAnnouncement(data);
        toast.success('Announcement saved as draft.');
      }
    } catch {
      toast.error('Failed to save announcement.');
      throw new Error('save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted.');
    } catch {
      toast.error('Failed to delete announcement.');
    }
  };

  const handleToggle = async (id, status) => {
    try {
      await togglePublishAnnouncement(id);
      toast.success(status === 'published' ? 'Moved to draft.' : 'Published!');
    } catch {
      toast.error('Failed to update announcement status.');
    }
  };

  const published = announcements.filter(a => a.status === 'published');
  const drafts    = announcements.filter(a => a.status === 'draft');

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', borderRadius: '1.25rem', padding: '1.75rem 2rem', color: '#fff', boxShadow: '0 8px 32px rgba(30,64,175,0.22)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 0.75rem', borderRadius: 99, display: 'inline-block', marginBottom: '0.625rem' }}>Communications</span>
          <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.625rem', fontWeight: 900 }}>Department Announcements</h2>
          <p style={{ margin: 0, fontSize: '0.9375rem', color: '#93c5fd' }}>
            <strong style={{ color: '#fff' }}>{published.length} published</strong> · {drafts.length} drafts
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setEditTarget(null); setComposeOpen(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: '#fff', color: '#1e40af', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <RiAddCircleLine style={{ fontSize: '1.1rem' }} />
          New Announcement
        </motion.button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filters.announcementCategory} onChange={(e) => handleFilter('announcementCategory', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filters.announcementAudience} onChange={(e) => handleFilter('announcementAudience', e.target.value)} className="input-field" style={{ height: 38, width: 'auto' }}>
          <option value="all">All Audiences</option>
          {Object.entries(AUDIENCE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading.announcements ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 200, background: '#e2e8f0', borderRadius: '1rem', animation: 'pulse 1.5s ease infinite' }} />)}
        </div>
      ) : errors.announcements ? (
        <EmptyState icon={<RiMegaphoneLine />} title="Failed to load announcements" description={errors.announcements} />
      ) : announcements.length === 0 ? (
        <EmptyState icon={<RiMegaphoneLine />} title="No announcements yet" description="Create your first department announcement." action={<button onClick={() => setComposeOpen(true)} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: 'none', background: 'var(--color-primary-600)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Announcement</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {published.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> Published ({published.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {published.map(a => (
                  <AnnouncementCard key={a.id} ann={a} onEdit={(a) => { setEditTarget(a); setComposeOpen(true); }} onDelete={handleDelete} onTogglePublish={handleToggle} actionLoading={loading.action} />
                ))}
              </div>
            </div>
          )}
          {drafts.length > 0 && (
            <div>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', display: 'inline-block' }} /> Drafts ({drafts.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {drafts.map(a => (
                  <AnnouncementCard key={a.id} ann={a} onEdit={(a) => { setEditTarget(a); setComposeOpen(true); }} onDelete={handleDelete} onTogglePublish={handleToggle} actionLoading={loading.action} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ComposeModal
        isOpen={composeOpen}
        existing={editTarget}
        onClose={() => { setComposeOpen(false); setEditTarget(null); }}
        onSave={handleSave}
        loading={loading.action}
      />

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </motion.div>
  );
};

export default AnnouncementsPage;
