import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import {
  FaBell,
  FaBookmark,
  FaCheckDouble,
  FaComment,
  FaTimes,
} from 'react-icons/fa';

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------
const BOOKING_TYPES = new Set([
  'booking_request',
  'booking_confirmed',
  'booking_rejected',
  'booking_cancelled',
  'counter_proposed',
]);

const DM_TYPES = new Set([
  'new_message',
  'new_bid',
  'bid_accepted',
  'bid_declined',
  'bid_countered',
]);

const TABS = [
  { key: 'all',      label: 'All',      icon: FaBell },
  { key: 'bookings', label: 'Bookings', icon: FaBookmark },
  { key: 'dm',       label: 'DMs',      icon: FaComment },
  { key: 'general',  label: 'General',  icon: FaBell },
];

function categoryOf(type) {
  if (BOOKING_TYPES.has(type)) return 'bookings';
  if (DM_TYPES.has(type)) return 'dm';
  return 'general';
}

// ---------------------------------------------------------------------------
// Type → visual config
// ---------------------------------------------------------------------------
const TYPE_CONFIG = {
  new_message:      { emoji: '💬', color: 'bg-blue-100 text-blue-600' },
  new_bid:          { emoji: '💰', color: 'bg-amber-100 text-amber-600' },
  bid_accepted:     { emoji: '✅', color: 'bg-emerald-100 text-emerald-600' },
  bid_declined:     { emoji: '❌', color: 'bg-red-100 text-red-600' },
  bid_countered:    { emoji: '🔄', color: 'bg-violet-100 text-violet-600' },
  booking_request:  { emoji: '📅', color: 'bg-pink-100 text-pink-600' },
  booking_confirmed:{ emoji: '🎉', color: 'bg-emerald-100 text-emerald-600' },
  booking_rejected: { emoji: '🚫', color: 'bg-red-100 text-red-600' },
  booking_cancelled:{ emoji: '↩️', color: 'bg-slate-100 text-slate-600' },
  counter_proposed: { emoji: '🔁', color: 'bg-violet-100 text-violet-600' },
};

function typeConfig(type) {
  return TYPE_CONFIG[type] || { emoji: '🔔', color: 'bg-slate-100 text-slate-600' };
}

// ---------------------------------------------------------------------------
// Time helper
// ---------------------------------------------------------------------------
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
}

// ---------------------------------------------------------------------------
// Single notification row
// ---------------------------------------------------------------------------
function NotificationRow({ notification, onRead, onClose, navigate }) {
  const cfg = typeConfig(notification.notification_type);

  const handleClick = () => {
    if (!notification.is_read) onRead(notification.id);
    onClose();
    if (notification.deep_link) {
      navigate(notification.deep_link);
    } else if (notification.link_type === 'chat' && notification.link_id) {
      navigate(`/dm/${notification.link_id}`);
    } else if (notification.link_type === 'booking' && notification.link_id) {
      navigate(`/bookings/${notification.link_id}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-3 px-5 py-4 border-b border-slate-100 transition-colors hover:bg-slate-50 ${
        !notification.is_read ? 'bg-pink-50/60' : ''
      }`}
    >
      {/* Icon */}
      <span className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${cfg.color}`}>
        {cfg.emoji}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!notification.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">{timeAgo(notification.created_at)}</p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-pink-500 mt-1.5" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main modal
// ---------------------------------------------------------------------------
export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  // Count unread per category
  const unreadByTab = useMemo(() => {
    const counts = { all: 0, bookings: 0, dm: 0, general: 0 };
    notifications.forEach((n) => {
      if (!n.is_read) {
        counts.all += 1;
        counts[categoryOf(n.notification_type)] += 1;
      }
    });
    return counts;
  }, [notifications]);

  // Filter by active tab
  const filtered = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => categoryOf(n.notification_type) === activeTab);
  }, [notifications, activeTab]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <Motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Modal panel */}
          <Motion.div
            key="notif-modal"
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-4 top-16 md:inset-auto md:top-20 md:right-6 md:left-auto md:w-[520px] lg:w-[600px] z-50 flex flex-col bg-white rounded-2xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.35)] border border-slate-200/80 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 6rem)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-pink-600 transition-colors px-2 py-1 rounded-lg hover:bg-pink-50"
                  >
                    <FaCheckDouble className="text-xs" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* ── Tab bar ── */}
            <div className="flex border-b border-slate-100 bg-white flex-shrink-0">
              {TABS.map((tab) => {
                const count = unreadByTab[tab.key];
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all ${
                      isActive
                        ? 'border-pink-500 text-pink-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-pink-100 text-pink-600' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Notification list ── */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-7 h-7 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-400">Loading notifications…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                    {activeTab === 'bookings' ? '📅' : activeTab === 'dm' ? '💬' : '🔔'}
                  </div>
                  <p className="text-sm font-medium">
                    {activeTab === 'all'
                      ? 'No notifications yet'
                      : `No ${TABS.find((t) => t.key === activeTab)?.label} notifications`}
                  </p>
                </div>
              ) : (
                filtered.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    onClose={onClose}
                    navigate={navigate}
                  />
                ))
              )}
            </div>

            {/* ── Footer ── */}
            {filtered.length > 0 && (
              <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50 text-center">
                <p className="text-xs text-slate-400">
                  Showing {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
                  {activeTab !== 'all' && ` in ${TABS.find((t) => t.key === activeTab)?.label}`}
                </p>
              </div>
            )}
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
