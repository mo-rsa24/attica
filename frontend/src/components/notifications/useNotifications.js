import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../AuthContext';

export function useNotifications() {
    const { tokens, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const reconnectRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!tokens?.access) return;
        try {
            const res = await fetch('/api/notifications/', {
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [tokens]);

    const fetchUnreadCount = useCallback(async () => {
        if (!tokens?.access) return;
        try {
            const res = await fetch('/api/notifications/unread-count/', {
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unread_count);
            }
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, [tokens]);

    const markAsRead = useCallback(async (notificationId) => {
        if (!tokens?.access) return;
        try {
            const res = await fetch(`/api/notifications/${notificationId}/read/`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            if (res.ok) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, [tokens]);

    const markAllAsRead = useCallback(async () => {
        if (!tokens?.access) return;
        try {
            const res = await fetch('/api/notifications/mark-all-read/', {
                method: 'POST',
                headers: { Authorization: `Bearer ${tokens.access}` }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, [tokens]);

    // WebSocket connection for real-time notifications
    useEffect(() => {
        if (!tokens?.access || !user) return;

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://${window.location.host}/ws/notifications/?token=${tokens.access}`;

        const connect = () => {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'notification' && data.notification) {
                    // Add new notification to the top
                    setNotifications(prev => [data.notification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            };

            socket.onclose = () => {
                socketRef.current = null;
                // Reconnect after 5 seconds
                reconnectRef.current = setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
            socketRef.current?.close();
        };
    }, [tokens, user]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, [fetchNotifications, fetchUnreadCount]);

    // Poll for unread count every 30 seconds as fallback
    useEffect(() => {
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    };
}
