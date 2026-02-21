import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaComments,
  FaChevronRight,
  FaStore,
  FaMusic,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { BookingCard, BookingStatusBadge } from './components/booking';

const providerTypeIcons = {
  vendor: FaStore,
  artist: FaMusic,
  venue: FaMapMarkerAlt,
};

function SummaryCard({ icon: Icon, title, count, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${onClick ? 'hover:border-pink-200' : ''}`}
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

function EventSection({ event, bookings, onCancelBooking }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  const bookingsByStatus = useMemo(() => ({
    drafts: bookings.filter(b => b.status === 'draft'),
    pending: bookings.filter(b => b.status === 'pending'),
    confirmed: bookings.filter(b => b.status === 'successful'),
    rejected: bookings.filter(b => b.status === 'rejected'),
  }), [bookings]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No date set';
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Event Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 rounded-xl">
            <FaCalendarAlt className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">
              {event.name || event.data?.name || 'Untitled Event'}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(event.date || event.data?.date)} • {bookings.length} provider{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {bookingsByStatus.confirmed.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                {bookingsByStatus.confirmed.length} confirmed
              </span>
            )}
            {bookingsByStatus.pending.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                {bookingsByStatus.pending.length} pending
              </span>
            )}
          </div>
          <FaChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Bookings */}
      {expanded && bookings.length > 0 && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userRole="organizer"
                onCancel={onCancelBooking}
              />
            ))}
          </div>
        </div>
      )}

      {expanded && bookings.length === 0 && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="text-center py-8 text-gray-500">
            <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No providers booked yet.</p>
            <button
              onClick={() => navigate('/services')}
              className="mt-3 text-pink-600 hover:text-pink-700 font-medium"
            >
              Find Providers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EventOrganizerDashboard() {
  const { user, tokens } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!tokens?.access) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch events and bookings in parallel
        const [eventsRes, bookingsRes] = await Promise.all([
          fetch('/api/events/my/', {
            headers: { Authorization: `Bearer ${tokens.access}` },
          }),
          fetch('/api/chat/bookings/?role=organizer', {
            headers: { Authorization: `Bearer ${tokens.access}` },
          }),
        ]);

        if (!eventsRes.ok || !bookingsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const eventsData = await eventsRes.json();
        const bookingsData = await bookingsRes.json();

        // Combine drafts and published events
        const allEvents = [
          ...(eventsData.drafts || []).map(e => ({ ...e, isDraft: true })),
          ...(eventsData.published || []).map(e => ({ ...e, isDraft: false })),
        ];

        setEvents(allEvents);
        setBookings(bookingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokens?.access]);

  const bookingStats = useMemo(() => ({
    drafts: bookings.filter(b => b.status === 'draft').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'successful').length,
    total: bookings.length,
  }), [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return bookings;
    if (activeTab === 'drafts') return bookings.filter(b => b.status === 'draft');
    if (activeTab === 'pending') return bookings.filter(b => b.status === 'pending');
    if (activeTab === 'confirmed') return bookings.filter(b => b.status === 'successful');
    return bookings;
  }, [bookings, activeTab]);

  const bookingsByEvent = useMemo(() => {
    const map = new Map();
    filteredBookings.forEach(booking => {
      const eventId = booking.event;
      if (!map.has(eventId)) {
        map.set(eventId, []);
      }
      map.get(eventId).push(booking);
    });
    return map;
  }, [filteredBookings]);

  const handleCancelBooking = async (booking) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/chat/bookings/${booking.id}/cancel/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh bookings
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
              Welcome back, {user?.username || 'Organizer'}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your events and provider bookings
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
            <button
              onClick={() => navigate('/createEvent')}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Create Event
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={FaCalendarAlt}
            title="Total Events"
            count={events.length}
            color="bg-pink-500"
            onClick={() => navigate('/events')}
          />
          <SummaryCard
            icon={FaClock}
            title="Pending Responses"
            count={bookingStats.pending}
            color="bg-yellow-500"
            onClick={() => setActiveTab('pending')}
          />
          <SummaryCard
            icon={FaCheckCircle}
            title="Confirmed"
            count={bookingStats.confirmed}
            color="bg-green-500"
            onClick={() => setActiveTab('confirmed')}
          />
          <SummaryCard
            icon={FaUsers}
            title="Total Bookings"
            count={bookingStats.total}
            color="bg-blue-500"
            onClick={() => setActiveTab('all')}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'drafts', label: 'Drafts', count: bookingStats.drafts },
            { id: 'pending', label: 'Pending', count: bookingStats.pending },
            { id: 'confirmed', label: 'Confirmed', count: bookingStats.confirmed },
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
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Events with Bookings */}
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <FaCalendarAlt className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first event to start booking providers.
              </p>
              <button
                onClick={() => navigate('/createEvent')}
                className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
              >
                <FaPlus className="w-4 h-4" />
                Create Event
              </button>
            </div>
          ) : (
            events.map(event => {
              const eventBookings = bookingsByEvent.get(event.id) || [];
              // Show all events in 'all' tab, or only events with matching bookings in filtered tabs
              if (activeTab !== 'all' && eventBookings.length === 0) return null;

              return (
                <EventSection
                  key={event.id}
                  event={event}
                  bookings={eventBookings}
                  onCancelBooking={handleCancelBooking}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
