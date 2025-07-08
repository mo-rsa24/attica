import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaRegHeart, FaHeart, FaShareSquare, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAuth } from './AuthContext';
import ReservationWidget from './ReservationWidget';
import RequestToBookModal from './RequestToBook2.jsx'

// 1. Image Gallery: Now with a modal for viewing all images
function ImageGallery({ images }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const openModal = (index) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    if (!images || images.length === 0) {
        return <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">No Images Available</div>;
    }

    const heroImage = images[0];
    const thumbnailImages = images.slice(1, 5);

    return (
        <div className="relative">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-2xl overflow-hidden">
                <div className="col-span-2 row-span-2 cursor-pointer" onClick={() => openModal(0)}>
                    <img src={heroImage} alt="Main service" className="h-full w-full object-cover hover:opacity-90 transition-opacity" />
                </div>
                {thumbnailImages.map((img, i) => (
                    <div key={i} className="col-span-1 row-span-1 cursor-pointer" onClick={() => openModal(i + 1)}>
                        <img src={img} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover hover:opacity-90 transition-opacity" />
                    </div>
                ))}
            </div>
            <button onClick={() => openModal(0)} className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md text-sm font-semibold hover:bg-gray-100 transition">
                Show all photos
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <button onClick={closeModal} className="absolute top-4 right-4 text-white text-3xl font-bold">✕</button>
                    <img src={images[selectedIndex]} alt="Full view" className="max-h-[90vh] max-w-[90vw] object-contain" />
                </div>
            )}
        </div>
    );
}

// 2. Title & Metadata: More detailed and styled
function TitleMetadata({ name, rating, reviewsCount, location, vendor }) {
    return (
        <div className="py-6">
            <h1 className="text-4xl font-bold text-gray-900">{name}</h1>
            <div className="flex items-center text-gray-600 text-md mt-2 space-x-4">
                <div className="flex items-center">
                    <FaStar className="text-yellow-500 mr-1" />
                    <span>{rating} ({reviewsCount} reviews)</span>
                </div>
                <span>·</span>
                <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{location}</span>
                </div>
            </div>
        </div>
    );
}

