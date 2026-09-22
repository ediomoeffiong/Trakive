import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiEditBoxLine } from 'react-icons/ri';
import { Modal, Button } from '../../../components/ui';
import { attendanceService } from '../../../services/attendanceService';

const todayIso = () => new Date().toISOString().slice(0, 10);

const ManualAttendanceModal = ({
  isOpen,
  onClose,
  onSuccess,
  interns = [],
  selectedIntern = null,
  defaultDate = null,
}) => {
  const [internId, setInternId] = useState('');
  const [date, setDate] = useState(defaultDate || todayIso());
  const [status, setStatus] = useState('present');
  const [reason, setReason] = useState('');
  const [checkInTime, setCheckInTime] = useState('08:15');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedIntern?.intern_id) {
      setInternId(selectedIntern.intern_id);
    } else if (interns.length > 0 && !internId) {
      setInternId(interns[0].intern_id || interns[0].id);
    }
  }, [selectedIntern, interns, internId]);

  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!internId) {
      toast.error('Please select an intern.');
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Please provide a valid reason for manual adjustment (minimum 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        intern_id: internId,
        date,
        status,
        reason: reason.trim(),
      };

      // Optional check_in ISO string if status is present or late
      if ((status === 'present' || status === 'late') && checkInTime) {
        payload.check_in = new Date(`${date}T${checkInTime}:00`).toISOString();
      }

      await attendanceService.manualAttendance(payload);
      toast.success('Manual attendance adjustment recorded.');
      setReason('');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Unable to save manual attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manual Attendance Override"
      size="md"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !internId || reason.trim().length < 5}>
            <RiEditBoxLine style={{ marginRight: '0.35rem' }} />
            {submitting ? 'Saving...' : 'Record Adjustment'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-neutral-600)', lineHeight: 1.5 }}>
          Record an attendance change or override on behalf of an intern. All manual adjustments are logged in the audit trail.
        </p>

        {/* Intern Dropdown */}
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
            Select Intern
          </label>
          <select
            value={internId}
            onChange={(e) => setInternId(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-neutral-300)',
              background: '#ffffff',
              fontSize: '0.875rem',
              color: 'var(--color-neutral-900)',
              fontFamily: 'inherit',
            }}
          >
            <option value="" disabled>Select an intern...</option>
            {interns.map((i) => (
              <option key={i.intern_id || i.id} value={i.intern_id || i.id}>
                {i.first_name} {i.last_name} {i.department_name ? `(${i.department_name})` : ''} - {i.email}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
              Attendance Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                background: '#ffffff',
                fontSize: '0.875rem',
                color: 'var(--color-neutral-900)',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                background: '#ffffff',
                fontSize: '0.875rem',
                color: 'var(--color-neutral-900)',
                fontFamily: 'inherit',
              }}
            >
              <option value="present">Present (In Office)</option>
              <option value="late">Late Arrival</option>
              <option value="remote">Remote / Online</option>
              <option value="excused">Excused Absence</option>
              <option value="absent">Absent</option>
              <option value="public_holiday">Public Holiday</option>
              <option value="non_workday">Non-Workday</option>
            </select>
          </div>
        </div>

        {/* Optional Check In Time for present/late */}
        {(status === 'present' || status === 'late') && (
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', marginBottom: '0.35rem' }}>
              Recorded Check-In Time
            </label>
            <input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                background: '#ffffff',
                fontSize: '0.875rem',
                color: 'var(--color-neutral-900)',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}

        {/* Reason */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>
              Adjustment Reason
            </label>
            <span style={{ fontSize: '0.75rem', color: reason.trim().length < 5 ? 'var(--color-danger-500)' : 'var(--color-neutral-400)' }}>
              {reason.trim().length}/5 chars min
            </span>
          </div>
          <textarea
            rows={3}
            required
            placeholder="Explain why this manual adjustment is being made (e.g. Geolocation failure confirmed in office, authorized client meeting)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
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

export default ManualAttendanceModal;
