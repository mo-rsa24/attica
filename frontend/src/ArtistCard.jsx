import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ArtistCard = ({ artist }) => {
    return (
        <Link to={`/artists/${artist.id}`} className="block bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-2 overflow-hidden group">
            <div className="relative">
                <img
                    src={artist.profile_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                    alt={artist.name}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            <div className="p-4 bg-gray-50">
                <h4 className="text-xl font-bold mt-1">{artist.name}</h4>
                <div className="flex items-center text-sm text-gray-600">
                    <FaStar className="mr-2 text-yellow-500" />
                    <span>{artist.rating}</span>
                    <span className="mx-2">|</span>
                    <span>{artist.genres}</span>
                </div>
            </div>
        </Link>
    );
};

export default ArtistCard;