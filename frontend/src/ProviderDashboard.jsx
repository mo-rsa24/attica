import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaTools,
} from 'react-icons/fa';
import { useAuth } from './AuthContext';
import BookingStatusBadge from './components/booking/BookingStatusBadge';
import ProviderCounterModal from './components/booking/ProviderCounterModal';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDT(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function timeUntilExpiry(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `Expires in ${h}h ${m}m`;
  return `Expires in ${m}m`;
}

function roleLabel(userType) {
  const map = { artist: 'Artist', vendor: 'Vendor', venue: 'Venue Manager' };
  return map[userType] || 'Provider';
}

// ---------------------------------------------------------------------------
// Pending request card
// ---------------------------------------------------------------------------
function RequestCard({ request, tokens, onRefresh }) {
  const [declining, setDeclining] = useState(false);
  const [declineMsg, setDeclineMsg] = useState('');
  const [busy, setBusy] = useState(null);
  const [counterOpen, setCounterOpen] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const act = async (endpoint, body = {}) => {
    setBusy(endpoint);
    setErr('');
    try {
      const res = await fetch(`/api/scheduling/requests/${request.id}/${endpoint}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens?.access}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.detail || 'Action failed.');
        return;
      }
      onRefresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(null);
    }
  };

  const expiry = timeUntilExpiry(request.expires_at);
  const isExpiringSoon = expiry && !expiry.startsWith('Expires in') === false &&
    new Date(request.expires_at) - Date.now() < 6 * 3_600_000;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">
            {request.event_title || `Request #${request.id}`}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            by <span className="font-medium text-gray-700">{request.organizer_username}</span>
          </p>
        </div>
        <BookingStatusBadge status={request.status} />
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FaCalendarAlt className="text-gray-400 flex-shrink-0" />
        <span>{formatDT(request.requested_start_at)} — {formatDT(request.requested_end_at)}</span>
      </div>

      {/* Expiry warning */}
      {expiry && (
        <div className={`flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-1.5 ${
          isExpiringSoon ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
        }`}>
          <FaClock className="flex-shrink-0" />
          {expiry}
        </div>
      )}

      {request.message && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 italic">
          "{request.message}"
        </p>
      )}

      {err && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>
      )}

      {/* Actions */}
      {request.status === 'pending' && !declining && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => act('approve')}
            disabled={busy !== null}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 text-sm"
          >
            {busy === 'approve' ? <FaSpinner className="animate-spin" /> : <FaCheck />}
            Accept
          </button>
          <button
            onClick={() => setCounterOpen(true)}
            disabled={busy !== null}
            className="w-full flex items-center justify-center gap-2 border border-amber-400 text-amber-700 bg-amber-50 font-semibold py-2.5 rounded-xl hover:bg-amber-100 transition-all disabled:opacity-60 text-sm"
          >
            Propose different terms
          </button>
          <button
            onClick={() => setDeclining(true)}
            disabled={busy !== null}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-60 text-sm"
          >
            <FaTimes /> Decline
          </button>
        </div>
      )}

      {request.status === 'pending' && declining && (
        <div className="flex flex-col gap-2">
          <textarea
            rows={2}
            value={declineMsg}
            onChange={(e) => setDeclineMsg(e.target.value)}
            placeholder="Reason (optional)…"
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex gap-2">
            <button
              onClick={() => act('decline', { message: declineMsg })}
              disabled={busy !== null}
              className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-all disabled:opacity-60 text-sm"
            >
              {busy === 'decline' ? 'Declining…' : 'Confirm decline'}
            </button>
            <button
              onClick={() => { setDeclining(false); setDeclineMsg(''); }}
              className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {request.status !== 'pending' && (
        <button
          onClick={() => navigate(`/bookings/${request.id}`)}
          className="w-full text-center text-sm font-semibold text-pink-600 hover:text-pink-700 py-2"
        >
          View full details →
        </button>
      )}

      {counterOpen && (
        <ProviderCounterModal
          bookingRequest={request}
          onClose={() => setCounterOpen(false)}
          onSuccess={() => { setCounterOpen(false); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmed booking row
// ---------------------------------------------------------------------------
function BookingRow({ booking }) {
  return (
    <Link
      to={`/booking-detail/${booking.id}`}
      className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {booking.event_name || `Booking #${booking.id}`}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{formatDT(booking.start_at)}</p>
      </div>
      <BookingStatusBadge status={booking.status} />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Calendar mini-view
// ---------------------------------------------------------------------------
function CalendarView({ resourceId, tokens }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId || !tokens?.access) return;
    const today = new Date();
    const startDate = today.toISOString().slice(0, 10);
    const endDate = new Date(today.setDate(today.getDate() + 30)).toISOString().slice(0, 10);

    fetch(`/api/scheduling/calendar/?scope=resource&resource_id=${resourceId}&start_date=${startDate}&end_date=${endDate}`, {
      headers: { Authorization: `Bearer ${tokens.access}` },
    })
      .then((r) => r.json())
      .then((data) => { setEvents(Array.isArray(data) ? data : data.results || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [resourceId, tokens]);

  const STATUS_COLORS = {
    AVAILABLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    BOOKED: 'bg-pink-100 text-pink-800 border-pink-200',
    BLACKOUT: 'bg-gray-200 text-gray-600 border-gray-300',
    HOLD: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
      <FaSpinner className="animate-spin" /> Loading calendar…
    </div>
  );

  if (!events.length) return (
    <p className="text-center py-8 text-sm text-gray-400">No calendar events in the next 30 days.</p>
  );

  return (
    <div className="space-y-2">
      {events.slice(0, 20).map((ev) => (
        <div
          key={ev.id}
          className={`flex items-center justify-between gap-3 border rounded-xl px-4 py-3 text-sm ${STATUS_COLORS[ev.type] || 'bg-gray-50 border-gray-200 text-gray-700'}`}
        >
          <span className="font-medium truncate">{ev.title || ev.type}</span>
          <span className="flex-shrink-0 text-xs">{formatDT(ev.start_at)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------
export default function ProviderDashboard() {
  const { tokens, user } = useAuth();
  const [resource, setResource] = useState(null);
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  const userType = user?.user_type;
  const label = roleLabel(userType);

  const load = useCallback(async () => {
    if (!tokens?.access) return;
    setLoading(true);
    try {
      // Fetch user's own resource
      const resRes = await fetch(`/api/scheduling/resources/?owner_id=${user?.id}`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const resData = await resRes.json();
      const myResource = Array.isArray(resData)
        ? resData[0]
        : resData.results?.[0] || null;
      setResource(myResource);

      // Fetch incoming booking requests (as provider)
      const reqRes = await fetch('/api/scheduling/requests/?role=provider', {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const reqData = await reqRes.json();
      setRequests(Array.isArray(reqData) ? reqData : reqData.results || []);

      // Fetch confirmed bookings (as provider)
      const bookRes = await fetch('/api/scheduling/bookings/?role=provider', {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      const bookData = await bookRes.json();
      setBookings(Array.isArray(bookData) ? bookData : bookData.results || []);
    } catch {
      // silently fail — data partial is still useful
    } finally {
      setLoading(false);
    }
  }, [tokens]);

  useEffect(() => { load(); }, [load]);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const otherRequests = requests.filter((r) => r.status !== 'pending');
  const upcomingBookings = bookings.filter((b) =>
    ['hold', 'confirmed', 'in_progress'].includes(b.status)
  );

  const TABS = [
    { key: 'requests', label: 'Requests', count: pendingRequests.length },
    { key: 'bookings', label: 'Bookings', count: upcomingBookings.length },
    { key: 'calendar', label: 'Calendar', count: null },
  ];

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-pink-500">{label} Workspace</p>
            <h1 className="mt-1 text-3xl font-black text-gray-900">My Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/provider-availability"
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FaTools className="text-gray-400" />
              Set Availability
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending requests', value: pendingRequests.length, color: 'text-amber-600' },
              { label: 'Active bookings', value: upcomingBookings.length, color: 'text-emerald-600' },
              { label: 'Total requests', value: requests.length, color: 'text-pink-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* No resource warning */}
        {!loading && !resource && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Your marketplace profile is not set up yet.</p>
              <p className="text-sm text-amber-700 mt-1">
                Set up your availability so organizers can find and book you.{' '}
                <Link to="/provider-availability" className="underline font-semibold">Set up now →</Link>
              </p>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.key ? 'bg-pink-100 text-pink-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <FaSpinner className="animate-spin text-xl" /> Loading your dashboard…
          </div>
        ) : (
          <>
            {/* Requests tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {pendingRequests.length > 0 && (
                  <>
                    <h2 className="text-base font-bold text-gray-800">Awaiting your response</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {pendingRequests.map((r) => (
                        <RequestCard key={r.id} request={r} tokens={tokens} onRefresh={load} />
                      ))}
                    </div>
                  </>
                )}

                {otherRequests.length > 0 && (
                  <>
                    <h2 className="text-base font-bold text-gray-800 mt-6">Previous requests</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {otherRequests.map((r) => (
                        <RequestCard key={r.id} request={r} tokens={tokens} onRefresh={load} />
                      ))}
                    </div>
                  </>
                )}

                {requests.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-medium">No booking requests yet.</p>
                    <p className="text-sm mt-1">Once organizers find you in search, requests will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* Bookings tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-3">
                {upcomingBookings.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="font-medium">No active bookings.</p>
                  </div>
                )}
                {upcomingBookings.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
                {bookings.filter((b) => !['hold', 'confirmed', 'in_progress'].includes(b.status)).length > 0 && (
                  <>
                    <h2 className="text-base font-bold text-gray-800 pt-4">Past bookings</h2>
                    {bookings
                      .filter((b) => !['hold', 'confirmed', 'in_progress'].includes(b.status))
                      .map((b) => <BookingRow key={b.id} booking={b} />)}
                  </>
                )}
              </div>
            )}

            {/* Calendar tab */}
            {activeTab === 'calendar' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-4">Next 30 days</h2>
                {resource ? (
                  <CalendarView resourceId={resource.id} tokens={tokens} />
                ) : (
                  <p className="text-center py-8 text-sm text-gray-400">
                    Set up your availability profile to see your calendar.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
