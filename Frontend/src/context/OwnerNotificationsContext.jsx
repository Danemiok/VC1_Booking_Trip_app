import React from 'react';
import { bookingService } from '@/services/bookingService';
import { messageService } from '@/services/messageService';
import { useAuth } from '@/context/AuthContext';
const OwnerNotificationsContext = React.createContext(undefined);
export const OwnerNotificationsProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const enabled = isAuthenticated && user?.role === 'owner';
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    const [activeNotification, setActiveNotification] = React.useState(null);
    const refresh = React.useCallback(async ({ silent = false } = {}) => {
        if (!enabled)
            return;
        try {
            if (!silent)
                setLoading(true);
            const [bookingRes, chatRes] = await Promise.all([
                bookingService.getOwnerNotifications({ limit: 25 }),
                messageService.getOwnerUnreadCount()
            ]);
            const next = Array.isArray(bookingRes?.data) ? bookingRes.data : [];
            const bookingUnread = Number(bookingRes?.unread_count ?? bookingRes?.unreadCount ?? next.filter((n) => !n?.readAt).length);
            const chatUnread = Number(chatRes?.unread_count ?? 0);
            setNotifications(next);
            const totalUnread = (Number.isFinite(bookingUnread) ? bookingUnread : 0) + chatUnread;
            setUnreadCount(totalUnread);
        }
        catch (error) {
            // best-effort: don't break the UI if notifications fail
            console.error('Failed to fetch owner notifications:', error);
        }
        finally {
            if (!silent)
                setLoading(false);
        }
    }, [enabled]);
    React.useEffect(() => {
        if (!enabled) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }
        refresh();
        const id = window.setInterval(() => refresh({ silent: true }), 30000);
        return () => window.clearInterval(id);
    }, [enabled, refresh]);
    const markRead = React.useCallback(async (notificationId) => {
        if (!enabled || !notificationId)
            return;
        try {
            await bookingService.markOwnerNotificationRead(notificationId);
        }
        catch (error) {
            console.error('Failed to mark notification read:', error);
            return;
        }
        setNotifications((prev) => prev.map((n) => String(n.id) === String(notificationId) ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n));
        setUnreadCount((c) => Math.max(0, c - 1));
    }, [enabled]);
    const markAllRead = React.useCallback(async () => {
        if (!enabled)
            return;
        try {
            await bookingService.markAllOwnerNotificationsRead();
        }
        catch (error) {
            console.error('Failed to mark all notifications read:', error);
            return;
        }
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
        setUnreadCount(0);
    }, [enabled]);
    const value = React.useMemo(() => ({
        notifications,
        unreadCount,
        loading,
        activeNotification,
        refresh,
        markRead,
        markAllRead,
        openNotification: (notification) => setActiveNotification(notification),
        closeNotification: () => setActiveNotification(null),
    }), [activeNotification, loading, markAllRead, markRead, notifications, refresh, unreadCount]);
    return <OwnerNotificationsContext.Provider value={value}>{children}</OwnerNotificationsContext.Provider>;
};
export const useOwnerNotifications = () => {
    const ctx = React.useContext(OwnerNotificationsContext);
    if (!ctx) {
        throw new Error('useOwnerNotifications must be used within an OwnerNotificationsProvider');
    }
    return ctx;
};
