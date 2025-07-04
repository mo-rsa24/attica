import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationCard = ({ location }) => {
    return (
        <Link to={`/locations/${location.id}`} className="block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 overflow-hidden group">
            <div className="relative">
                <img
                    src={location.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                    alt={location.name}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            <div className="p-4 bg-gray-50">
                <h4 className="text-xl font-bold mt-1">{location.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="mr-2 text-pink-500" />
                    <span>{location.venue_count} venues available</span>
                </div>
            </div>
        </Link>
    );
};

export default LocationCard;