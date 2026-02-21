import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const formatDate = (date) => {
    if (!date) return 'TBA';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'TBA';
    return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const normalizeList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
            return trimmed.split(',').map(v => v.trim()).filter(Boolean);
        }
    }
    return [];
};

export default function Tours() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [tours, setTours] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchTours = async () => {
            setIsLoading(true);
            setError('');
            try {
                const artistsRes = await fetch('/api/artists/artists/');
                if (!artistsRes.ok) throw new Error('Failed to fetch artists');

                const artistsPayload = await artistsRes.json();
                const artists = Array.isArray(artistsPayload)
                    ? artistsPayload
                    : artistsPayload?.results || [];

                const normalizedTours = artists
                    .map((artist) => ({
                        artist,
                        startDate: artist.tour_start_date || null,
                        endDate: artist.tour_end_date || null,
                        cities: normalizeList(artist.tour_cities),
                        clubs: normalizeList(artist.tour_clubs),
                        ticketPrice: artist.general_ticket_price,
                    }))
                    .filter((tour) =>
                        tour.startDate ||
                        tour.endDate ||
                        tour.cities.length > 0 ||
                        tour.clubs.length > 0
                    )
                    .sort((a, b) => {
                        const aDate = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
                        const bDate = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
                        return aDate - bDate;
                    });

                if (isMounted) {
                    setTours(normalizedTours);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Unable to load tours right now. Please try again.');
                    console.error(err);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchTours();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredPosts = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return tours;

        return tours.filter((tour) => {
            const artistName = tour.artist?.name?.toLowerCase() || '';
            const genres = tour.artist?.genres?.toLowerCase() || '';
            const cities = tour.cities.join(' ').toLowerCase();
            const clubs = tour.clubs.join(' ').toLowerCase();
            return artistName.includes(term) || genres.includes(term) || cities.includes(term) || clubs.includes(term);
        });
    }, [tours, query]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="uppercase text-xs tracking-[0.3em] font-semibold text-white/80 mb-2">Tours</p>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Upcoming artist tours</h1>
                    <p className="text-white/90 text-lg max-w-3xl mb-6">
                        Browse active tour schedules from artist profiles.
                    </p>
                    <div className="bg-white/15 border border-white/30 rounded-2xl p-4 backdrop-blur-lg w-full lg:w-[460px]">
                        <p className="text-sm text-white/85 mb-2">Search tours</p>
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by artist, genre, city, or venue"
                            className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                        />
                    </div>
                </div>
            </section>

            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="animate-pulse bg-white rounded-2xl shadow p-5 space-y-4">
                                <div className="h-10 bg-gray-200 rounded w-2/3" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-5/6" />
                                <div className="h-44 bg-gray-200 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                        <p className="text-lg font-semibold text-gray-800 mb-2">No tours found.</p>
                        <p className="text-gray-500">
                            Tours will appear once artists add tour dates or locations in their profiles.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-gray-600 mb-5">
                            Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'tour' : 'tours'}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPosts.map((tour) => (
                                <article key={tour.artist.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={tour.artist?.profile_image || 'https://placehold.co/48x48/F3F4F6/9CA3AF?text=A'}
                                            alt={tour.artist?.name || 'Artist'}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <Link
                                                to={`/artists/${tour.artist?.id}`}
                                                className="font-semibold text-gray-900 hover:text-emerald-700 transition-colors"
                                            >
                                                {tour.artist?.name || 'Unknown Artist'}
                                            </Link>
                                            <p className="text-xs text-gray-500">{tour.artist?.genres || 'Genres not listed'}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 mb-4">
                                        <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700 mb-1">Tour Window</p>
                                        <p className="text-sm text-gray-800">
                                            {formatDate(tour.startDate)} to {formatDate(tour.endDate)}
                                        </p>
                                    </div>

                                    {tour.cities.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Cities</p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{tour.cities.join(', ')}</p>
                                        </div>
                                    )}

                                    {tour.clubs.length > 0 && (
                                        <div className="mb-3">
                                            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">Venues / Clubs</p>
                                            <p className="text-sm text-gray-700 line-clamp-2">{tour.clubs.join(', ')}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                                        <span className="text-gray-500 truncate max-w-[65%]">
                                            {tour.ticketPrice ? `From R${tour.ticketPrice}` : 'Ticket price TBA'}
                                        </span>
                                        <Link
                                            to={`/artists/${tour.artist?.id}`}
                                            className="font-semibold text-emerald-700 hover:text-emerald-800"
                                        >
                                            View artist
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
