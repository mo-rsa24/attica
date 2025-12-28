import React, { useEffect, useMemo, useState } from 'react';
import { FaBolt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import EventCard from './EventCard.jsx';

const SortPill = ({ isActive, label, description, onClick, icon }) => {
    const IconComponent = icon;
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-full border transition ${
                isActive
                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
        }`}
    >
            <div className={`p-2 rounded-full ${isActive ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'}`}>
                <IconComponent />
            </div>
            <div className="text-left">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </button>
    );
};

const EventCardSkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="h-48 bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
    </div>
);

const SORT_OPTIONS = {
    popular: {
        label: 'Most Popular',
        description: 'Trending with the highest guest interest',
        icon: FaBolt,
    },
    recent: {
        label: 'Most Recent',
        description: 'Fresh drops happening soon',
        icon: FaClock,
    },
    closest: {
        label: 'Closest',
        description: 'Events near your current location',
        icon: FaMapMarkerAlt,
    },
};

const sortEvents = (items, sortKey) => {
    const events = [...items];
    switch (sortKey) {
        case 'popular':
            return events.sort((a, b) => (b.guest_count || 0) - (a.guest_count || 0));
        case 'closest':
            return events.sort((a, b) => {
                const aDistance = typeof a.distance_km === 'number' ? a.distance_km : Number.POSITIVE_INFINITY;
                const bDistance = typeof b.distance_km === 'number' ? b.distance_km : Number.POSITIVE_INFINITY;
                if (aDistance === bDistance) {
                    return new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0);
                }
                return aDistance - bDistance;
            });
        case 'recent':
        default:
            return events.sort(
                (a, b) => new Date(b.date || b.created_at || 0) - new Date(a.date || a.created_at || 0)
            );
    }
};

export default function Events() {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSort, setSelectedSort] = useState('popular');
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('');

    const filteredEvents = useMemo(() => {
        if (!searchTerm) return events;
        const query = searchTerm.toLowerCase();
        return events.filter(event => {
            const locationName =
                event.location_detail?.name ||
                event.location?.name ||
                event.location?.address ||
                '';
            return (
                event.name?.toLowerCase().includes(query) ||
                locationName.toLowerCase().includes(query) ||
                event.category?.toLowerCase().includes(query)
            );
        });
    }, [events, searchTerm]);

    useEffect(() => {
        if (selectedSort !== 'closest' || userLocation) return;

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setLocationStatus('Location access is not supported in this browser.');
            return;
        }

        setLocationStatus('Fetching your location to find nearby events...');
        navigator.geolocation.getCurrentPosition(
            position => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationStatus('');
            },
            () => {
                setLocationStatus('We could not access your location. Showing recent events instead.');
            }
        );
    }, [selectedSort, userLocation]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchEvents = async () => {
            setIsLoading(true);
            setError('');
            const shouldUseLocation = selectedSort === 'closest' && userLocation;
            const url = shouldUseLocation
                ? `/api/events/events/?lat=${userLocation.lat}&lng=${userLocation.lng}`
                : '/api/events/events/';

            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Unable to load events');
                }
                const payload = await response.json();
                const rawEvents = Array.isArray(payload) ? payload : payload?.results || [];
                const activeSort = selectedSort === 'closest' && !userLocation ? 'recent' : selectedSort;
                const sortedEvents = sortEvents(rawEvents, activeSort);
                if (isMounted) {
                    setEvents(sortedEvents);
                }
            } catch (err) {
                if (isMounted && err.name !== 'AbortError') {
                    setError('We ran into an issue loading events. Please try again.');
                    console.error(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchEvents();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [selectedSort, userLocation]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="uppercase text-xs tracking-[0.3em] font-semibold text-white/80 mb-2">Events</p>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-3">Discover events made for you</h1>
                            <p className="text-white/85 text-lg max-w-2xl">
                                Browse trending experiences, see what&apos;s coming up next, or let us surface the
                                closest happenings near you.
                            </p>
                        </div>
                        <div className="bg-white/15 border border-white/30 rounded-2xl p-4 backdrop-blur-lg w-full lg:w-[420px]">
                            <p className="text-sm text-white/80 mb-2">Quick search</p>
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by event name, location, or category"
                                className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                            <SortPill
                                key={key}
                                isActive={selectedSort === key}
                                label={option.label}
                                description={option.description}
                                icon={option.icon}
                                onClick={() => setSelectedSort(key)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
                            {SORT_OPTIONS[selectedSort].label}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900">Curated for you</h2>
                        {locationStatus && (
                            <p className="text-sm text-pink-700 mt-1 bg-pink-50 inline-block px-3 py-2 rounded-full">
                                {locationStatus}
                            </p>
                        )}
                    </div>
                    <div className="text-sm text-gray-600">
                        Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <EventCardSkeleton key={idx} />
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                        <p className="text-lg font-semibold text-gray-800 mb-2">No events match your search.</p>
                        <p className="text-gray-500 mb-4">
                            Try adjusting your search terms or switching to a different sorting option.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedSort('popular');
                            }}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}