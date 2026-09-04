/**
 * @file SupervisorNotifications.jsx
 * @description Supervisor Notifications & Communication Center page.
 * Reuses existing Intern notification components, layout patterns, and hooks
 * with supervisor-specific data, role awareness, and action routes.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiBellLine, RiCheckDoubleLine, RiSettings3Line,
  RiSearchLine, RiMegaphoneLine, RiAlarmLine,
} from 'react-icons/ri';

import { useNotificationStore } from '../../store';
import {
  NotificationGroup,
  NotificationSearch,
  NotificationFilters,
  NotificationDetailPanel,
  AnnouncementCard,
  ReminderCard,
  NotificationPreferencesModal,
  NotificationListSkeleton,
  AnnouncementCardSkeleton,
  ReminderCardSkeleton,
} from '../../components/notifications';
import EmptyState from '../../components/ui/EmptyState';

const TABS = [
  { key: 'notifications', label: 'Notifications', Icon: RiBellLine },
  { key: 'announcements', label: 'Announcements', Icon: RiMegaphoneLine },
  { key: 'reminders',     label: 'Reminders',     Icon: RiAlarmLine },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

function NotificationsTabContent({ isMobile }) {
  const loadingNotifications = useNotificationStore((s) => s.loadingNotifications);
  const selectedNotification = useNotificationStore((s) => s.selectedNotification);
  const setSelectedNotification = useNotificationStore((s) => s.setSelectedNotification);
  const clearSelectedNotification = useNotificationStore((s) => s.clearSelectedNotification);
  const getGroupedNotifications = useNotificationStore((s) => s.getGroupedNotifications);
  const getFilteredNotifications = useNotificationStore((s) => s.getFilteredNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAsUnread = useNotificationStore((s) => s.markAsUnread);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const archiveNotification = useNotificationStore((s) => s.archiveNotification);
  const searchQuery = useNotificationStore((s) => s.searchQuery);
  const filters = useNotificationStore((s) => s.filters);

  const grouped = getGroupedNotifications();
  const filteredTotal = getFilteredNotifications().length;
  const hasAnyNotifications = filteredTotal > 0;

  const handleMarkRead = useCallback((id) => {
    markAsRead(id, 'Supervisor');
    toast.success('Marked as read.');
  }, [markAsRead]);

  const handleMarkUnread = useCallback((id) => {
    markAsUnread(id, 'Supervisor');
    toast.success('Marked as unread.');
  }, [markAsUnread]);

  const handleDelete = useCallback((id) => {
    deleteNotification(id, 'Supervisor');
    toast.success('Notification dismissed.');
  }, [deleteNotification]);

  const handleArchive = useCallback((id) => {
    archiveNotification(id, 'Supervisor');
    toast.success('Notification archived.');
  }, [archiveNotification]);

  const listProps = {
    selectedId: selectedNotification?.id,
    onSelect: setSelectedNotification,
    onMarkRead: handleMarkRead,
    onMarkUnread: handleMarkUnread,
    onDelete: handleDelete,
    onArchive: handleArchive,
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '1.25rem',
        alignItems: 'flex-start',
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Notification list */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: '1rem',
          border: '1px solid var(--color-neutral-200)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          minHeight: 300,
        }}
      >
        {loadingNotifications ? (
          <NotificationListSkeleton count={6} />
        ) : !hasAnyNotifications ? (
          searchQuery ? (
            <EmptyState
              icon={<RiSearchLine />}
              title="No results found"
              description={`No supervisor notifications match "${searchQuery}".`}
            />
          ) : filters.status === 'unread' ? (
            <EmptyState
              icon={<RiCheckDoubleLine />}
              title="All caught up!"
              description="No unread supervisor notifications."
            />
          ) : (
            <EmptyState
              icon={<RiBellLine />}
              title="No notifications yet"
              description="New intern submissions and system alerts will appear here."
            />
          )
        ) : (
          <AnimatePresence>
            {grouped.today.length > 0 && (
              <NotificationGroup key="group-today" label="Today" notifications={grouped.today} {...listProps} />
            )}
            {grouped.yesterday.length > 0 && (
              <NotificationGroup key="group-yesterday" label="Yesterday" notifications={grouped.yesterday} {...listProps} />
            )}
            {grouped.thisWeek.length > 0 && (
              <NotificationGroup key="group-thisWeek" label="This Week" notifications={grouped.thisWeek} {...listProps} />
            )}
            {grouped.older.length > 0 && (
              <NotificationGroup key="group-older" label="Older" notifications={grouped.older} {...listProps} />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Detail panel — desktop only */}
      {!isMobile && (
        <AnimatePresence>
          {selectedNotification && (
            <NotificationDetailPanel
              notification={selectedNotification}
              onClose={clearSelectedNotification}
              isMobile={false}
            />
          )}
        </AnimatePresence>
      )}

      {/* Detail panel — mobile bottom sheet */}
      {isMobile && selectedNotification && (
        <NotificationDetailPanel
          notification={selectedNotification}
          onClose={clearSelectedNotification}
          isMobile={true}
        />
      )}
    </div>
  );
}

function AnnouncementsTabContent() {
  const announcements = useNotificationStore((s) => s.announcements);
  const loadingAnnouncements = useNotificationStore((s) => s.loadingAnnouncements);

  if (loadingAnnouncements) {
    return (
      <div>
        {[1, 2, 3].map((i) => <AnnouncementCardSkeleton key={i} />)}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={<RiMegaphoneLine />}
        title="No supervisor announcements"
        description="Department announcements from leadership will appear here."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {announcements.map((ann) => (
        <AnnouncementCard key={ann.id} announcement={ann} />
      ))}
    </motion.div>
  );
}

function RemindersTabContent() {
  const reminders = useNotificationStore((s) => s.reminders);
  const loadingReminders = useNotificationStore((s) => s.loadingReminders);

  if (loadingReminders) {
    return (
      <div>
        {[1, 2, 3].map((i) => <ReminderCardSkeleton key={i} />)}
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <EmptyState
        icon={<RiAlarmLine />}
        title="No pending reminders"
        description="You have no urgent review actions or pending task approvals right now."
      />
    );
  }

  const critical = reminders.filter((r) => r.urgency === 'critical' || r.urgency === 'overdue');
  const upcoming = reminders.filter((r) => r.urgency === 'warning');
  const normal = reminders.filter((r) => r.urgency === 'normal');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {critical.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3
            style={{
              margin: '0 0 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            Needs Immediate Supervisor Action
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {critical.map((r) => <ReminderCard key={r.id} reminder={r} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h3
            style={{
              margin: '0 0 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#c2410c',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
            Upcoming Reviews & Syncs
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcoming.map((r) => <ReminderCard key={r.id} reminder={r} />)}
          </div>
        </div>
      )}

      {normal.length > 0 && (
        <div>
          <h3
            style={{
              margin: '0 0 0.75rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-neutral-500)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-neutral-400)', display: 'inline-block' }} />
            Scheduled Tasks
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {normal.map((r) => <ReminderCard key={r.id} reminder={r} />)}
          </div>
        </div>
      )}
    </motion.div>
  );
}

const SupervisorNotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const isMobile = useIsMobile();

  const fetchAll = useNotificationStore((s) => s.fetchAll);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const startSimulatedUpdates = useNotificationStore((s) => s.startSimulatedUpdates);
  const stopSimulatedUpdates = useNotificationStore((s) => s.stopSimulatedUpdates);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
  const setPreferencesOpen = useNotificationStore((s) => s.setPreferencesOpen);
  const preferencesOpen = useNotificationStore((s) => s.preferencesOpen);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    fetchAll('Supervisor');
    startSimulatedUpdates('Supervisor');
    return () => stopSimulatedUpdates();
  }, []); // eslint-disable-line

  const handleMarkAll = async () => {
    await markAllAsRead('Supervisor');
    toast.success('All supervisor notifications marked as read.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          padding: '0.25rem 0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Supervisor Notifications
            </h2>
            {unreadCount > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 24,
                  height: 24,
                  borderRadius: '999px',
                  background: '#00b4d8',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0 6px',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--color-neutral-500)' }}>
            Track intern submissions, review deadlines, onboarding approvals, and system alerts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="btn btn-ghost"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                gap: '0.375rem',
                color: 'var(--color-primary-600)',
                padding: '0.5rem 0.875rem',
                border: '1px solid var(--color-primary-200)',
                borderRadius: '0.625rem',
                background: 'var(--color-primary-50)',
              }}
            >
              <RiCheckDoubleLine />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setPreferencesOpen(true)}
            className="btn btn-ghost btn-icon"
            aria-label="Notification preferences"
            id="supervisor-notification-prefs-btn"
            style={{
              fontSize: '1.125rem',
              color: 'var(--color-neutral-500)',
              border: '1px solid var(--color-neutral-200)',
              borderRadius: '0.625rem',
              padding: '0.5rem',
            }}
          >
            <RiSettings3Line />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '2px solid var(--color-neutral-100)',
        }}
        role="tablist"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color: activeTab === tab.key ? '#00b4d8' : '#00b4d8',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginBottom: -2,
            }}
          >
            <tab.Icon />
            {tab.label}
            {activeTab === tab.key && (
              <motion.span
                layoutId="sup-notif-tab-indicator"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  borderRadius: '2px 2px 0 0',
                  background: 'var(--color-primary-600)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: isMobile ? '100%' : 240 }}>
            <NotificationSearch />
          </div>
          <NotificationFilters />
        </motion.div>
      )}

      {/* Tab Panels */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'notifications' && <NotificationsTabContent isMobile={isMobile} />}
            {activeTab === 'announcements' && <AnnouncementsTabContent />}
            {activeTab === 'reminders' && <RemindersTabContent />}
          </motion.div>
        </AnimatePresence>
      </div>

      <NotificationPreferencesModal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </motion.div>
  );
};

export default SupervisorNotificationsPage;
