import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaSearch } from 'react-icons/fa';

import { useAuth } from '../AuthContext';
import CalendarTimeline from '../components/scheduling/CalendarTimeline';
import { schedulingApi, schedulingFormatters } from '../api/schedulingApi';

const PROVIDER_ROLE_SET = new Set(['VENUE_MANAGER', 'ARTIST', 'SERVICE_PROVIDER', 'VENUE', 'VENDOR']);

const getRoleFlags = (user, resources, events) => {
  const roles = user?.roles || [];
  const roleSet = new Set(roles);
  const isOrganizer = roleSet.has('EVENT_ORGANIZER') || (events?.length || 0) > 0;
  const isProvider = roles.some((role) => PROVIDER_ROLE_SET.has(role)) || (resources?.length || 0) > 0;
  const isAdmin = roleSet.has('ADMIN') || user?.is_staff || user?.is_superuser;
  return { isOrganizer, isProvider, isAdmin };
};

const flattenEvents = (payload) => [
  ...(payload?.published || []),
  ...(payload?.drafts || []),
]
  .filter((event) => event?.id)
  .sort((a, b) => Number(b.id) - Number(a.id));

const parseIds = (value) => {
  if (!value) return [];
  return [...new Set(
    value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0),
  )];
};

const formatFailures = (failures) => failures.slice(0, 3).join(' | ');

