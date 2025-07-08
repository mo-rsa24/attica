import { useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import AdvancedSearch from './AdvancedSearch.jsx';
import ServiceCard from './ServiceCard.jsx';
import EventCard from './EventCard.jsx';
import ArtistCard from './ArtistCard.jsx';
import LocationCard from './LocationCard.jsx';
import ServiceCardSkeleton from './ServiceCardSkeleton.jsx';
import { Link } from 'react-router-dom';
import useAxios from './utils/useAxios';

// A reusable component for sectioning content
const PageSection = ({ title, children, linkTo }) => (
    <div className="my-12">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">{title}</h2>
            {linkTo && <Link to={linkTo} className="text-blue-500 hover:underline">View All</Link>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {children}
        </div>
    </div>
);

function HomePage() {
    const { user, tokens } = useAuth();
    const [pageData, setPageData] = useState({
        popularServices: [],
        upcomingEvents: [],
        popularArtists: [],
        popularLocations: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    const api = useMemo(() => useAxios(), []); // 🛠 Memoize Axios instance

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
    }, [isEventOrganizer, user, tokens, api]); // ✅ api is memoized now

    return (
        <div className="max-w-screen-xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            <AdvancedSearch />

            <PageSection title="Popular Services" linkTo="/services">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                ) : (
                    pageData.popularServices.map(service => <ServiceCard key={service.id} service={service} />)
                )}
            </PageSection>

            <PageSection title={isEventOrganizer ? "Similar Events" : "Upcoming Events"} linkTo="/events">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                ) : (
                    pageData.upcomingEvents.map(event => <EventCard key={event.id} event={event} />)
                )}
            </PageSection>

            {isEventOrganizer && (
                <>
                    <PageSection title="Popular Artists" linkTo="/artists">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                        ) : (
                            pageData.popularArtists.map(artist => <ArtistCard key={artist.id} artist={artist} />)
                        )}
                    </PageSection>

                    <PageSection title="Popular Locations" linkTo="/locations">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, index) => <ServiceCardSkeleton key={index} />)
                        ) : (
                            pageData.popularLocations.map(location => <LocationCard key={location.id} location={location} />)
                        )}
                    </PageSection>
                </>
            )}
        </div>
    );
}

export default HomePage;
