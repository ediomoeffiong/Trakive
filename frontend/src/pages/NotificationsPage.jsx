/**
 * @file NotificationsPage.jsx
 * @description Full Notifications & Communication Center page for Trakive.
 *
 * Features:
 *  - Page header with unread count, mark-all-read, and preferences gear
 *  - Tab navigation: All | Announcements | Reminders
 *  - Search + Filters bar
 *  - Grouped notification list (Today / Yesterday / This Week / Older)
 *  - Detail side panel (desktop) / bottom sheet (mobile)
 *  - Empty states for all scenarios
 *  - Skeleton loading states
 *  - Simulated real-time notification delivery
 *  - Responsive layout
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  RiBellLine, RiCheckDoubleLine, RiSettings3Line,
  RiInboxLine, RiSearchLine, RiMegaphoneLine,
  RiAlarmLine, RiFilterLine,
} from 'react-icons/ri';

import { useNotificationStore, useAppStore } from '../store';
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
  DetailPanelSkeleton,
} from '../components/notifications';
import EmptyState from '../components/ui/EmptyState';

// ── Page tab config ───────────────────────────────────────────────────────────
const TABS = [
  { key: 'notifications', label: 'Notifications', Icon: RiBellLine },
  { key: 'announcements', label: 'Announcements', Icon: RiMegaphoneLine },
  { key: 'reminders',     label: 'Reminders',     Icon: RiAlarmLine },
];

// ── Hook: responsive breakpoint ───────────────────────────────────────────────
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

// ── Reusable Pagination Controls ─────────────────────────────────────────────
function PaginationControls({ currentPage, totalPages, totalItems, pageSize = 10, onPageChange }) {
  if (totalItems <= 0) return null;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1.25rem',
        borderTop: '1px solid var(--color-neutral-200)',
        background: '#fff',
        fontSize: '0.8125rem',
        color: 'var(--color-neutral-600)',
        flexShrink: 0,
      }}
    >
      <span>
        Showing <strong style={{ color: 'var(--color-neutral-900)' }}>{startItem}–{endItem}</strong> of{' '}
        <strong style={{ color: 'var(--color-neutral-900)' }}>{totalItems}</strong>
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', opacity: currentPage <= 1 ? 0.4 : 1 }}
        >
          Previous
        </button>
        <span style={{ fontWeight: 600, color: 'var(--color-neutral-700)', padding: '0 0.25rem' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-ghost btn-sm"
          style={{ padding: '0.25rem 0.625rem', fontSize: '0.8125rem', opacity: currentPage >= totalPages ? 0.4 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ── Notifications tab content ────────────────────────────────────────────────
function NotificationsTabContent({ isMobile }) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadingNotifications = useNotificationStore((s) => s.loadingNotifications);
  const selectedNotification = useNotificationStore((s) => s.selectedNotification);
  const setSelectedNotification = useNotificationStore((s) => s.setSelectedNotification);
  const clearSelectedNotification = useNotificationStore((s) => s.clearSelectedNotification);
  const getFilteredNotifications = useNotificationStore((s) => s.getFilteredNotifications);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAsUnread = useNotificationStore((s) => s.markAsUnread);
  const deleteNotification = useNotificationStore((s) => s.deleteNotification);
  const archiveNotification = useNotificationStore((s) => s.archiveNotification);
  const searchQuery = useNotificationStore((s) => s.searchQuery);
  const filters = useNotificationStore((s) => s.filters);

  const allFiltered = getFilteredNotifications();
  const totalItems = allFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasAnyNotifications = totalItems > 0;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters]);

  const currentPage = Math.min(page, totalPages);
  const paginatedList = allFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const grouped = { today: [], yesterday: [], thisWeek: [], older: [] };
  paginatedList.forEach((n) => {
    const d = new Date(n.date);
    if (d >= todayStart) grouped.today.push(n);
    else if (d >= yesterdayStart) grouped.yesterday.push(n);
    else if (d >= weekStart) grouped.thisWeek.push(n);
    else grouped.older.push(n);
  });

  const handleMarkRead = useCallback((id) => {
    markAsRead(id);
    toast.success('Marked as read.');
  }, [markAsRead]);

  const handleMarkUnread = useCallback((id) => {
    markAsUnread(id);
    toast.success('Marked as unread.');
  }, [markAsUnread]);

  const handleDelete = useCallback((id) => {
    deleteNotification(id);
    toast.success('Notification deleted.');
  }, [deleteNotification]);

  const handleArchive = useCallback((id) => {
    archiveNotification(id);
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
        position: 'relative',
      }}
    >
      {/* Notification list column */}
      <div
        style={{
          flex: 1,
          background: '#fff',
          borderRadius: '1rem',
          border: '1px solid var(--color-neutral-200)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 220px)',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 300 }}>
          {loadingNotifications ? (
            <NotificationListSkeleton count={6} />
          ) : !hasAnyNotifications ? (
            searchQuery ? (
              <EmptyState
                icon={<RiSearchLine />}
                title="No results found"
                description={`No notifications match "${searchQuery}". Try a different search term.`}
              />
            ) : filters.status === 'unread' ? (
              <EmptyState
                icon={<RiCheckDoubleLine />}
                title="All caught up!"
                description="You have no unread notifications. Great job staying on top of things!"
              />
            ) : (
              <EmptyState
                icon={<RiBellLine />}
                title="No notifications yet"
                description="When you receive notifications, they'll appear here."
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

        {/* Pagination controls */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      {/* Detail panel — desktop only (sticky) */}
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

// ── Announcements tab content ─────────────────────────────────────────────────
function AnnouncementsTabContent() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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
        title="No announcements"
        description="Organization-wide announcements from your HR team and leadership will appear here."
      />
    );
  }

  const totalItems = announcements.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedAnnouncements = announcements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}
      >
        {paginatedAnnouncements.map((ann) => (
          <AnnouncementCard key={ann.id} announcement={ann} />
        ))}
      </motion.div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Reminders tab content ─────────────────────────────────────────────────────
function RemindersTabContent() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

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
        title="No reminders"
        description="You have no upcoming deadlines or pending actions right now."
      />
    );
  }

  const totalItems = reminders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedReminders = reminders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const critical = paginatedReminders.filter((r) => r.urgency === 'critical' || r.urgency === 'overdue');
  const upcoming = paginatedReminders.filter((r) => r.urgency === 'warning');
  const normal = paginatedReminders.filter((r) => r.urgency === 'normal');

  return (
    <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1rem' }}>
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
              Needs Immediate Attention
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
              Coming Up Soon
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
              Upcoming
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {normal.map((r) => <ReminderCard key={r.id} reminder={r} />)}
            </div>
          </div>
        )}
      </motion.div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const isMobile = useIsMobile();

  const user = useAppStore((s) => s.user);
  const fetchAll = useNotificationStore((s) => s.fetchAll);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);
  const setPreferencesOpen = useNotificationStore((s) => s.setPreferencesOpen);
  const preferencesOpen = useNotificationStore((s) => s.preferencesOpen);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    if (!user?.id) return;
    fetchAll(user?.role);
  }, [fetchAll, user?.id, user?.role]);

  const handleMarkAll = async () => {
    await markAllAsRead(user?.role);
    toast.success('All notifications marked as read.');
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
      {/* ── Page Header ──────────────────────────────────────────────────── */}
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
              Notifications
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
                  background: 'var(--color-primary-600)',
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
            Stay up to date with your tasks, reviews, and announcements.
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
            id="notification-prefs-btn"
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

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          borderBottom: '2px solid var(--color-neutral-100)',
        }}
        role="tablist"
        aria-label="Notification sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`${tab.key}-tabpanel`}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              color:
                activeTab === tab.key
                  ? 'var(--color-primary-600)'
                  : 'var(--color-neutral-500)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.15s',
              marginBottom: -2,
            }}
          >
            <tab.Icon />
            {tab.label}
            {activeTab === tab.key && (
              <motion.span
                layoutId="notif-page-tab-indicator"
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

      {/* ── Search + Filters (only on notifications tab) ──────────────────── */}
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

      {/* ── Tab Panels ───────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id={`${activeTab}-tabpanel`}
        aria-labelledby={`tab-${activeTab}`}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'notifications' && (
              <NotificationsTabContent isMobile={isMobile} />
            )}
            {activeTab === 'announcements' && <AnnouncementsTabContent />}
            {activeTab === 'reminders' && <RemindersTabContent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Preferences Modal ─────────────────────────────────────────────── */}
      <NotificationPreferencesModal
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </motion.div>
  );
};

export default NotificationsPage;