export default function SchedulingPlannerPage() {
  const { user, tokens } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const rangeAutofilledRef = useRef(false);

  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');

  const [searchStart, setSearchStart] = useState(() => schedulingFormatters.toLocalInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [searchEnd, setSearchEnd] = useState(() => schedulingFormatters.toLocalInputValue(new Date(Date.now() + 28 * 60 * 60 * 1000)));
  const [resourceType, setResourceType] = useState('');
  const [city, setCity] = useState('');
  const [attendeeCount, setAttendeeCount] = useState(1);

  const [availability, setAvailability] = useState([]);
  const [calendarItems, setCalendarItems] = useState([]);
  const [providerRequests, setProviderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [requestLoadingId, setRequestLoadingId] = useState(null);
  const [bulkRequestLoading, setBulkRequestLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [prefillTargets, setPrefillTargets] = useState({
    eventId: '',
    artistIds: [],
    vendorIds: [],
    venueIds: [],
    autoRequest: false,
  });
  const [autoPrefillRequestDone, setAutoPrefillRequestDone] = useState(false);

  const authToken = tokens?.access;
  const roleFlags = useMemo(() => getRoleFlags(user, resources, events), [user, resources, events]);

  const selectedScope = roleFlags.isProvider && !roleFlags.isOrganizer ? 'resource' : 'organizer';
  const prefillTargetCount = prefillTargets.artistIds.length + prefillTargets.vendorIds.length + prefillTargets.venueIds.length;

  const prefillMatchedResources = useMemo(() => resources.filter((resource) => (
    (resource.artist && prefillTargets.artistIds.includes(resource.artist))
    || (resource.vendor && prefillTargets.vendorIds.includes(resource.vendor))
    || (resource.venue && prefillTargets.venueIds.includes(resource.venue))
  )), [resources, prefillTargets]);

  const prefillMissingCounts = useMemo(() => {
    const matchedArtistIds = new Set(prefillMatchedResources.map((resource) => resource.artist).filter(Boolean));
    const matchedVendorIds = new Set(prefillMatchedResources.map((resource) => resource.vendor).filter(Boolean));
    const matchedVenueIds = new Set(prefillMatchedResources.map((resource) => resource.venue).filter(Boolean));
    return {
      artists: prefillTargets.artistIds.filter((id) => !matchedArtistIds.has(id)).length,
      vendors: prefillTargets.vendorIds.filter((id) => !matchedVendorIds.has(id)).length,
      venues: prefillTargets.venueIds.filter((id) => !matchedVenueIds.has(id)).length,
    };
  }, [prefillMatchedResources, prefillTargets]);

  const ownedResources = useMemo(
    () => resources.filter((resource) => Number(resource.owner) === Number(user?.id)),
    [resources, user?.id],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const queryEventId = params.get('event_id') || '';
    const queryStartAt = params.get('start_at');
    const queryEndAt = params.get('end_at');
    const autoRequestFlag = params.get('auto_request');

    const parsedPrefill = {
      eventId: queryEventId,
      artistIds: parseIds(params.get('artist_ids')),
      vendorIds: parseIds(params.get('vendor_ids')),
      venueIds: parseIds(params.get('venue_ids')),
      autoRequest: autoRequestFlag === '1' || autoRequestFlag === 'true',
    };

    setPrefillTargets(parsedPrefill);
    setAutoPrefillRequestDone(false);
    rangeAutofilledRef.current = false;

    if (queryEventId) {
      setSelectedEventId(queryEventId);
    }
    if (queryStartAt) {
      setSearchStart(schedulingFormatters.toLocalInputValue(queryStartAt));
    }
    if (queryEndAt) {
      setSearchEnd(schedulingFormatters.toLocalInputValue(queryEndAt));
    }
  }, [location.search]);

  const loadBootstrap = async () => {
    if (!authToken) return;

    setLoading(true);
    setError('');

    try {
      const [eventsPayload, resourcesPayload] = await Promise.all([
        fetch('/api/events/my-events/', {
          headers: { Authorization: `Bearer ${authToken}` },
        }).then((res) => (res.ok ? res.json() : { drafts: [], published: [] })),
        schedulingApi.getResources(authToken).catch(() => []),
      ]);

      const parsedEvents = flattenEvents(eventsPayload);
      setEvents(parsedEvents);
      const parsedResources = Array.isArray(resourcesPayload) ? resourcesPayload : [];
      setResources(parsedResources);

      if (parsedEvents.length > 0) {
        setSelectedEventId((prev) => prev || prefillTargets.eventId || String(parsedEvents[0].id));
      }
      if (parsedResources.length > 0) {
        const ownResources = parsedResources.filter((resource) => Number(resource.owner) === Number(user?.id));
        const fallbackResource = ownResources[0] || parsedResources[0];
        setSelectedResourceId((prev) => prev || String(fallbackResource.id));
      }
    } catch (err) {
      setError(err.message || 'Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async () => {
    if (!authToken) return;

    const startIso = schedulingFormatters.toIsoFromLocalInput(searchStart);
    const endIso = schedulingFormatters.toIsoFromLocalInput(searchEnd);
    if (!startIso || !endIso) {
      setError('Please provide a valid calendar date range.');
      return;
    }

    setCalendarLoading(true);
    setError('');

    try {
      const calendarPayload = await schedulingApi.getCalendar(authToken, {
        scope: selectedScope,
        start_at: startIso,
        end_at: endIso,
        ...(selectedScope === 'organizer' && selectedEventId ? { event_id: selectedEventId } : {}),
        ...(selectedScope === 'resource' && selectedResourceId ? { resource_id: selectedResourceId } : {}),
      });

      setCalendarItems(calendarPayload?.results || []);
    } catch (err) {
      setError(err.message || 'Failed to load calendar view.');
    } finally {
      setCalendarLoading(false);
    }
  };

  const loadProviderInbox = async () => {
    if (!authToken || !roleFlags.isProvider) return;

    try {
      const inboxPayload = await schedulingApi.getRequests(authToken, {
        role: 'provider',
        status: 'pending',
      });
      setProviderRequests(Array.isArray(inboxPayload) ? inboxPayload : []);
    } catch (err) {
      setError(err.message || 'Failed to load provider requests.');
    }
  };

  useEffect(() => {
    loadBootstrap();
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    loadCalendar();
  }, [authToken, selectedScope, selectedEventId, selectedResourceId]);

  useEffect(() => {
    loadProviderInbox();
  }, [authToken, roleFlags.isProvider]);

  useEffect(() => {
    if (rangeAutofilledRef.current) return;
    if (!selectedEventId || !events.length) return;

    const hasQueryRange = new URLSearchParams(location.search || '').has('start_at')
      || new URLSearchParams(location.search || '').has('end_at');
    if (hasQueryRange) return;

    const selectedEvent = events.find((event) => String(event.id) === String(selectedEventId));
    const eventDate = selectedEvent?.date || selectedEvent?.data?.date;
    if (!eventDate) return;

    const start = new Date(`${eventDate}T12:00:00`);
    if (Number.isNaN(start.getTime())) return;
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    setSearchStart(schedulingFormatters.toLocalInputValue(start));
    setSearchEnd(schedulingFormatters.toLocalInputValue(end));
    rangeAutofilledRef.current = true;
  }, [selectedEventId, events, location.search]);

  const runAvailabilitySearch = async ({ silent = false } = {}) => {
    if (!authToken) return [];

    const startIso = schedulingFormatters.toIsoFromLocalInput(searchStart);
    const endIso = schedulingFormatters.toIsoFromLocalInput(searchEnd);
    if (!startIso || !endIso) {
      if (!silent) {
        setError('Please provide valid search dates.');
      }
      return [];
    }

    if (!silent) {
      setSearchLoading(true);
      setError('');
    }

    try {
      const payload = await schedulingApi.searchAvailability(authToken, {
        start_at: startIso,
        end_at: endIso,
        resource_type: resourceType || undefined,
        city: city || undefined,
        attendee_count: attendeeCount,
        limit: 100,
      });
      const resultList = payload?.results || [];
      setAvailability(resultList);
      return resultList;
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Failed to search availability.');
      }
      return [];
    } finally {
      if (!silent) {
        setSearchLoading(false);
      }
    }
  };

  const handleSearchAvailability = async (event) => {
    event.preventDefault();
    await runAvailabilitySearch();
  };

  const ensureEventSelection = () => {
    if (!selectedEventId) {
      setError('Select an organizer event before requesting or booking resources.');
      return false;
    }
    return true;
  };

  const buildSlotForResource = (resource, availabilityList, fallbackStart, fallbackEnd) => {
    const match = availabilityList.find((item) => Number(item.resource_id) === Number(resource.id));
    if (match?.windows?.length) {
      return {
        start_at: match.windows[0].start_at,
        end_at: match.windows[0].end_at,
      };
    }
    return {
      start_at: fallbackStart,
      end_at: fallbackEnd,
    };
  };

  const runBulkPrefillRequests = async ({ silent = false } = {}) => {
    if (!authToken || !ensureEventSelection()) return;
    if (prefillMatchedResources.length === 0) {
      if (!silent) {
        setError('No matching scheduling resources found for your selected listing items.');
      }
      return;
    }

    const fallbackStart = schedulingFormatters.toIsoFromLocalInput(searchStart);
    const fallbackEnd = schedulingFormatters.toIsoFromLocalInput(searchEnd);
    if (!fallbackStart || !fallbackEnd) {
      setError('Please provide a valid date range before requesting selected resources.');
      return;
    }

    setBulkRequestLoading(true);
    setError('');
    if (!silent) {
      setNotice('');
    }

    try {
      const availabilityList = availability.length > 0 ? availability : await runAvailabilitySearch({ silent: true });
      let successCount = 0;
      const failures = [];

      for (const resource of prefillMatchedResources) {
        const slot = buildSlotForResource(resource, availabilityList, fallbackStart, fallbackEnd);
        try {
          await schedulingApi.createRequest(authToken, {
            event_id: Number(selectedEventId),
            resource_id: Number(resource.id),
            start_at: slot.start_at,
            end_at: slot.end_at,
            attendee_count: attendeeCount,
            message: 'Created from listing step selection.',
          });
          successCount += 1;
        } catch (err) {
          failures.push(`${resource.display_name}: ${err.message}`);
        }
      }

      const summaryParts = [`Requested ${successCount}/${prefillMatchedResources.length} selected resources.`];
      if (failures.length > 0) {
        summaryParts.push(`Failures: ${formatFailures(failures)}`);
      }
      setNotice(summaryParts.join(' '));
      await loadCalendar();
      await loadProviderInbox();
    } finally {
      setBulkRequestLoading(false);
    }
  };

  const handleCreateRequest = async (resource, windowSlot) => {
    if (!authToken || !ensureEventSelection()) return;

    setRequestLoadingId(`request-${resource.resource_id}-${windowSlot.start_at}`);
    setError('');
    setNotice('');

    try {
      await schedulingApi.createRequest(authToken, {
        event_id: Number(selectedEventId),
        resource_id: resource.resource_id,
        start_at: windowSlot.start_at,
        end_at: windowSlot.end_at,
        attendee_count: attendeeCount,
        message: '',
      });
      setNotice(`Request sent to ${resource.display_name}.`);
      await loadCalendar();
      await loadProviderInbox();
    } catch (err) {
      setError(err.message || 'Failed to create request.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const handleCreateBooking = async (resource, windowSlot) => {
    if (!authToken || !ensureEventSelection()) return;

    setRequestLoadingId(`book-${resource.resource_id}-${windowSlot.start_at}`);
    setError('');
    setNotice('');

    try {
      await schedulingApi.createBooking(authToken, {
        event_id: Number(selectedEventId),
        resource_id: resource.resource_id,
        start_at: windowSlot.start_at,
        end_at: windowSlot.end_at,
        attendee_count: attendeeCount,
      });
      setNotice(`Booking confirmed for ${resource.display_name}.`);
      await loadCalendar();
    } catch (err) {
      setError(err.message || 'Failed to create booking.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const handleApproveRequest = async (requestItem) => {
    if (!authToken) return;
    setRequestLoadingId(`approve-${requestItem.id}`);
    setError('');
    setNotice('');

    try {
      await schedulingApi.approveRequest(authToken, requestItem.id);
      setNotice(`Approved request #${requestItem.id}.`);
      await loadProviderInbox();
      await loadCalendar();
    } catch (err) {
      setError(err.message || 'Failed to approve request.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const handleDeclineRequest = async (requestItem) => {
    if (!authToken) return;
    const reason = window.prompt('Decline reason (optional):', '') || '';

    setRequestLoadingId(`decline-${requestItem.id}`);
    setError('');
    setNotice('');

    try {
      await schedulingApi.declineRequest(authToken, requestItem.id, reason);
      setNotice(`Declined request #${requestItem.id}.`);
      await loadProviderInbox();
    } catch (err) {
      setError(err.message || 'Failed to decline request.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const handleCancelBooking = async (calendarItem) => {
    if (!authToken || !calendarItem?.id) return;
    if (!window.confirm('Cancel this booking?')) return;

    setRequestLoadingId(`cancel-${calendarItem.id}`);
    setError('');
    setNotice('');

    try {
      await schedulingApi.cancelBooking(authToken, calendarItem.id, 'Cancelled from scheduling planner UI.');
      setNotice(`Booking #${calendarItem.id} cancelled.`);
      await loadCalendar();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  const handleRescheduleBooking = async (calendarItem) => {
    if (!authToken || !calendarItem?.id) return;

    const startInput = window.prompt('New start date/time (YYYY-MM-DDTHH:mm):', searchStart);
    if (!startInput) return;
    const endInput = window.prompt('New end date/time (YYYY-MM-DDTHH:mm):', searchEnd);
    if (!endInput) return;

    const newStartAt = schedulingFormatters.toIsoFromLocalInput(startInput);
    const newEndAt = schedulingFormatters.toIsoFromLocalInput(endInput);
    if (!newStartAt || !newEndAt) {
      setError('Invalid reschedule date values provided.');
      return;
    }

    setRequestLoadingId(`reschedule-${calendarItem.id}`);
    setError('');
    setNotice('');

    try {
      await schedulingApi.rescheduleBooking(authToken, calendarItem.id, {
        new_start_at: newStartAt,
        new_end_at: newEndAt,
      });
      setNotice(`Booking #${calendarItem.id} rescheduled.`);
      await loadCalendar();
    } catch (err) {
      setError(err.message || 'Failed to reschedule booking.');
    } finally {
      setRequestLoadingId(null);
    }
  };

  useEffect(() => {
    if (!authToken) return;
    if (!prefillTargets.autoRequest) return;
    if (autoPrefillRequestDone) return;
    if (prefillTargetCount === 0) return;
    if (prefillMatchedResources.length === 0) return;
    if (!selectedEventId) return;

    runBulkPrefillRequests({ silent: true })
      .finally(() => setAutoPrefillRequestDone(true));
  }, [
    authToken,
    prefillTargets.autoRequest,
    prefillTargetCount,
    prefillMatchedResources,
    selectedEventId,
    autoPrefillRequestDone,
  ]);

  if (!authToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center max-w-lg">
          <h1 className="text-2xl font-bold text-gray-900">Scheduling Planner</h1>
          <p className="text-gray-600 mt-2">Please sign in to access booking and request workflows.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-5 px-5 py-2.5 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scheduling Planner</h1>
            <p className="text-gray-600 mt-1">Interactive availability, booking requests, confirmations, and calendar timeline.</p>
          </div>
          <button
            onClick={loadCalendar}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            disabled={calendarLoading}
          >
            {calendarLoading ? 'Refreshing...' : 'Refresh Calendar'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}
        {notice && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">{notice}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Organizer Events</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{events.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Provider Resources</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{resources.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-500">Pending Provider Requests</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{providerRequests.length}</p>
          </div>
        </div>

        {prefillTargetCount > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-indigo-900">Prefilled From Listing Selection</h2>
                <p className="text-sm text-indigo-700 mt-1">
                  Targets: {prefillTargetCount} | Matched resources: {prefillMatchedResources.length}
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  Missing matches: artists {prefillMissingCounts.artists}, vendors {prefillMissingCounts.vendors}, venues {prefillMissingCounts.venues}
                </p>
              </div>
              <button
                onClick={() => runBulkPrefillRequests()}
                disabled={bulkRequestLoading || prefillMatchedResources.length === 0}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                {bulkRequestLoading ? 'Requesting...' : `Request Matched (${prefillMatchedResources.length})`}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-900">Range + Scope</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <label className="text-sm text-gray-700">
              Start
              <input
                type="datetime-local"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={searchStart}
                onChange={(event) => setSearchStart(event.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              End
              <input
                type="datetime-local"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={searchEnd}
                onChange={(event) => setSearchEnd(event.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              Organizer Event
              <select
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
              >
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    #{event.id} {event.name || event.data?.name || 'Untitled Event'}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Provider Resource
              <select
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                value={selectedResourceId}
                onChange={(event) => setSelectedResourceId(event.target.value)}
              >
                <option value="">Select resource</option>
                {(selectedScope === 'resource' ? ownedResources : resources).map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    #{resource.id} {resource.display_name} ({resource.resource_type})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button
                onClick={loadCalendar}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800"
                disabled={calendarLoading}
              >
                {calendarLoading ? 'Loading...' : 'Load Timeline'}
              </button>
            </div>
          </div>
        </div>

        {roleFlags.isOrganizer && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaSearch className="text-pink-600" />
              <h2 className="text-lg font-semibold text-gray-900">Organizer Availability Search</h2>
            </div>

            <form onSubmit={handleSearchAvailability} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <label className="text-sm text-gray-700">
                Resource Type
                <select
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={resourceType}
                  onChange={(event) => setResourceType(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="venue">Venue</option>
                  <option value="artist">Artist</option>
                  <option value="vendor">Vendor</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                City
                <input
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Johannesburg"
                />
              </label>
              <label className="text-sm text-gray-700">
                Attendees
                <input
                  type="number"
                  min="1"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={attendeeCount}
                  onChange={(event) => setAttendeeCount(Math.max(1, Number(event.target.value) || 1))}
                />
              </label>
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full px-4 py-2 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700"
                  disabled={searchLoading}
                >
                  {searchLoading ? 'Searching...' : 'Search Availability'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {availability.length === 0 && (
                <p className="text-sm text-gray-500">Run a search to see bookable windows.</p>
              )}

              {availability.map((resource) => (
                <div key={resource.resource_id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.display_name}</h3>
                      <p className="text-xs text-gray-500">
                        {resource.resource_type} • {resource.city || 'Unknown city'} • {resource.timezone}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700 font-semibold">
                      {schedulingFormatters.bookingModeLabel(resource.booking_mode)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(resource.windows || []).slice(0, 6).map((windowSlot) => {
                      const requestActionId = `request-${resource.resource_id}-${windowSlot.start_at}`;
                      const bookingActionId = `book-${resource.resource_id}-${windowSlot.start_at}`;
                      const busy = requestLoadingId === requestActionId || requestLoadingId === bookingActionId;
                      const canInstantBook = resource.booking_mode !== 'approval_required';

                      return (
                        <div key={`${resource.resource_id}-${windowSlot.start_at}`} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {schedulingFormatters.formatDateTime(windowSlot.start_at)} to {schedulingFormatters.formatDateTime(windowSlot.end_at)}
                            </p>
                            <p className="text-xs text-gray-500">Capacity remaining: {windowSlot.capacity_remaining}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleCreateRequest(resource, windowSlot)}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200 text-amber-700 hover:bg-amber-50"
                              disabled={busy}
                            >
                              {requestLoadingId === requestActionId ? 'Sending...' : 'Send Request'}
                            </button>
                            {canInstantBook && (
                              <button
                                onClick={() => handleCreateBooking(resource, windowSlot)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                disabled={busy}
                              >
                                {requestLoadingId === bookingActionId ? 'Booking...' : 'Book Now'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {roleFlags.isProvider && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="text-pink-600" />
              <h2 className="text-lg font-semibold text-gray-900">Provider Request Inbox</h2>
            </div>

            {providerRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No pending booking requests at the moment.</p>
            ) : (
              <div className="space-y-3">
                {providerRequests.map((requestItem) => {
                  const approving = requestLoadingId === `approve-${requestItem.id}`;
                  const declining = requestLoadingId === `decline-${requestItem.id}`;
                  return (
                    <div key={requestItem.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">Request #{requestItem.id}</p>
                          <p className="text-sm text-gray-600">
                            Event #{requestItem.event} · Organizer #{requestItem.organizer} · Resource #{requestItem.resource}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {schedulingFormatters.formatDateTime(requestItem.requested_start_at)} to {schedulingFormatters.formatDateTime(requestItem.requested_end_at)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-700 font-semibold">
                          {requestItem.status}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleApproveRequest(requestItem)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          disabled={approving || declining}
                        >
                          {approving ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(requestItem)}
                          className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                          disabled={approving || declining}
                        >
                          {declining ? 'Declining...' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <FaCheckCircle className="text-pink-600" />
            <h2 className="text-lg font-semibold text-gray-900">Calendar Timeline</h2>
          </div>
          <CalendarTimeline
            items={calendarItems}
            emptyMessage="No requests or bookings in this range yet."
            onCancelBooking={handleCancelBooking}
            onRescheduleBooking={handleRescheduleBooking}
          />
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-gray-700">Loading scheduling planner...</div>
          </div>
        )}
      </div>
    </div>
  );
}
