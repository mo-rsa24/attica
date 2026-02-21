import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArtistPostsSidebar from "./ArtistPostSidebar.jsx";

// --- Helper & Sub-Components ---

// Header Component
const ProfileHeader = ({ artist, onFollow, isFollowing }) => (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 px-4">
        <img
            src={artist.profile_image || 'https://placehold.co/150x150/e2e8f0/e2e8f0'}
            alt={artist.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{artist.name}</h1>
            <p className="text-md text-gray-500 mt-1">@{artist.user?.username || 'artist'}</p>
            <p className="mt-4 text-gray-700 max-w-md">{artist.bio}</p>
            {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold mt-2 hover:underline">
                    {artist.website}
                </a>
            )}
            <div className="flex items-center gap-4 mt-4">
                <button
                    onClick={onFollow}
                    className={`px-6 py-2 rounded-lg font-semibold transition ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
                <Link to={`/artists/${artist.id}/book`} className="px-6 py-2 rounded-lg font-semibold bg-rose-500 text-white hover:bg-rose-600 transition">
                    Request Booking
                </Link>
            </div>
        </div>
    </div>
);

// Stats Bar Component
const StatsBar = ({ stats }) => (
    <div className="grid grid-cols-3 text-center my-8 py-4 border-y">
        <div>
            <p className="text-xl font-bold">{stats.bookings_completed}</p>
            <p className="text-sm text-gray-500">Bookings</p>
        </div>
        <div>
            <p className="text-xl font-bold">{stats.rating}⭐</p>
            <p className="text-sm text-gray-500">Rating</p>
        </div>
        <div>
            <p className="text-xl font-bold">{stats.follower_count}</p>
            <p className="text-sm text-gray-500">Followers</p>
        </div>
    </div>
);

const FEE_OPTION_LABELS = {
    fixed: 'Fixed fee',
    range: 'Fee range',
    negotiable: 'Negotiable',
    quote_only: 'Quote only',
};

const BookingOverview = ({ artist }) => {
    const availability = artist.availability && typeof artist.availability === 'object' ? artist.availability : {};
    const availableDays = Array.isArray(availability.available_days) ? availability.available_days : [];
    const blackoutDates = Array.isArray(availability.blackout_dates) ? availability.blackout_dates : [];
    const feeOption = FEE_OPTION_LABELS[availability.booking_fee_option] || null;

    const feeRange =
        artist.booking_fee_min || artist.booking_fee_max
            ? `R${artist.booking_fee_min || '-'} to R${artist.booking_fee_max || '-'}`
            : null;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
            <h3 className="text-lg font-bold text-gray-900">Booking Overview</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Fee option" value={feeOption} />
                <InfoRow label="Default fee" value={artist.booking_fee ? `R${artist.booking_fee}` : null} />
                <InfoRow label="Fee range" value={feeRange} />
                <InfoRow label="General ticket" value={artist.general_ticket_price ? `R${artist.general_ticket_price}` : null} />
                <InfoRow label="Tour dates" value={artist.tour_start_date || artist.tour_end_date ? `${artist.tour_start_date || '?'} to ${artist.tour_end_date || '?'}` : null} />
                <InfoRow label="Contact email" value={artist.contact_email || null} />
                <InfoRow label="Phone" value={artist.phone_number || null} />
                <InfoRow label="Instagram" value={artist.instagram_handle ? `@${artist.instagram_handle.replace(/^@/, '')}` : null} />
            </div>

            {availableDays.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Available days</p>
                    <div className="flex flex-wrap gap-2">
                        {availableDays.map((day) => (
                            <span key={day} className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                                {day}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {blackoutDates.length > 0 && (
                <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Blackout dates</p>
                    <div className="flex flex-wrap gap-2">
                        {blackoutDates.map((date) => (
                            <span key={date} className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
                                {date}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {availability.notes && (
                <p className="mt-4 text-sm text-gray-700">
                    <span className="font-semibold">Availability notes:</span> {availability.notes}
                </p>
            )}
            {availability.booking_notes && (
                <p className="mt-2 text-sm text-gray-700">
                    <span className="font-semibold">Pricing notes:</span> {availability.booking_notes}
                </p>
            )}
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-1">{value || 'Not specified'}</p>
    </div>
);

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = ['Portfolio', 'Reviews', 'Events'];
    return (
        <div className="border-b">
            <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab
                                ? 'border-gray-900 text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {tab.toUpperCase()}
                    </button>
                ))}
            </nav>
        </div>
    );
};

// Portfolio Grid Component
const PortfolioGrid = ({ items }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
        {items.map(item => (
            <div key={item.id} className="aspect-square bg-gray-100 overflow-hidden">
                <img src={item.image} alt={item.caption || 'Portfolio item'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
        ))}
    </div>
);

// Reviews List Component
const ReviewsList = ({ items }) => (
    <div className="space-y-6 max-w-2xl mx-auto py-8">
        {items.map(review => (
            <div key={review.id} className="flex items-start gap-4">
                <img src={`https://i.pravatar.cc/150?u=${review.user}`} alt={review.user} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-semibold">{review.user}</p>
                    <p className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                    <p className="mt-1 text-gray-700">{review.comment}</p>
                </div>
            </div>
        ))}
    </div>
);

