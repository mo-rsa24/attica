import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import PostCard from './PostCard';
import NewPostButton from './NewPostButton';

const normalizeList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
        }
    }
    return [];
};

const formatDate = (value) => {
    if (!value) return 'TBA';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'TBA';
    return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatTicketPrice = (value) => {
    if (value === null || value === undefined || value === '') return 'Ticket price TBA';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return String(value);
    try {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0,
        }).format(parsed);
    } catch {
        return `R${parsed}`;
    }
};

const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== '';

const buildTourState = (artist, artistId, tour) => ({
    tour: {
        artist: {
            id: artistId ?? null,
            name: artist?.name || '',
            genres: artist?.genres || '',
            profile_image: artist?.profile_image || null,
            bio: artist?.bio || '',
        },
        startDate: tour?.startDate || null,
        endDate: tour?.endDate || null,
        cities: Array.isArray(tour?.cities) ? tour.cities : [],
        clubs: Array.isArray(tour?.clubs) ? tour.clubs : [],
        ticketPrice: tour?.ticketPrice ?? null,
    },
});

const TourGuideCard = ({ tour, artist, artistId }) => {
    const cardBody = (
        <article className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-lg transition-all duration-300">
            <h3 className="font-semibold text-gray-900">{tour.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
                {formatDate(tour.startDate)} to {formatDate(tour.endDate)}
            </p>

            {tour.cities.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Cities</p>
                    <p className="text-sm text-gray-700 mt-1">{tour.cities.join(', ')}</p>
                </div>
            )}

            {tour.clubs.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Venues / Clubs</p>
                    <p className="text-sm text-gray-700 mt-1">{tour.clubs.join(', ')}</p>
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100 text-sm font-medium text-gray-700">
                {formatTicketPrice(tour.ticketPrice)}
            </div>
        </article>
    );

    if (!artistId) return cardBody;

    return (
        <Link
            to={`/tours/${artistId}`}
            state={buildTourState(artist, artistId, tour)}
            className="block"
            aria-label={`Open ${artist?.name || 'artist'} tour guide`}
        >
            {cardBody}
        </Link>
    );
};

const ArtistPostsSidebar = ({ artist, posts = [], isMyProfile }) => {
    const { id: routeArtistId } = useParams();
    const resolvedArtistId = artist?.id || routeArtistId || null;

    const tourGuides = useMemo(() => {
        const toursFromArtist = Array.isArray(artist?.tours) ? artist.tours : [];
        const normalizedTours = toursFromArtist
            .map((tour, idx) => {
                const cities = normalizeList(tour?.cities ?? tour?.tour_cities);
                const clubs = normalizeList(tour?.clubs ?? tour?.tour_clubs);
                const startDate = tour?.startDate ?? tour?.start_date ?? tour?.tour_start_date ?? null;
                const endDate = tour?.endDate ?? tour?.end_date ?? tour?.tour_end_date ?? null;
                const ticketPrice = tour?.ticketPrice ?? tour?.ticket_price ?? tour?.general_ticket_price ?? null;
                const hasContent = startDate || endDate || cities.length > 0 || clubs.length > 0 || hasValue(ticketPrice);

                if (!hasContent) return null;

                return {
                    id: tour?.id || `tour-guide-${idx + 1}`,
                    title: tour?.title || tour?.name || `Tour guide ${idx + 1}`,
                    startDate,
                    endDate,
                    cities,
                    clubs,
                    ticketPrice,
                };
            })
            .filter(Boolean);

        if (normalizedTours.length > 0) return normalizedTours;

        const fallbackCities = normalizeList(artist?.tour_cities);
        const fallbackClubs = normalizeList(artist?.tour_clubs);
        const hasFallbackData =
            artist?.tour_start_date ||
            artist?.tour_end_date ||
            fallbackCities.length > 0 ||
            fallbackClubs.length > 0 ||
            hasValue(artist?.general_ticket_price);

        if (!hasFallbackData) return [];

        return [
            {
                id: `artist-${artist?.id || 'me'}-tour-guide`,
                title: 'Tour guide',
                startDate: artist?.tour_start_date || null,
                endDate: artist?.tour_end_date || null,
                cities: fallbackCities,
                clubs: fallbackClubs,
                ticketPrice: artist?.general_ticket_price ?? null,
            },
        ];
    }, [artist]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md sticky top-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Offerings</h2>

            {isMyProfile && <NewPostButton />}

            <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                {tourGuides.length > 0 ? (
                    tourGuides.map((tour) => (
                        <TourGuideCard
                            key={tour.id}
                            tour={tour}
                            artist={artist}
                            artistId={resolvedArtistId}
                        />
                    ))
                ) : isMyProfile ? (
                    <p className="text-gray-500 text-center py-8">No tour guides yet.</p>
                ) : posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} artist={artist} />
                    ))
                ) : (
                    <p className="text-gray-500 text-center py-8">No offerings yet.</p>
                )}
            </div>
        </div>
    );
};

export default ArtistPostsSidebar;
