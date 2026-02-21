import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
    FaCalendarAlt,
    FaClock,
    FaExclamationTriangle,
    FaMapMarkerAlt,
    FaMusic,
    FaPlus,
    FaRedoAlt,
    FaStore,
    FaTrash
} from 'react-icons/fa';
import {useAuth} from './AuthContext';
import {getActiveRole, getRoleWorkspace} from './utils/roleWorkspace';

const STEP_ROUTE_MAP = {
    1: 'step1',
    2: 'step2',
    3: 'step3',
    4: 'step4',
    5: 'step5',
    6: 'step6',
    7: 'step7',
    8: 'step8',
    review: 'review',
    location: 'step3/location',
    artists: 'step3/artists',
    vendors: 'step3/vendors',
};

const ROLE_COPY = {
    EVENT_ORGANIZER: {
        eyebrow: 'My events',
        title: 'Keep building your experiences',
        description: 'Track drafts, resume setup where you left off, and publish when you are ready.',
        emptyTitle: 'No events yet',
        emptyMessage: 'You have not started creating any events yet.',
    },
    VENUE_MANAGER: {
        eyebrow: 'My venues',
        title: 'Manage your venue listings',
        description: 'Review the venues you have listed and keep details up to date.',
        emptyTitle: 'No venues yet',
        emptyMessage: 'Your listed venues will appear here after you add one.',
    },
    ARTIST: {
        eyebrow: 'My bookings',
        title: 'Track your artist bookings',
        description: 'Monitor incoming requests, confirmed gigs, and booking status updates.',
        emptyTitle: 'No bookings yet',
        emptyMessage: 'Your booking requests will appear here once organizers reach out.',
    },
    SERVICE_PROVIDER: {
        eyebrow: 'My offering',
        title: 'Manage your offerings',
        description: 'Review your published service offerings and keep pricing and details current.',
        emptyTitle: 'No offerings yet',
        emptyMessage: 'Your services will appear here after you add your first offering.',
    },
};

const BOOKING_STATUS_TONE = {
    draft: 'bg-slate-50 text-slate-700 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    successful: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
};

const canonicalRole = (role) => {
    if (role === 'ORGANIZER') return 'EVENT_ORGANIZER';
    if (role === 'VENDOR') return 'SERVICE_PROVIDER';
    if (role === 'VENUE') return 'VENUE_MANAGER';
    return role || 'EVENT_ORGANIZER';
};

const formatDateTime = (value) => {
    if (!value) return 'Not available';
    try {
        return new Date(value).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    } catch (err) {
        return value;
    }
};

const formatDate = (value) => {
    if (!value) return 'Date not set';
    try {
        return new Date(value).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch (err) {
        return value;
    }
};

const formatCurrency = (amount, currency = 'ZAR') => {
    if (amount === null || amount === undefined || amount === '') return 'Price not set';
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) return String(amount);
    try {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(parsed);
    } catch (err) {
        return `R${parsed}`;
    }
};

const resolveStepRoute = (currentStep, eventId) => {
    if (!currentStep) return null;
    const rawKey = typeof currentStep === 'string' ? currentStep.toLowerCase() : currentStep;
    if (STEP_ROUTE_MAP[rawKey]) {
        return eventId ? `/listing/${eventId}/${STEP_ROUTE_MAP[rawKey]}` : null;
    }

    const parsed = Number(rawKey);
    if (!Number.isNaN(parsed) && STEP_ROUTE_MAP[parsed]) {
        return eventId ? `/listing/${eventId}/${STEP_ROUTE_MAP[parsed]}` : null;
    }

    if (typeof currentStep === 'string' && currentStep.startsWith('/listing/')) {
        return currentStep;
    }

    return null;
};

const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({length: 4}).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/2"/>
                <div className="h-4 bg-gray-200 rounded w-4/5"/>
                <div className="h-4 bg-gray-200 rounded w-1/3"/>
                <div className="flex items-center justify-between pt-2">
                    <div className="h-9 bg-gray-200 rounded w-24"/>
                    <div className="h-9 bg-gray-200 rounded w-28"/>
                </div>
            </div>
        ))}
    </div>
);

