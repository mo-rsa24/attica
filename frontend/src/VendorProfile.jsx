import React, {useEffect, useMemo, useRef, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {FaCheckCircle, FaPaperPlane, FaStar} from "react-icons/fa";
import {useAuth} from "./AuthContext";
import ChatRoom from "./components/chat/ChatRoom";
import BidModal from "./components/chat/BidModal";

export default function VendorProfile() {
    const {username} = useParams();
    const {user, tokens} = useAuth();

    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [showFullBio, setShowFullBio] = useState(false);

    const [room, setRoom] = useState(null);
    const [creatingRoom, setCreatingRoom] = useState(false);
    const [chatError, setChatError] = useState(null);
    const chatRef = useRef(null);
    const [showBidModal, setShowBidModal] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setFetchError(null);

                const res = await fetch(`/api/vendors/by-username/${username}/`);
                if (!res.ok) throw new Error(`Failed to load vendor (${res.status})`);

                const data = await res.json();
                if (!cancelled) setVendor(data);
            } catch (e) {
                if (!cancelled) setFetchError(e?.message || "Failed to load vendor");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [username]);

    const bio = useMemo(() => vendor?.description || "", [vendor]);
    const listings = useMemo(() => vendor?.services || [], [vendor]);
    const reviews = useMemo(() => vendor?.reviews || [], [vendor]);

    const ensureRoom = async () => {
        setChatError(null);
        // If we already have a room, reuse it
        if (room) return room;

        // Must have auth + vendor + user
        if (!tokens?.access) {
            setChatError("Please sign in to send a DM.");
            return null;
        }
        if (!vendor || !user) {
            setChatError("We couldn't load your account details. Please try again.");
            return null;
        }
        const vendorUserId = vendor.user_id || vendor.user?.id;
        if (!vendorUserId) {
            setChatError("This vendor can't receive messages right now.");
            return null;
        }

        // Prevent duplicate creates
        if (creatingRoom) return null;

        setCreatingRoom(true);
        try {
            const res = await fetch("/api/chat/rooms/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokens.access}`,
                },
                body: JSON.stringify({
                    organizer: user.id,
                    vendor: vendorUserId,
                }),
            });

            if (!res.ok) {
                let detail = "Unable to open chat right now. Please try again.";
                try {
                    const errorData = await res.json();
                    if (errorData?.detail) detail = errorData.detail;
                } catch {
                    // ignore JSON parse errors and use default detail
                }
                setChatError(detail);
                return null;
            }

            const data = await res.json();
            setRoom(data);
            return data;
        } finally {
            setCreatingRoom(false);
        }
    };

    const handleStartChat = async () => {
        await ensureRoom();
    };

    const handlePlaceBid = async () => {
        const r = await ensureRoom();
        if (r) setShowBidModal(true);
    };
    useEffect(() => {
        if (room && chatRef.current) {
            chatRef.current.scrollIntoView({behavior: "smooth", block: "start"});
        }
    }, [room]);


    if (loading) {
        return (
            <div className="max-w-screen-lg mx-auto mt-6 px-4">
                <p className="text-gray-600">Loading…</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="max-w-screen-lg mx-auto mt-6 px-4">
                <p className="text-red-600">{fetchError}</p>
            </div>
        );
    }

    if (!vendor) return null;

    return (
        <>
            <div className="max-w-screen-lg mx-auto mt-6 space-y-6 px-4">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row">
                    <img
                        src={vendor.profile_image || "/static/default_profile.jpg"}
                        alt={vendor.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto md:mx-0 md:mr-6"
                    />

                    <div className="flex-1 mt-4 md:mt-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    {vendor.name}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">Joined in 2021</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleStartChat}
                                    disabled={!tokens?.access || !user || creatingRoom}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white text-sm font-medium shadow hover:bg-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <FaPaperPlane/>
                                    {creatingRoom ? "Opening…" : "DM"}
                                </button>

                                {user?.user_type === "organizer" && (
                                    <button
                                        onClick={handlePlaceBid}
                                        disabled={!tokens?.access || creatingRoom}
                                        className="px-3 py-2 rounded-full bg-green-600 text-white text-sm font-medium shadow hover:bg-green-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {creatingRoom ? "Preparing…" : "Place Bid"}
                                    </button>
                                )}
                            </div>
                            {chatError && (
                                <p className="text-sm text-red-600 mt-2" role="status">
                                    {chatError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center space-x-2 mt-2">
              <span className="flex items-center text-sm text-gray-700">
                <FaCheckCircle className="text-green-500 mr-1"/> Superhost
              </span>
                        </div>

                        <div className="flex items-center space-x-1 mt-2">
                            <FaStar className="text-yellow-500"/>
                            <span className="text-sm font-medium">{vendor.rating}</span>
                        </div>
                    </div>
                </div>

                {/* Verification Badge */}
                <div className="bg-gray-50 rounded-lg p-4 border flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2"/>
                    <span className="text-sm text-gray-700">
            Identity verified in May 2019
          </span>
                </div>

                {/* About Section */}
                <div className="border rounded-lg bg-white p-6">
                    <p className="text-gray-800 mb-4">
                        {showFullBio || bio.length < 200 ? bio : `${bio.slice(0, 200)}...`}
                    </p>

                    {!showFullBio && bio.length > 200 && (
                        <button
                            className="text-blue-600 text-sm font-medium hover:underline"
                            onClick={() => setShowFullBio(true)}
                        >
                            Show more
                        </button>
                    )}

                    <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                            <span className="mr-2">🌍</span>
                            <span>From Johannesburg</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">💬</span>
                            <span>Speaks English</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-2">❤️</span>
                            <span>Travel, Photography</span>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Reviews</h2>

                    {reviews.length === 0 ? (
                        <p className="text-gray-600">No reviews yet.</p>
                    ) : (
                        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                            {reviews.map((r) => (
                                <div key={r.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <img
                                            src={r.user_avatar || "/static/default_profile.jpg"}
                                            alt="avatar"
                                            className="w-10 h-10 rounded-full mr-2"
                                        />
                                        <div>
                                            <p className="font-medium">{r.user}</p>
                                            <p className="text-sm text-gray-500">{r.date}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600 mb-2">
                                        <FaStar className="text-yellow-500 mr-1"/> {r.rating}
                                    </div>

                                    <p className="text-gray-700">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Listings Section */}
                {listings.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">
                            Places Hosted by {vendor.name}
                        </h2>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {listings.map((service) => (
                                <Link
                                    to={`/services/${service.id}`}
                                    key={service.id}
                                    className="group block"
                                >
                                    <img
                                        src={service.image}
                                        alt={service.name}
                                        className="rounded-lg shadow-sm mb-2 object-cover w-full h-48 group-hover:shadow-lg group-hover:scale-105 transition"
                                    />
                                    <h3 className="text-lg font-semibold">{service.name}</h3>
                                    <div className="text-sm text-gray-500 flex items-center space-x-1">
                                        <FaStar className="text-yellow-500"/>
                                        <span>{service.rating}</span>
                                        <span>·</span>
                                        {service.price && <span>${service.price}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {room && (
                <div ref={chatRef} className="max-w-screen-lg mx-auto mt-4 px-4">
                    <ChatRoom
                        room={room}
                        tokens={tokens}
                        user={user}
                        vendor={vendor}
                        onClose={() => setRoom(null)}
                    />
                </div>
            )}

            {room && (
                <BidModal
                    room={room}
                    open={showBidModal}
                    onClose={() => setShowBidModal(false)}
                    tokens={tokens}
                    onSubmit={() => {
                        // TODO: wire bid submit handler
                    }}
                />
            )}
        </>
    );
}
