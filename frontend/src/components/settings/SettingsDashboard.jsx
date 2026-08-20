/**
 * @file SettingsDashboard.jsx
 * @description Settings home page showing all category cards and a preferences summary panel.
 */

import { motion } from 'framer-motion';
import {
  RiUserSettingsLine, RiShieldCheckLine, RiBellLine, RiPaletteLine,
  RiShieldUserLine, RiEyeLine, RiTranslate2, RiComputerLine,
  RiSettings4Line, RiArrowRightLine, RiCheckboxCircleLine, RiTimeLine,
  RiGlobalLine,
} from 'react-icons/ri';
import { useSettingsStore }  from '../../store/useSettingsStore';
import { useAppStore }       from '../../store/useAppStore';
import { SettingsDashboardSkeleton } from './SettingsSkeletons';

// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id:          'account',
    label:       'Account',
    description: 'Update name, username, email, and phone number',
    icon:        RiUserSettingsLine,
    color:       { bg: '#eff6ff', text: '#2563eb' },
  },
  {
    id:          'security',
    label:       'Security',
    description: 'Password, two-factor authentication, and login activity',
    icon:        RiShieldCheckLine,
    color:       { bg: '#fef2f2', text: '#dc2626' },
  },
  {
    id:          'sessions',
    label:       'Sessions & Devices',
    description: 'Manage active sessions and connected devices',
    icon:        RiComputerLine,
    color:       { bg: '#f0fdf4', text: '#16a34a' },
  },
  {
    id:          'notifications',
    label:       'Notifications',
    description: 'Configure how and when you receive alerts',
    icon:        RiBellLine,
    color:       { bg: '#fefce8', text: '#ca8a04' },
  },
  {
    id:          'appearance',
    label:       'Appearance',
    description: 'Theme, layout density, and sidebar behavior',
    icon:        RiPaletteLine,
    color:       { bg: '#fdf4ff', text: '#9333ea' },
  },
  {
    id:          'privacy',
    label:       'Privacy',
    description: 'Profile visibility, data sharing, and activity controls',
    icon:        RiShieldUserLine,
    color:       { bg: '#fff7ed', text: '#ea580c' },
  },
  {
    id:          'accessibility',
    label:       'Accessibility',
    description: 'Text size, motion, focus, and high contrast options',
    icon:        RiEyeLine,
    color:       { bg: '#ecfdf5', text: '#059669' },
  },
  {
    id:          'language',
    label:       'Language & Region',
    description: 'Language, date format, timezone, and currency',
    icon:        RiTranslate2,
    color:       { bg: '#f0f9ff', text: '#0284c7' },
  },
  {
    id:          'role',
    label:       'Role Preferences',
    description: 'Settings tailored to your role and responsibilities',
    icon:        RiSettings4Line,
    color:       { bg: '#f8fafc', text: '#475569' },
  },
];

// ── Category Card ─────────────────────────────────────────────────────────────
const CategoryCard = ({ category, onClick }) => {
  const Icon = category.icon;
  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgb(0 0 0 / 0.10)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(category.id)}
      id={`settings-category-${category.id}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        padding: '1.25rem', borderRadius: '1rem', border: 'none', cursor: 'pointer',
        background: 'var(--color-neutral-50)',
        border: '1.5px solid var(--color-neutral-100)',
        textAlign: 'left', gap: '0.875rem',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '0.75rem', flexShrink: 0,
        background: category.color.bg, color: category.color.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem',
      }}>
        <Icon />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
          {category.label}
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0, lineHeight: 1.5 }}>
          {category.description}
        </p>
      </div>

      <div style={{ alignSelf: 'flex-end', color: 'var(--color-neutral-300)' }}>
        <RiArrowRightLine />
      </div>
    </motion.button>
  );
};

// ── Preferences Summary Panel ─────────────────────────────────────────────────
const PreferencesSummary = ({ settings, user }) => {
  const s = settings;

  const formatDate = (iso) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const rows = [
    {
      icon: '🎨',
      label: 'Theme',
      value: s.appearance?.theme
        ? s.appearance.theme.charAt(0).toUpperCase() + s.appearance.theme.slice(1)
        : 'Light',
    },
    {
      icon: '🌍',
      label: 'Language',
      value: s.language?.locale?.toUpperCase() || 'EN',
    },
    {
      icon: '🔔',
      label: 'Notifications',
      value: s.notifications?.inAppNotifications ? 'Enabled' : 'Disabled',
    },
    {
      icon: '🔐',
      label: '2FA',
      value: s.security?.twoFactorEnabled ? 'Active' : 'Inactive',
      alert: !s.security?.twoFactorEnabled,
    },
    {
      icon: '🔑',
      label: 'Last Password Change',
      value: formatDate(s.security?.lastPasswordChange),
    },
    {
      icon: '👤',
      label: 'Profile Visibility',
      value: s.privacy?.profileVisibility
        ? s.privacy.profileVisibility.charAt(0).toUpperCase() + s.privacy.profileVisibility.slice(1)
        : 'Everyone',
    },
  ];

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '0.625rem',
          background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
        }}>
          <RiCheckboxCircleLine />
        </div>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
          Current Preferences
        </h3>
      </div>

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {rows.map(({ icon, label, value, alert }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.6875rem 0', gap: '0.5rem',
            borderBottom: '1px solid var(--color-neutral-100)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-600)' }}>
                {label}
              </span>
            </div>
            <span style={{
              fontSize: '0.8125rem', fontWeight: 700,
              color: alert ? 'var(--color-danger-600)' : 'var(--color-neutral-800)',
              padding: '0.125rem 0.5rem', borderRadius: 99,
              background: alert ? 'var(--color-danger-50)' : 'var(--color-neutral-100)',
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Role badge */}
      {user && (
        <div style={{
          marginTop: '1rem', padding: '0.625rem 0.875rem', borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
          display: 'flex', alignItems: 'center', gap: '0.625rem',
        }}>
          <span style={{ fontSize: '1rem' }}>
            {user.role === 'Intern' ? '🎓' : user.role === 'Supervisor' ? '👨‍💼' : user.role === 'HR Administrator' ? '🏛️' : '🏢'}
          </span>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Signed in as
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {user.name} · {user.role}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Welcome Banner ────────────────────────────────────────────────────────────
const WelcomeBanner = ({ user }) => (
  <div style={{
    padding: '1.5rem 2rem', borderRadius: '1.25rem',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Decorative circles */}
    <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -60, right: 80 }} />
    <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -40, right: 20 }} />

    <div style={{ position: 'relative', zIndex: 1 }}>
      <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#fff', margin: '0 0 0.375rem', letterSpacing: '-0.02em' }}>
        ⚙️ Settings & Preferences
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
        Manage your account, security, notifications, and personalization preferences.
        {user && ` Viewing options for: ${user.role}.`}
      </p>
    </div>
  </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const SettingsDashboard = ({ onNavigate }) => {
  const { settings, loading } = useSettingsStore();
  const user = useAppStore((s) => s.user);

  if (loading) return <SettingsDashboardSkeleton />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <WelcomeBanner user={user} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '1.5rem', alignItems: 'start' }}
        className="settings-summary-grid">
        {/* Category grid */}
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-400)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
            All Settings
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '0.875rem',
          }}>
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <CategoryCard category={cat} onClick={onNavigate} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Summary panel */}
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-neutral-400)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
            Summary
          </p>
          <PreferencesSummary settings={settings} user={user} />
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .settings-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsDashboard;
