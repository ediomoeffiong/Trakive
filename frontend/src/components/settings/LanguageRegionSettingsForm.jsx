/**
 * @file LanguageRegionSettingsForm.jsx
 * @description Language and region settings with live format previews.
 */

import toast from 'react-hot-toast';
import {
  RiTranslate2, RiCalendarLine, RiTimeLine, RiMapPin2Line, RiMoneyDollarCircleLine,
} from 'react-icons/ri';
import { useSettingsStore } from '../../store/useSettingsStore';
import UnsavedChangesBar   from './UnsavedChangesBar';
import {
  LANGUAGES, formatDatePreview, formatTimePreview,
} from '../../data/languages';
import { TIMEZONES, DATE_FORMATS, TIME_FORMATS, CURRENCIES } from '../../data/settings';

// ── Styled select ─────────────────────────────────────────────────────────────
const StyledSelect = ({ id, value, onChange, options, label, icon: Icon, hint }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    {label && (
      <label htmlFor={id} style={{
        fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-neutral-700)',
        display: 'flex', alignItems: 'center', gap: '0.375rem',
      }}>
        {Icon && <Icon style={{ fontSize: '1rem', color: 'var(--color-neutral-400)' }} />}
        {label}
      </label>
    )}
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
        border: '1.5px solid var(--color-neutral-200)',
        background: 'var(--color-neutral-50)', color: 'var(--color-neutral-800)',
        fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
        outline: 'none', cursor: 'pointer', appearance: 'auto',
        transition: 'border-color 0.15s',
      }}
    >
      {options.map((opt) => (
        <option key={opt.value || opt.id} value={opt.value || opt.id}>
          {opt.flag ? `${opt.flag} ` : ''}{opt.label}
        </option>
      ))}
    </select>
    {hint && (
      <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-400)', margin: 0 }}>
        {hint}
      </p>
    )}
  </div>
);

// ── Format preview pill ───────────────────────────────────────────────────────
const PreviewBadge = ({ label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
    <span style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', fontWeight: 500 }}>
      {label}:
    </span>
    <span style={{
      fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary-700)',
      padding: '0.25rem 0.625rem', borderRadius: 99,
      background: 'var(--color-primary-50)',
    }}>
      {value}
    </span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const LanguageRegionSettingsForm = () => {
  const { settings, updateField, saveCategory, saving, isDirty, discardChanges } = useSettingsStore();
  const lang = settings.language;

  const handleSave = async () => {
    try {
      await saveCategory('language');
      toast.success('Language & region settings saved!', { icon: '🌍' });
    } catch {
      toast.error('Failed to save language settings.');
    }
  };

  const datePreview = formatDatePreview(lang.dateFormat);
  const timePreview = formatTimePreview(lang.timeFormat);
  const selectedCurrency = CURRENCIES.find((c) => c.value === lang.currency);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>

      {/* Language */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '0.75rem', flexShrink: 0,
            background: 'var(--color-primary-50)', color: 'var(--color-primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
          }}>
            <RiTranslate2 />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>
              Language
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
              Choose your preferred display language
            </p>
          </div>
        </div>

        <StyledSelect
          id="language-select"
          label="Display Language"
          icon={RiTranslate2}
          value={lang.locale}
          onChange={(v) => updateField('language', 'locale', v)}
          options={LANGUAGES}
          hint="Interface text will appear in the selected language in a future update"
        />
      </div>

      {/* Date & Time */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
            Date & Time Format
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Select how dates and times are displayed throughout Trakive
          </p>
        </div>

        <div className="settings-form-grid">
          <StyledSelect
            id="date-format-select"
            label="Date Format"
            icon={RiCalendarLine}
            value={lang.dateFormat}
            onChange={(v) => updateField('language', 'dateFormat', v)}
            options={DATE_FORMATS}
          />
          <StyledSelect
            id="time-format-select"
            label="Time Format"
            icon={RiTimeLine}
            value={lang.timeFormat}
            onChange={(v) => updateField('language', 'timeFormat', v)}
            options={TIME_FORMATS}
          />
        </div>

        {/* Live preview */}
        <div style={{
          marginTop: '1rem', padding: '1rem', borderRadius: '0.75rem',
          background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
        }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-neutral-600)', margin: '0 0 0.625rem' }}>
            📅 Live preview
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <PreviewBadge label="Date" value={datePreview} />
            <PreviewBadge label="Time" value={timePreview} />
            <PreviewBadge label="Combined" value={`${datePreview} at ${timePreview}`} />
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
            Time Zone
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            All timestamps will be displayed in your selected time zone
          </p>
        </div>

        <StyledSelect
          id="timezone-select"
          label="Time Zone"
          icon={RiMapPin2Line}
          value={lang.timezone}
          onChange={(v) => updateField('language', 'timezone', v)}
          options={TIMEZONES}
        />

        {/* Current time preview */}
        <div style={{
          marginTop: '1rem', padding: '0.875rem 1rem', borderRadius: '0.75rem',
          background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <RiTimeLine style={{ color: 'var(--color-neutral-400)', fontSize: '1.1rem' }} />
          <div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-neutral-500)', margin: '0 0 0.125rem' }}>
              Current time in selected zone
            </p>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-800)', margin: 0 }}>
              {new Intl.DateTimeFormat('en', {
                timeZone: lang.timezone,
                hour: lang.timeFormat === '12h' ? 'numeric' : '2-digit',
                minute: '2-digit',
                hour12: lang.timeFormat === '12h',
                weekday: 'long',
              }).format(new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Currency (placeholder) */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: '0 0 0.25rem' }}>
            Currency
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', margin: 0 }}>
            Used for expense reports and stipend display (placeholder — future feature)
          </p>
        </div>

        <StyledSelect
          id="currency-select"
          label="Preferred Currency"
          icon={RiMoneyDollarCircleLine}
          value={lang.currency}
          onChange={(v) => updateField('language', 'currency', v)}
          options={CURRENCIES}
        />

        {selectedCurrency && (
          <div style={{
            marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
            background: 'var(--color-neutral-50)', border: '1px solid var(--color-neutral-100)',
            width: 'fit-content',
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-neutral-700)' }}>
              {selectedCurrency.symbol}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
              {selectedCurrency.label}
            </span>
          </div>
        )}
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

export default LanguageRegionSettingsForm;