const ErrorState = ({message, onRetry}) => (
    <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <FaExclamationTriangle/>
            <span>{message}</span>
        </div>
        {onRetry && (
            <button
                onClick={onRetry}
                className="px-3 py-2 bg-white text-rose-700 rounded-lg border border-rose-200 hover:bg-rose-100 font-semibold"
            >
                Try again
            </button>
        )}
    </div>
);

const EmptyState = ({title, message, ctaLabel, ctaRoute}) => (
    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">{message}</p>
        {ctaLabel && ctaRoute && (
            <Link
                to={ctaRoute}
                className="inline-flex items-center px-5 py-3 bg-pink-600 text-white font-semibold rounded-xl shadow-sm hover:bg-pink-700 transition"
            >
                <FaPlus className="mr-2"/>{ctaLabel}
            </Link>
        )}
    </div>
);

const EventRow = ({event, onResume, onDelete}) => {
    const isDraft = event.record_type === 'draft' || event.status === 'draft' || event.is_draft;
    const statusLabel = isDraft ? 'Draft' : 'Published';
    const statusTone = isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    const lastUpdated = event.updated_at || event.created_at;
    const resumePath = isDraft
        ? resolveStepRoute(event.current_step, event.id) || `/listing/${event.id}/step1`
        : `/events/${event.id}`;
    const resumeLabel = isDraft ? 'Resume' : 'Open';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
                <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900">{event.name || 'Untitled event'}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusTone}`}>{statusLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center space-x-2">
                        <FaCalendarAlt className="text-pink-500"/>
                        <span>Last updated: {formatDateTime(lastUpdated)}</span>
                    </span>
                    {event.current_step && (
                        <span className="inline-flex items-center space-x-2">
                            <FaClock className="text-pink-500"/>
                            <span>Current step: {event.current_step}</span>
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3">
                {isDraft && onDelete && (
                    <button
                        onClick={() => onDelete(event.id)}
                        className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-500 font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
                        title="Delete draft"
                    >
                        <FaTrash/>
                    </button>
                )}
                {!isDraft && (
                    <Link
                        to={`/events/${event.id}`}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
                    >
                        View
                    </Link>
                )}
                <button
                    onClick={() => onResume(resumePath)}
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white font-semibold rounded-lg shadow-sm hover:bg-pink-700 transition"
                >
                    <FaRedoAlt className="mr-2"/>{resumeLabel}
                </button>
            </div>
        </div>
    );
};

const VenueRow = ({venue}) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{venue.name || 'Untitled venue'}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                    <FaMapMarkerAlt className="text-pink-500"/>
                    {venue.address || 'Address not set'}
                </span>
                <span>Capacity: {venue.capacity ?? 'N/A'}</span>
                <span>{formatCurrency(venue.price, 'ZAR')}</span>
                <span>Updated: {formatDateTime(venue.updated_at || venue.created_at)}</span>
            </div>
        </div>
        <Link
            to={`/locations/${venue.id}`}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
        >
            View
        </Link>
    </div>
);

const OfferingRow = ({offering}) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{offering.name || 'Untitled offering'}</h3>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                    <FaStore className="text-pink-500"/>
                    {offering.category_name || 'Service'}
                </span>
                <span>{formatCurrency(offering.price, 'ZAR')}</span>
                <span>Rating: {offering.rating ?? 'N/A'}</span>
            </div>
        </div>
        <Link
            to={`/services/${offering.id}`}
            className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
        >
            View
        </Link>
    </div>
);

const ArtistBookingRow = ({booking}) => {
    const status = (booking.status || 'draft').toLowerCase();
    const statusTone = BOOKING_STATUS_TONE[status] || BOOKING_STATUS_TONE.draft;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{booking.event_name || 'Untitled event'}</h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusTone}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="inline-flex items-center gap-2">
                        <FaMusic className="text-pink-500"/>
                        Proposed date: {formatDate(booking.proposed_date || booking.event_date)}
                    </span>
                    <span>Bid: {formatCurrency(booking.final_amount ?? booking.bid_amount, booking.currency || 'ZAR')}</span>
                    <span>Updated: {formatDateTime(booking.updated_at || booking.created_at)}</span>
                </div>
            </div>
            {booking.chatroom_id ? (
                <Link
                    to={`/dm/${booking.chatroom_id}`}
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
                >
                    Open chat
                </Link>
            ) : (
                <span className="text-sm text-gray-500">Chat unavailable</span>
            )}
        </div>
    );
};

