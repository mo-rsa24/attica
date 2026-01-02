import React, {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {FaCalendarAlt, FaClock, FaExclamationTriangle, FaPlus, FaRedoAlt} from 'react-icons/fa';
import {useAuth} from './AuthContext';

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

const EmptyState = () => (
    <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center shadow-sm">
        <div className="text-5xl mb-4">🗂️</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No events yet</h3>
        <p className="text-gray-600 max-w-xl mx-auto mb-6">
            You haven&apos;t started creating any events. Kick off your first listing to see it appear here.
        </p>
        <Link
            to="/createEvent"
            className="inline-flex items-center px-5 py-3 bg-pink-600 text-white font-semibold rounded-xl shadow-sm hover:bg-pink-700 transition"
        >
            <FaPlus className="mr-2"/> Create new event
        </Link>
    </div>
);

const LoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({length: 4}).map((_, idx) => (
            <div key={idx}
                 className="animate-pulse bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/2"/>
                <div className="flex items-center space-x-3">
                    <div className="h-4 bg-gray-200 rounded w-24"/>
                    <div className="h-4 bg-gray-200 rounded w-16"/>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32"/>
                <div className="flex items-center justify-between pt-4">
                    <div className="h-10 bg-gray-200 rounded w-24"/>
                    <div className="h-10 bg-gray-200 rounded w-32"/>
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

const EventRow = ({event, onResume}) => {
    const isDraft = event.record_type === 'draft' || event.status === 'draft' || event.is_draft;
    const statusLabel = isDraft ? 'Draft' : 'Published';
    const statusTone = isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    const lastUpdated = event.updated_at || event.created_at;
    const resumePath = isDraft
        ? resolveStepRoute(event.current_step, event.id) || `/listing/${event.id}/step1`
        : `/events/${event.id}`;
    const resumeLabel = isDraft ? 'Resume' : 'Open';


    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
                <div className="flex items-center space-x-3">
                    <h3 className="text-xl font-semibold text-gray-900">{event.name || 'Untitled event'}</h3>
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusTone}`}>{statusLabel}</span>
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
                    <FaRedoAlt className="mr-2"/> {resumeLabel}
                </button>
            </div>
        </div>
    );
};

export default function MyEventsPage() {
    const {tokens} = useAuth();
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState([]);
    const [publishedEvents, setPublishedEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEvents = async (signal) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/events/my-events/', {
                headers: tokens?.access ? {Authorization: `Bearer ${tokens.access}`} : {},
                signal
            });
            if (!response.ok) {
                throw new Error('Unable to load your events right now.');
            }
            const payload = await response.json();
            setDrafts(payload?.drafts || []);
            setPublishedEvents(payload?.published || []);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Something went wrong while fetching your events.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!tokens?.access) {
            setIsLoading(false);
            setError('Please log in to view your events.');
            return;
        }
        const controller = new AbortController();
        fetchEvents(controller.signal);
        return () => controller.abort();
    }, [tokens?.access]);

    const handleResume = (path) => {
        if (path) {
            navigate(path);
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

    const hasDrafts = sortedDrafts.length > 0;
    const hasPublished = sortedPublished.length > 0;
    const hasAnyEvents = hasDrafts || hasPublished;

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="uppercase text-xs tracking-[0.3em] font-semibold text-white/80 mb-2">My events</p>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-3">Keep building your experiences</h1>
                            <p className="text-white/85 text-lg max-w-2xl">
                                Track drafts, resume setup where you left off, and publish when you&apos;re ready.
                            </p>
                        </div>
                        <Link
                            to="/createEvent"
                            className="inline-flex items-center px-5 py-3 bg-white text-pink-600 font-semibold rounded-xl shadow-lg hover:bg-pink-50 transition w-full lg:w-auto justify-center"
                        >
                            <FaPlus className="mr-2"/> Create new event
                        </Link>
                    </div>
                </div>
            </section>

            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
                {error && (
                    <ErrorState message={error} onRetry={tokens?.access ? () => fetchEvents() : null}/>
                )}

                {isLoading ? (
                    <LoadingState/>
                ) : !hasAnyEvents ? (
                    <EmptyState/>
                ) : (
                    <div className="space-y-8">
                        {hasDrafts && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Drafts</h2>
                                    <span className="text-sm text-gray-500">{sortedDrafts.length} in progress</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sortedDrafts.map(event => (
                                        <EventRow key={`draft-${event.id}`} event={event} onResume={handleResume}/>
                                    ))}
                                </div>
                            </div>
                        )}

                        {hasPublished && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Published</h2>
                                    <span className="text-sm text-gray-500">{sortedPublished.length} live</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sortedPublished.map(event => (
                                        <EventRow key={`event-${event.id}`} event={event} onResume={handleResume}/>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}