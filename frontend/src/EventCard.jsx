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
              className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="relative">
                <img
                    src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                    alt={event.name}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <span
                    className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 backdrop-blur"
                >
                    {event.category || 'General'}
                </span>
                <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="line-clamp-1 text-xl font-bold">{event.name}</h4>
                </div>
            </div>
            <div className="p-4">
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{blurb}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FaCalendarAlt className="mr-2 text-pink-500"/>
                    <span>{eventDate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-pink-500"/>
                    <span className="truncate">{locationName}</span>
                    {distance && (
                        <span className="ml-auto rounded-full bg-pink-50 px-2 py-1 text-xs font-semibold text-pink-600">
              {distance} km away
            </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default EventCard;
