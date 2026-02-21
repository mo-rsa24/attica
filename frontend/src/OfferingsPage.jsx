import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import React from 'react';
import FloatingActionButton from './FloatingActionButton.jsx';
import AdvancedSearch from './AdvancedSearch.jsx';
import ServiceCard from './ServiceCard.jsx';
import EventCard from './EventCard.jsx';
import ArtistCard from './ArtistCard.jsx';
import LocationCard from './LocationCard.jsx';
import ServiceCardSkeleton from './ServiceCardSkeleton.jsx';
import { Link } from 'react-router-dom';
import useAxios from './utils/useAxios';

// --- Quick-action category cards for the hero ---
const quickActions = [
    {
        label: 'Events',
        to: '/events',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
        ),
        color: 'bg-violet-50 text-violet-600',
    },
    {
        label: 'Services',
        to: '/services',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.32-3.07a.833.833 0 010-1.44l5.32-3.07a1.667 1.667 0 012.5 1.44v6.14a1.667 1.667 0 01-2.5 1.44zM20.25 7.5l-.625 10.632a2.308 2.308 0 01-2.3 2.118H6.675a2.308 2.308 0 01-2.3-2.118L3.75 7.5" />
            </svg>
        ),
        color: 'bg-sky-50 text-sky-600',
    },
    {
        label: 'Artists',
        to: '/artists',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
            </svg>
        ),
        color: 'bg-amber-50 text-amber-600',
    },
    {
        label: 'My Events',
        to: '/my-events',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
        ),
        color: 'bg-emerald-50 text-emerald-600',
    },
];

