/**
 * @file appearance.js
 * @description Appearance and theme configuration options for Trakive settings.
 */

/** Theme option definitions */
export const THEME_OPTIONS = [
  {
    id:          'light',
    label:       'Light',
    description: 'Clean white interface, ideal for daytime use',
    icon:        '☀️',
    preview: {
      bg:     '#f8fafc',
      surface:'#ffffff',
      text:   '#0f172a',
      accent: '#2563eb',
    },
  },
  {
    id:          'dark',
    label:       'Dark',
    description: 'Dark interface, easier on the eyes at night',
    icon:        '🌙',
    preview: {
      bg:     '#0f172a',
      surface:'#1e293b',
      text:   '#f1f5f9',
      accent: '#3b82f6',
    },
  },
  {
    id:          'system',
    label:       'System',
    description: 'Automatically matches your device preference',
    icon:        '💻',
    preview: {
      bg:     'linear-gradient(135deg, #f8fafc 50%, #0f172a 50%)',
      surface:'#e2e8f0',
      text:   '#334155',
      accent: '#2563eb',
    },
  },
];

/** Sidebar behavior options */
export const SIDEBAR_BEHAVIORS = [
  {
    id:          'full',
    label:       'Always expanded',
    description: 'Sidebar always shows labels and icons',
    icon:        '◀▶',
  },
  {
    id:          'collapsed',
    label:       'Always compact',
    description: 'Sidebar shows icons only by default',
    icon:        '≡',
  },
  {
    id:          'auto',
    label:       'Auto',
    description: 'Collapses on smaller screens automatically',
    icon:        '⟺',
  },
];
