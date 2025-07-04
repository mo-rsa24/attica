import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider'; // Make sure this path is correct
import AdvancedSearch from './components/AdvancedSearch';
import Card from './components/Card';

const HomePage = () => {
    const { user } = useAuth();
    const [popularServices, setPopularServices] = useState([]);
    const [popularArtists, setPopularArtists] = useState([]);
    const [popularLocations, setPopularLocations] = useState([]);
    const [similarEvents, setSimilarEvents] = useState([]);

    const isEventOrganizer = user && user.roles.includes('EVENT_ORGANIZER');

    useEffect(() => {
        if (isEventOrganizer) {
            // Fetch data for Event Organizer
            fetch('/api/vendors/services/popular/').then(res => res.json()).then(setPopularServices);
            fetch('/api/artists/popular/').then(res => res.json()).then(setPopularArtists);
            fetch('/api/locations/popular/').then(res => res.json()).then(setPopularLocations);
            fetch('/api/events/similar/').then(res => res.json()).then(setSimilarEvents);
        } else {
            // Fetch default data for other users
            fetch('/api/vendors/services/popular/').then(res => res.json()).then(setPopularServices);
        }
    }, [isEventOrganizer]);

    const renderSection = (title, items, type) => (
        <div className="my-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <button className="text-sm font-semibold text-pink-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <Card key={item.id} item={item} type={type} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4">
            <AdvancedSearch />

            {isEventOrganizer ? (
                <>
                    {renderSection("Similar Events", similarEvents, "event")}
                    {renderSection("Popular Service Providers", popularServices, "service")}
                    {renderSection("Popular Locations", popularLocations, "location")}
                    {renderSection("Popular Artists", popularArtists, "artist")}
                </>
            ) : (
                <>
                    {renderSection("Popular Service Providers", popularServices, "service")}
                    {/* Render other default sections for non-organizers here */}
                </>
            )}
        </div>
    );
};

export default HomePage;