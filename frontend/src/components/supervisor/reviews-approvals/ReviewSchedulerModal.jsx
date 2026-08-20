/**
 * @file ReviewSchedulerModal.jsx
 * @description Modal for scheduling a new performance review or 1-on-1 check-in.
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  RiCloseLine,
  RiCalendarCheckLine,
  RiSendPlaneLine,
  RiTimeLine,
  RiMapPinLine,
  RiLink,
  RiUserLine,
} from 'react-icons/ri';

const REVIEW_TYPES = [
  { value: 'one-on-one', label: '1-on-1 Check-in' },
  { value: 'formal-review', label: 'Formal Performance Review' },
  { value: 'skills-assessment', label: 'Skills Assessment' },
  { value: 'probation-review', label: 'Probation Review' },
];

const LOCATIONS = [
  { value: 'google-meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'microsoft-teams', label: 'Microsoft Teams' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'phone', label: 'Phone Call' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

// ── Field Wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%',
  padding: '0.5625rem 0.875rem',
  borderRadius: '0.75rem',
  border: '1.5px solid var(--color-neutral-200)',
  fontSize: '0.875rem',
  color: 'var(--color-neutral-700)',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const ReviewSchedulerModal = ({
  isOpen = false,
  formData = {},
  interns = [],
  isLoading = false,
  onClose,
  onChange,
  onSubmit,
}) => {
  const handleFieldFocus = (e) => (e.target.style.borderColor = '#4f46e5');
  const handleFieldBlur = (e) => (e.target.style.borderColor = 'var(--color-neutral-200)');

  const handleSubmit = () => {
    if (!formData.internId) { alert('Please select an intern.'); return; }
    if (!formData.scheduledAt) { alert('Please select a date and time.'); return; }
    if (!formData.title?.trim()) { alert('Please enter a review title.'); return; }
    onSubmit?.();
  };

  // Auto-fill title when intern + type changes
  const handleInternChange = (e) => {
    onChange?.('internId', e.target.value);
    const intern = interns.find((i) => i.internId === e.target.value || i.id === e.target.value);
    if (intern && !formData.title) {
      const typeLbl = REVIEW_TYPES.find((t) => t.value === (formData.type || 'one-on-one'))?.label || '1-on-1 Check-in';
      onChange?.('title', `${typeLbl} — ${intern.internName || intern.name}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(3px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(560px, calc(100vw - 2rem))',
              maxHeight: 'calc(100vh - 4rem)',
              background: '#fff',
              borderRadius: '1.25rem',
              zIndex: 301,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #f8faff, #fff)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem' }}>
                  <RiCalendarCheckLine />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--color-neutral-900)' }}>Schedule Review</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Book a 1-on-1 or formal performance review</p>
                </div>
              </div>
              <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-neutral-200)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-500)', fontSize: '1.1rem' }}>
                <RiCloseLine />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

              {/* Intern */}
              <Field label="Intern" required>
                <div style={{ position: 'relative' }}>
                  <RiUserLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
                  <select
                    value={formData.internId || ''}
                    onChange={handleInternChange}
                    style={{ ...inputStyle, paddingLeft: '2.25rem', cursor: 'pointer' }}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  >
                    <option value="">Select intern…</option>
                    {interns.map((i) => (
                      <option key={i.internId || i.id} value={i.internId || i.id}>
                        {i.internName || i.name} — {i.department || i.internDepartment}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>

              {/* Review Type */}
              <Field label="Review Type" required>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {REVIEW_TYPES.map(({ value, label }) => (
                    <motion.button
                      key={value}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onChange?.('type', value)}
                      style={{
                        padding: '0.5rem 0.875rem',
                        borderRadius: '9999px',
                        border: `1.5px solid ${formData.type === value ? '#4f46e5' : 'var(--color-neutral-200)'}`,
                        background: formData.type === value ? '#eef2ff' : '#fff',
                        color: formData.type === value ? '#4338ca' : 'var(--color-neutral-600)',
                        fontSize: '0.8125rem',
                        fontWeight: formData.type === value ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
              </Field>

              {/* Title */}
              <Field label="Review Title" required>
                <input
                  type="text"
                  placeholder="e.g. Month 2 Performance Review"
                  value={formData.title || ''}
                  onChange={(e) => onChange?.('title', e.target.value)}
                  style={inputStyle}
                  onFocus={handleFieldFocus}
                  onBlur={handleFieldBlur}
                />
              </Field>

              {/* Date & Time + Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
                <Field label="Date & Time" required>
                  <div style={{ position: 'relative' }}>
                    <RiTimeLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
                    <input
                      type="datetime-local"
                      value={formData.scheduledAt || ''}
                      onChange={(e) => onChange?.('scheduledAt', e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                    />
                  </div>
                </Field>
                <Field label="Duration">
                  <select
                    value={formData.durationMins || 30}
                    onChange={(e) => onChange?.('durationMins', Number(e.target.value))}
                    style={{ ...inputStyle, width: '100px', cursor: 'pointer' }}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Location */}
              <Field label="Location">
                <div style={{ position: 'relative' }}>
                  <RiMapPinLine style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
                  <select
                    value={formData.location || 'google-meet'}
                    onChange={(e) => onChange?.('location', e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '2.25rem', cursor: 'pointer' }}
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                  >
                    {LOCATIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </Field>

              {/* Meeting Link */}
              {['google-meet', 'zoom', 'microsoft-teams'].includes(formData.location) && (
                <Field label="Meeting Link">
                  <div style={{ position: 'relative' }}>
                    <RiLink style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
                    <input
                      type="url"
                      placeholder="https://meet.google.com/…"
                      value={formData.meetingLink || ''}
                      onChange={(e) => onChange?.('meetingLink', e.target.value)}
                      style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                    />
                  </div>
                </Field>
              )}

              {/* Notes */}
              <Field label="Agenda / Notes">
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => onChange?.('notes', e.target.value)}
                  placeholder="Topics to cover, context, or agenda items…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  onFocus={handleFieldFocus}
                  onBlur={handleFieldBlur}
                />
              </Field>
            </div>

            {/* Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-neutral-100)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={onClose} style={{ padding: '0.625rem 1rem', borderRadius: '0.75rem', border: '1.5px solid var(--color-neutral-200)', background: '#fff', color: 'var(--color-neutral-600)', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(79,70,229,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1, boxShadow: '0 4px 16px rgba(79,70,229,0.28)' }}
              >
                {isLoading ? (
                  <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <RiSendPlaneLine />
                )}
                Schedule Review
              </motion.button>
            </div>
          </motion.div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewSchedulerModal;
