/**
 * @file NotificationPreferencesModal.jsx
 * @description Modal for managing notification preference toggles.
 * Uses the Switch component from the design system.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiSettings3Line, RiCheckLine } from 'react-icons/ri';
import toast from 'react-hot-toast';
import Switch from '../ui/Switch';
import { useNotificationStore } from '../../store';

// ── Preference sections ──────────────────────────────────────────────────────
const PREFERENCE_SECTIONS = [
  {
    heading: 'Notification Types',
    description: 'Choose which types of notifications you want to receive in-app.',
    items: [
      {
        key: 'taskNotifications',
        label: 'Task Notifications',
        description: 'New tasks, updates, and deadline reminders.',
      },
      {
        key: 'reviewNotifications',
        label: 'Review Notifications',
        description: 'Performance review updates and feedback.',
      },
      {
        key: 'onboardingUpdates',
        label: 'Onboarding Updates',
        description: 'Step completions, overdue alerts, and progress.',
      },
      {
        key: 'announcements',
        label: 'Announcements',
        description: 'Organization-wide announcements from HR and leadership.',
      },
      {
        key: 'reminders',
        label: 'Reminders',
        description: 'Upcoming deadlines and pending actions.',
      },
      {
        key: 'systemUpdates',
        label: 'System Updates',
        description: 'Platform updates and maintenance notifications.',
      },
    ],
  },
  {
    heading: 'Delivery Methods',
    description: 'Control how you receive notifications.',
    items: [
      {
        key: 'inAppNotifications',
        label: 'In-App Notifications',
        description: 'Show notifications inside the Trakive platform.',
      },
      {
        key: 'emailNotifications',
        label: 'Email Notifications',
        description: 'Receive notifications to your registered email address.',
      },
      {
        key: 'pushNotifications',
        label: 'Push Notifications',
        description: 'Browser push notifications (coming soon).',
        disabled: true,
      },
    ],
  },
];

/**
 * @param {object}   props
 * @param {boolean}  props.open
 * @param {function} props.onClose
 */
const NotificationPreferencesModal = ({ open, onClose }) => {
  const storePreferences = useNotificationStore((s) => s.preferences);
  const updatePreferences = useNotificationStore((s) => s.updatePreferences);
  const loadingPreferences = useNotificationStore((s) => s.loadingPreferences);

  const [localPrefs, setLocalPrefs] = useState(storePreferences);
  const [saving, setSaving] = useState(false);

  // Sync when modal opens
  useEffect(() => {
    if (open && storePreferences) {
      setLocalPrefs({ ...storePreferences });
    }
  }, [open, storePreferences]);

  const handleToggle = (key) => {
    setLocalPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(localPrefs);
      toast.success('Notification preferences saved.');
      onClose();
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 400,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Notification Preferences"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 401,
              width: '90vw',
              maxWidth: 540,
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: '1.125rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.16)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--color-neutral-100)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #f8faff, #fff)',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '0.625rem',
                  background: 'var(--color-primary-100)',
                  color: 'var(--color-primary-600)',
                  fontSize: '1.125rem',
                }}
                aria-hidden
              >
                <RiSettings3Line />
              </span>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                  Notification Preferences
                </h2>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                  Manage how and when you're notified.
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-icon"
                aria-label="Close preferences"
                style={{ fontSize: '1.125rem', color: 'var(--color-neutral-400)' }}
              >
                <RiCloseLine />
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem' }}>
              {loadingPreferences || !localPrefs ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-neutral-400)' }}>
                  Loading preferences…
                </div>
              ) : (
                PREFERENCE_SECTIONS.map((section, si) => (
                  <section key={si} style={{ marginBottom: si < PREFERENCE_SECTIONS.length - 1 ? '1.75rem' : 0 }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <h3 style={{ margin: '0 0 0.125rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-800)' }}>
                        {section.heading}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                        {section.description}
                      </p>
                    </div>

                    <div
                      style={{
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                      }}
                    >
                      {section.items.map((item, ii) => (
                        <div
                          key={item.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            padding: '0.875rem 1rem',
                            borderBottom: ii < section.items.length - 1
                              ? '1px solid var(--color-neutral-100)' : 'none',
                            opacity: item.disabled ? 0.5 : 1,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.125rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)' }}>
                              {item.label}
                              {item.disabled && (
                                <span style={{ marginLeft: '0.375rem', fontSize: '0.6875rem', color: 'var(--color-neutral-400)', fontWeight: 500 }}>
                                  (Coming soon)
                                </span>
                              )}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-neutral-500)' }}>
                              {item.description}
                            </p>
                          </div>
                          <Switch
                            checked={!!localPrefs[item.key]}
                            onChange={() => !item.disabled && handleToggle(item.key)}
                            disabled={item.disabled}
                            size="md"
                            id={`pref-${item.key}`}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--color-neutral-100)',
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                background: 'var(--color-neutral-50)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={onClose}
                className="btn btn-ghost"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={saving}
                style={{ fontSize: '0.875rem', padding: '0.5rem 1.25rem', gap: '0.375rem' }}
              >
                {saving ? 'Saving…' : <><RiCheckLine /> Save Preferences</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPreferencesModal;
