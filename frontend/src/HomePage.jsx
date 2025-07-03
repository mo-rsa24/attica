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

        // Fetch upcoming events
        fetch('/events/upcoming/') // A new API endpoint for upcoming events
            .then(res => res.json())
            .then(setUpcomingEvents)
            .catch(() => {});
    }, []);

    return (
        <div className="max-w-screen-xl mx-auto mt-6 px-4">
            {/* Advanced Search Component */}
            <div className="bg-white p-6 rounded-xl shadow-lg mb-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome to Attica</h2>
                <AdvancedSearch />
            </div>

            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
                <div className="mt-10">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-800">Upcoming Events</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {upcomingEvents.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            )}

            <hr className="my-12 border-t border-dashed"/>

            {/* Popular Service Providers Section */}
            <div className="mt-10">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">Popular Service Providers</h3>
                <div className="overflow-x-auto flex snap-x snap-mandatory pb-4">
                    {(popular.length ? popular : Array.from({length: 4})).map((service, idx) => (
                        <div key={idx} className="snap-start w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 px-2">
                            {service ? <ServiceCard service={service}/> : <ServiceCardSkeleton />}
                        </div>
                    ))}
                </div>
            </div>

            <hr className="my-12 border-t border-dashed"/>

            {/* Categories Section */}
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