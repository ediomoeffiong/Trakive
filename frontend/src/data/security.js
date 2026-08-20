/**
 * @file security.js
 * @description Mock security configuration data for Trakive's Settings module.
 */

/** Mock connected OAuth providers */
export const OAUTH_PROVIDERS = [
  {
    id:          'google',
    name:        'Google',
    icon:        '🔵',
    description: 'Sign in with your Google account',
    connected:   false,
    email:       null,
  },
  {
    id:          'microsoft',
    name:        'Microsoft',
    icon:        '🟦',
    description: 'Sign in with your Microsoft account',
    connected:   false,
    email:       null,
  },
  {
    id:          'github',
    name:        'GitHub',
    icon:        '⚫',
    description: 'Sign in with your GitHub account',
    connected:   false,
    email:       null,
  },
];

/** Mock security events log */
export const mockSecurityEvents = [
  {
    id:        'se-1',
    type:      'login_success',
    label:     'Successful login',
    device:    'Chrome on Windows',
    ip:        '196.54.12.88',
    location:  'Lagos, Nigeria',
    timestamp: '2026-07-24T07:15:00Z',
    severity:  'info',
  },
  {
    id:        'se-2',
    type:      'password_change',
    label:     'Password changed',
    device:    'Chrome on Windows',
    ip:        '196.54.12.88',
    location:  'Lagos, Nigeria',
    timestamp: '2026-06-12T10:02:00Z',
    severity:  'warning',
  },
  {
    id:        'se-3',
    type:      'login_failed',
    label:     'Failed login attempt',
    device:    'Unknown Device',
    ip:        '41.190.3.240',
    location:  'Kano, Nigeria',
    timestamp: '2026-06-01T03:44:00Z',
    severity:  'danger',
  },
  {
    id:        'se-4',
    type:      'session_revoked',
    label:     'Session revoked',
    device:    'Safari on iPhone',
    ip:        '41.184.6.77',
    location:  'Abuja, Nigeria',
    timestamp: '2026-05-28T19:10:00Z',
    severity:  'info',
  },
];

/** 2FA method descriptors */
export const TWO_FACTOR_METHODS = [
  {
    id:          'totp',
    name:        'Authenticator App',
    description: 'Use Google Authenticator, Authy, or any TOTP app',
    icon:        '📱',
    available:   true,
  },
  {
    id:          'sms',
    name:        'SMS Verification',
    description: 'Receive a code via text message',
    icon:        '💬',
    available:   true,
  },
  {
    id:          'hardware',
    name:        'Hardware Security Key',
    description: 'Use a FIDO2/WebAuthn key (e.g., YubiKey)',
    icon:        '🔑',
    available:   false, // future
  },
];
