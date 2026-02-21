import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ArtistCard = ({ artist }) => {
    return (
        <Link to={`/artists/${artist.id}`} className="group block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
            <div className="relative">
                <img
                    src={artist.profile_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'}
                    alt={artist.name}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 backdrop-blur">
                    Artist
                </span>
            </div>
            <div className="p-4">
                <h4 className="mt-1 line-clamp-1 text-xl font-bold text-gray-900 group-hover:text-pink-600">{artist.name}</h4>
                <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FaStar className="mr-2 text-yellow-500" />
                    <span>{artist.rating}</span>
                    <span className="mx-2">|</span>
                    <span className="line-clamp-1">{artist.genres || 'Multi-genre'}</span>
                </div>
            </div>
        </Link>
    );
};

export default ArtistCard;
