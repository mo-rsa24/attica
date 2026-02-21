import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaComments, FaMapMarkerAlt, FaMusic, FaStore } from 'react-icons/fa';
import BookingStatusBadge from './BookingStatusBadge';

const providerTypeIcons = {
  vendor: FaStore,
  artist: FaMusic,
  venue: FaMapMarkerAlt,
};

const providerTypeLabels = {
  vendor: 'Vendor',
  artist: 'Artist',
  venue: 'Venue',
};

export default function BookingCard({
  booking,
  userRole = 'organizer', // 'organizer' or 'provider'
  onAccept,
  onReject,
  onCancel,
  onMessage,
  compact = false,
}) {
  const navigate = useNavigate();
  const Icon = providerTypeIcons[booking.provider_type] || FaStore;

  const handleMessageClick = () => {
    if (booking.chatroom_id) {
      navigate(`/dm/${booking.chatroom_id}`);
    } else if (onMessage) {
      onMessage(booking);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBD';
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'ZAR') => {
    if (!amount) return 'Price TBD';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {userRole === 'organizer' ? booking.provider_username : booking.organizer_username}
            </p>
            <p className="text-sm text-gray-500">
              {providerTypeLabels[booking.provider_type]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookingStatusBadge status={booking.status} size="sm" />
          {booking.chatroom_id && (
            <button
              onClick={handleMessageClick}
              className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            >
              <FaComments className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-100 rounded-xl">
              <Icon className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {userRole === 'organizer' ? booking.provider_username : booking.organizer_username}
              </h3>
              <p className="text-sm text-gray-500">
                {providerTypeLabels[booking.provider_type]}
              </p>
            </div>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Event info */}
        {booking.event_name && (
          <div className="flex items-center gap-2 text-sm">
            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{booking.event_name}</span>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{formatDate(booking.proposed_date || booking.event_date)}</span>
        </div>

        {/* Amount */}
        {(booking.bid_amount || booking.final_amount) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {booking.status === 'successful' ? 'Final Amount' : 'Bid Amount'}
            </span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(booking.final_amount || booking.bid_amount, booking.currency)}
            </span>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">{booking.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {/* Provider actions for pending bookings */}
          {userRole === 'provider' && booking.status === 'pending' && (
            <>
              <button
                onClick={() => onAccept?.(booking)}
                className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onReject?.(booking)}
                className="flex-1 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Decline
              </button>
            </>
          )}

          {/* Organizer actions */}
          {userRole === 'organizer' && booking.status !== 'cancelled' && booking.status !== 'rejected' && (
            <button
              onClick={() => onCancel?.(booking)}
              className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          )}

          {/* Message button */}
          {booking.chatroom_id && (
            <button
              onClick={handleMessageClick}
              className="flex-1 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaComments className="w-4 h-4" />
              Message
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
