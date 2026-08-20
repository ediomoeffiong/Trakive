/**
 * @file AppearanceSettingsForm.jsx
 * @description Theme, spacing density, and sidebar behaviour settings.
 * Implements actual theme switching via useAppStore and persists to localStorage.
 */

import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiPaletteLine, RiLayoutLine,
  RiCheckLine,
} from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAppStore }      from '../../store/useAppStore';
import { THEME_OPTIONS, SIDEBAR_BEHAVIORS } from '../../data/appearance';
import { SPACING_MODES }    from '../../data/settings';
import UnsavedChangesBar    from './UnsavedChangesBar';

// ── Theme option card ─────────────────────────────────────────────────────────
const ThemeCard = ({ option, selected, onSelect }) => (
  <motion.button
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => onSelect(option.id)}
    id={`theme-option-${option.id}`}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '1rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', textAlign: 'left',
      border: `2px solid ${selected ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
      background: selected ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
      transition: 'border-color 0.2s, background 0.2s',
      position: 'relative',
      gap: '0.75rem',
    }}
    aria-pressed={selected}
    aria-label={`${option.label} theme`}
  >
    {/* Mini preview */}
    <div style={{
      width: '100%', height: 72, borderRadius: '0.5rem', overflow: 'hidden',
      background: typeof option.preview.bg === 'string' && option.preview.bg.includes('gradient')
        ? option.preview.bg
        : option.preview.bg,
      border: '1px solid rgba(0,0,0,0.08)',
      position: 'relative',
    }}>
      {/* Fake topbar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 18,
        background: option.preview.surface,
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex', alignItems: 'center', gap: 4, padding: '0 6px',
      }}>
        {[1,2,3].map((i) => (
          <div key={i} style={{ width: 5, height: 5, borderRadius: '50%',
            background: i === 1 ? option.preview.accent : 'rgba(128,128,128,0.3)' }} />
        ))}
      </div>
      {/* Fake content lines */}
      <div style={{ position: 'absolute', top: 24, left: 8, right: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[70, 90, 55].map((w, i) => (
          <div key={i} style={{ height: 6, width: `${w}%`, borderRadius: 3,
            background: i === 0 ? option.preview.accent : `${option.preview.text}30` }} />
        ))}
      </div>
    </div>

    {/* Label */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
      <span style={{ fontSize: '1.1rem' }}>{option.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
          {option.label}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: 0 }}>
          {option.description}
        </p>
      </div>
      {selected && (
        <span style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          background: 'var(--color-primary-600)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <RiCheckLine style={{ color: '#fff', fontSize: '0.75rem' }} />
        </span>
      )}
    </div>
  </motion.button>
);

// ── Radio option row ──────────────────────────────────────────────────────────
const RadioRow = ({ option, selected, onSelect, name }) => (
  <motion.label
    whileHover={{ x: 2 }}
    htmlFor={`${name}-${option.id}`}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '0.875rem', borderRadius: '0.75rem', cursor: 'pointer',
      border: `1.5px solid ${selected ? 'var(--color-primary-300)' : 'var(--color-neutral-200)'}`,
      background: selected ? 'var(--color-primary-50)' : 'transparent',
      transition: 'all 0.2s',
    }}
  >
    <input
      type="radio"
      id={`${name}-${option.id}`}
      name={name}
      checked={selected}
      onChange={() => onSelect(option.id)}
      style={{ accentColor: 'var(--color-primary-600)', width: 16, height: 16, flexShrink: 0 }}
    />
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: '0 0 0.125rem' }}>
        {option.label}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
        {option.description}
      </p>
    </div>
  </motion.label>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AppearanceSettingsForm = () => {
  const { settings, updateField, updateFields, saveCategory, saving, isDirty, discardChanges } = useSettingsStore();
  const setTheme = useAppStore((s) => s.setTheme);
  const appearance = settings.appearance;

  const handleThemeSelect = (themeId) => {
    updateField('appearance', 'theme', themeId);
    setTheme(themeId); // immediately apply to DOM via AppLayout effect
  };

  const handleSave = async () => {
    try {
      await saveCategory('appearance');
      toast.success('Appearance settings saved!', { icon: '🎨' });
    } catch {
      toast.error('Failed to save appearance settings.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

      {/* Theme */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.75rem',
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
          }}>
            <RiPaletteLine />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Color Theme
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              Changes take effect immediately across the entire application
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.875rem',
        }}>
          {THEME_OPTIONS.map((opt) => (
            <ThemeCard
              key={opt.id}
              option={opt}
              selected={appearance.theme === opt.id}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>
      </div>

      {/* Spacing density */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.75rem',
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0,
          }}>
            <RiLayoutLine />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Layout Density
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              Control how much information is visible at once
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SPACING_MODES.map((mode) => (
            <RadioRow
              key={mode.value}
              name="spacing"
              option={{ id: mode.value, label: mode.label, description: mode.description }}
              selected={appearance.spacing === mode.value}
              onSelect={(val) => updateField('appearance', 'spacing', val)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar behaviour */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
            Sidebar Behavior
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Control how the navigation sidebar behaves on page load
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SIDEBAR_BEHAVIORS.map((b) => (
            <RadioRow
              key={b.id}
              name="sidebar"
              option={{ id: b.id, label: b.label, description: b.description }}
              selected={appearance.sidebarBehavior === b.id}
              onSelect={(val) => updateField('appearance', 'sidebarBehavior', val)}
            />
          ))}
        </div>
      </div>

      <UnsavedChangesBar
        isDirty={isDirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={discardChanges}
      />
    </div>
  );
};

export default AppearanceSettingsForm;
