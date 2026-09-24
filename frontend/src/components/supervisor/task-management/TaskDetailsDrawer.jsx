/**
 * @file TaskDetailsDrawer.jsx
 * @description Slide-over drawer with tabbed details for a selected task:
 * Overview, Assigned Interns, Submission Monitoring, Timeline, and Comments.
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiCloseLine,
  RiEdit2Line,
  RiUserAddLine,
  RiFileCopyLine,
  RiArchiveLine,
  RiCalendarLine,
  RiTimeLine,
  RiPriceTag3Line,
  RiStarLine,
  RiCheckboxCircleLine,
  RiLoader3Line,
  RiMessageLine,
  RiFileTextLine,
  RiDownloadLine,
  RiSendPlane2Line,
} from 'react-icons/ri';
import TaskActivityTimeline from './TaskActivityTimeline';
import { TaskDetailsSkeleton } from './TaskSkeletonLoaders';
import { useSupervisorTaskStore } from '../../../store/useSupervisorTaskStore';
import { taskManagementService } from '../../../services/taskManagementService';
import { Avatar } from '../../ui';

const STATUS_STYLES = {
  draft:            { bg: '#f1f5f9', text: '#475569', label: 'Draft' },
  assigned:         { bg: '#dbeafe', text: '#1e40af', label: 'Assigned' },
  'in-progress':    { bg: '#e0e7ff', text: '#3730a3', label: 'In Progress' },
  'pending-review': { bg: '#fef3c7', text: '#b45309', label: 'Pending Review' },
  'needs-revision': { bg: '#fef2f2', text: '#b91c1c', label: 'Needs Revision' },
  completed:        { bg: '#d1fae5', text: '#065f46', label: 'Completed' },
  overdue:          { bg: '#fee2e2', text: '#991b1b', label: 'Overdue' },
  archived:         { bg: '#f3f4f6', text: '#6b7280', label: 'Archived' },
};

const PRIORITY_COLORS = {
  urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#22c55e',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: RiFileTextLine },
  { id: 'interns', label: 'Interns', icon: RiUserAddLine },
  { id: 'submissions', label: 'Submissions', icon: RiCheckboxCircleLine },
  { id: 'timeline', label: 'Timeline', icon: RiLoader3Line },
  { id: 'comments', label: 'Comments', icon: RiMessageLine },
];

// ── Sub-sections ──────────────────────────────────────────────────────────────
const OverviewTab = ({ task }) => {
  const objectives = task.objectives?.length
    ? task.objectives
    : task.learningObjectives?.length
    ? task.learningObjectives
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Description */}
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
          Description
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Objectives & Deliverables */}
      {objectives.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
            Objectives & Key Deliverables
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {objectives.map((obj, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-neutral-200)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#00b4d8',
                    minWidth: '1.25rem',
                    marginTop: '0.1rem',
                  }}
                >
                  {i + 1}.
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
                  {obj}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submission requirements */}
      {task.submissionRequirements && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
            Submission Requirements
          </h4>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>
            {task.submissionRequirements}
          </p>
        </div>
      )}

      {/* Attachments */}
      {task.attachments?.length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
            Attachments & Reference Files ({task.attachments.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {task.attachments.map((att, i) => (
              <div
                key={att.id || i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--color-neutral-50)',
                  borderRadius: '0.625rem',
                  border: '1px solid var(--color-neutral-200)',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <RiFileTextLine style={{ color: '#00b4d8', fontSize: '1.125rem', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--color-neutral-800)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {att.name}
                  </span>
                  {att.size && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', flexShrink: 0 }}>
                      ({att.size})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => taskManagementService.downloadAttachment(att)}
                  style={{
                    background: '#e0f7fc',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.35rem 0.625rem',
                    cursor: 'pointer',
                    color: '#007791',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                  title="Open or download file"
                >
                  <RiDownloadLine /> Open
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const InternsTab = ({ task }) => {
  const INTERN_PROGRESS_COLORS = { reviewed: '#10b981', 'needs-revision': '#ef4444', submitted: '#3b82f6', 'in-progress': '#4f46e5', pending: '#f59e0b', 'not-started': '#94a3b8' };
  const safeAssignedInterns = Array.isArray(task?.assignedInterns) ? task.assignedInterns.filter(Boolean) : [];

  if (safeAssignedInterns.length === 0) {
    return (
      <div style={{ padding: '1.25rem 0.75rem', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>No interns assigned</p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
          Assign this task to an intern from the board or assignment modal.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {safeAssignedInterns.map((intern) => (
        <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: '#fff', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <Avatar name={intern.name || 'Intern'} src={intern.avatar} size="md" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{intern.name || 'Unnamed Intern'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ flex: 1, maxWidth: '160px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${intern.progress || 0}%`, background: (intern.progress || 0) >= 100 ? '#10b981' : '#4f46e5', borderRadius: '99px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{intern.progress ?? 0}%</span>
            </div>
          </div>
          <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: '#f1f5f9', color: INTERN_PROGRESS_COLORS[intern.submissionStatus] || '#64748b', border: `1px solid ${INTERN_PROGRESS_COLORS[intern.submissionStatus] || '#94a3b8'}30` }}>
            {intern.submissionStatus?.replace(/-/g, ' ') || 'Pending'}
          </span>
        </div>
      ))}
    </div>
  );
};

const SubmissionsTab = ({ taskId, submissions = [], isLoading }) => {
  if (isLoading) return <div style={{ padding: '1rem', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>Loading submissions...</div>;

  const safeSubmissions = Array.isArray(submissions) ? submissions.filter(Boolean) : [];

  if (safeSubmissions.length === 0) {
    return (
      <div style={{ padding: '1.25rem 0.75rem', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>No submissions yet</p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.45 }}>
          Intern work submitted against this task will appear here for review.
        </p>
      </div>
    );
  }

  const STATUS_COLORS = { submitted: '#3b82f6', reviewed: '#10b981', 'needs-revision': '#ef4444', late: '#f59e0b' };

  const formatSubDate = (d) => {
    if (!d) return '—';
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {safeSubmissions.map((sub) => (
        <div key={sub.id} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden' }}>
                <Avatar name={sub.internName || 'Intern'} src={sub.internAvatar} size="sm" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{sub.internName || 'Unnamed Intern'}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Attempt #{sub.attemptNumber || 1} · {formatSubDate(sub.submittedAt)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {sub.score !== null && sub.score !== undefined && (
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#4f46e5' }}>{sub.score}/100</span>
              )}
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: `${STATUS_COLORS[sub.status] || '#94a3b8'}15`, color: STATUS_COLORS[sub.status] || '#94a3b8', border: `1px solid ${STATUS_COLORS[sub.status] || '#94a3b8'}30` }}>
                {sub.status || 'submitted'}
              </span>
            </div>
          </div>
          {sub.submissionNote && (
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{sub.submissionNote}</p>
          )}
          {sub.feedback && (
            <div style={{ background: '#f0fdf4', borderRadius: '0.625rem', padding: '0.625rem 0.875rem', border: '1px solid #bbf7d0', marginTop: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#15803d', marginBottom: '0.25rem' }}>Supervisor Feedback:</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#166534', lineHeight: 1.5 }}>{sub.feedback}</p>
            </div>
          )}
          {Array.isArray(sub.links) && sub.links.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
              {sub.links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none', background: '#eef2ff', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                  🔗 {link.label || 'Link'}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CommentsTab = ({ taskId }) => {
  const { taskComments, loading, fetchTaskComments, addTaskComment } = useSupervisorTaskStore();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (taskId) fetchTaskComments(taskId);
  }, [taskId, fetchTaskComments]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true);
    try {
      await addTaskComment(taskId, message);
      setDraft('');
      toast.success('Comment posted.');
    } catch {
      toast.error('Could not post comment.');
    } finally {
      setSending(false);
    }
  };

  if (loading?.comments) {
    return <div style={{ padding: '1rem', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>Loading comments...</div>;
  }

  const safeComments = Array.isArray(taskComments) ? taskComments.filter(Boolean) : [];

  const formatCommentDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return isNaN(d.getTime()) ? '' : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {safeComments.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--color-neutral-50)', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-200)' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>No comments yet</p>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Start a discussion with the assigned intern.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {safeComments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Avatar name={comment.authorName || 'User'} src={comment.avatar} size="sm" />
              <div style={{ flex: 1, padding: '0.75rem 0.875rem', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)', borderRadius: '0 0.75rem 0.75rem 0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{comment.authorName || 'Supervisor'}</span>
                    {comment.authorRole && (
                      <span style={{ marginLeft: '0.4rem', fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>{comment.authorRole}</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', whiteSpace: 'nowrap' }}>
                    {formatCommentDate(comment.timestamp)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.55 }}>{comment.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)' }}>
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a comment…"
          style={{
            flex: 1,
            padding: '0.6rem 0.85rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--color-neutral-200)',
            fontSize: '0.8125rem',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#00b4d8',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: sending || !draft.trim() ? 'not-allowed' : 'pointer',
            opacity: sending || !draft.trim() ? 0.5 : 1,
          }}
          aria-label="Post comment"
        >
          <RiSendPlane2Line />
        </button>
      </form>
    </div>
  );
};

// ── Main Drawer ───────────────────────────────────────────────────────────────
const TaskDetailsDrawer = ({
  isOpen,
  task,
  onClose,
  onEdit,
  onAssign,
  onDuplicate,
  onArchive,
  submissions = [],
  isLoadingSubmissions = false,
  timeline = [],
  isLoadingTimeline = false,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { fetchSubmissions, fetchTaskTimeline } = useSupervisorTaskStore();

  useEffect(() => {
    if (isOpen && task) {
      setActiveTab('overview');
    }
  }, [isOpen, task?.id]);

  useEffect(() => {
    if (isOpen && task && activeTab === 'submissions') {
      fetchSubmissions(task.id);
    }
    if (isOpen && task && activeTab === 'timeline') {
      fetchTaskTimeline(task.id);
    }
  }, [activeTab, isOpen, task?.id]);

  if (!task) return null;

  const statusStyle = STATUS_STYLES[task.status] || STATUS_STYLES.draft;
  const priorityColor = PRIORITY_COLORS[task.priority] || '#3b82f6';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 9999, backdropFilter: 'blur(2px)' }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000,
              width: 'min(560px, 100vw)',
              background: '#fff',
              boxShadow: '-8px 0 48px rgba(0,0,0,0.16)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="complementary"
            aria-label="Task details"
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-neutral-200)',
                flexShrink: 0,
                background: '#00b4d8',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.text }}>
                      {statusStyle.label}
                    </span>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: `${priorityColor}20`, color: priorityColor, border: `1px solid ${priorityColor}50` }}>
                      {task.priority ? (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : 'Medium'} Priority
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#fff' }}>
                    {task.title || 'Untitled Task'}
                  </h2>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.125rem', flexShrink: 0 }} aria-label="Close drawer">
                  <RiCloseLine />
                </button>
              </div>

              {/* Quick meta */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RiCalendarLine /> Due {task.dueDate || 'No due date'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#fff' }}>
                  {task.assignedInterns?.length || 0} intern(s) assigned · {task.submissionCount || 0} submission(s)
                </span>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                {[
                  { label: 'Edit', icon: RiEdit2Line, onClick: () => { onEdit?.(task); onClose(); } },
                  { label: 'Assign', icon: RiUserAddLine, onClick: () => { onAssign?.(task); onClose(); } },
                  { label: 'Duplicate', icon: RiFileCopyLine, onClick: () => { onDuplicate?.(task); } },
                  { label: 'Archive', icon: RiArchiveLine, onClick: () => { onArchive?.(task); onClose(); } },
                ].map(({ label, icon: Icon, onClick }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', background: '#fff', border: 'none', color: '#00b4d8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Icon style={{ fontSize: '0.875rem', color: '#00b4d8' }} /> {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-neutral-200)', overflowX: 'auto', flexShrink: 0 }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    borderBottom: activeTab === id ? '2px solid #4f46e5' : '2px solid transparent',
                    color: activeTab === id ? '#4f46e5' : 'var(--color-neutral-500)',
                    fontWeight: activeTab === id ? 700 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon style={{ fontSize: '0.9375rem' }} /> {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === 'overview' && <OverviewTab task={task} />}
                  {activeTab === 'interns' && <InternsTab task={task} />}
                  {activeTab === 'submissions' && <SubmissionsTab taskId={task.id} submissions={submissions} isLoading={isLoadingSubmissions} />}
                  {activeTab === 'timeline' && <TaskActivityTimeline timeline={timeline} isLoading={isLoadingTimeline} />}
                  {activeTab === 'comments' && <CommentsTab taskId={task.id} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TaskDetailsDrawer;
