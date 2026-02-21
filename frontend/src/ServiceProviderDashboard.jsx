import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  FaCalendarAlt,
  FaInbox,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaCalendarCheck,
  FaChevronRight,
  FaExclamationCircle,
} from 'react-icons/fa';
import { BookingCard } from './components/booking';

function SummaryCard({ icon: Icon, title, count, color, highlight, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 shadow-sm border transition-all cursor-pointer ${
        highlight
          ? 'border-yellow-300 ring-2 ring-yellow-100'
          : 'border-gray-100 hover:shadow-md hover:border-pink-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function BookingRequestCard({ booking, onAccept, onReject }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBD';
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount, currency = 'ZAR') => {
    if (!amount) return 'Price to discuss';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
      {/* Header with urgency indicator */}
      <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaExclamationCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            New Booking Request
          </span>
        </div>
        <span className="text-xs text-yellow-600">
          {new Date(booking.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Organizer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">From</p>
            <p className="font-semibold text-gray-900">{booking.organizer_username}</p>
          </div>
          <button
            onClick={() => booking.chatroom_id && navigate(`/dm/${booking.chatroom_id}`)}
            className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <FaComments className="w-5 h-5" />
          </button>
        </div>

        {/* Event */}
        <div>
          <p className="text-sm text-gray-500">Event</p>
          <p className="font-medium text-gray-900">{booking.event_name}</p>
        </div>

        {/* Date and Amount */}
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-gray-900">
              {formatDate(booking.proposed_date || booking.event_date)}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Offer</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(booking.bid_amount, booking.currency)}
            </p>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div>
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm text-gray-700 line-clamp-2">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button
          onClick={() => onReject(booking)}
          className="flex-1 px-4 py-2.5 text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => onAccept(booking)}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  );
}

function BlockedDatesList({ blockedDates }) {
  if (!blockedDates || blockedDates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaCalendarCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No blocked dates yet.</p>
        <p className="text-sm">Accept bookings to see your schedule here.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="space-y-2">
      {blockedDates.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <FaCalendarAlt className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{formatDate(item.date)}</p>
              <p className="text-sm text-gray-500">{item.booking_event}</p>
            </div>
          </div>
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Booked
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ServiceProviderDashboard() {
  const { user, tokens } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    const fetchData = async () => {
      if (!tokens?.access) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch bookings and blocked dates in parallel
        const [bookingsRes, availabilityRes] = await Promise.all([
          fetch('/api/chat/bookings/?role=provider', {
            headers: { Authorization: `Bearer ${tokens.access}` },
          }),
          fetch(`/api/chat/providers/${user?.id}/availability/`, {
            headers: { Authorization: `Bearer ${tokens.access}` },
          }),
        ]);

        if (!bookingsRes.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);

        if (availabilityRes.ok) {
          const availabilityData = await availabilityRes.json();
          setBlockedDates(availabilityData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokens?.access, user?.id]);

  const bookingStats = useMemo(() => ({
    incoming: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'successful').length,
    declined: bookings.filter(b => b.status === 'rejected').length,
    total: bookings.length,
  }), [bookings]);

  const pendingBookings = useMemo(
    () => bookings.filter(b => b.status === 'pending'),
    [bookings]
  );

  const confirmedBookings = useMemo(
    () => bookings.filter(b => b.status === 'successful'),
    [bookings]
  );

  const handleAccept = async (booking) => {
    try {
      const response = await fetch(`/api/chat/bookings/${booking.id}/accept/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to accept booking');
      }

      const updatedBooking = await response.json();
      setBookings(prev =>
        prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
      );

      // Refresh blocked dates
      const availabilityRes = await fetch(`/api/chat/providers/${user?.id}/availability/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (availabilityRes.ok) {
        setBlockedDates(await availabilityRes.json());
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (booking) => {
    const reason = window.prompt('Reason for declining (optional):');
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`/api/chat/bookings/${booking.id}/reject/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline booking');
      }

      const updatedBooking = await response.json();
      setBookings(prev =>
        prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your booking requests and schedule
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/scheduling')}
              className="px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaCalendarAlt className="w-4 h-4" />
              Scheduling
            </button>
            <button
              onClick={() => navigate('/dm')}
              className="px-4 py-2 text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaComments className="w-4 h-4" />
              Messages
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={FaInbox}
            title="Incoming Requests"
            count={bookingStats.incoming}
            color="bg-yellow-500"
            highlight={bookingStats.incoming > 0}
            onClick={() => setActiveTab('incoming')}
          />
          <SummaryCard
            icon={FaCheckCircle}
            title="Confirmed"
            count={bookingStats.confirmed}
            color="bg-green-500"
            onClick={() => setActiveTab('confirmed')}
          />
          <SummaryCard
            icon={FaClock}
            title="Declined"
            count={bookingStats.declined}
            color="bg-gray-400"
          />
          <SummaryCard
            icon={FaCalendarCheck}
            title="Blocked Dates"
            count={blockedDates.length}
            color="bg-pink-500"
            onClick={() => setActiveTab('calendar')}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'incoming', label: 'Incoming Requests', count: bookingStats.incoming },
            { id: 'confirmed', label: 'Confirmed Bookings', count: bookingStats.confirmed },
            { id: 'calendar', label: 'My Schedule' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : tab.id === 'incoming' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'incoming' && (
            <>
              {pendingBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <FaInbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No pending requests
                  </h3>
                  <p className="text-gray-600">
                    New booking requests from organizers will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingBookings.map(booking => (
                    <BookingRequestCard
                      key={booking.id}
                      booking={booking}
                      onAccept={handleAccept}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'confirmed' && (
            <>
              {confirmedBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <FaCheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No confirmed bookings yet
                  </h3>
                  <p className="text-gray-600">
                    Accept booking requests to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {confirmedBookings.map(booking => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      userRole="provider"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Blocked Dates
              </h3>
              <BlockedDatesList blockedDates={blockedDates} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
