/**
 * @file NotificationDrawer.jsx
 * @description Topbar notification bell popover drawer.
 * Shows recent notifications, unread count, quick actions, and "View All" link.
 * On mobile renders as full-screen panel.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiBellLine, RiCheckDoubleLine, RiArrowRightLine } from 'react-icons/ri';
import { useNotificationStore, useAppStore } from '../../store';
import NotificationItem from './NotificationItem';
import NotificationBadge from './NotificationBadge';
import { DrawerSkeleton } from './NotificationSkeleton';
import { ROUTES } from '../../constants';

const NotificationDrawer = () => {
  const navigate = useNavigate();

  const drawerOpen = useNotificationStore((s) => s.drawerOpen);
  const toggleDrawer = useNotificationStore((s) => s.toggleDrawer);
  const setDrawerOpen = useNotificationStore((s) => s.setDrawerOpen);
  const notifications = useNotificationStore((s) => s.notifications);
  const loadingNotifications = useNotificationStore((s) => s.loadingNotifications);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);

  const unreadCount = getUnreadCount();
  const recentNotifications = notifications
    .filter((n) => !n.isArchived)
    .slice(0, 5);

  const user = useAppStore((s) => s.user);
  const isSupervisor = user?.role === 'Supervisor';
  const notificationsRoute = isSupervisor ? ROUTES.SUPERVISOR_NOTIFICATIONS : ROUTES.NOTIFICATIONS;

  useEffect(() => {
    // Only fetch if we haven't loaded yet
    if (notifications.length === 0) {
      fetchNotifications(user?.role);
    }
  }, [user?.role]);  // eslint-disable-line

  const handleViewAll = () => {
    setDrawerOpen(false);
    navigate(notificationsRoute);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setDrawerOpen(false);
    if (notification.actionRoute) {
      navigate(notification.actionRoute);
    } else {
      navigate(notificationsRoute);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={toggleDrawer}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        id="notification-bell-btn"
        style={{ position: 'relative', fontSize: '1.2rem', color: 'var(--color-neutral-500)' }}
      >
        <RiBellLine />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
            }}
          >
            <NotificationBadge count={unreadCount} size="sm" pulse />
          </span>
        )}
      </button>

      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Click-away overlay */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 50 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />

            {/* Panel */}
            <motion.div
              id="notification-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Notifications"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.75rem)',
                right: 0,
                width: 360,
                maxHeight: 'calc(100vh - 100px)',
                background: '#fff',
                borderRadius: '1rem',
                boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
                zIndex: 51,
                overflow: 'hidden',
                border: '1px solid var(--color-neutral-200)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: '1px solid var(--color-neutral-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #f8faff, #fff)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <h6 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
                    Notifications
                  </h6>
                  {unreadCount > 0 && (
                    <NotificationBadge count={unreadCount} size="sm" pulse={false} />
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="btn btn-ghost"
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-primary-600)',
                      fontWeight: 600,
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                    }}
                    aria-label="Mark all notifications as read"
                  >
                    <RiCheckDoubleLine />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {loadingNotifications ? (
                  <DrawerSkeleton />
                ) : recentNotifications.length === 0 ? (
                  <div
                    style={{
                      padding: '2.5rem 1.5rem',
                      textAlign: 'center',
                      color: 'var(--color-neutral-400)',
                    }}
                  >
                    <RiBellLine style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
                      You're all caught up!
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem' }}>
                      No new notifications.
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      compact
                      onClick={handleNotificationClick}
                      onMarkRead={markAsRead}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '0.75rem',
                  borderTop: '1px solid var(--color-neutral-100)',
                  background: 'var(--color-neutral-50)',
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={handleViewAll}
                  className="btn btn-ghost"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--color-primary-600)',
                    padding: '0.5rem',
                  }}
                >
                  View All Notifications
                  <RiArrowRightLine />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDrawer;