// 3. Reusable Feature Grid (previously QuickFacts)
function FeatureGrid({ title, items }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="py-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <div className="grid grid-cols-2 gap-4 text-gray-700">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                        {/* You can use a library like react-icons here */}
                        <span className="text-xl">✓</span>
                        <span>{item.name || item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 4. Enhanced Description
function Description({ text }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongText = text && text.length > 300;

    return (
        <div className="py-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">About this service</h2>
            <div className={`text-gray-800 leading-relaxed overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-full' : 'max-h-40'}`}>
                <p>{text}</p>
            </div>
            {isLongText && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 font-semibold mt-2 hover:underline">
                    {isExpanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
}

// 5. Host Profile Card
function HostProfile({ host }) {
    if (!host) return null;
    return (
        <div className="py-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">Meet your host</h2>
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                <img src={host.profile_image} alt={host.name} className="w-20 h-20 rounded-full object-cover" />
                <div>
                    <h3 className="text-xl font-bold">{host.name}</h3>
                    <p className="text-sm text-gray-600">{host.service_count} services · ⭐ {host.rating}</p>
                    <Link to={`/vendor/${host.username}`} className="text-blue-600 font-semibold mt-1 inline-block">View Profile</Link>
                </div>
            </div>
        </div>
    );
}

// 6. Styled Reviews Section
function Reviews({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="py-6 border-t">
                <h2 className="text-2xl font-semibold mb-4">No reviews yet</h2>
                <p className="text-gray-600">Be the first to review this service after you book.</p>
            </div>
        );
    }
    return (
        <div className="py-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">What guests are saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviews.slice(0, 4).map((r) => (
                    <div key={r.id}>
                        <div className="flex items-center mb-2">
                            <img src={r.user_avatar} alt={r.user_name} className="w-12 h-12 rounded-full object-cover mr-4" />
                            <div>
                                <p className="font-semibold">{r.user_name}</p>
                                <div className="text-sm text-gray-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                            </div>
                        </div>
                        <p className="text-gray-700 line-clamp-3">{r.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// 7. Fixed Location Map
function LocationMap({ lat, lng, locationName }) {
    const mapSrc = (lat && lng)
        ? `https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=14&amp;output=embed`
        : `https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&hl=es&z=14&amp;output=embed`;

    return (
        <div className="py-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">Location</h2>
            <div className="h-96 w-full rounded-2xl overflow-hidden">
                <iframe
                    title="Service Location"
                    src={mapSrc}
                    className="w-full h-full border-0"
                    loading="lazy"
                ></iframe>
            </div>
            <p className="mt-4 font-semibold text-gray-800">{locationName}</p>
            <p className="text-sm text-gray-500">Exact location is provided after booking.</p>
        </div>
    );
}

// 8. Styled Accordion for Policies
function PoliciesAccordion({ policies }) {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleItem = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    if (!policies || policies.length === 0) return null;

    return (
        <div className="py-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">Things to know</h2>
            <div className="space-y-2">
                {policies.map((p, i) => (
                    <div key={i} className="border-b">
                        <button
                            className="w-full flex justify-between items-center py-4 text-left"
                            onClick={() => toggleItem(i)}
                        >
                            <span className="font-semibold capitalize">{p.type}</span>
                            <span>{openIndex === i ? <FaChevronUp /> : <FaChevronDown />}</span>
                        </button>
                        {openIndex === i && (
                            <div className="pb-4 text-gray-700">
                                {p.text}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// 9. Sticky Reservation Widget
function ReservationWidget2({ price, serviceId, userRole }) {
    const navigate = useNavigate();
    const [guests, setGuests] = useState(1);

    const handleBooking = () => {
        // This would navigate to a detailed booking page or open a modal
        navigate(`/services/${serviceId}/request`);
    };

    const isOrganizer = userRole === 'EVENT_ORGANIZER';

    return (
        <div className="sticky top-24">
            <div className="bg-white p-6 rounded-2xl shadow-lg border">
                <p className="text-2xl font-bold">
                    R {price} <span className="text-base font-normal text-gray-600">/ day</span>
                </p>
                <div className="mt-4 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-1">DATES</label>
                        <input type="text" placeholder="Select dates" className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold mb-1">GUESTS</label>
                        <input type="number" value={guests} onChange={e => setGuests(e.target.value)} min="1" className="w-full p-2 border rounded-md" />
                    </div>
                    {isOrganizer ? (
                        <button onClick={handleBooking} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition-all">
                            Request to Book
                        </button>
                    ) : (
                        <p className="text-center text-sm text-gray-500">Log in as an event organizer to book.</p>
                    )}
                    <p className="text-center text-xs text-gray-500">You won't be charged yet</p>
                </div>
                <div className="mt-4 pt-4 border-t text-sm">
                    <div className="flex justify-between">
                        <span>R {price} x 1 day</span>
                        <span>R {price}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-2">
                        <span>Total</span>
                        <span>R {price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


// Main Listing Page Component
export default function ListingPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [service, setService] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isRequestModalOpen, setRequestModalOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/vendors/services/${id}/`)
            .then(res => {
                if (!res.ok) throw new Error('Service not found');
                return res.json();
            })
            .then(data => {
                setService(data);
            })
            .catch(error => {
                console.error("Failed to fetch service:", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [id]);

    if (isLoading) {
        return <div className="text-center py-40 text-2xl font-semibold">Loading...</div>;
    }

    if (!service) {
        return <div className="text-center py-40 text-2xl font-semibold">Service not found.</div>;
    }

    // Prepare data for child components
    const images = [service.image, ...(service.gallery?.map(g => g.image) || [])];
    const userRole = user?.roles?.includes('EVENT_ORGANIZER') ? 'EVENT_ORGANIZER' : 'GUEST';


    const handleOpenRequestModal = () => {
        setRequestModalOpen(true);
    };

    return (
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ImageGallery images={images} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
                {/* Main Content Column */}
                <div className="md:col-span-2">
                    <TitleMetadata
                        name={service.name}
                        rating={service.rating}
                        reviewsCount={service.reviews.length}
                        location={service.location_tags}
                    />
                    <Description text={service.description} />
                    <FeatureGrid title="What this service offers" items={service.amenities} />
                    <Reviews reviews={service.reviews} />
                    <LocationMap lat={service.latitude} lng={service.longitude} locationName={service.location_tags} />
                    <PoliciesAccordion policies={service.policies} />
                    <HostProfile host={service.vendor} />
                </div>

                {/* Sticky Reservation Column */}
                <div className="md:col-span-1">
                     <ReservationWidget
                        service={service}
                        userRole={"organizer"} // This would be fetched dynamically
                        onRequestToBookClick={handleOpenRequestModal}
                    />
                </div>
            <RequestToBookModal
                            isOpen={isRequestModalOpen}
                            onClose={() => setRequestModalOpen(false)}
                            serviceId={service.id}
                        />

            </div>
        </div>
    );
}