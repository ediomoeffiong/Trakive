/**
 * @file index.js
 * @description Barrel export for all Trakive Notification components.
 */

export { default as NotificationBadge }          from './NotificationBadge';
export { default as NotificationItem }           from './NotificationItem';
export { default as NotificationDrawer }         from './NotificationDrawer';
export { default as NotificationDetailPanel }    from './NotificationDetailPanel';
export { default as NotificationFilters }        from './NotificationFilters';
export { default as NotificationSearch }         from './NotificationSearch';
export { default as NotificationGroup }          from './NotificationGroup';
export { default as AnnouncementCard }           from './AnnouncementCard';
export { default as ReminderCard }               from './ReminderCard';
export { default as NotificationPreferencesModal } from './NotificationPreferencesModal';

// Skeleton loaders
export {
  default as NotificationItemSkeleton,
  NotificationListSkeleton,
  DrawerSkeleton,
  DetailPanelSkeleton,
  AnnouncementCardSkeleton,
  ReminderCardSkeleton,
} from './NotificationSkeleton';
