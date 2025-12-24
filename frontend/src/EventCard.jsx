import React from 'react';
import {Link} from 'react-router-dom';
import {FaMapMarkerAlt, FaCalendarAlt} from 'react-icons/fa';

function EventCard({event}) {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const locationName =
        event.location_detail?.name ||
        event.location?.name ||
        event.location?.address ||
        event.location ||
        'Location to be announced';
    const distance = typeof event.distance_km === 'number' ? event.distance_km.toFixed(1) : null;
    const blurb = event.notes || 'See the details, RSVP, and share with friends.';


    return (
        <Link to={`/events/${event.id}`}
              className="block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 overflow-hidden group">
            <div className="relative">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                    alt={event.name}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <span
                        className="text-xs bg-pink-600 px-2 py-1 rounded-full uppercase font-bold tracking-wider">{event.category || 'General'}</span>
                    <h4 className="text-xl font-bold mt-1">{event.name}</h4>
                </div>
            </div>
            <div className="p-4 bg-gray-50">
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{blurb}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaCalendarAlt className="mr-2 text-pink-500"/>
                    <span>{eventDate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-pink-500"/>
                    <span className="truncate">{locationName}</span>
                    {distance && (
                        <span className="ml-auto text-xs font-semibold text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
              {distance} km away
            </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default EventCard;