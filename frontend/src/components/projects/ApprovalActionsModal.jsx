/**
 * @file ApprovalActionsModal.jsx
 * @description Supervisor modal for approving, rejecting, or requesting changes on a project.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal, Button } from '../ui';
import { projectService } from '../../services/projectService';

const TAB_STYLE = (active) => ({
  flex: 1,
  padding: '0.55rem',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '0.4rem',
  background: active ? 'var(--color-primary-600)' : 'transparent',
  color: active ? '#fff' : 'var(--color-neutral-600)',
  transition: 'all 0.15s ease',
});

export function ApprovalActionsModal({ isOpen, onClose, project, onActionComplete }) {
  const [action, setAction] = useState('approve');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  if (!project) return null;

  const requiresFeedback = action === 'reject' || action === 'request_changes';

  const handleSubmit = async () => {
    if (requiresFeedback && !feedback.trim()) {
      return toast.error('Please provide a reason or feedback');
    }
    setLoading(true);
    try {
      if (action === 'approve') {
        await projectService.approveProject(project.id);
        toast.success('Project approved successfully!');
      } else if (action === 'reject') {
        await projectService.rejectProject(project.id, feedback);
        toast.success('Project rejected');
      } else {
        await projectService.requestChanges(project.id, feedback);
        toast.success('Changes requested — intern will be notified');
      }
      onActionComplete?.();
      onClose();
      setFeedback('');
      setAction('approve');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Project Proposal" maxWidth="500px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Project summary */}
        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-neutral-50)', borderRadius: '0.5rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-neutral-900)', margin: '0 0 0.2rem' }}>
            {project.title}
          </p>
          {project.description && (
            <p style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.5 }}>
              {project.description}
            </p>
          )}
        </div>

        {/* Action tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--color-neutral-100)', borderRadius: '0.5rem', padding: '0.25rem' }}>
          <button style={TAB_STYLE(action === 'approve')} onClick={() => setAction('approve')}>✓ Approve</button>
          <button style={TAB_STYLE(action === 'request_changes')} onClick={() => setAction('request_changes')}>⟳ Request Changes</button>
          <button style={{ ...TAB_STYLE(action === 'reject'), ...(action === 'reject' ? { background: 'var(--color-danger-600)' } : {}) }} onClick={() => setAction('reject')}>✕ Reject</button>
        </div>

        {/* Action messages */}
        {action === 'approve' && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-success-600)', margin: 0, background: 'var(--color-success-50)', padding: '0.65rem 0.9rem', borderRadius: '0.5rem' }}>
            The project will be marked as <strong>Active</strong> and the intern will be notified.
          </p>
        )}

        {/* Feedback field */}
        {requiresFeedback && (
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-neutral-700)', marginBottom: '0.4rem' }}>
              {action === 'reject' ? 'Rejection Reason' : 'Changes Required'}{' '}
              <span style={{ color: 'var(--color-danger-500)' }}>*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={action === 'reject' ? 'Explain why this project is not approved...' : 'Describe the changes needed before approval...'}
              style={{
                width: '100%', minHeight: '100px', padding: '0.65rem 0.75rem',
                border: '1px solid var(--color-neutral-200)', borderRadius: '0.5rem',
                fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box',
                background: 'var(--color-neutral-0, #fff)', color: 'var(--color-neutral-900)',
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            style={action === 'reject' ? { background: 'var(--color-danger-600)', color: '#fff' } : {}}
          >
            {action === 'approve' ? 'Approve Project' : action === 'reject' ? 'Reject Project' : 'Send Feedback'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
