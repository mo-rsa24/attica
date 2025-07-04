import { useEffect, useState } from 'react';
import ServiceCardSkeleton from './ServiceCardSkeleton.jsx';
import ServiceCard from './ServiceCard.jsx';
import AdvancedSearch from './AdvancedSearch.jsx';
import EventCard from './EventCard.jsx'; // Import the new EventCard component

function HomePage() {
    const [popular, setPopular] = useState([]);
    const [categories, setCategories] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        // Fetch popular services
        fetch('/api/vendors/services/popular/')
            .then(res => res.json())
            .then(setPopular)
            .catch(() => {});

        // Fetch service categories
        fetch('/api/vendors/categories-with-services/')
            .then(res => res.json())
            .then(setCategories)
            .catch(() => {});

        // A mock API endpoint for upcoming events for demonstration purposes
        const mockUpcomingEvents = [
            { id: 1, name: "Summer Music Fest", location: "Green Park, London", date: "2025-08-15", image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3", category: "Music" },
            { id: 2, name: "Tech Conference 2025", location: "ExCeL London", date: "2025-09-10", image_url: "https://images.unsplash.com/photo-1495754149474-e54c07932677", category: "Tech" },
            { id: 3, name: "The Great Foodie Festival", location: "Hyde Park, London", date: "2025-07-20", image_url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1", category: "Food & Drink" },
            { id: 4, name: "Charity Gala Dinner", location: "The Savoy, London", date: "2025-11-01", image_url: "https://images.unsplash.com/photo-1543893325-4b13a11735cb", category: "Charity" }
        ];
        setUpcomingEvents(mockUpcomingEvents);

    }, []);

    return (
        <div className="max-w-screen-xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            {/* Advanced Search Component */}
            <div className="mb-16">
                <h2 className="text-4xl font-extrabold mb-4 text-center text-gray-800 tracking-tight">Find your next
                    experience</h2>
                <p className="text-center text-gray-600 mb-8">Discover events and services to make your next event
                    unforgettable.</p>
                <AdvancedSearch/>
            </div>

            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
                <div className="my-16">
                    <h3 className="text-3xl font-bold mb-6 text-gray-800">Upcoming Events</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {upcomingEvents.map(event => (
                            <EventCard key={event.id} event={event}/>
                        ))}
                    </div>
                </div>
            )}

            <hr className="my-16 border-t-2 border-gray-100"/>

            {/* Popular Service Providers Section */}
            <div className="my-16">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Popular Service Providers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(popular.length ? popular : Array.from({length: 4})).map((service, idx) => (
                        service ? <ServiceCard key={idx} service={service}/> : <ServiceCardSkeleton key={idx}/>
                    ))}
                </div>
            </div>

            <div className="mt-10">
                {categories.map(cat => (
                    <div key={cat.id} className="mb-10">
                        <h3 className="text-2xl font-semibold mb-4 text-gray-800">{cat.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {cat.services.slice(0, 4).map(service => (
                                <ServiceCard key={service.id} service={service}/>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default HomePage;