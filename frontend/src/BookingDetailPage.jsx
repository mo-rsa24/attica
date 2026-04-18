import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheck,
  FaClock,
  FaSpinner,
  FaTimes,
  FaUser,
} from 'react-icons/fa';
import { useAuth } from './AuthContext';
import BookingStatusBadge from './components/booking/BookingStatusBadge';
import { schedulingApi, schedulingFormatters } from './api/schedulingApi';

const { formatDateTime, toLocalInputValue, toIsoFromLocalInput } = schedulingFormatters;

// ---------------------------------------------------------------------------
// Status timeline
// ---------------------------------------------------------------------------
const STATUS_ORDER = ['hold', 'confirmed', 'in_progress', 'completed'];

function StatusTimeline({ status }) {
  const isCancelled = status === 'cancelled' || status === 'expired';
  const isReschedulePending = status === 'reschedule_pending';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUS_ORDER.map((s, i) => {
        const currentIdx = STATUS_ORDER.indexOf(status);
        const isDone = currentIdx > i;
        const isActive = s === status || (isReschedulePending && s === 'confirmed');
        return (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isCancelled && s === status
                ? 'bg-red-100 border-red-300 text-red-700'
                : isActive
                  ? 'bg-pink-100 border-pink-300 text-pink-700'
                  : isDone
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-gray-100 border-gray-200 text-gray-400'
            }`}>
              {isDone && <FaCheck className="text-[10px]" />}
              {s.replace('_', ' ')}
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <span className={`text-xs ${isDone ? 'text-emerald-400' : 'text-gray-300'}`}>→</span>
            )}
          </React.Fragment>
        );
      })}
      {isCancelled && (
        <div className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-red-100 border-red-300 text-red-700 flex items-center gap-1.5">
          <FaTimes className="text-[10px]" />
          {status}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reschedule form
// ---------------------------------------------------------------------------
function RescheduleForm({ booking, tokens, onDone, onCancel }) {
  const [newStart, setNewStart] = useState(toLocalInputValue(booking.start_at));
  const [newEnd, setNewEnd] = useState(toLocalInputValue(booking.end_at));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const startIso = toIsoFromLocalInput(newStart);
    const endIso = toIsoFromLocalInput(newEnd);
    if (!startIso || !endIso) { setError('Please enter valid dates.'); return; }
    if (endIso <= startIso) { setError('End must be after start.'); return; }
    setLoading(true);
    setError('');
    try {
      await schedulingApi.rescheduleBooking(tokens?.access, booking.id, {
        new_start_at: startIso,
        new_end_at: endIso,
      });
      onDone();
    } catch (e) {
      setError(e.message || 'Reschedule failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-amber-900">Propose new time</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">New start</label>
          <input
            type="datetime-local"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">New end</label>
          <input
            type="datetime-local"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-amber-600 text-white font-bold py-2.5 rounded-xl hover:bg-amber-700 transition-all disabled:opacity-60 text-sm"
        >
          {loading ? 'Rescheduling…' : 'Confirm reschedule'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cancel form
// ---------------------------------------------------------------------------
function CancelForm({ booking, tokens, onDone, onCancel }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await schedulingApi.cancelBooking(tokens?.access, booking.id, reason);
      onDone();
    } catch (e) {
      setError(e.message || 'Cancellation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-red-200 bg-red-50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-red-900">Cancel booking</h3>
      <p className="text-sm text-red-700">This action cannot be undone. Please provide a reason.</p>
      <textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for cancellation…"
        className="w-full border border-red-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
      />
      {error && <p className="text-sm text-red-600 bg-red-100 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-all disabled:opacity-60 text-sm"
        >
          {loading ? 'Cancelling…' : 'Confirm cancel'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function BookingDetailPage() {
  const { id } = useParams();
  const { tokens, user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState(null); // null | 'reschedule' | 'cancel'
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [openingChat, setOpeningChat] = useState(false);

  const load = useCallback(async () => {
    if (!tokens?.access || !id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/scheduling/bookings/${id}/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (res.status === 404) { setError('Booking not found.'); return; }
      if (!res.ok) { setError('Failed to load booking.'); return; }
      setBooking(await res.json());
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }, [tokens, id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
        <FaSpinner className="animate-spin text-2xl" />
        <span>Loading booking…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-semibold">{error}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-pink-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

  if (!booking) return null;

  const isProvider = user?.id && booking.resource_owner_id === user.id;
  const isOrganizer = user?.id && booking.organizer === user.id;
  const isActive = ['hold', 'confirmed', 'in_progress', 'reschedule_pending'].includes(booking.status);
  const isCompletable = isProvider && ['confirmed', 'in_progress'].includes(booking.status);
  const isCancellable = isActive;
  const isReschedulable = isActive && booking.status !== 'reschedule_pending';

  const handleOpenChat = async () => {
    if (!tokens?.access) return;
    // Determine who to message: if I'm the organizer, message the provider; if provider, message the organizer
    const counterpartUsername = isProvider
      ? booking.organizer_username
      : booking.resource_owner_username;
    if (!counterpartUsername) return;
    setOpeningChat(true);
    try {
      const res = await fetch(`/api/chat/rooms/with/${counterpartUsername}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.access}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error('Could not open chat');
      const room = await res.json();
      navigate(`/dm/${room.id}`);
    } catch (e) {
      setActionError(e.message || 'Could not open chat.');
    } finally {
      setOpeningChat(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    setActionError('');
    try {
      await schedulingApi.completeBooking(tokens?.access, booking.id);
      await load();
    } catch (e) {
      setActionError(e.message || 'Failed to mark complete.');
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back
        </button>

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-pink-500">
                Confirmed Booking #{booking.id}
              </p>
              <h1 className="mt-1 text-2xl font-black text-gray-900">
                {booking.resource_display_name || `Resource #${booking.resource}`}
              </h1>
              {booking.resource_type && (
                <p className="text-sm text-gray-500 mt-0.5 capitalize">{booking.resource_type}</p>
              )}
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Timeline */}
          <StatusTimeline status={booking.status} />

          {/* Time details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
              <FaCalendarAlt className="text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start</p>
                <p className="font-semibold text-gray-900 mt-0.5">{formatDateTime(booking.start_at)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4">
              <FaClock className="text-pink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End</p>
                <p className="font-semibold text-gray-900 mt-0.5">{formatDateTime(booking.end_at)}</p>
              </div>
            </div>
          </div>

          {/* Attendees & source */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <FaUser className="text-gray-400" />
              {booking.attendee_count} attendee{booking.attendee_count !== 1 ? 's' : ''}
            </span>
            {booking.source && (
              <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">
                {booking.source}
              </span>
            )}
          </div>

          {/* Parties */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Organizer</p>
              <p className="font-medium text-gray-800">
                {booking.organizer_first_name || booking.organizer_last_name
                  ? `${booking.organizer_first_name} ${booking.organizer_last_name}`.trim()
                  : booking.organizer_username || `User #${booking.organizer}`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Provider</p>
              <p className="font-medium text-gray-800">{booking.resource_display_name}</p>
            </div>
          </div>

          {/* Cancellation info */}
          {booking.cancellation_reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">Cancellation reason: </span>
              {booking.cancellation_reason}
            </div>
          )}

          {/* Reschedule pending */}
          {booking.status === 'reschedule_pending' && booking.reschedule_requested_start_at && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <p className="font-semibold mb-1">Reschedule requested</p>
              <p>New start: {formatDateTime(booking.reschedule_requested_start_at)}</p>
              <p>New end: {formatDateTime(booking.reschedule_requested_end_at)}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {isActive && action === null && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Actions</h2>
            {actionError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{actionError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              {isCompletable && (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 text-sm"
                >
                  {completing ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                  {completing ? 'Marking complete…' : 'Mark as Complete'}
                </button>
              )}
              {isReschedulable && (
                <button
                  onClick={() => setAction('reschedule')}
                  className="flex-1 flex items-center justify-center gap-2 border border-amber-400 text-amber-700 bg-amber-50 font-semibold py-3 rounded-xl hover:bg-amber-100 transition-all text-sm"
                >
                  <FaClock />
                  {isProvider ? 'Reschedule' : 'Request reschedule'}
                </button>
              )}
              {isCancellable && (
                <button
                  onClick={() => setAction('cancel')}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all text-sm"
                >
                  <FaTimes />
                  Cancel booking
                </button>
              )}
            </div>
            <div className="mt-3">
              <button
                onClick={handleOpenChat}
                disabled={openingChat}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-300 text-slate-600 font-semibold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                {openingChat ? <FaSpinner className="animate-spin" /> : '💬'}
                {openingChat ? 'Opening chat…' : 'Message the other party'}
              </button>
            </div>
          </div>
        )}

        {action === 'reschedule' && (
          <RescheduleForm
            booking={booking}
            tokens={tokens}
            onDone={() => { setAction(null); load(); }}
            onCancel={() => setAction(null)}
          />
        )}

        {action === 'cancel' && (
          <CancelForm
            booking={booking}
            tokens={tokens}
            onDone={() => { setAction(null); load(); }}
            onCancel={() => setAction(null)}
          />
        )}

        {/* Post-completion prompt */}
        {booking.status === 'completed' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
            <div className="text-4xl">🎉</div>
            <h2 className="font-black text-emerald-800 text-lg">Booking completed!</h2>
            {isOrganizer && (
              <p className="text-sm text-emerald-700">
                Leave a review to help others discover great providers.{' '}
                <Link to={`/review/${booking.id}`} className="underline font-semibold">
                  Write a review →
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Provider dashboard link */}
        {isProvider && (
          <div className="text-center">
            <Link to="/provider-dashboard" className="text-sm text-pink-600 hover:underline font-medium">
              ← Back to My Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
