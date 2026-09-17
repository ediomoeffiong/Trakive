import { useState } from 'react';
import { Modal, Button } from '../ui';
import { attendanceService } from '../../services/attendanceService';
import { attendanceErrorMessage } from '../../utils/attendanceGeo';
import toast from 'react-hot-toast';

const CorrectionRequestModal = ({ isOpen, onClose, date, locationState, onSubmitted }) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await attendanceService.requestCorrection({
        date,
        reason,
        location_state: locationState || 'manual',
      });
      toast.success('Review request sent to your supervisor');
      setReason('');
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(attendanceErrorMessage(err, 'Could not submit request'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request attendance review"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={reason.trim().length < 8}>
            Submit request
          </Button>
        </>
      )}
    >
      <p style={{ marginTop: 0, color: 'var(--color-neutral-600)', fontSize: '0.9rem' }}>
        Use this when GPS failed, permission was denied, or you were legitimately at work but
        could not be verified. Your supervisor will review the request.
      </p>
      <label htmlFor="attendance-reason" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
        Reason
      </label>
      <textarea
        id="attendance-reason"
        className="input-field"
        rows={4}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Explain what happened (minimum 8 characters)"
        style={{ width: '100%', minHeight: '6rem', resize: 'vertical' }}
      />
    </Modal>
  );
};

export default CorrectionRequestModal;
