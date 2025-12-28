import React, { useEffect, useMemo, useState } from 'react';
import { FaBolt, FaMusic, FaPiggyBank, FaStar } from 'react-icons/fa';
import ArtistCard from './ArtistCard.jsx';

const SortPill = ({ isActive, label, description, onClick, icon: IconComponent }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-full border transition ${
            isActive
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
        }`}
    >
        <div className={`p-2 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
            <IconComponent />
        </div>
        <div className="text-left">
            <p className="font-semibold text-sm">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </button>
);

const ArtistCardSkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="h-56 bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
    </div>
);

const SORT_OPTIONS = {
    popular: {
        label: 'Most Popular',
        description: 'Top rated and followed artists',
        icon: FaBolt,
    },
    rating: {
        label: 'Highest Rated',
        description: 'Artists with the best reviews',
        icon: FaStar,
    },
    budget: {
        label: 'Budget Friendly',
        description: 'Lowest booking fees first',
        icon: FaPiggyBank,
    },
};

const sortArtists = (items, sortKey) => {
    const artists = [...items];
    switch (sortKey) {
        case 'popular':
            return artists.sort((a, b) => {
                const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
                if (ratingDiff !== 0) return ratingDiff;
                return (b.follower_count || 0) - (a.follower_count || 0);
            });
        case 'rating':
            return artists.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        case 'budget':
            return artists.sort((a, b) => {
                const feeA = Number(a.booking_fee) || Number.POSITIVE_INFINITY;
                const feeB = Number(b.booking_fee) || Number.POSITIVE_INFINITY;
                if (feeA === feeB) {
                    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
                }
                return feeA - feeB;
            });
        default:
            return artists;
    }
};

export default function Artists() {
    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [sortOption, setSortOption] = useState('popular');

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await fetch('/api/artists/genres/');
                if (!response.ok) throw new Error('Unable to load genres');
                const data = await response.json();
                setGenres(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchGenres();
    }, []);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const fetchArtists = async () => {
            setIsLoading(true);
            setError('');
            const genreFilter = selectedGenre !== 'all' ? `?genres=${encodeURIComponent(selectedGenre)}` : '';
            try {
                const response = await fetch(`/api/artists/artists/${genreFilter}`, { signal: controller.signal });
                if (!response.ok) throw new Error('Unable to load artists');
                const payload = await response.json();
                const rawArtists = Array.isArray(payload) ? payload : payload?.results || [];
                const sorted = sortArtists(rawArtists, sortOption);
                if (isMounted) {
                    setArtists(sorted);
                }
            } catch (err) {
                if (isMounted && err.name !== 'AbortError') {
                    setError('We had trouble loading artists. Please try again.');
                    console.error(err);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchArtists();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [selectedGenre, sortOption]);

    const filteredArtists = useMemo(() => {
        const query = searchTerm.toLowerCase();
        const visible = artists.filter(artist => {
            const name = artist.name?.toLowerCase() || '';
            const genresText = artist.genres?.toLowerCase() || '';
            const bio = artist.bio?.toLowerCase() || '';
            const matchesGenre = selectedGenre === 'all' || genresText.includes(selectedGenre.toLowerCase());
            const matchesSearch = name.includes(query) || genresText.includes(query) || bio.includes(query);
            return matchesGenre && matchesSearch;
        });
        return sortArtists(visible, sortOption);
    }, [artists, searchTerm, selectedGenre, sortOption]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="uppercase text-xs tracking-[0.3em] font-semibold text-white/80 mb-2">Artists</p>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-3">Explore artists for your next event</h1>
                            <p className="text-white/85 text-lg max-w-2xl">
                                Discover performers by genre, budget, or popularity, then dive into their profiles to book
                                the perfect fit.
                            </p>
                        </div>
                        <div className="bg-white/15 border border-white/30 rounded-2xl p-4 backdrop-blur-lg w-full lg:w-[420px]">
                            <p className="text-sm text-white/80 mb-2">Search artists</p>
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by name, genre, or vibe"
                                className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                            />
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                            <SortPill
                                key={key}
                                isActive={sortOption === key}
                                label={option.label}
                                description={option.description}
                                icon={option.icon}
                                onClick={() => setSortOption(key)}
                            />
                        ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedGenre('all')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                selectedGenre === 'all'
                                    ? 'bg-white text-indigo-600 shadow'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            All genres
                        </button>
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                    selectedGenre === genre
                                        ? 'bg-white text-indigo-600 shadow'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold flex items-center gap-2">
                            <FaMusic className="text-indigo-500" /> Explore artists
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900">Handpicked talent for every stage</h2>
                    </div>
                    <div className="text-sm text-gray-600">
                        Showing {filteredArtists.length} {filteredArtists.length === 1 ? 'artist' : 'artists'}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <ArtistCardSkeleton key={idx} />
                        ))}
                    </div>
                ) : filteredArtists.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                        <p className="text-lg font-semibold text-gray-800 mb-2">No artists match your search.</p>
                        <p className="text-gray-500 mb-4">Try clearing filters or switching to another sorting option.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedGenre('all');
                                setSortOption('popular');
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArtists.map(artist => (
                            <ArtistCard key={artist.id} artist={artist} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}