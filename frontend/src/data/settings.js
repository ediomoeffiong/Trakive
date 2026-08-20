/**
 * @file settings.js
 * @description Global settings defaults, lookup lists, and configuration models for Trakive.
 */

/** Supported timezones */
export const TIMEZONES = [
  { value: 'Africa/Lagos',       label: 'Lagos (WAT, UTC+1)' },
  { value: 'Africa/Accra',       label: 'Accra (GMT, UTC+0)' },
  { value: 'Africa/Nairobi',     label: 'Nairobi (EAT, UTC+3)' },
  { value: 'Europe/London',      label: 'London (GMT/BST)' },
  { value: 'Europe/Paris',       label: 'Paris (CET, UTC+1)' },
  { value: 'America/New_York',   label: 'New York (EST/EDT)' },
  { value: 'America/Chicago',    label: 'Chicago (CST/CDT)' },
  { value: 'America/Los_Angeles',label: 'Los Angeles (PST/PDT)' },
  { value: 'Asia/Dubai',         label: 'Dubai (GST, UTC+4)' },
  { value: 'Asia/Kolkata',       label: 'Mumbai/Kolkata (IST, UTC+5:30)' },
  { value: 'Asia/Singapore',     label: 'Singapore (SGT, UTC+8)' },
  { value: 'Asia/Tokyo',         label: 'Tokyo (JST, UTC+9)' },
  { value: 'Australia/Sydney',   label: 'Sydney (AEST/AEDT)' },
  { value: 'UTC',                label: 'UTC (Coordinated Universal Time)' },
];

/** Supported currencies (placeholder) */
export const CURRENCIES = [
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'USD', label: 'US Dollar ($)',       symbol: '$' },
  { value: 'EUR', label: 'Euro (€)',            symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)',   symbol: '£' },
  { value: 'GHS', label: 'Ghanaian Cedi (₵)',   symbol: '₵' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)',symbol: 'KSh' },
  { value: 'ZAR', label: 'South African Rand (R)',symbol: 'R' },
  { value: 'AED', label: 'UAE Dirham (AED)',    symbol: 'AED' },
  { value: 'INR', label: 'Indian Rupee (₹)',    symbol: '₹' },
];

/** Date format options */
export const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY',   example: '24/07/2026' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY',   example: '07/24/2026' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD',   example: '2026-07-24' },
  { value: 'D MMMM YYYY',label: 'D MMMM YYYY',  example: '24 July 2026' },
  { value: 'MMMM D, YYYY',label: 'MMMM D, YYYY',example: 'July 24, 2026' },
];

/** Time format options */
export const TIME_FORMATS = [
  { value: '12h', label: '12-hour (2:30 PM)' },
  { value: '24h', label: '24-hour (14:30)'   },
];

/** Text size scale options */
export const TEXT_SIZES = [
  { value: 'standard',   label: 'Standard',   scale: 1.0,  description: 'Default font size (100%)' },
  { value: 'large',      label: 'Large',       scale: 1.125,description: 'Slightly larger text (112.5%)' },
  { value: 'extra-large',label: 'Extra Large', scale: 1.25, description: 'Maximum text size (125%)' },
];

/** Spacing / density options */
export const SPACING_MODES = [
  { value: 'comfortable', label: 'Comfortable', description: 'Spacious layout with generous padding' },
  { value: 'compact',     label: 'Compact',     description: 'Tighter layout, more content visible' },
];

/** Default settings schema (represents a freshly registered user) */
export const defaultSettings = {
  account: {
    displayName:  'Ediomo Effiong',
    username:     'covenant.effiong',
    email:        'ediomo.effiong@trakive.com',
    phone:        '+234 800 000 0001',
    emailVerified: true,
  },

  security: {
    twoFactorEnabled:    false,
    ssoEnabled:          false,
    lastPasswordChange:  '2026-06-12T10:00:00Z',
    connectedProviders:  [], // future: ['google', 'microsoft', 'github']
  },

  notifications: {
    taskNotifications:  true,
    reviewNotifications:true,
    onboardingUpdates:  true,
    announcements:      true,
    reminders:          true,
    weeklyDigest:       true,
    emailNotifications: true,
    pushNotifications:  false,
    inAppNotifications: true,
  },

  appearance: {
    theme:       'light',   // 'light' | 'dark' | 'system'
    spacing:     'comfortable', // 'comfortable' | 'compact'
    sidebarBehavior: 'full',   // 'full' | 'collapsed'
  },

  privacy: {
    profileVisibility:   'everyone', // 'everyone' | 'team' | 'private'
    showEmailToSupervisor: true,
    showPhoneNumber:     false,
    activityVisibility:  true,
    analyticsParticipation: true,
  },

  accessibility: {
    textSize:         'standard',  // 'standard' | 'large' | 'extra-large'
    highContrast:     false,
    reducedMotion:    false,
    keyboardHelper:   false,
    focusEnhancer:    false,
  },

  language: {
    locale:      'en',             // BCP 47 language tag
    dateFormat:  'DD/MM/YYYY',
    timeFormat:  '12h',
    timezone:    'Africa/Lagos',
    currency:    'NGN',
  },
};
