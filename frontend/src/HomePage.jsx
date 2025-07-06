import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import AdvancedSearch from './AdvancedSearch.jsx';
import ServiceCard from './ServiceCard.jsx';
import EventCard from './EventCard.jsx';
import ArtistCard from './ArtistCard.jsx';
import LocationCard from './LocationCard.jsx';
import ServiceCardSkeleton from './ServiceCardSkeleton.jsx';
import { Link } from 'react-router-dom';
import useAxios from 'utils/useAxios'; // Make sure you have this import

const PageSection = ({ title, viewAllLink, items, cardType, isLoading }) => {
    const skeletonItems = Array.from({ length: 4 });

    const renderCard = (item) => {
        switch (cardType) {
            case 'service':
                return <ServiceCard key={item.id} service={item} />;
            case 'event':
                return <EventCard key={item.id} event={item} />;
            case 'artist':
                return <ArtistCard key={item.id} artist={item} />;
            case 'location':
                return <LocationCard key={item.id} location={item} />;
            default:
                return null;
        }
    };

    return (
        <div className="my-16">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-gray-800">{title}</h3>
                <Link to={viewAllLink} className="text-sm font-semibold text-pink-600 hover:underline transition-colors">
                    View All
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {isLoading ? (
                    skeletonItems.map((_, idx) => <ServiceCardSkeleton key={idx} />)
                ) : (
                    items.map(renderCard)
                )}
            </div>
        </div>
    );
};

function HomePage() {
    const { user, tokens } = useAuth();
    const [pageData, setPageData] = useState({
        popularServices: [],
        upcomingEvents: [],
        popularArtists: [],
        popularLocations: [],
    });
    const api = useAxios(); // Call useAxios at the top level
    const [isLoading, setIsLoading] = useState(true);

    const isEventOrganizer = user?.roles.includes('EVENT_ORGANIZER');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const headers = {
                'Content-Type': 'application/json',
            };
            if (tokens) {
                headers['Authorization'] = `Bearer ${tokens.access}`;
            }

            const fetchPopularServices = fetch('/api/vendors/services/popular/', { headers }).then(res => res.json());
            const fetchUpcomingEvents = fetch('/api/events/upcoming/', { headers }).then(res => res.json());
            const fetchPopularArtists = fetch('/api/artists/popular/', { headers }).then(res => res.json());
            const fetchPopularLocations = fetch('/api/locations/popular/', { headers }).then(res => res.json());
            const fetchSimilarEvents = fetch('/api/events/similar/', { headers }).then(res => res.json());

            try {
                let promises = [];
                if (isEventOrganizer) {
                    promises = [
                        fetchPopularServices,
                        fetchSimilarEvents,
                        fetchPopularArtists,
                        fetchPopularLocations
                    ];
                } else {
                    promises = [
                        fetchPopularServices,
                        fetchUpcomingEvents,
                    ];
                }

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

        if (user || !isEventOrganizer) {
            fetchData();
        }
    }, [isEventOrganizer, user, tokens]);

    return (
        <div className="max-w-screen-xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
                <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-800 tracking-tight">Find your next experience</h2>
                <p className="text-center text-gray-600 mb-8">Discover events and services to make your next event unforgettable.</p>
                <AdvancedSearch />
            </div>

            <hr className="my-16 border-t-2 border-gray-100" />

            {isEventOrganizer ? (
                <>
                    <PageSection title="Events You Might Like" viewAllLink="/events" items={pageData.upcomingEvents} cardType="event" isLoading={isLoading} />
                    <PageSection title="Popular Service Providers" viewAllLink="/services" items={pageData.popularServices} cardType="service" isLoading={isLoading} />
                    <PageSection title="Trending Locations" viewAllLink="/locations" items={pageData.popularLocations} cardType="location" isLoading={isLoading} />
                    <PageSection title="Top Artists" viewAllLink="/artists" items={pageData.popularArtists} cardType="artist" isLoading={isLoading} />
                </>
            ) : (
                <>
                    <PageSection title="Upcoming Events" viewAllLink="/events" items={pageData.upcomingEvents} cardType="event" isLoading={isLoading} />
                    <PageSection title="Popular Service Providers" viewAllLink="/services" items={pageData.popularServices} cardType="service" isLoading={isLoading} />
                </>
            )}
        </div>
    );
}

export default HomePage;