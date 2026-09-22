import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiCalendarCheckLine, RiSendPlaneLine } from 'react-icons/ri';
import { Modal, Button } from '../ui';
import { attendanceService } from '../../services/attendanceService';

const todayIso = () => new Date().toISOString().slice(0, 10);

const InternCorrectionModal = ({ isOpen, onClose, onSuccess, defaultDate }) => {
  const [date, setDate] = useState(defaultDate || todayIso());
  const [requestedStatus, setRequestedStatus] = useState('present');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Please provide a clear reason (minimum 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await attendanceService.requestCorrection({
        date,
        requested_status: requestedStatus,
        reason: reason.trim(),
      });
      toast.success('Correction request submitted for supervisor review.');
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Unable to submit correction request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Attendance Review"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || reason.trim().length < 5}>
            <RiSendPlaneLine style={{ marginRight: '0.35rem' }} />
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
          If you were present, had technical or GPS issues, or had an authorized reason for being excused/remote, submit this request for your supervisor to review.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={todayIso()}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                background: '#fff',
                fontSize: '0.875rem',
                color: 'var(--color-neutral-900)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.375rem' }}>
              Requested Attendance Status
            </label>
            <select
              value={requestedStatus}
              onChange={(e) => setRequestedStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                background: '#fff',
                fontSize: '0.875rem',
                color: 'var(--color-neutral-900)',
                fontFamily: 'inherit',
              }}
            >
              <option value="present">Present (In Office)</option>
              <option value="late">Late Arrival</option>
              <option value="remote">Remote / Online</option>
              <option value="excused">Excused Absence</option>
            </select>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
              Reason & Context
            </label>
            <span style={{ fontSize: '0.75rem', color: reason.trim().length < 5 ? 'var(--color-danger-500)' : 'var(--color-neutral-400)' }}>
              {reason.trim().length}/5 chars min
            </span>
          </div>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you could not check in normally (e.g. Geolocation error, device GPS issue, arrived on time at HQ, authorized field work)..."
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-neutral-300)',
              background: '#fff',
              fontSize: '0.875rem',
              color: 'var(--color-neutral-900)',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.625rem',
          padding: '0.75rem 1rem',
          borderRadius: '0.625rem',
          background: 'var(--color-primary-50)',
          border: '1px solid var(--color-primary-200)',
        }}>
          <RiCalendarCheckLine style={{ color: 'var(--color-primary-600)', fontSize: '1.25rem', marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-primary-800)', lineHeight: 1.45 }}>
            Your supervisor will be notified immediately. Once reviewed and approved, your attendance percentage and history will automatically update.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default InternCorrectionModal;
