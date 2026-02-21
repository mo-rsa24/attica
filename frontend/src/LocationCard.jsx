import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationCard = ({ location }) => {
    return (
        <Link to={`/locations/${location.id}`} className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="relative">
                <img
                    src={location.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                    alt={location.name}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 backdrop-blur">
                    Venue
                </span>
            </div>
            <div className="p-4">
                <h4 className="mt-1 line-clamp-1 text-xl font-bold text-gray-900 group-hover:text-pink-600">{location.name}</h4>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-pink-500" />
                    <span>{location.venue_count} venues available</span>
                </div>
            </div>
        </Link>
    );
};

export default LocationCard;