export default function MyEventsPage() {
    const {tokens, user, currentRole} = useAuth();
    const navigate = useNavigate();
    const activeRole = getActiveRole(user, currentRole);
    const roleKey = canonicalRole(activeRole);
    const workspace = getRoleWorkspace(activeRole);
    const copy = ROLE_COPY[roleKey] || ROLE_COPY.EVENT_ORGANIZER;

    const [drafts, setDrafts] = useState([]);
    const [publishedEvents, setPublishedEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [offerings, setOfferings] = useState([]);
    const [artistBookings, setArtistBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const isOrganizerRole = roleKey === 'EVENT_ORGANIZER';
    const isVenueRole = roleKey === 'VENUE_MANAGER';
    const isServiceProviderRole = roleKey === 'SERVICE_PROVIDER';
    const isArtistRole = roleKey === 'ARTIST';

    const fetchWorkspace = useCallback(async (signal) => {
        if (!tokens?.access) {
            setIsLoading(false);
            setError('Please log in to view your content.');
            return;
        }

        const headers = {Authorization: `Bearer ${tokens.access}`};
        setIsLoading(true);
        setError('');

        try {
            setDrafts([]);
            setPublishedEvents([]);
            setVenues([]);
            setOfferings([]);
            setArtistBookings([]);

            if (isOrganizerRole) {
                const response = await fetch('/api/events/my-events/', {headers, signal});
                if (!response.ok) {
                    throw new Error('Unable to load your events right now.');
                }
                const payload = await response.json();
                setDrafts(payload?.drafts || []);
                setPublishedEvents(payload?.published || []);
                return;
            }

            if (isVenueRole) {
                if (!user?.id) {
                    throw new Error('Unable to determine your account for venue listings.');
                }
                const response = await fetch(`/api/locations/locations/?owner=${user.id}`, {headers, signal});
                if (!response.ok) {
                    throw new Error('Unable to load your venues right now.');
                }
                const payload = await response.json();
                const results = Array.isArray(payload) ? payload : payload?.results || [];
                setVenues(results);
                return;
            }

            if (isServiceProviderRole) {
                if (!user?.username) {
                    throw new Error('Unable to determine your account for offerings.');
                }
                const response = await fetch(`/api/vendors/by-username/${encodeURIComponent(user.username)}/`, {headers, signal});
                if (response.status === 404) {
                    setOfferings([]);
                    return;
                }
                if (!response.ok) {
                    throw new Error('Unable to load your offerings right now.');
                }
                const payload = await response.json();
                setOfferings(Array.isArray(payload?.services) ? payload.services : []);
                return;
            }

            if (isArtistRole) {
                const response = await fetch('/api/chat/bookings/?role=provider&provider_type=artist', {headers, signal});
                if (!response.ok) {
                    throw new Error('Unable to load your bookings right now.');
                }
                const payload = await response.json();
                setArtistBookings(Array.isArray(payload) ? payload : []);
                return;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Something went wrong while loading your content.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [isArtistRole, isOrganizerRole, isServiceProviderRole, isVenueRole, tokens?.access, user?.id, user?.username]);

    useEffect(() => {
        const controller = new AbortController();
        fetchWorkspace(controller.signal);
        return () => controller.abort();
    }, [fetchWorkspace]);

    const handleResume = (path) => {
        if (path) {
            navigate(path);
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Delete this draft? This cannot be undone.')) return;
        try {
            const response = await fetch(`/api/events/event-drafts/${eventId}/`, {
                method: 'DELETE',
                headers: tokens?.access ? {Authorization: `Bearer ${tokens.access}`} : {},
            });
            if (!response.ok) {
                throw new Error('Failed to delete draft.');
            }
            setDrafts(prev => prev.filter((item) => item.id !== eventId));
            localStorage.removeItem('eventCreationStore');
        } catch (err) {
            setError(err.message || 'Could not delete the draft.');
        }
    };

    const sortedDrafts = useMemo(
        () => [...drafts].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)),
        [drafts]
    );

    const sortedPublished = useMemo(
        () => [...publishedEvents].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)),
        [publishedEvents]
    );

    const sortedVenues = useMemo(
        () => [...venues].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)),
        [venues]
    );

    const sortedOfferings = useMemo(
        () => [...offerings].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)),
        [offerings]
    );

    const sortedArtistBookings = useMemo(
        () => [...artistBookings].sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)),
        [artistBookings]
    );

    const hasOrganizerContent = sortedDrafts.length > 0 || sortedPublished.length > 0;
    const hasVenues = sortedVenues.length > 0;
    const hasOfferings = sortedOfferings.length > 0;
    const hasArtistBookings = sortedArtistBookings.length > 0;

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="uppercase text-xs tracking-[0.3em] font-semibold text-white/80 mb-2">{copy.eyebrow}</p>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-3">{copy.title}</h1>
                            <p className="text-white/85 text-lg max-w-2xl">{copy.description}</p>
                        </div>
                        {workspace?.createRoute && workspace?.createLabel && (
                            <Link
                                to={workspace.createRoute}
                                className="inline-flex items-center px-5 py-3 bg-white text-pink-600 font-semibold rounded-xl shadow-lg hover:bg-pink-50 transition w-full lg:w-auto justify-center"
                            >
                                <FaPlus className="mr-2"/>{workspace.createLabel}
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {error && (
                    <ErrorState message={error} onRetry={tokens?.access ? () => fetchWorkspace() : null}/>
                )}

                {isLoading ? (
                    <LoadingState/>
                ) : (
                    <>
                        {isOrganizerRole && (
                            <>
                                {!hasOrganizerContent ? (
                                    <EmptyState
                                        title={copy.emptyTitle}
                                        message={copy.emptyMessage}
                                        ctaLabel={workspace?.createLabel}
                                        ctaRoute={workspace?.createRoute}
                                    />
                                ) : (
                                    <div className="space-y-8">
                                        {sortedDrafts.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-semibold text-gray-900">Drafts</h2>
                                                    <span className="text-sm text-gray-500">{sortedDrafts.length} in progress</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {sortedDrafts.map((event) => (
                                                        <EventRow key={`draft-${event.id}`} event={event} onResume={handleResume} onDelete={handleDelete}/>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {sortedPublished.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h2 className="text-xl font-semibold text-gray-900">Published</h2>
                                                    <span className="text-sm text-gray-500">{sortedPublished.length} live</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {sortedPublished.map((event) => (
                                                        <EventRow key={`event-${event.id}`} event={event} onResume={handleResume}/>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {isVenueRole && (
                            <>
                                {!hasVenues ? (
                                    <EmptyState
                                        title={copy.emptyTitle}
                                        message={copy.emptyMessage}
                                        ctaLabel={workspace?.createLabel}
                                        ctaRoute={workspace?.createRoute}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">Listed Venues</h2>
                                            <span className="text-sm text-gray-500">{sortedVenues.length} total</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {sortedVenues.map((venue) => (
                                                <VenueRow key={`venue-${venue.id}`} venue={venue}/>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {isServiceProviderRole && (
                            <>
                                {!hasOfferings ? (
                                    <EmptyState
                                        title={copy.emptyTitle}
                                        message={copy.emptyMessage}
                                        ctaLabel={workspace?.createLabel}
                                        ctaRoute={workspace?.createRoute}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">Published Offerings</h2>
                                            <span className="text-sm text-gray-500">{sortedOfferings.length} total</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {sortedOfferings.map((offering) => (
                                                <OfferingRow key={`offering-${offering.id}`} offering={offering}/>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {isArtistRole && (
                            <>
                                {!hasArtistBookings ? (
                                    <EmptyState
                                        title={copy.emptyTitle}
                                        message={copy.emptyMessage}
                                        ctaLabel={workspace?.createLabel}
                                        ctaRoute={workspace?.createRoute}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold text-gray-900">Booking Requests</h2>
                                            <span className="text-sm text-gray-500">{sortedArtistBookings.length} total</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            {sortedArtistBookings.map((booking) => (
                                                <ArtistBookingRow key={`artist-booking-${booking.id}`} booking={booking}/>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </section>
        </div>
    );
}
