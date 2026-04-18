import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from './useNotifications';
import NotificationsModal from './NotificationsModal';

export default function NotificationBell() {
    const [modalOpen, setModalOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

    return (
        <>
            <button
                onClick={() => setModalOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <FaBell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                loading={loading}
                markAsRead={markAsRead}
                markAllAsRead={markAllAsRead}
            />
        </>
    );
}
