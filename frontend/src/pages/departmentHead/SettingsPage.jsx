/**
 * @file SettingsPage.jsx (Department Head)
 * @description Department Head — Portal Settings page.
 * Reuses the shared SettingsLayout and all settings section components
 * with the department-head role context passed through.
 */

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlocker } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useSettingsStore } from '../../store/useSettingsStore';

import SettingsLayout             from '../../components/settings/SettingsLayout';
import SettingsDashboard          from '../../components/settings/SettingsDashboard';
import AccountSettingsForm        from '../../components/settings/AccountSettingsForm';
import SecuritySettingsForm       from '../../components/settings/SecuritySettingsForm';
import SessionsDevicesList        from '../../components/settings/SessionsDevicesList';
import NotificationPrefsForm      from '../../components/settings/NotificationPrefsForm';
import AppearanceSettingsForm     from '../../components/settings/AppearanceSettingsForm';
import PrivacySettingsForm        from '../../components/settings/PrivacySettingsForm';
import AccessibilitySettingsForm  from '../../components/settings/AccessibilitySettingsForm';
import LanguageRegionSettingsForm from '../../components/settings/LanguageRegionSettingsForm';
import RolePreferencesForm        from '../../components/settings/RolePreferencesForm';
import { SettingsFormSkeleton }   from '../../components/settings/SettingsSkeletons';

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

const SettingsPage = () => {
  const {
    activeSection, setActiveSection,
    loading, hasUnsavedChanges, setHasUnsavedChanges,
    fetchAll,
  } = useSettingsStore();

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Warn on navigation away from unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  const handleBlockedNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      const confirm = window.confirm('You have unsaved changes. Leave without saving?');
      if (confirm) {
        setHasUnsavedChanges(false);
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker, setHasUnsavedChanges]);

  useEffect(() => {
    if (blocker.state === 'blocked') handleBlockedNavigation();
  }, [blocker.state, handleBlockedNavigation]);

  const ActiveComponent = SECTION_COMPONENTS[activeSection] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className="sr-only">Portal Settings — Department Head — Trakive</h1>

      <SettingsLayout activeSection={activeSection} onSectionChange={setActiveSection}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {loading.settings ? (
              <SettingsFormSkeleton />
            ) : activeSection === 'dashboard' ? (
              <SettingsDashboard onNavigate={setActiveSection} />
            ) : ActiveComponent ? (
              <ActiveComponent />
            ) : (
              <SettingsDashboard onNavigate={setActiveSection} />
            )}
          </motion.div>
        </AnimatePresence>
      </SettingsLayout>
    </motion.div>
  );
};

export default SettingsPage;
