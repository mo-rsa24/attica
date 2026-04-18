import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArtistPostsSidebar from "./ArtistPostSidebar.jsx";
import { useAuth } from './AuthContext';

// --- Helper & Sub-Components ---

// Header Component
const ProfileHeader = ({ artist, onFollow, isFollowing, isMyProfile }) => (
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
                {isMyProfile ? (
                    <Link
                        to="/profile/edit"
                        className="px-6 py-2 rounded-lg font-semibold transition bg-gray-900 text-white hover:bg-gray-800"
                    >
                        Edit profile
                    </Link>
                ) : (
                    <button
                        onClick={onFollow}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${isFollowing ? 'bg-gray-200 text-gray-800' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                        {isFollowing ? 'Following' : 'Follow'}
                    </button>
                )}
                {!isMyProfile && (
                    <Link to={`/artists/${artist.id}/book`} className="px-6 py-2 rounded-lg font-semibold bg-rose-500 text-white hover:bg-rose-600 transition">
                        Request Booking
                    </Link>
                )}
            </div>
        </div>
    </div>
);

// Stats Bar Component
const StatsBar = ({ stats, resource }) => {
    const rating = resource?.average_rating ?? stats.rating;
    const reviewCount = resource?.review_count ?? 0;
    return (
        <div className="grid grid-cols-3 text-center my-8 py-4 border-y">
            <div>
                <p className="text-xl font-bold">{stats.bookings_completed ?? 0}</p>
                <p className="text-sm text-gray-500">Bookings</p>
            </div>
            <div>
                <p className="text-xl font-bold">
                    {rating ? `${rating}⭐` : '—'}
                </p>
                <p className="text-sm text-gray-500">
                    Rating {reviewCount > 0 ? `(${reviewCount})` : ''}
                </p>
            </div>
            <div>
                <p className="text-xl font-bold">{stats.follower_count ?? 0}</p>
                <p className="text-sm text-gray-500">Followers</p>
            </div>
        </div>
    );
};

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

const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';

    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (Number.isNaN(seconds) || seconds < 0) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 5) return `${weeks}w ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
};

const normalizeArtistFeedPosts = (payload) => {
    const artistPosts = Array.isArray(payload) ? payload : payload?.results || [];
    return artistPosts.map((post) => ({
        id: `artist-${post.id}`,
        content: post.content || '',
        image: post.image || null,
        created_at: post.created_at,
        source: 'artist',
    }));
};

const normalizeSocialFeedPosts = (items) =>
    (Array.isArray(items) ? items : []).map((post) => ({
        id: `social-${post.id}`,
        content: post.text || '',
        image: post.image || null,
        created_at: post.created_at,
        source: 'social',
    }));

const sortPostsByNewest = (items) =>
    [...items].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = ['Feed', 'Portfolio', 'Reviews', 'Events'];
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
const PortfolioGrid = ({ items, isMyProfile, artistId, authHeader, onUploaded }) => {
    const [uploading, setUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState('');
    const fileRef = React.useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError('');
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`/api/artists/artists/${artistId}/portfolio/`, {
                method: 'POST',
                headers: authHeader ? { Authorization: authHeader } : {},
                body: fd,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || err.image?.[0] || 'Upload failed');
            }
            onUploaded?.();
        } catch (err) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div>
            {isMyProfile && (
                <div className="mb-4 flex items-center gap-3">
                    <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${uploading ? 'opacity-60 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                        {uploading ? 'Uploading…' : '+ Add photo'}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploading}
                            onChange={handleUpload}
                        />
                    </label>
                    {uploadError && <p className="text-sm text-rose-600">{uploadError}</p>}
                </div>
            )}
            {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8 text-sm">No portfolio photos yet.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4">
                    {items.map(item => (
                        <div key={item.id} className="aspect-square bg-gray-100 overflow-hidden">
                            <img src={item.image} alt={item.caption || 'Portfolio item'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Feed List Component
const FeedList = ({ items, artist }) => {
    const handle = artist?.instagram_handle ? `@${artist.instagram_handle.replace(/^@/, '')}` : '@artist';

    if (!items.length) {
        return (
            <div className="max-w-2xl mx-auto py-8 text-center border rounded-xl bg-white">
                <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
                <p className="text-sm text-gray-500 mt-1">This artist has not published feed posts yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto py-4">
            {items.map((post) => (
                <article key={post.id} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 pt-5 pb-4">
                        <div className="flex items-start gap-3 mb-3">
                            <img
                                src={artist?.profile_image || 'https://placehold.co/72x72/e2e8f0/64748B?text=A'}
                                alt={artist?.name || 'Artist'}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900">{artist?.name || 'Artist'}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {handle} · {formatTimeAgo(post.created_at)}
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                    </div>
                    {post.image && (
                        <div className="border-t bg-gray-50">
                            <img src={post.image} alt="Post media" className="w-full max-h-[560px] object-cover" />
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
};

// Reviews List Component — shows scheduling system reviews
const ReviewsList = ({ items }) => {
    if (!items.length) {
        return (
            <div className="max-w-2xl mx-auto py-8 text-center border rounded-xl bg-white">
                <h3 className="text-lg font-semibold text-gray-900">No reviews yet</h3>
                <p className="text-sm text-gray-500 mt-1">Be the first to book and review this artist.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto py-8">
            {items.map(review => {
                const stars = Math.max(0, Math.min(5, review.rating || 0));
                const initials = (review.reviewer_username || '?').charAt(0).toUpperCase();
                return (
                    <div key={review.id} className="bg-white border rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-1">
                                    <p className="font-semibold text-gray-900">@{review.reviewer_username || 'reviewer'}</p>
                                    <span className="text-xs text-gray-400">{formatTimeAgo(review.created_at)}</span>
                                </div>
                                <p className="text-amber-400 text-sm mt-0.5">
                                    {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                                    <span className="ml-1 text-gray-500 text-xs">({stars}/5)</span>
                                </p>
                                {review.comment && (
                                    <p className="mt-2 text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Events List Component
const EventsList = ({ items }) => {
    if (!items.length) {
        return (
            <div className="max-w-2xl mx-auto py-8 text-center border rounded-xl bg-white">
                <h3 className="text-lg font-semibold text-gray-900">No events yet</h3>
                <p className="text-sm text-gray-500 mt-1">This artist has no linked performance events yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-2xl mx-auto py-8">
            {items.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg">{event.name}</p>
                        <p className="text-sm text-gray-600">{event.date} - {event.location}</p>
                    </div>
                    <Link
                        to={`/events/${event.id}`}
                        className="bg-gray-800 text-white px-4 py-2 text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        View Event
                    </Link>
                </div>
            ))}
        </div>
    );
};


// --- Main Artist Profile Page Component ---

export default function ArtistProfilePage() {
    const { id } = useParams();
    const { user, tokens } = useAuth();
    const [artist, setArtist] = useState(null);
    const [resource, setResource] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('Portfolio');
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const authHeaderValue = tokens?.access ? `Bearer ${tokens.access}` : '';

    useEffect(() => {
        const fetchArtistData = async () => {
            setIsLoading(true);
            try {
                const requestOptions = authHeaderValue ? { headers: { Authorization: authHeaderValue } } : undefined;
                const fetchAllSocialPosts = async (artistProfileId) => {
                    const allSocialPosts = [];
                    let offset = 0;
                    let hasMore = true;

                    while (hasMore) {
                        const response = await fetch(
                            `/api/accounts/social-posts/?artist_profile_id=${artistProfileId}&offset=${offset}&limit=30`,
                            requestOptions
                        );

                        if (!response.ok) {
                            throw new Error(`Failed to fetch social posts with status ${response.status}`);
                        }

                        const payload = await response.json();
                        const results = Array.isArray(payload?.results) ? payload.results : [];
                        allSocialPosts.push(...results);

                        if (!payload?.has_more || results.length === 0) {
                            hasMore = false;
                            continue;
                        }

                        offset = typeof payload?.next_offset === 'number'
                            ? payload.next_offset
                            : offset + results.length;
                    }

                    return allSocialPosts;
                };

                // Fetch all data in parallel
                const [artistRes, portfolioRes, eventsRes, artistPostsRes, socialPostsData] = await Promise.all([
                    fetch(`/api/artists/artists/${id}/`, requestOptions),
                    fetch(`/api/artists/artists/${id}/portfolio/`, requestOptions),
                    fetch(`/api/artists/artists/${id}/events/`, requestOptions),
                    fetch(`/api/artists/artists/${id}/posts/`, requestOptions),
                    fetchAllSocialPosts(id).catch((error) => {
                        console.error('Failed to fetch artist social posts:', error);
                        return [];
                    }),
                ]);

                const [artistData, portfolioData, eventsData, artistPostsData] = await Promise.all([
                    artistRes.json(),
                    portfolioRes.json(),
                    eventsRes.json(),
                    artistPostsRes.json(),
                ]);

                // Fetch scheduling reviews by the artist's owner user ID
                const ownerId = artistData.owner || artistData.owner_id;
                let reviewsData = [];
                if (ownerId) {
                    const reviewsRes = await fetch(
                        `/api/scheduling/reviews/?resource_owner_id=${ownerId}`,
                        requestOptions
                    ).catch(() => null);
                    if (reviewsRes && reviewsRes.ok) {
                        const reviewsPayload = await reviewsRes.json();
                        reviewsData = Array.isArray(reviewsPayload)
                            ? reviewsPayload
                            : (reviewsPayload?.results ?? []);
                    }
                }

                const mergedFeedPosts = sortPostsByNewest([
                    ...normalizeArtistFeedPosts(artistPostsData),
                    ...normalizeSocialFeedPosts(socialPostsData),
                ]);

                // Fetch the scheduling MarketplaceResource for this artist
                if (ownerId) {
                    const resourcesRes = await fetch(
                        `/api/scheduling/resources/?owner_id=${ownerId}`,
                        requestOptions
                    ).catch(() => null);
                    if (resourcesRes && resourcesRes.ok) {
                        const resourcesPayload = await resourcesRes.json();
                        const items = Array.isArray(resourcesPayload)
                            ? resourcesPayload
                            : (resourcesPayload?.results ?? []);
                        if (items.length > 0) setResource(items[0]);
                    }
                }

                setArtist(artistData);
                setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
                setReviews(reviewsData);
                setEvents(Array.isArray(eventsData) ? eventsData : []);
                setPosts(mergedFeedPosts);

                // setIsMyProfile(artistData.user.id === loggedInUserId);
            } catch (error) {
                console.error("Failed to fetch artist data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistData();
    }, [id, authHeaderValue]);

    const isMyProfile = Boolean(
        user?.id && artist?.owner && Number(artist.owner) === Number(user.id)
    );

    const handleFollow = async () => {
        if (!artist || isMyProfile) return;

        // Optimistic UI update
        setArtist(prev => ({
            ...prev,
            is_following: !prev.is_following,
            follower_count: prev.is_following ? prev.follower_count - 1 : prev.follower_count + 1
        }));

        try {
            // API call
            const requestOptions = {
                method: 'POST',
                ...(authHeaderValue ? { headers: { Authorization: authHeaderValue } } : {}),
            };
            const response = await fetch(`/api/artists/artists/${id}/follow/`, {
                ...requestOptions,
            });

            if (!response.ok) {
                throw new Error(`Follow toggle failed with status ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to toggle follow state:', error);
            setArtist(prev => ({
                ...prev,
                is_following: !prev.is_following,
                follower_count: prev.is_following ? prev.follower_count - 1 : prev.follower_count + 1
            }));
        }
    };

    if (isLoading) {
        return <div className="text-center py-20">Loading profile...</div>;
    }

    if (!artist) {
        return <div className="text-center py-20">Artist not found.</div>;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Feed':
                return <FeedList items={posts} artist={artist} />;
            case 'Portfolio':
                return (
                    <PortfolioGrid
                        items={portfolio}
                        isMyProfile={isMyProfile}
                        artistId={id}
                        authHeader={authHeaderValue}
                        onUploaded={() => {
                            // Refresh portfolio
                            fetch(`/api/artists/artists/${id}/portfolio/`, authHeaderValue ? { headers: { Authorization: authHeaderValue } } : undefined)
                                .then(r => r.json())
                                .then(data => setPortfolio(Array.isArray(data) ? data : []))
                                .catch(() => {});
                        }}
                    />
                );
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
                <ProfileHeader artist={artist} onFollow={handleFollow} isFollowing={artist.is_following} isMyProfile={isMyProfile}/>
                <BookingOverview artist={artist} />
                <StatsBar stats={artist} resource={resource} />
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
                    isMyProfile={isMyProfile}
                />
            </div>
        </div>
        </div>
    );
}

