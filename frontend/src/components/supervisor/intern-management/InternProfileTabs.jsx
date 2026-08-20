/**
 * @file InternProfileTabs.jsx
 * @description Horizontally scrollable tab navigation for the Intern Profile page.
 * Tabs: Overview | Tasks | Performance | Onboarding | Documents | Activity | Notes
 */

import { motion } from 'framer-motion';
import {
  RiLayoutGridLine,
  RiTaskLine,
  RiBarChartLine,
  RiCheckboxMultipleLine,
  RiFileTextLine,
  RiHistoryLine,
  RiStickyNoteLine,
} from 'react-icons/ri';

export const PROFILE_TABS = [
  { id: 'overview',    label: 'Overview',    icon: RiLayoutGridLine },
  { id: 'tasks',       label: 'Tasks',       icon: RiTaskLine },
  { id: 'performance', label: 'Performance', icon: RiBarChartLine },
  { id: 'onboarding',  label: 'Onboarding',  icon: RiCheckboxMultipleLine },
  { id: 'documents',   label: 'Documents',   icon: RiFileTextLine },
  { id: 'activity',    label: 'Activity',    icon: RiHistoryLine },
  { id: 'notes',       label: 'Notes',       icon: RiStickyNoteLine },
];

const InternProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid var(--color-neutral-200)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        padding: '0 0.5rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          alignItems: 'center',
          minWidth: 'max-content',
        }}
        role="tablist"
        aria-label="Intern profile sections"
      >
        {PROFILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem 1.125rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid var(--color-primary-600)'
                  : '2px solid transparent',
                color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                position: 'relative',
              }}
            >
              <Icon style={{ fontSize: '1.05rem', flexShrink: 0 }} />
              {tab.label}

              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  style={{
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'var(--color-primary-600)',
                    borderRadius: '2px 2px 0 0',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default InternProfileTabs;
