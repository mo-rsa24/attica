import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useNotifications } from './useNotifications';

function NotificationItem({ notification, onRead, onClick }) {
    const getIcon = () => {
        switch (notification.notification_type) {
            case 'new_message':
                return '💬';
            case 'new_bid':
                return '💰';
            case 'bid_accepted':
                return '✅';
            case 'bid_declined':
                return '❌';
            case 'bid_countered':
                return '🔄';
            default:
                return '🔔';
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div
            className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.is_read ? 'bg-blue-50' : ''
            }`}
            onClick={() => {
                if (!notification.is_read) onRead(notification.id);
                onClick(notification);
            }}
        >
            <div className="flex items-start gap-3">
                <span className="text-xl">{getIcon()}</span>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                        {notification.title}
                    </p>
                    {notification.message && (
                        <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.created_at)}</p>
                </div>
                {!notification.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                )}
            </div>
        </div>
    );
}

export default function NotificationBell() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        setIsOpen(false);
        if (notification.deep_link) {
            navigate(notification.deep_link);
        } else if (notification.link_type === 'chat' && notification.link_id) {
            navigate(`/dm/${notification.link_id}`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <FaBell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <FaCheckDouble className="w-3 h-3" />
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FaBell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                    onClick={handleNotificationClick}
                                />
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="border-t p-2 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/notifications');
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
