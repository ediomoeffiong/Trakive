/**
 * @file notificationPreferences.js
 * @description Default notification preference settings for Trakive users.
 */

export const defaultNotificationPreferences = {
  // In-app notification categories
  taskNotifications: true,
  reviewNotifications: true,
  onboardingUpdates: true,
  announcements: true,
  reminders: true,
  systemUpdates: false,

  // Delivery methods
  emailNotifications: true,
  inAppNotifications: true,

  // Email digest
  emailDigest: 'daily', // 'instant' | 'daily' | 'weekly' | 'none'

  // Quiet hours
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',

  // Push (UI only — future)
  pushNotifications: false,
};
