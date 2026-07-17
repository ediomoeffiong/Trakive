/**
 * @file TaskDetails.jsx
 * @description Completely redesigned premium Task Details page for Trakive.
 * Layout: sticky header + two-column (main content + action sidebar).
 * Features: description, objectives, resources, submission history, upload zone, comments.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiAttachment2,
  RiUploadCloud2Line,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
  RiMessage2Line,
  RiHistoryLine,
  RiFilePdfLine,
  RiFileExcelLine,
  RiFilePptLine,
  RiFileWordLine,
  RiFileImageLine,
  RiSendPlane2Line,
  RiFolderDownloadLine,
  RiAlarmWarningLine,
  RiCheckLine,
} from 'react-icons/ri';

import { useTaskStore } from '../store';
import {
  Badge, Button, ProgressBar, Breadcrumb,
  EmptyState, Skeleton, Avatar, Alert,
} from '../components/ui';
import { ROUTES } from '../constants';

// ─── Design tokens ────────────────────────────────────────────────────────────

const PRIORITY_META = {
  urgent: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Urgent'  },
  high:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'High'    },
  medium: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Medium'  },
  low:    { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Low'     },
};

const STATUS_META = {
  'assigned':       { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Assigned'       },
  'in-progress':    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'In Progress'    },
  'submitted':      { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Submitted'      },
  'under-review':   { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', label: 'Under Review'  },
  'completed':      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed'      },
  'needs-revision': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Needs Revision' },
};

const WORKFLOW_STEPS = [
  { key: 'assigned',     label: 'Assigned'     },
  { key: 'in-progress',  label: 'In Progress'  },
  { key: 'under-review', label: 'Under Review' },
  { key: 'completed',    label: 'Completed'    },
];

const STATUS_ORDER = ['assigned', 'in-progress', 'submitted', 'under-review', 'completed', 'needs-revision'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFileIcon(type) {
  switch ((type ?? '').toLowerCase()) {
    case 'pdf':  return <RiFilePdfLine  style={{ color: '#ef4444', fontSize: '1.5rem' }} />;
    case 'xlsx': case 'xls': return <RiFileExcelLine style={{ color: '#16a34a', fontSize: '1.5rem' }} />;
    case 'pptx': case 'ppt': return <RiFilePptLine   style={{ color: '#f97316', fontSize: '1.5rem' }} />;
    case 'docx': case 'doc': return <RiFileWordLine   style={{ color: '#2563eb', fontSize: '1.5rem' }} />;
    case 'png':  case 'jpg': case 'jpeg': return <RiFileImageLine style={{ color: '#8b5cf6', fontSize: '1.5rem' }} />;
    default: return <RiFileTextLine style={{ color: '#94a3b8', fontSize: '1.5rem' }} />;
  }
}

function MetaChip({ label, value, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '0.25rem',
      padding: '0.75rem 1rem',
      background: 'var(--color-neutral-50)',
      border: '1px solid var(--color-neutral-100)',
      borderRadius: '0.875rem',
    }}>
      <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-800)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        {Icon && <Icon style={{ fontSize: '0.875rem', color: 'var(--color-neutral-400)' }} />}
        {value ?? '—'}
      </span>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Skeleton width="200px" height="20px" />
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[120, 180, 120].map((h, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '1rem', padding: '1.75rem', border: '1px solid var(--color-neutral-100)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton width="40%" height="1.25rem" />
              <Skeleton width="100%" height={`${h}px`} />
            </div>
          ))}
        </div>
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[180, 200].map((h, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--color-neutral-100)' }}>
              <Skeleton width="100%" height={`${h}px`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: '#fff', borderRadius: '1rem',
        border: '1px solid var(--color-neutral-100)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}
    >
      {accent && <div style={{ height: '3px', background: accent }} />}
      <div style={{ padding: '1.5rem' }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {Icon && <Icon style={{ fontSize: '1.1rem', color: accent ?? 'var(--color-neutral-400)' }} />}
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const {
    currentTask, loadingTaskDetails, updatingStatus, submittingDeliverable, addingComment,
    fetchTaskDetails, updateTaskStatus, submitDeliverable, addComment,
  } = useTaskStore();

  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [objectives, setObjectives] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails(taskId);
      setUploadFile(null); setUploadSuccess(false); setUploadError(null); setUploadProgress(0);
    }
  }, [taskId, fetchTaskDetails]);

  useEffect(() => {
    if (currentTask?.objectives) setObjectives(currentTask.objectives);
  }, [currentTask]);

  const handleToggleObjective = useCallback(objId => {
    setObjectives(prev => prev.map(o => o.id === objId ? { ...o, checked: !o.checked } : o));
  }, []);

  const handleStartTask  = () => updateTaskStatus(currentTask.id, 'in-progress');
  const handleReview     = () => updateTaskStatus(currentTask.id, 'under-review');
  const handleResumeWork = () => updateTaskStatus(currentTask.id, 'in-progress');

  // Drag-and-drop upload
  const handleDrag = e => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFile = file => {
    setUploadError(null); setUploadSuccess(false);
    if (file.size > 10 * 1024 * 1024) { setUploadError('File exceeds 10 MB limit.'); return; }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','docx','xlsx','pptx','png','jpg','jpeg'].includes(ext)) {
      setUploadError('Unsupported file type. Use PDF, DOCX, XLSX, PPTX, or image.'); return;
    }
    setUploadFile(file);
    setUploadProgress(0);
    const iv = setInterval(() => {
      setUploadProgress(p => { if (p >= 90) { clearInterval(iv); return 90; } return p + 15; });
    }, 150);
    submitDeliverable(currentTask.id, { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' })
      .then(() => { clearInterval(iv); setUploadProgress(100); setUploadSuccess(true); setTimeout(() => { setUploadFile(null); setUploadSuccess(false); }, 3500); })
      .catch(() => { clearInterval(iv); setUploadError('Upload failed. Please try again.'); });
  };

  const handleDrop = e => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  const handleFileSelect = e => { if (e.target.files[0]) processFile(e.target.files[0]); };

  const handlePostComment = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(currentTask.id, commentText);
    setCommentText('');
  };

  // ─── Loading & error states ────────────────────────────────────────────────
  if (loadingTaskDetails) return <DetailSkeleton />;

  if (!currentTask) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem' }}>
      <EmptyState
        title="Task not found"
        description="This task doesn't exist or was removed."
        action={<Button onClick={() => navigate(ROUTES.TASKS)}>Back to Tasks</Button>}
      />
    </div>
  );

  const sm = STATUS_META[currentTask.status] ?? STATUS_META.assigned;
  const pm = PRIORITY_META[currentTask.priority] ?? PRIORITY_META.low;
  const isOverdue = !currentTask.completedAt && currentTask.remainingDays < 0;
  const doneObj = objectives.filter(o => o.checked).length;
  const totalObj = objectives.length;

  const currentStepIndex = STATUS_ORDER.indexOf(currentTask.status);
  const workflowStepIndex = step => STATUS_ORDER.indexOf(step.key);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem' }}>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <Breadcrumb items={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Tasks', to: ROUTES.TASKS },
          { label: currentTask.title },
        ]} />
        <button
          onClick={() => navigate(ROUTES.TASKS)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-500)',
            padding: '0.25rem 0', alignSelf: 'flex-start', transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-neutral-800)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-neutral-500)'}
        >
          <RiArrowLeftLine /> Back to Task Runway
        </button>
      </div>

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: '#fff', borderRadius: '1.125rem',
          border: '1px solid var(--color-neutral-100)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Priority accent bar */}
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${pm.color}, ${pm.color}66)` }} />

        <div style={{ padding: '1.75rem 2rem' }}>
          {/* Top badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: '#64748b', background: 'var(--color-neutral-100)', padding: '0.2rem 0.625rem', borderRadius: '99px',
            }}>
              {currentTask.category}
            </span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: pm.color, background: pm.bg, border: `1px solid ${pm.border}`,
              padding: '0.2rem 0.625rem', borderRadius: '99px',
            }}>
              {pm.label} Priority
            </span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              color: sm.color, background: sm.bg, border: `1px solid ${sm.border}`,
              padding: '0.2rem 0.625rem', borderRadius: '99px',
            }}>
              {sm.label}
            </span>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)', margin: '0 0 0.5rem', lineHeight: 1.25 }}>
            {currentTask.title}
          </h1>

          {/* Deadline alert */}
          {isOverdue && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '0.75rem', marginTop: '1rem',
            }}>
              <RiAlarmWarningLine style={{ color: '#dc2626', fontSize: '1.1rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
                This task was due on {currentTask.dueDate}. Please upload your deliverable or contact your supervisor.
              </span>
            </div>
          )}
          {!isOverdue && currentTask.remainingDays <= 1 && !currentTask.completedAt && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.75rem 1rem', background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: '0.75rem', marginTop: '1rem',
            }}>
              <RiAlarmWarningLine style={{ color: '#d97706', fontSize: '1.1rem', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#d97706' }}>
                Deadline approaching — due {currentTask.remainingDays === 0 ? 'today' : 'tomorrow'} ({currentTask.dueDate}).
              </span>
            </div>
          )}

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
            <MetaChip label="Assigned" value={currentTask.assignedDate} icon={RiCalendarEventLine} />
            <MetaChip label="Due Date" value={currentTask.dueDate} icon={RiCalendarEventLine} />
            <MetaChip label="Est. Time" value={currentTask.estimatedTime} icon={RiTimeLine} />
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
              padding: '0.75rem 1rem',
              background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
              borderRadius: '0.875rem',
            }}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Supervisor</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                <Avatar src={currentTask.supervisor?.avatar} name={currentTask.supervisor?.name} size="xs" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                  {currentTask.supervisor?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main 2-column layout ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* ── Left Column ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Description */}
          <Section title="Description" accent="#6366f1">
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>
              {currentTask.fullDescription || currentTask.description}
            </p>
          </Section>

          {/* Objectives */}
          {totalObj > 0 && (
            <Section title="Task Objectives" icon={RiCheckboxCircleLine} accent="#10b981">
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-500)' }}>
                    {doneObj}/{totalObj} completed
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: doneObj === totalObj ? '#16a34a' : 'var(--color-neutral-400)' }}>
                    {totalObj > 0 ? Math.round((doneObj / totalObj) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar value={totalObj > 0 ? Math.round((doneObj / totalObj) * 100) : 0} variant="success" size="sm" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {objectives.map(obj => (
                  <motion.div
                    key={obj.id}
                    onClick={() => handleToggleObjective(obj.id)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1rem',
                      background: obj.checked ? '#f0fdf4' : '#fff',
                      border: `1px solid ${obj.checked ? '#bbf7d0' : 'var(--color-neutral-200)'}`,
                      borderRadius: '0.75rem', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {obj.checked
                      ? <RiCheckboxCircleLine style={{ color: '#16a34a', fontSize: '1.25rem', flexShrink: 0 }} />
                      : <RiCheckboxBlankCircleLine style={{ color: '#cbd5e1', fontSize: '1.25rem', flexShrink: 0 }} />
                    }
                    <span style={{
                      fontSize: '0.875rem', fontWeight: 500, flex: 1,
                      color: obj.checked ? 'var(--color-neutral-400)' : 'var(--color-neutral-800)',
                      textDecoration: obj.checked ? 'line-through' : 'none',
                    }}>
                      {obj.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Reference Resources */}
          <Section title="Reference Resources" icon={RiAttachment2} accent="#f59e0b">
            {(!currentTask.attachments || currentTask.attachments.length === 0) ? (
              <EmptyState
                icon={<RiAttachment2 />}
                title="No attachments"
                description="No reference docs have been uploaded for this task."
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {currentTask.attachments.map(file => (
                  <div key={file.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
                    borderRadius: '0.875rem', transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-neutral-200)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-neutral-100)'}
                  >
                    <div style={{ flexShrink: 0 }}>{getFileIcon(file.type)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-neutral-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', marginTop: '0.15rem' }}>
                        {file.size}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Mock download: ${file.name}`)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '0.5rem', flexShrink: 0,
                        background: '#fff', border: '1px solid var(--color-neutral-200)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: 'var(--color-neutral-500)', fontSize: '0.95rem',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = 'var(--color-neutral-500)'; }}
                    >
                      <RiFolderDownloadLine />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Submission History */}
          <Section title="Submission History" icon={RiHistoryLine} accent="#8b5cf6">
            {(!currentTask.submissions || currentTask.submissions.length === 0) ? (
              <EmptyState
                icon={<RiHistoryLine />}
                title="No submissions yet"
                description="Upload a deliverable to start tracking your submission history."
              />
            ) : (
              <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-neutral-100)' }}>
                {currentTask.submissions.map((sub, i) => {
                  const isApproved = sub.status === 'completed';
                  const isRevision = sub.status === 'needs-revision';
                  const dotColor = isApproved ? '#16a34a' : isRevision ? '#dc2626' : '#d97706';
                  return (
                    <div key={sub.id} style={{ position: 'relative', marginBottom: i < currentTask.submissions.length - 1 ? '1.75rem' : 0 }}>
                      {/* Timeline dot */}
                      <div style={{
                        position: 'absolute', left: '-1.875rem', top: '0.125rem',
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: dotColor, border: `2px solid #fff`,
                        boxShadow: `0 0 0 2px ${dotColor}44`,
                      }} />

                      {/* File block */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                          {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' '}at {new Date(sub.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{
                          fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                          color: isApproved ? '#16a34a' : isRevision ? '#dc2626' : '#d97706',
                          background: isApproved ? '#f0fdf4' : isRevision ? '#fef2f2' : '#fffbeb',
                          border: `1px solid ${isApproved ? '#bbf7d0' : isRevision ? '#fecaca' : '#fde68a'}`,
                          padding: '0.15rem 0.5rem', borderRadius: '99px',
                        }}>
                          {sub.status.replace('-', ' ')}
                        </span>
                      </div>

                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.875rem',
                        background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
                        borderRadius: '0.625rem', marginBottom: sub.feedback ? '0.625rem' : 0,
                      }}>
                        <RiFileTextLine style={{ color: 'var(--color-neutral-400)', fontSize: '1rem' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>{sub.fileName}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>({sub.fileSize})</span>
                      </div>

                      {sub.feedback && (
                        <div style={{
                          padding: '0.875rem 1rem',
                          background: 'var(--color-neutral-50)',
                          borderLeft: '3px solid #6366f1',
                          borderRadius: '0 0.625rem 0.625rem 0',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{sub.feedbackAuthor}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>
                              {new Date(sub.feedbackDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                            "{sub.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

        </div>

        {/* ── Right Sidebar ────────────────────────────────────────────── */}
        <div style={{
          width: '280px', flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: '1.25rem',
          position: 'sticky', top: '88px', alignSelf: 'flex-start',
        }}>

          {/* Workflow Status */}
          <div style={{
            background: '#fff', borderRadius: '1rem',
            border: '1px solid var(--color-neutral-100)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            padding: '1.25rem',
          }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.25rem' }}>
              Workflow Status
            </h3>

            {/* Step track */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {WORKFLOW_STEPS.map((step, i) => {
                const stepOrder = workflowStepIndex(step);
                const isDone = currentStepIndex > stepOrder || (currentTask.status === 'needs-revision' && stepOrder < 2);
                const isActive = currentTask.status === step.key || (currentTask.status === 'needs-revision' && step.key === 'in-progress');
                const isLast = i === WORKFLOW_STEPS.length - 1;
                return (
                  <div key={step.key} style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
                    {/* Icon + connector */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '28px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: isDone ? '#16a34a' : isActive ? sm.bg : 'var(--color-neutral-50)',
                        border: `2px solid ${isDone ? '#16a34a' : isActive ? sm.color : 'var(--color-neutral-200)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isDone ? '#fff' : isActive ? sm.color : 'var(--color-neutral-300)',
                        fontSize: '0.875rem', transition: 'all 0.2s',
                        boxShadow: isActive ? `0 0 0 3px ${sm.color}22` : 'none',
                      }}>
                        {isDone ? <RiCheckLine /> : i + 1}
                      </div>
                      {!isLast && (
                        <div style={{
                          width: '2px', flex: 1, minHeight: '24px',
                          background: isDone ? '#16a34a' : 'var(--color-neutral-100)',
                          margin: '2px 0',
                        }} />
                      )}
                    </div>

                    {/* Label */}
                    <div style={{ paddingBottom: isLast ? 0 : '1rem', paddingTop: '0.25rem', flex: 1 }}>
                      <span style={{
                        fontSize: '0.8125rem', fontWeight: isActive ? 700 : 600,
                        color: isActive ? sm.color : isDone ? 'var(--color-neutral-700)' : 'var(--color-neutral-400)',
                      }}>
                        {step.label}
                        {isActive && currentTask.status === 'needs-revision' && (
                          <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#dc2626', marginLeft: '0.375rem', textTransform: 'uppercase' }}>
                            (Revision)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-100)' }}>
              {currentTask.status === 'assigned' && (
                <Button fullWidth loading={updatingStatus} onClick={handleStartTask}>
                  Start Working
                </Button>
              )}
              {currentTask.status === 'in-progress' && (
                <Button fullWidth variant="outline" loading={updatingStatus} onClick={handleReview}>
                  Submit for Review
                </Button>
              )}
              {currentTask.status === 'needs-revision' && (
                <Button fullWidth loading={updatingStatus} onClick={handleResumeWork}>
                  Resume Work
                </Button>
              )}
              {currentTask.status === 'completed' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center',
                  padding: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '0.75rem',
                }}>
                  <RiCheckboxCircleLine style={{ color: '#16a34a', fontSize: '1.1rem' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>Completed & Approved</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Deliverable */}
          {currentTask.status !== 'completed' && (
            <div style={{
              background: '#fff', borderRadius: '1rem',
              border: '1px solid var(--color-neutral-100)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              padding: '1.25rem',
            }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>
                Upload Deliverable
              </h3>

              <div
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#6366f1' : 'var(--color-neutral-200)'}`,
                  borderRadius: '0.875rem', padding: '1.5rem 1rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  background: dragActive ? '#eef2ff' : 'var(--color-neutral-50)',
                  cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center',
                }}
              >
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg" />
                <RiUploadCloud2Line style={{ fontSize: '2rem', color: dragActive ? '#6366f1' : 'var(--color-neutral-400)' }} />
                <div>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-neutral-700)', margin: '0 0 0.2rem' }}>
                    Drop file or click to upload
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-neutral-400)', margin: 0 }}>
                    PDF, DOCX, XLSX, PPTX, PNG, JPG · Max 10 MB
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {uploadFile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)', borderRadius: '0.75rem' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {uploadFile.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-600)' }}>{uploadProgress}%</span>
                    </div>
                    <ProgressBar value={uploadProgress} variant={uploadSuccess ? 'success' : 'primary'} size="xs" />
                    {uploadSuccess && (
                      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', marginTop: '0.375rem', margin: '0.375rem 0 0' }}>
                        ✓ Uploaded successfully!
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {uploadError && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.625rem 0.75rem',
                  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.625rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <RiAlarmWarningLine style={{ color: '#dc2626', fontSize: '0.9rem', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* Discussion */}
          <div style={{
            background: '#fff', borderRadius: '1rem',
            border: '1px solid var(--color-neutral-100)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            padding: '1.25rem',
            display: 'flex', flexDirection: 'column', gap: '1rem',
            maxHeight: '420px',
          }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <RiMessage2Line style={{ color: '#6366f1', fontSize: '0.9rem' }} /> Discussion
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(!currentTask.comments || currentTask.comments.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', margin: 0 }}>No messages yet</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-300)', margin: '0.25rem 0 0' }}>Ask your supervisor a question below.</p>
                </div>
              ) : currentTask.comments.map(comm => (
                <div key={comm.id} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <Avatar src={comm.avatar} name={comm.authorName} size="sm" />
                  <div style={{
                    flex: 1, padding: '0.625rem 0.875rem',
                    background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
                    borderRadius: '0 0.75rem 0.75rem 0.75rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>{comm.authorName}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-neutral-400)' }}>
                        {new Date(comm.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-neutral-600)', lineHeight: 1.55, margin: 0 }}>
                      {comm.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-neutral-100)' }}>
              <input
                type="text"
                placeholder="Ask a question…"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                style={{
                  flex: 1, padding: '0.5rem 0.75rem',
                  background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-200)',
                  borderRadius: '0.625rem', fontSize: '0.78rem', fontWeight: 500,
                  color: 'var(--color-neutral-800)', outline: 'none',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'var(--color-neutral-200)'}
              />
              <button
                type="submit"
                disabled={addingComment || !commentText.trim()}
                style={{
                  width: '36px', height: '36px', borderRadius: '0.625rem', flexShrink: 0,
                  background: 'var(--color-neutral-900)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', fontSize: '0.95rem',
                  opacity: addingComment || !commentText.trim() ? 0.5 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <RiSendPlane2Line />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
