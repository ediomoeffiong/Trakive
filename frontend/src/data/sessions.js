/**
 * @file sessions.js
 * @description Mock active sessions and connected devices data for Trakive.
 */

/** Mock active session list */
export const mockSessions = [
  {
    id:          'sess-current',
    isCurrent:   true,
    device:      'MacBook Pro',
    browser:     'Chrome 126',
    os:          'macOS 14 Sonoma',
    ip:          '196.54.12.88',
    location:    'Lagos, Nigeria',
    lastActive:  new Date().toISOString(),
    deviceType:  'desktop',
    deviceIcon:  '💻',
  },
  {
    id:          'sess-2',
    isCurrent:   false,
    device:      'iPhone 15 Pro',
    browser:     'Safari 17',
    os:          'iOS 17.5',
    ip:          '41.184.6.77',
    location:    'Abuja, Nigeria',
    lastActive:  new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
    deviceType:  'mobile',
    deviceIcon:  '📱',
  },
  {
    id:          'sess-3',
    isCurrent:   false,
    device:      'Windows PC',
    browser:     'Firefox 127',
    os:          'Windows 11',
    ip:          '102.88.20.44',
    location:    'Port Harcourt, Nigeria',
    lastActive:  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    deviceType:  'desktop',
    deviceIcon:  '🖥️',
  },
  {
    id:          'sess-4',
    isCurrent:   false,
    device:      'iPad Air',
    browser:     'Safari 17',
    os:          'iPadOS 17.4',
    ip:          '196.20.14.100',
    location:    'Ikeja, Nigeria',
    lastActive:  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    deviceType:  'tablet',
    deviceIcon:  '📟',
  },
];