// Events List Component
const EventsList = ({ items }) => (
     <div className="space-y-4 max-w-2xl mx-auto py-8">
        {items.map(event => (
            <div key={event.id} className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg">{event.name}</p>
                    <p className="text-sm text-gray-600">{event.date} - {event.location}</p>
                </div>
                <button className="bg-gray-800 text-white px-4 py-2 text-sm rounded-lg">View Event</button>
            </div>
        ))}
    </div>
);


// --- Main Artist Profile Page Component ---

export default function ArtistProfilePage() {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('Portfolio');
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]); // <-- NEW: State for post
    // const [isMyProfile, setIsMyProfile] = useState(false); // <-- NEW: To check if it's the logged-in user's profile

    useEffect(() => {
        const fetchArtistData = async () => {
            setIsLoading(true);
            try {
                // Fetch all data in parallel
                const [artistRes, portfolioRes, reviewsRes, eventsRes, postsRes] = await Promise.all([
                    fetch(`/api/artists/artists/${id}/`),
                    fetch(`/api/artists/artists/${id}/portfolio/`),
                    fetch(`/api/artists/artists/${id}/reviews/`),
                    fetch(`/api/artists/artists/${id}/events/`),
                    fetch(`/api/artists/artists/${id}/posts/`), // <-- NEW: Fetch posts
                ]);

                setArtist(await artistRes.json());
                setPortfolio(await portfolioRes.json());
                setReviews(await reviewsRes.json());
                setEvents(await eventsRes.json());
                setPosts(await postsRes.json());

                // setIsMyProfile(artistData.user.id === loggedInUserId);
            } catch (error) {
                console.error("Failed to fetch artist data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistData();
    }, [id]);

    const handleFollow = async () => {
        // Optimistic UI update
        setArtist(prev => ({
            ...prev,
            is_following: !prev.is_following,
            follower_count: prev.is_following ? prev.follower_count - 1 : prev.follower_count + 1
        }));

        // API call
        await fetch(`/api/artists/artists/${id}/follow/`, {
            method: 'POST',
            // Add authentication headers here
        });
    };

    if (isLoading) {
        return <div className="text-center py-20">Loading profile...</div>;
    }

    if (!artist) {
        return <div className="text-center py-20">Artist not found.</div>;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Portfolio':
                return <PortfolioGrid items={portfolio} />;
            case 'Reviews':
                return <ReviewsList items={reviews} />;
            case 'Events':
                return <EventsList items={events} />;
            default:
                return null;
        }
    };

    return (
        // <div className="bg-gray-50 min-h-screen">
        //     <div className="max-w-4xl mx-auto py-8">
        //         <ProfileHeader artist={artist} onFollow={handleFollow} isFollowing={artist.is_following}/>
        //         <StatsBar stats={artist}/>
        //         <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab}/>
        //         <div className="mt-8">
        //             {renderTabContent()}
        //         </div>
        //     </div>
        // </div>

    <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- Main Profile Section (LHS) --- */}
            <div className="lg:col-span-2">
                <ProfileHeader artist={artist} onFollow={handleFollow} isFollowing={artist.is_following}/>
                <BookingOverview artist={artist} />
                <StatsBar stats={artist}/>
                <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab}/>
                <div className="mt-8">
                    {renderTabContent()}
                </div>
            </div>

            {/* --- Posts Sidebar (RHS) --- */}
            <div className="lg:col-span-1">
                <ArtistPostsSidebar
                    artist={artist}
                    posts={posts}
                    isMyProfile={true}
                />
            </div>
        </div>
        </div>
    );
}