// --- Section component with horizontal scroll option ---
const PageSection = ({ title, subtitle, children, linkTo, horizontal }) => (
    <section className="mt-12">
        <div className="flex justify-between items-end mb-5">
            <div>
                <h2
                    className="text-xl sm:text-2xl font-bold text-gray-900"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    {title}
                </h2>
                {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
            {linkTo && (
                <Link
                    to={linkTo}
                    className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full"
                >
                    View all
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            )}
        </div>
        {horizontal ? (
            <div className="flex gap-5 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {children}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {children}
            </div>
        )}
    </section>
);

// --- Empty state for sections with no data ---
const EmptySection = ({ message }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 12.677a2.25 2.25 0 00-.1.661z" />
            </svg>
        </div>
        <p className="text-sm text-gray-400">{message}</p>
    </div>
);

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function OfferingsPage() {
    const { user, tokens } = useAuth();
    const [pageData, setPageData] = useState({
        popularServices: [],
        upcomingEvents: [],
        popularArtists: [],
        popularLocations: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);

    const api = useAxios();

    const isEventOrganizer = user?.roles?.includes('EVENT_ORGANIZER');

    useEffect(() => {
        if (!user || !tokens) {
            console.warn('User not authenticated. Skipping homepage API calls.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchPopularServices = api.get('/api/vendors/services/popular/').then(res => res.data);
                const fetchUpcomingEvents = api.get('/api/events/upcoming/').then(res => res.data);
                const fetchPopularArtists = api.get('/api/artists/popular/').then(res => res.data);
                const fetchPopularLocations = api.get('/api/locations/popular/').then(res => res.data);
                const fetchSimilarEvents = api.get('/api/events/similar/').then(res => res.data);

                const promises = isEventOrganizer ? [
                    fetchPopularServices,
                    fetchSimilarEvents,
                    fetchPopularArtists,
                    fetchPopularLocations
                ] : [
                    fetchPopularServices,
                    fetchUpcomingEvents,
                ];

                const [
                    popularServicesData,
                    eventsData,
                    popularArtistsData = [],
                    popularLocationsData = []
                ] = await Promise.all(promises);

                setPageData({
                    popularServices: popularServicesData,
                    upcomingEvents: eventsData,
                    popularArtists: popularArtistsData,
                    popularLocations: popularLocationsData,
                });

                console.log('Homepage data fetched successfully.');
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
                setPageData({
                    popularServices: [],
                    upcomingEvents: [],
                    popularArtists: [],
                    popularLocations: [],
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isEventOrganizer, user, tokens, api]);

    const displayName = user?.username
        ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
        : '';

    return (
        <div className="home-atmosphere min-h-screen relative overflow-x-clip">
            <div className="home-bg-layer home-bg-layer--base" aria-hidden="true" />
            <div className="home-bg-layer home-bg-layer--mesh" aria-hidden="true" />
            <div className="home-orb home-orb--one" aria-hidden="true" />
            <div className="home-orb home-orb--two" aria-hidden="true" />
            <div className="home-orb home-orb--three" aria-hidden="true" />

            {/* ===== Hero Section ===== */}
            <div className="relative bg-white/70 overflow-hidden backdrop-blur-[1px]">
                {/* Subtle decorative background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full blur-3xl opacity-65 home-float-slow" />
                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-cyan-100 to-blue-100 rounded-full blur-3xl opacity-55 home-float-fast" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-10">
                    {/* Greeting + CTA row */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10 home-fade-up">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                Dashboard
                            </p>
                            <h1
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                {displayName ? `${getGreeting()}, ${displayName}` : getGreeting()}
                            </h1>
                            <p className="mt-3 text-gray-500 text-base sm:text-lg max-w-xl">
                                {isEventOrganizer
                                    ? 'Find the perfect vendors, artists, and venues for your next event.'
                                    : 'Discover upcoming events and top-rated services near you.'
                                }
                            </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button
                                onClick={() => setShowSearch(prev => !prev)}
                                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                Search
                            </button>
                            {isEventOrganizer && (
                                <Link
                                    to="/createEvent"
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
                                >
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    New event
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Quick-action cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quickActions.map((action, idx) => (
                            <Link
                                key={action.label}
                                to={action.to}
                                className="home-fade-up flex items-center gap-3 px-4 py-3.5 bg-white/90 border border-gray-100 rounded-2xl hover:border-gray-200 hover:shadow-md transition-all duration-200 group"
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {action.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== Collapsible Search ===== */}
            {showSearch && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-4 relative z-10">
                    <AdvancedSearch />
                </div>
            )}

            {/* ===== Content Sections ===== */}
            <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-4">
                <PageSection
                    title="Popular Services"
                    subtitle="Top-rated vendors in your area"
                    linkTo="/services"
                >
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                    ) : pageData.popularServices.length > 0 ? (
                        pageData.popularServices.map(service => <ServiceCard key={service.id} service={service} />)
                    ) : (
                        <EmptySection message="No popular services yet. Check back soon!" />
                    )}
                </PageSection>

                <PageSection
                    title={isEventOrganizer ? "Similar Events" : "Upcoming Events"}
                    subtitle={isEventOrganizer ? "Events like yours for inspiration" : "Happening near you soon"}
                    linkTo="/events"
                >
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                    ) : pageData.upcomingEvents.length > 0 ? (
                        pageData.upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
                    ) : (
                        <EmptySection message="No upcoming events found. Create one!" />
                    )}
                </PageSection>

                {isEventOrganizer && (
                    <>
                        <PageSection
                            title="Popular Artists"
                            subtitle="Talented performers ready to book"
                            linkTo="/artists"
                        >
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                            ) : pageData.popularArtists.length > 0 ? (
                                pageData.popularArtists.map(artist => <ArtistCard key={artist.id} artist={artist} />)
                            ) : (
                                <EmptySection message="No artists found yet." />
                            )}
                        </PageSection>

                        <PageSection
                            title="Popular Locations"
                            subtitle="Trending venues and spaces"
                            linkTo="/locations"
                        >
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                            ) : pageData.popularLocations.length > 0 ? (
                                pageData.popularLocations.map(location => <LocationCard key={location.id} location={location} />)
                            ) : (
                                <EmptySection message="No locations found yet." />
                            )}
                        </PageSection>
                    </>
                )}
            </div>

            <FloatingActionButton />
        </div>
    );
}

export default OfferingsPage;
