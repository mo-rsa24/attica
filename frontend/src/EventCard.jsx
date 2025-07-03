import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  // Format the date to be more readable
  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link to={`/events/${event.id}`} className="block bg-white rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
          alt={event.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-800 shadow">
          {eventDate}
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-lg font-bold text-gray-900 truncate">{event.name}</h4>
        <p className="text-sm text-gray-600 mt-1">{event.location}</p>
        <p className="text-sm text-pink-600 font-semibold mt-2">{event.category || 'General'}</p>
      </div>
    </Link>
  );
}

export default EventCard;