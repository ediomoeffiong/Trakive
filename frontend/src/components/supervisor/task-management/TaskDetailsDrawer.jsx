/**
 * @file TaskDetailsDrawer.jsx
 * @description Slide-over drawer with tabbed details for a selected task:
 * Overview, Assigned Interns, Submission Monitoring, Timeline, and Comments.
 */

import { useEffect, useState } from 'react';
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
} from 'react-icons/ri';
import TaskActivityTimeline from './TaskActivityTimeline';
import { TaskDetailsSkeleton } from './TaskSkeletonLoaders';
import { useSupervisorTaskStore } from '../../../store/useSupervisorTaskStore';

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
const OverviewTab = ({ task }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    {/* Description */}
    <div>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>Description</h4>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.7 }}>{task.description}</p>
    </div>

    {/* Instructions */}
    {task.instructions && (
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>Instructions</h4>
        <div style={{ background: 'var(--color-neutral-50)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--color-neutral-200)' }}>
          <pre style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {task.instructions}
          </pre>
        </div>
      </div>
    )}

    {/* Tags */}
    {task.tags?.length > 0 && (
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RiPriceTag3Line style={{ color: '#6366f1' }} /> Tags
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {task.tags.map((tag) => (
            <span key={tag} style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', background: '#eef2ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #c7d2fe' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Submission requirements */}
    {task.submissionRequirements && (
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>Submission Requirements</h4>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-600)', lineHeight: 1.6 }}>{task.submissionRequirements}</p>
      </div>
    )}

    {/* Rubric */}
    {task.rubric?.length > 0 && (
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <RiStarLine style={{ color: '#f59e0b' }} /> Rubric
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {task.rubric.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0.625rem 0.875rem', background: '#fff', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{item.criterion}</p>
                {item.description && <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--color-neutral-500)', lineHeight: 1.4 }}>{item.description}</p>}
              </div>
              <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', background: '#fef3c7', color: '#b45309', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {item.maxScore} pts
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.25rem 0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
              Total: {task.rubric.reduce((sum, r) => sum + (r.maxScore || 0), 0)} points
            </span>
          </div>
        </div>
      </div>
    )}

    {/* Attachments */}
    {task.attachments?.length > 0 && (
      <div>
        <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>Attachments</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {task.attachments.map((att) => (
            <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: 'var(--color-neutral-50)', borderRadius: '0.625rem', border: '1px solid var(--color-neutral-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RiFileTextLine style={{ color: '#6366f1' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{att.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>{att.size}</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', display: 'flex' }} title="Download">
                <RiDownloadLine />
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const InternsTab = ({ task }) => {
  const INTERN_PROGRESS_COLORS = { reviewed: '#10b981', 'needs-revision': '#ef4444', submitted: '#3b82f6', 'in-progress': '#4f46e5', pending: '#f59e0b', 'not-started': '#94a3b8' };

  if (!task.assignedInterns || task.assignedInterns.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>
        No interns assigned to this task yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {task.assignedInterns.map((intern) => (
        <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem', background: '#fff', borderRadius: '0.875rem', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4f46e5', color: '#fff', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {intern.initials}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{intern.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ flex: 1, maxWidth: '160px', height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${intern.progress}%`, background: intern.progress >= 100 ? '#10b981' : '#4f46e5', borderRadius: '99px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-500)' }}>{intern.progress}%</span>
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
  if (submissions.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>No submissions yet.</div>;

  const STATUS_COLORS = { submitted: '#3b82f6', reviewed: '#10b981', 'needs-revision': '#ef4444', late: '#f59e0b' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {submissions.map((sub) => (
        <div key={sub.id} style={{ background: '#fff', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sub.internInitials}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>{sub.internName}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-400)' }}>Attempt #{sub.attemptNumber} · {new Date(sub.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {sub.score !== null && (
                <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#4f46e5' }}>{sub.score}/100</span>
              )}
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: `${STATUS_COLORS[sub.status] || '#94a3b8'}15`, color: STATUS_COLORS[sub.status] || '#94a3b8', border: `1px solid ${STATUS_COLORS[sub.status] || '#94a3b8'}30` }}>
                {sub.status}
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
          {sub.links?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
              {sub.links.map((link, i) => (
                <a key={i} href={link.url} style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, textDecoration: 'none', background: '#eef2ff', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                  🔗 {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const CommentsTab = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ padding: '0.875rem 1rem', background: '#faf5ff', borderRadius: '0.875rem', border: '1px solid #e9d5ff' }}>
      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6d28d9', fontWeight: 600 }}>💬 Comments are coming soon!</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#7c3aed' }}>Real-time supervisor–intern comment threads will be available in the next module update.</p>
    </div>
  </div>
);

// ── Main Drawer ───────────────────────────────────────────────────────────────
const TaskDetailsDrawer = ({
  isOpen,
  task,
  onClose,
  onEdit,
  onAssign,
  onDuplicate,
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }}
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
              zIndex: 201,
              width: 'min(560px, 95vw)',
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
                background: 'linear-gradient(135deg, #1e293b 0%, #312e81 100%)',
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
                      {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)} Priority
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {task.title}
                  </h2>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.5rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: '1.125rem', flexShrink: 0 }} aria-label="Close drawer">
                  <RiCloseLine />
                </button>
              </div>

              {/* Quick meta */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RiCalendarLine /> Due {task.dueDate}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <RiTimeLine /> {task.estimatedHours}h estimated
                </span>
                <span style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
                  {task.assignedInterns?.length || 0} intern(s) · {task.submissionCount} submission(s)
                </span>
              </div>

              {/* Quick actions */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem' }}>
                {[
                  { label: 'Edit', icon: RiEdit2Line, onClick: () => { onEdit?.(task); onClose(); } },
                  { label: 'Assign', icon: RiUserAddLine, onClick: () => { onAssign?.(task); onClose(); } },
                  { label: 'Duplicate', icon: RiFileCopyLine, onClick: () => { onDuplicate?.(task); } },
                  { label: 'Archive', icon: RiArchiveLine, onClick: () => { toast.success('Task archived.'); onClose(); } },
                ].map(({ label, icon: Icon, onClick }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onClick}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <Icon style={{ fontSize: '0.875rem' }} /> {label}
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
                  {activeTab === 'comments' && <CommentsTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailsDrawer;
