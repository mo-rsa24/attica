import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
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
    const { user } = useAuth(); // Use the custom hook to get the user
    const [pageData, setPageData] = useState({
        popularServices: [],
        upcomingEvents: [],
        popularArtists: [],
        popularLocations: [],
    });
    const api = useAxios(); // This returns an authenticated axios instance
    const [isLoading, setIsLoading] = useState(true);

    // Check if the user has the 'EVENT_ORGANIZER' role
    const isEventOrganizer = user?.roles?.includes('EVENT_ORGANIZER');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            // The 'api' instance from useAxios already has the base URL and auth headers
            const fetchPopularServices = api.get('/api/vendors/services/popular/').then(res => res.data);
            const fetchUpcomingEvents = api.get('/api/events/upcoming/').then(res => res.data);
            const fetchPopularArtists = api.get('/api/artists/popular/').then(res => res.data);
            const fetchPopularLocations = api.get('/api/locations/popular/').then(res => res.data);
            const fetchSimilarEvents = api.get('/api/events/similar/').then(res => res.data);

            try {
                // Conditionally fetch data based on user role
                const promises = isEventOrganizer ? [
                    fetchPopularServices,
                    fetchSimilarEvents, // Show similar events for organizers
                    fetchPopularArtists,
                    fetchPopularLocations
                ] : [
                    fetchPopularServices,
                    fetchUpcomingEvents, // Show upcoming events for others
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

            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
                // Reset data on error to prevent displaying stale information
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
    }, [isEventOrganizer, api]); // Rerun the effect if the user's role or the api instance changes

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