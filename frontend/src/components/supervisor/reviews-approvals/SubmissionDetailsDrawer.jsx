/**
 * @file SubmissionDetailsDrawer.jsx
 * @description Slide-over drawer showing full submission details, attached files,
 * timeline, intern profile summary, and previous submissions.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCloseLine,
  RiFileTextLine,
  RiFilePdfLine,
  RiFileImageLine,
  RiFileCodeLine,
  RiFileZipLine,
  RiFileExcel2Line,
  RiExternalLinkLine,
  RiDownloadLine,
  RiTimeLine,
  RiUserLine,
  RiCheckboxCircleLine,
  RiRefreshLine,
  RiCloseCircleLine,
  RiAlertLine,
  RiStarLine,
  RiEdit2Line,
  RiLink,
} from 'react-icons/ri';
import { DrawerDetailsSkeleton } from './ReviewSkeletonLoaders';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

const FILE_ICONS = {
  pdf: { icon: RiFilePdfLine, color: '#ef4444' },
  image: { icon: RiFileImageLine, color: '#10b981' },
  sql: { icon: RiFileCodeLine, color: '#4f46e5' },
  html: { icon: RiFileCodeLine, color: '#f59e0b' },
  json: { icon: RiFileCodeLine, color: '#06b6d4' },
  zip: { icon: RiFileZipLine, color: '#7c3aed' },
  excel: { icon: RiFileExcel2Line, color: '#059669' },
  default: { icon: RiFileTextLine, color: '#64748b' },
};

const TIMELINE_STYLES = {
  submitted: { color: '#4f46e5', bg: '#eef2ff', icon: RiTimeLine },
  approved: { color: '#10b981', bg: '#ecfdf5', icon: RiCheckboxCircleLine },
  'needs-revision': { color: '#f59e0b', bg: '#fffbeb', icon: RiRefreshLine },
  rejected: { color: '#ef4444', bg: '#fef2f2', icon: RiCloseCircleLine },
  assigned: { color: '#64748b', bg: '#f1f5f9', icon: RiUserLine },
  reviewed: { color: '#7c3aed', bg: '#f5f3ff', icon: RiEdit2Line },
  late: { color: '#ef4444', bg: '#fef2f2', icon: RiAlertLine },
};

const STATUS_CONFIG = {
  'pending-review': { label: 'Pending Review', bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  approved:         { label: 'Approved',        bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
  'needs-revision': { label: 'Needs Revision',  bg: '#eef2ff', color: '#3730a3', dot: '#4f46e5' },
  rejected:         { label: 'Rejected',         bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
};

const getInitialsBg = (initials = 'XX') => {
  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#7c3aed', '#059669'];
  return colors[initials.charCodeAt(0) % colors.length];
};

const SectionTitle = ({ children, icon: Icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
    {Icon && <Icon style={{ fontSize: '0.9rem', color: '#4f46e5' }} />}
    <h4 style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {children}
    </h4>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const SubmissionDetailsDrawer = ({
  isOpen = false,
  submission = null,
  isLoading = false,
  onClose,
  onReview,
}) => {
  const cfg = submission ? (STATUS_CONFIG[submission.status] || STATUS_CONFIG['pending-review']) : null;

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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(560px, 100vw)',
              background: '#fff',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.14)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                  Submission Details
                </h3>
                {submission && cfg && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: cfg.bg, color: cfg.color, marginTop: '0.25rem' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: cfg.dot }} />
                    {cfg.label}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {submission?.status === 'pending-review' && (
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onReview?.(submission)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <RiEdit2Line /> Write Review
                  </motion.button>
                )}
                <button onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '50%', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)', fontSize: '1.1rem' }}>
                  <RiCloseLine />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {isLoading ? (
                <DrawerDetailsSkeleton />
              ) : !submission ? null : (
                <>
                  {/* ── Intern Profile Summary ─────────────────────────────── */}
                  <div style={{ background: 'linear-gradient(135deg, #f8faff, #eef2ff)', borderRadius: '1rem', padding: '1.125rem', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #e0e7ff' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getInitialsBg(submission.internInitials), color: '#fff', fontSize: '0.9375rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}>
                      {submission.internInitials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
                        {submission.internName}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: '#4f46e5', fontWeight: 600 }}>
                        {submission.internDepartment}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <RiStarLine style={{ color: '#f59e0b', fontSize: '0.9rem' }} />
                        <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--color-neutral-800)' }}>{submission.internScore}</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>
                        {submission.internTotalSubmissions} submissions
                      </div>
                    </div>
                  </div>

                  {/* ── Task Context ──────────────────────────────────────────── */}
                  <div>
                    <SectionTitle icon={RiFileTextLine}>Related Task</SectionTitle>
                    <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-100)' }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: '0.25rem' }}>
                        {submission.taskTitle}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                        <span>{submission.taskCategory}</span>
                        {submission.taskDueDate && (
                          <span>Due: {new Date(submission.taskDueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        )}
                        <span style={{ fontWeight: 700, color: submission.isLate ? '#dc2626' : '#059669' }}>
                          {submission.isLate ? '⚠ Late submission' : '✓ On time'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Submission Note ───────────────────────────────────────── */}
                  <div>
                    <SectionTitle icon={RiFileTextLine}>Submission Notes</SectionTitle>
                    <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1rem', border: '1px solid var(--color-neutral-100)', fontSize: '0.875rem', color: 'var(--color-neutral-700)', lineHeight: 1.7 }}>
                      {submission.submissionNote || 'No notes provided.'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', marginTop: '0.375rem' }}>
                      Submitted: {fmt(submission.submittedAt)} · Attempt #{submission.attemptNumber}
                    </div>
                  </div>

                  {/* ── Links ─────────────────────────────────────────────────── */}
                  {submission.links?.length > 0 && (
                    <div>
                      <SectionTitle icon={RiLink}>Links</SectionTitle>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {submission.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.75rem', borderRadius: '0.625rem', background: '#eef2ff', color: '#4338ca', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #e0e7ff' }}
                          >
                            <RiExternalLinkLine style={{ fontSize: '0.875rem' }} /> {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Attached Files ─────────────────────────────────────────── */}
                  {submission.attachedFiles?.length > 0 && (
                    <div>
                      <SectionTitle icon={RiFileTextLine}>Attached Files</SectionTitle>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {submission.attachedFiles.map((file) => {
                          const { icon: FileIcon, color } = FILE_ICONS[file.type] || FILE_ICONS.default;
                          return (
                            <div
                              key={file.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-100)' }}
                            >
                              <FileIcon style={{ fontSize: '1.25rem', color, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {file.name}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)' }}>{file.size}</div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.08, color: '#4f46e5' }}
                                whileTap={{ scale: 0.95 }}
                                title="Download"
                                style={{ background: 'none', border: 'none', color: 'var(--color-neutral-400)', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}
                              >
                                <RiDownloadLine />
                              </motion.button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Timeline ──────────────────────────────────────────────── */}
                  {submission.timeline?.length > 0 && (
                    <div>
                      <SectionTitle icon={RiTimeLine}>Submission Timeline</SectionTitle>
                      <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
                        {/* Vertical line */}
                        <div style={{ position: 'absolute', left: '7px', top: '12px', bottom: '12px', width: '2px', background: 'var(--color-neutral-100)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {submission.timeline.map((event, idx) => {
                            const style = TIMELINE_STYLES[event.type] || TIMELINE_STYLES.assigned;
                            const Icon = style.icon;
                            return (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', position: 'relative' }}
                              >
                                {/* Dot */}
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: style.bg, border: `2px solid ${style.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'absolute', left: '-1.25rem', zIndex: 1 }}>
                                  <Icon style={{ fontSize: '0.5rem', color: style.color }} />
                                </div>
                                <div style={{ flex: 1, paddingLeft: '0.25rem' }}>
                                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
                                    {event.message}
                                  </div>
                                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-neutral-400)', marginTop: '2px' }}>
                                    {event.actor} · {fmt(event.timestamp)}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Previous Submissions ──────────────────────────────────── */}
                  {submission.previousSubmissions?.length > 0 && (
                    <div>
                      <SectionTitle>Previous Attempts</SectionTitle>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {submission.previousSubmissions.map((prev) => (
                          <div
                            key={prev.attemptNumber}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--color-neutral-100)' }}
                          >
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                              Attempt #{prev.attemptNumber} · {new Date(prev.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {prev.score && (
                                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: prev.score >= 80 ? '#059669' : '#d97706' }}>
                                  {prev.score}
                                </span>
                              )}
                              <span style={{ padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, background: prev.decision === 'approved' ? '#ecfdf5' : '#fffbeb', color: prev.decision === 'approved' ? '#065f46' : '#92400e' }}>
                                {prev.decision === 'needs-revision' ? 'Revision' : prev.decision}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmissionDetailsDrawer;
