// mo-rsa24/attica/mo-rsa24-attica-591ee4e2f08b939716655a5b468a982894cf4efe/frontend/src/EventListingPage.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaUsers } from 'react-icons/fa';

export default function EventListingPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/events/events/${id}/`)
            .then(res => res.ok ? res.json() : Promise.reject('Event not found'))
            .then(setEvent)
            .catch(error => console.error("Failed to fetch event:", error))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) {
        return <div className="text-center py-40 text-2xl font-semibold">Loading Event...</div>;
    }

    if (!event) {
        return <div className="text-center py-40 text-2xl font-semibold text-red-500">Event Not Found</div>;
    }

    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-gray-900 text-white">
            {/* Hero Section */}
            <div
                className="relative h-[400px] bg-cover bg-center"
                style={{ backgroundImage: `url(${event.banner_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'})` }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                <div className="relative max-w-7xl mx-auto h-full flex items-end p-8">
                    <div className="flex items-end gap-6">
                        <img src={event.image_url || 'https://placehold.co/200x200/333/fff?text=Event'} alt={event.name} className="w-48 h-48 object-cover rounded-lg shadow-lg" />
                        <div>
                            <p className="text-sm font-bold text-pink-400 uppercase tracking-widest">{event.category || 'EVENT'}</p>
                            <h1 className="text-5xl font-extrabold mt-2">{event.name}</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white text-gray-800">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 p-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Tickets</h2>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            {event.tickets && event.tickets.length > 0 ? event.tickets.map(ticket => (
                                <div key={ticket.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                                    <div>
                                        <p className="font-semibold capitalize">{ticket.payment_status} Ticket</p>
                                        <p className="text-sm text-gray-500">Quantity: {ticket.quantity}</p>
                                    </div>
                                    <button className="bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-pink-700 transition">
                                        Select
                                    </button>
                                </div>
                            )) : <p>No tickets currently available for this event.</p>}
                        </div>

                        <h2 className="text-2xl font-bold mt-8 mb-4">About The Event</h2>
                        <p className="text-gray-600 leading-relaxed">{event.notes || 'No additional information available.'}</p>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Date & Time</h3>
                            <div className="flex items-center space-x-3 mb-2">
                                <FaCalendarAlt className="text-pink-500" />
                                <span>{eventDate}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaClock className="text-pink-500" />
                                <span>Starts at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Venue</h3>
                            <div className="flex items-center space-x-3 mb-2">
                                <FaMapMarkerAlt className="text-pink-500" />
                                <span>{event.location?.name || 'Venue TBD'}</span>
                            </div>
                            <p className="text-sm text-gray-500">{event.location?.address}</p>
                        </div>
                         <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <h3 className="text-xl font-bold mb-4">Event Info</h3>
                             <div className="flex items-center space-x-3 mb-2">
                                <FaUsers className="text-pink-500" />
                                <span>{event.guest_count} Guests Attending</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FaTicketAlt className="text-pink-500" />
                                <span>Theme: {event.theme || 'Not specified'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}