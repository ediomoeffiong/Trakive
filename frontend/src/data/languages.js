/**
 * @file languages.js
 * @description Supported locales for Trakive's language & region settings.
 */

/** Full list of supported languages */
export const LANGUAGES = [
  { value: 'en',    label: 'English',             nativeLabel: 'English',         flag: '🇬🇧' },
  { value: 'en-US', label: 'English (US)',         nativeLabel: 'English (US)',     flag: '🇺🇸' },
  { value: 'yo',    label: 'Yoruba',               nativeLabel: 'Yorùbá',          flag: '🇳🇬' },
  { value: 'ig',    label: 'Igbo',                 nativeLabel: 'Ásụsụ Igbo',      flag: '🇳🇬' },
  { value: 'ha',    label: 'Hausa',                nativeLabel: 'Harshen Hausa',   flag: '🇳🇬' },
  { value: 'fr',    label: 'French',               nativeLabel: 'Français',        flag: '🇫🇷' },
  { value: 'de',    label: 'German',               nativeLabel: 'Deutsch',         flag: '🇩🇪' },
  { value: 'es',    label: 'Spanish',              nativeLabel: 'Español',         flag: '🇪🇸' },
  { value: 'pt',    label: 'Portuguese',           nativeLabel: 'Português',       flag: '🇵🇹' },
  { value: 'sw',    label: 'Swahili',              nativeLabel: 'Kiswahili',       flag: '🇰🇪' },
  { value: 'ar',    label: 'Arabic',               nativeLabel: 'العربية',         flag: '🇸🇦', rtl: true },
  { value: 'zh',    label: 'Chinese (Simplified)', nativeLabel: '中文 (简体)',       flag: '🇨🇳' },
];

/**
 * Generate a formatted preview date string based on format token.
 * Preview uses a fixed reference date: July 24, 2026 at 14:30.
 */
export const formatDatePreview = (format) => {
  const map = {
    'DD/MM/YYYY':  '24/07/2026',
    'MM/DD/YYYY':  '07/24/2026',
    'YYYY-MM-DD':  '2026-07-24',
    'D MMMM YYYY': '24 July 2026',
    'MMMM D, YYYY':'July 24, 2026',
  };
  return map[format] || '24/07/2026';
};

/**
 * Generate a formatted preview time string based on format.
 */
export const formatTimePreview = (format) => {
  return format === '12h' ? '2:30 PM' : '14:30';
};
