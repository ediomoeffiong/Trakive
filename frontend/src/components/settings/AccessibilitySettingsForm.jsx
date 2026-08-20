/**
 * @file AccessibilitySettingsForm.jsx
 * @description Accessibility settings: text size, high contrast, reduced motion,
 * keyboard navigation, and focus indicators.
 */

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  RiEyeLine, RiKeyboardLine, RiFocus3Line,
  RiTextWrap, RiContrastFill,
} from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import Switch              from '../ui/Switch';
import UnsavedChangesBar   from './UnsavedChangesBar';
import { TEXT_SIZES }      from '../../data/settings';

// ── Text size option ──────────────────────────────────────────────────────────
const TextSizeCard = ({ size, selected, onSelect }) => (
  <button
    id={`text-size-${size.value}`}
    onClick={() => onSelect(size.value)}
    aria-pressed={selected}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', gap: '0.5rem',
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

// ── Toggle row ────────────────────────────────────────────────────────────────
const AccessRow = ({ icon: Icon, label, description, checked, onChange, badge }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    padding: '0.875rem 0', borderBottom: '1px solid var(--color-neutral-100)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '0.625rem', flexShrink: 0,
        background: 'var(--color-neutral-50)', color: 'var(--color-neutral-500)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
      }}>
        <Icon />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-neutral-800)', margin: 0 }}>
            {label}
          </p>
          {badge && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: 99,
              background: 'var(--color-warning-100)', color: 'var(--color-warning-700)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AccessibilitySettingsForm = () => {
  const { settings, updateField, saveCategory, saving, isDirty, discardChanges } = useSettingsStore();
  const access = settings.accessibility;

  // Apply text scale to root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-scale-large', 'text-scale-extra-large');
    if (access.textSize === 'large')       root.classList.add('text-scale-large');
    if (access.textSize === 'extra-large') root.classList.add('text-scale-extra-large');
  }, [access.textSize]);

  // Apply reduced motion class
  useEffect(() => {
    const root = document.documentElement;
    if (access.reducedMotion) root.classList.add('reduced-motion');
    else                      root.classList.remove('reduced-motion');
  }, [access.reducedMotion]);

  // Apply focus enhancer class
  useEffect(() => {
    const root = document.documentElement;
    if (access.focusEnhancer) root.classList.add('focus-enhanced');
    else                      root.classList.remove('focus-enhanced');
  }, [access.focusEnhancer]);

  const toggle = (key) => updateField('accessibility', key, !access[key]);

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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {TEXT_SIZES.map((size) => (
            <TextSizeCard
              key={size.value}
              size={size}
              selected={access.textSize === size.value}
              onSelect={(v) => updateField('accessibility', 'textSize', v)}
            />
          ))}
        </div>

        {/* Preview sentence */}
        <div style={{
          marginTop: '1.25rem', padding: '1rem', borderRadius: '0.75rem',
          background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
        }}>
          <p style={{ margin: 0, color: 'var(--color-neutral-700)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Preview: The quick brown fox jumps over the lazy dog. Trakive helps you track your internship journey.
          </p>
        </div>
      </div>

      {/* Visual & Motion */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
          Visual & Motion
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0 0 1rem' }}>
          Reduce visual distractions and improve readability
        </p>

        <AccessRow
          icon={RiContrastFill}
          label="High Contrast Mode"
          description="Increase contrast between text and backgrounds"
          badge="Placeholder"
          checked={access.highContrast}
          onChange={() => toggle('highContrast')}
        />
        <AccessRow
          icon={RiEyeLine}
          label="Reduced Motion"
          description="Minimize animations and transitions across the interface (takes effect immediately)"
          checked={access.reducedMotion}
          onChange={() => toggle('reducedMotion')}
        />
      </div>

      {/* Navigation */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
          Navigation Aids
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: '0 0 1rem' }}>
          Keyboard and focus-based navigation enhancements
        </p>

        <AccessRow
          icon={RiKeyboardLine}
          label="Keyboard Navigation Helper"
          description="Show keyboard shortcut hints and improve tab order visibility"
          badge="Placeholder"
          checked={access.keyboardHelper}
          onChange={() => toggle('keyboardHelper')}
        />
        <AccessRow
          icon={RiFocus3Line}
          label="Enhanced Focus Indicator"
          description="Show a larger, more visible focus ring on interactive elements (takes effect immediately)"
          checked={access.focusEnhancer}
          onChange={() => toggle('focusEnhancer')}
        />
      </div>

      {/* Info note */}
      <div style={{
        padding: '1rem 1.25rem', borderRadius: '0.875rem',
        background: 'var(--color-warning-50)',
        border: '1px solid var(--color-warning-100)',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚠️</span>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-warning-700)', margin: 0 }}>
          Settings marked as <strong>Placeholder</strong> are architected for future implementation and
          will have visual effect in a later release.
        </p>
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
