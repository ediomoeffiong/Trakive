/**
 * @file SettingsPage.jsx
 * @description Main Settings & Preferences page — Day 10.
 *
 * Orchestrates all settings sections with:
 *  - Zustand state from useSettingsStore
 *  - Section-driven navigation via SettingsLayout
 *  - Animated page entrance (Framer Motion)
 *  - Skeleton loading on initial fetch
 *  - Navigation guard for unsaved changes (useBlocker)
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlocker } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useSettingsStore } from '../store/useSettingsStore';

import SettingsLayout              from '../components/settings/SettingsLayout';
import SettingsDashboard           from '../components/settings/SettingsDashboard';
import AccountSettingsForm         from '../components/settings/AccountSettingsForm';
import SecuritySettingsForm        from '../components/settings/SecuritySettingsForm';
import SessionsDevicesList         from '../components/settings/SessionsDevicesList';
import NotificationPrefsForm       from '../components/settings/NotificationPrefsForm';
import AppearanceSettingsForm      from '../components/settings/AppearanceSettingsForm';
import PrivacySettingsForm         from '../components/settings/PrivacySettingsForm';
import AccessibilitySettingsForm   from '../components/settings/AccessibilitySettingsForm';
import LanguageRegionSettingsForm  from '../components/settings/LanguageRegionSettingsForm';
import RolePreferencesForm         from '../components/settings/RolePreferencesForm';
import { SettingsFormSkeleton }    from '../components/settings/SettingsSkeletons';

// ── Section Content Router ────────────────────────────────────────────────────
const SECTION_COMPONENTS = {
  account:       AccountSettingsForm,
  security:      SecuritySettingsForm,
  sessions:      SessionsDevicesList,
  notifications: NotificationPrefsForm,
  appearance:    AppearanceSettingsForm,
  privacy:       PrivacySettingsForm,
  accessibility: AccessibilitySettingsForm,
  language:      LanguageRegionSettingsForm,
  role:          RolePreferencesForm,
};

// ── Navigation Block Modal ────────────────────────────────────────────────────
const BlockModal = ({ onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 70,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  }}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        background: 'var(--color-neutral-50)', borderRadius: '1.25rem',
        padding: '2rem', maxWidth: '400px', width: '100%',
        boxShadow: '0 24px 64px rgb(0 0 0 / 0.25)',
      }}
    >
      <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-neutral-900)',
        margin: '0 0 0.5rem', textAlign: 'center' }}>
        Unsaved Changes
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)', margin: '0 0 1.5rem', textAlign: 'center' }}>
        You have unsaved changes. If you leave now, your changes will be discarded.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: '0.625rem', borderRadius: '0.625rem',
            border: '1.5px solid var(--color-neutral-200)',
            background: 'transparent', color: 'var(--color-neutral-700)',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          }}
        >
          Stay on page
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1, padding: '0.625rem', borderRadius: '0.625rem',
            border: 'none', background: 'var(--color-danger-500)', color: '#fff',
            fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
          }}
        >
          Leave & Discard
        </button>
      </div>
    </motion.div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const {
    loading,
    activeSection,
    isDirty,
    discardChanges,
    fetchAll,
    setActiveSection,
  } = useSettingsStore();

  // ── Initial data fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navigation blocker (unsaved changes guard) ─────────────────────────────
  const blocker = useBlocker(
    useCallback(({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
    [isDirty])
  );

  const handleBlockConfirm = () => {
    discardChanges();
    blocker.proceed?.();
  };

  // ── Section navigation ─────────────────────────────────────────────────────
  const handleNavigate = (sectionId) => {
    if (isDirty && sectionId !== activeSection) {
      toast('You have unsaved changes in this section.', {
        icon: '💾',
        style: { background: '#1e293b', color: '#f1f5f9' },
      });
    }
    setActiveSection(sectionId);
  };

  // ── Render active section ──────────────────────────────────────────────────
  const renderSection = () => {
    if (activeSection === 'dashboard') {
      return <SettingsDashboard onNavigate={handleNavigate} />;
    }
    const SectionComponent = SECTION_COMPONENTS[activeSection];
    if (!SectionComponent) return null;
    if (loading) return <SettingsFormSkeleton />;
    return <SectionComponent />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* SEO-friendly page title */}
      <h1 className="sr-only">Settings & Preferences — Trakive</h1>

      <SettingsLayout
        activeSection={activeSection}
        onNavigate={handleNavigate}
      >
        {renderSection()}
      </SettingsLayout>

      {/* Navigation block modal */}
      <AnimatePresence>
        {blocker.state === 'blocked' && (
          <BlockModal
            onConfirm={handleBlockConfirm}
            onCancel={() => blocker.reset?.()}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SettingsPage;
