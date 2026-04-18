import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaUsers, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import { schedulingApi, schedulingFormatters } from './api/schedulingApi.js';

const { toLocalInputValue, toIsoFromLocalInput } = schedulingFormatters;

function ArtistCard({ artist }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
      <img
        src={artist.profile_image || 'https://placehold.co/80x80/e2e8f0/94a3b8?text=A'}
        alt={artist.name}
        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
      />
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{artist.name}</h3>
        <p className="text-sm text-gray-500">@{artist.user?.username || 'artist'}</p>
        {artist.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {artist.genres.slice(0, 3).map((g) => (
              <span key={g} className="text-xs bg-rose-100 text-rose-700 rounded-full px-2 py-0.5 font-medium">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookArtistPage() {
  const { id } = useParams();
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const [artist, setArtist] = useState(null);
  const [resource, setResource] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState('');

  // Form state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!tokens?.access) return;
    let cancelled = false;

    const load = async () => {
      setLoadingPage(true);
      setPageError('');
      try {
        const headers = { Authorization: `Bearer ${tokens.access}` };

        // 1. Fetch artist profile
        const artistRes = await fetch(`/api/artists/artists/${id}/`, { headers });
        if (!artistRes.ok) {
          setPageError('Artist not found.');
          return;
        }
        const artistData = await artistRes.json();
        if (cancelled) return;
        setArtist(artistData);

        // 2. Find MarketplaceResource by owner_id
        const ownerId = artistData.owner || artistData.owner_id;
        if (ownerId) {
          const resourceData = await schedulingApi.getResources(tokens.access);
          const resources = Array.isArray(resourceData) ? resourceData : (resourceData?.results ?? []);
          const match = resources.find(
            (r) => String(r.owner) === String(ownerId) || String(r.owner_id) === String(ownerId)
          );
          if (!cancelled) setResource(match || null);
        }

        // 3. Fetch organizer's events
        const eventsRes = await fetch('/api/events/my-events/', { headers });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          if (!cancelled) {
            setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.results ?? []));
          }
        }
      } catch (err) {
        if (!cancelled) setPageError('Failed to load booking form.');
      } finally {
        if (!cancelled) setLoadingPage(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id, tokens?.access]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resource) return;
    if (!startAt || !endAt) {
      setSubmitError('Please select both start and end date/time.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const body = {
        resource_id: resource.id,
        start_at: toIsoFromLocalInput(startAt),
        end_at: toIsoFromLocalInput(endAt),
        attendee_count: attendeeCount ? parseInt(attendeeCount, 10) : null,
        message,
        ...(selectedEventId ? { event_id: parseInt(selectedEventId, 10) } : {}),
      };
      const result = await schedulingApi.createRequest(tokens.access, body);
      navigate(`/bookings/${result.id}`);
    } catch (err) {
      setSubmitError(err.message || 'Could not submit booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading booking form…</p>
        </div>
      </div>
    );
  }

  if (pageError || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-4">{pageError || 'Artist not found.'}</p>
          <Link to="/artists" className="text-rose-600 hover:underline">Browse artists</Link>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Link to={`/artists/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm">
          <FaArrowLeft /> Back to profile
        </Link>
        <div className="mb-6">
          <ArtistCard artist={artist} />
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <p className="text-amber-800 font-semibold text-lg mb-2">Not available for online booking</p>
          <p className="text-amber-700 text-sm">
            {artist.name} hasn&apos;t set up online booking yet. Contact them directly to discuss your event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        to={`/artists/${id}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium"
      >
        <FaArrowLeft /> Back to profile
      </Link>

      <h1 className="text-3xl font-black text-gray-900 mb-2">Request a booking</h1>
      <p className="text-gray-500 mb-8">Fill in your event details and send a booking request to the artist.</p>

      <ArtistCard artist={artist} />

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Event select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            <FaCalendarAlt className="inline mr-2 text-gray-400" />
            Link to an event <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          >
            <option value="">— No specific event (one-off booking) —</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name || ev.title || `Event #${ev.id}`}
              </option>
            ))}
          </select>
          {events.length === 0 && (
            <p className="mt-1.5 text-xs text-gray-400">
              No events found.{' '}
              <Link to="/createEvent" className="text-rose-500 hover:underline">Create an event</Link>
            </p>
          )}
        </div>

        {/* Date/time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start date &amp; time</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">End date &amp; time</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </div>

        {/* Attendee count */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            <FaUsers className="inline mr-2 text-gray-400" />
            Expected attendees <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            min="1"
            value={attendeeCount}
            onChange={(e) => setAttendeeCount(e.target.value)}
            placeholder="e.g. 200"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Message to artist <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your event, what you need from the artist, or any special requirements…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
          />
        </div>

        {/* Resource info strip */}
        {resource && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-sm">
            <FaMoneyBillWave className="text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-800">{resource.display_name}</span>
              {resource.booking_mode && (
                <span className="ml-2 text-emerald-600">
                  · {resource.booking_mode === 'instant' ? 'Instant booking' : 'Approval required'}
                </span>
              )}
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-rose-500 text-white font-bold py-4 rounded-2xl hover:bg-rose-600 disabled:opacity-60 transition-all text-lg"
        >
          {submitting ? 'Sending request…' : 'Send booking request'}
        </button>

        <p className="text-xs text-center text-gray-400">
          The artist will review your request and can accept, decline, or propose different terms.
        </p>
      </form>
    </div>
  );
}
