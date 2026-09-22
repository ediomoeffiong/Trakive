import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiCheckDoubleLine, RiCloseCircleLine } from 'react-icons/ri';
import { Modal, Button } from '../../../components/ui';
import { attendanceService } from '../../../services/attendanceService';

const ReviewCorrectionModal = ({
  isOpen,
  onClose,
  onSuccess,
  request = null,
  action = 'approved',
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isApproval = action === 'approved';

  useEffect(() => {
    if (isApproval) {
      setReason('Approved by supervisor');
    } else {
      setReason('');
    }
  }, [isApproval, request]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!request?.id) return;
    if (!isApproval && (!reason.trim() || reason.trim().length < 3)) {
      toast.error('Please provide a reason for rejecting the correction request.');
      return;
    }

    setSubmitting(true);
    try {
      await attendanceService.reviewCorrection(request.id, {
        status: action,
        reason: reason.trim() || (isApproval ? 'Approved by supervisor' : 'Rejected by supervisor'),
      });
      toast.success(`Correction request ${action}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Unable to review correction request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isApproval ? 'Approve Attendance Correction' : 'Reject Attendance Correction'}
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (!isApproval && reason.trim().length < 3)}
            style={{
              background: isApproval ? 'var(--color-success-600)' : 'var(--color-danger-600)',
              color: '#ffffff',
            }}
          >
            {isApproval ? (
              <RiCheckDoubleLine style={{ marginRight: '0.35rem' }} />
            ) : (
              <RiCloseCircleLine style={{ marginRight: '0.35rem' }} />
            )}
            {submitting ? 'Submitting...' : isApproval ? 'Confirm Approval' : 'Confirm Rejection'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Request Context Card */}
        <div style={{
          background: 'var(--color-neutral-50)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: '0.625rem',
          padding: '0.875rem 1rem',
          display: 'grid',
          gap: '0.4rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '0.9rem', color: 'var(--color-neutral-900)' }}>
              {request.first_name} {request.last_name}
            </strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>
              {new Date(request.date).toLocaleDateString()}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
            Requested Status: <strong style={{ color: 'var(--color-neutral-800)', textTransform: 'capitalize' }}>{request.requested_status}</strong>
          </p>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-neutral-700)', lineHeight: 1.45 }}>
            <strong>Intern's Note:</strong> {request.reason}
          </p>
        </div>

        {/* Supervisor Remark */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
            {isApproval ? 'Supervisor Note (Optional)' : 'Rejection Reason / Feedback (Required)'}
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={isApproval ? 'Add an optional note to the intern...' : 'Explain why this request is being rejected so the intern understands...'}
            required={!isApproval}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-neutral-300)',
              background: '#ffffff',
              fontSize: '0.875rem',
              color: 'var(--color-neutral-900)',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ReviewCorrectionModal;
