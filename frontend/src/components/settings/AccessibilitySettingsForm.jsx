/**
 * @file AccessibilitySettingsForm.jsx
 * @description Accessibility text-size settings.
 */

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiTextWrap } from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import UnsavedChangesBar   from './UnsavedChangesBar';
import { TEXT_SIZES }      from '../../data/settings';

const TEXT_SCALE_CLASSES = TEXT_SIZES
  .filter((size) => size.value !== 'standard')
  .map((size) => `text-scale-${size.value}`);

// ── Text size option ──────────────────────────────────────────────────────────
const TextSizeCard = ({ size, selected, onSelect }) => (
  <button
    id={`text-size-${size.value}`}
    onClick={() => onSelect(size.value)}
    aria-pressed={selected}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', borderRadius: '0.875rem', cursor: 'pointer', gap: '0.5rem',
      border: `2px solid ${selected ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
      background: selected ? 'var(--color-primary-50)' : 'var(--color-neutral-50)',
      flex: 1, transition: 'all 0.2s',
    }}
  >
    <span style={{ fontSize: `${1.5 * size.scale}rem`, fontWeight: 700, color: 'var(--color-neutral-800)', lineHeight: 1 }}>
      Aa
    </span>
    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-700)', margin: 0 }}>
      {size.label}
    </p>
    <p style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)', margin: 0 }}>
      {size.description}
    </p>
  </button>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AccessibilitySettingsForm = () => {
  const { settings, updateField, saveCategory, saving, isDirty, discardChanges } = useSettingsStore();
  const access = settings.accessibility;

  // Apply text scale to root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...TEXT_SCALE_CLASSES);
    if (access.textSize !== 'standard') {
      root.classList.add(`text-scale-${access.textSize}`);
    }
  }, [access.textSize]);

  const handleSave = async () => {
    try {
      await saveCategory('accessibility');
      toast.success('Accessibility preferences saved!', { icon: '♿' });
    } catch {
      toast.error('Failed to save accessibility settings.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

      {/* Text Size */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.75rem', flexShrink: 0,
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            <RiTextWrap />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Text Size
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              Choose a text size that is comfortable for reading
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {TEXT_SIZES.map((size) => (
            <TextSizeCard
              key={size.value}
              size={size}
              selected={access.textSize === size.value}
              onSelect={(v) => updateField('accessibility', 'textSize', v)}
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

export default AccessibilitySettingsForm;
