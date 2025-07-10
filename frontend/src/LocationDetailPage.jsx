import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Heart, Share2, Wifi, ParkingSquare, Wind, Users, MapPin, Star } from 'lucide-react';

// Helper function to conditionally join class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

// Mock API functions - replace with your actual API calls
const api = {
  fetchLocation: (id) => fetch(`/api/locations/locations/${id}/`).then(res => res.json()),
  fetchSimilar: (id) => fetch(`/api/locations/locations/${id}/similar/`).then(res => res.json()),
  fetchRecommendations: (id) => fetch(`/api/locations/locations/${id}/recommendations/`).then(res => res.json()),
  toggleWishlist: (id, isWished) => {
    console.log(`Toggling wishlist for location ${id}. Currently wished: ${isWished}`);
    // Replace with actual fetch POST/DELETE request
    return Promise.resolve({ success: true, isWished: !isWished });
  },
  joinWaitlist: (id, desiredDate) => {
    console.log(`Joining waitlist for location ${id} on ${desiredDate}`);
    return Promise.resolve({ success: true });
  },
  postQuestion: (id, text) => {
    console.log(`Posting question for location ${id}: "${text}"`);
    return Promise.resolve({ success: true });
  }
};

const FeatureIcon = ({ name }) => {
    // This component maps feature names to icons.
    // In a real app, you might get the icon name directly from the API.
    switch (name.toLowerCase()) {
        case 'wifi': return <Wifi className="w-6 h-6 text-rose-500" />;
        case 'parking': return <ParkingSquare className="w-6 h-6 text-rose-500" />;
        case 'air conditioning': return <Wind className="w-6 h-6 text-rose-500" />;
        case 'capacity': return <Users className="w-6 h-6 text-rose-500" />;
        default: return <Star className="w-6 h-6 text-rose-500" />;
    }
};


const LocationDetailPage = () => {
    const { id } = useParams();
    const [location, setLocation] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [similarLocations, setSimilarLocations] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isOnWaitlist, setIsOnWaitlist] = useState(false);
    const [isWished, setIsWished] = useState(false);
    const [question, setQuestion] = useState('');

    useEffect(() => {
        // Fetch all data for the location page
        const loadLocationData = async () => {
            try {
                const [locData, simData, recData] = await Promise.all([
                    api.fetchLocation(id),
                    api.fetchSimilar(id),
                    api.fetchRecommendations(id)
                ]);
                setLocation(locData);
                setMainImage(locData.image_url || 'https://placehold.co/1200x800/e2e8f0/4a5568?text=Venue');
                setSimilarLocations(simData);
                setRecommendations(recData);
                // In a real app, you'd fetch the user's wishlist status
                // setIsWished(locData.is_wished_by_user);
            } catch (error) {
                console.error("Failed to load location data:", error);
                toast.error("Could not load location details.");
            }
        };
        loadLocationData();
    }, [id]);

    useEffect(() => {
        // Set up WebSocket for real-time notifications
        if (!id) return;
        const client = new W3CWebSocket(`ws://127.0.0.1:8000/ws/waitlist/${id}/`);
        client.onopen = () => console.log('WebSocket Client Connected');
        client.onmessage = (message) => {
            const data = JSON.parse(message.data);
            if (data.type === 'waitlist.notification') {
                toast.success(data.message);
            }
        };
        return () => client.close();
    }, [id]);

    const handleToggleWishlist = async () => {
        try {
            const res = await api.toggleWishlist(id, isWished);
            if (res.success) {
                setIsWished(res.isWished);
                toast.success(res.isWished ? "Added to your wishlist!" : "Removed from your wishlist.");
            }
        } catch (error) {
            toast.error("Could not update wishlist.");
        }
    };

    const handleJoinWaitlist = async () => {
        try {
            await api.joinWaitlist(id, new Date().toISOString().split('T')[0]); // Using today as an example
            setIsOnWaitlist(true);
            toast.info("You've been added to the waitlist!");
        } catch (error) {
            toast.error("Could not join the waitlist.");
        }
    };

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            toast.warn("Please enter a question.");
            return;
        }
        try {
            await api.postQuestion(id, question);
            setQuestion('');
            toast.success("Your question has been submitted!");
        } catch (error) {
            toast.error("Failed to submit your question.");
        }
    };

    if (!location) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const galleryImages = location.images?.filter(img => img.image_type === 'gallery') || [];

    return (
        <>
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Breadcrumbs and Actions */}
                <div className="flex justify-between items-center mb-4">
                    <nav className="text-sm text-gray-500">
                        <span>Home</span> → <span>Locations</span> → <span className="font-medium text-gray-700">{location.name}</span>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button onClick={handleToggleWishlist} className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors">
                            <Heart className={classNames("w-5 h-5", isWished ? "text-rose-500 fill-current" : "")} />
                            <span>{isWished ? 'Wishlisted' : 'Wishlist'}</span>
                        </button>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition-colors">
                            <Share2 className="w-5 h-5" />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-3">
                        {/* Hero Gallery */}
                        <div className="relative">
                            <motion.img
                                key={mainImage}
                                src={mainImage}
                                className="rounded-xl shadow-lg w-full h-[450px] object-cover cursor-pointer"
                                onClick={() => setIsLightboxOpen(true)}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            />
                            <div className="absolute bottom-4 left-0 right-0 px-4">
                                <div className="flex gap-2 bg-black/30 backdrop-blur-sm p-2 rounded-xl overflow-x-auto">
                                    {galleryImages.slice(0, 7).map(t => (
                                        <img key={t.id} src={t.image_url} onClick={(e) => { e.stopPropagation(); setMainImage(t.image_url); }}
                                             className={`w-20 h-20 rounded-lg object-cover shadow-sm cursor-pointer border-2 transition ${mainImage === t.image_url ? 'border-rose-500' : 'border-transparent hover:border-white/50'}`}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Summary Panel) */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-8 bg-white p-6 rounded-xl shadow-lg space-y-6">
                            <h1 className="text-3xl lg:text-4xl font-bold">{location.name}</h1>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <span>{location.address}</span>
                            </div>
                            <div className="text-4xl font-bold text-rose-600">
                                ${location.price} <span className="text-lg font-normal text-gray-500">/ event</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-600 border-t border-b py-4">
                                <div className="flex items-center gap-2"><Users className="w-5 h-5 text-rose-500"/><span>Capacity: {location.capacity}</span></div>
                                <div className="flex items-center gap-2"><Star className="w-5 h-5 text-rose-500"/><span>{location.rating} ({location.reviews?.length || 0} reviews)</span></div>
                            </div>
                            <button className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-lg shadow-md transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500">
                                Request to Book
                            </button>
                            <button
                                onClick={handleJoinWaitlist}
                                disabled={isOnWaitlist}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isOnWaitlist ? 'You are on the waitlist' : 'Join Waitlist'}
                            </button>
                             <p className="text-xs text-center text-gray-400">Listed on {new Date(location.listed_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        {/* Description */}
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">About this Venue</h2>
                            <p className="text-gray-700 leading-relaxed">{location.description}</p>
                        </div>

                        {/* Features */}
                         <div className="mb-12">
                            <h2 className="text-2xl font-bold mb-4">What this place offers</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {location.features?.map(f => (
                                    <div key={f.id} className="flex items-center gap-3">
                                        <FeatureIcon name={f.name} />
                                        <span>{f.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Media Tabs */}
                        <div className="mb-12">
                             <Tab.Group as="div" className="w-full">
                                <Tab.List className="flex space-x-1 rounded-xl bg-rose-900/20 p-1">
                                    {['Gallery', 'Virtual Tour'].map((category) => (
                                        <Tab key={category} as={Fragment}>
                                        {({ selected }) => (
                                            <button className={classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white/60 ring-offset-2 ring-offset-rose-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-rose-700 shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white' )}>
                                            {category}
                                            </button>
                                        )}
                                        </Tab>
                                    ))}
                                </Tab.List>
                                <Tab.Panels className="mt-2">
                                    <Tab.Panel className="rounded-xl bg-white p-3 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {galleryImages.map(img => (
                                                <motion.img whileHover={{ scale: 1.05 }} key={img.id} src={img.image_url} alt="Gallery" className="rounded-lg shadow-md aspect-square object-cover"/>
                                            ))}
                                        </div>
                                    </Tab.Panel>
                                    <Tab.Panel className="rounded-xl bg-white p-3 ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                                        {location.virtual_tour_url ?
                                            <iframe src={location.virtual_tour_url} className="w-full h-96 border-none rounded-lg" allowFullScreen></iframe> :
                                            <p className="text-center text-gray-500 py-12">No virtual tour available.</p>}
                                    </Tab.Panel>
                                </Tab.Panels>
                            </Tab.Group>
                        </div>

                        {/* Q&A Section */}
                        <div className="my-10">
                            <h2 className="text-2xl font-bold mb-4">Questions & Answers</h2>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                 {/* Display existing questions here */}
                                <form onSubmit={handleAskQuestion} className="mt-4">
                                    <textarea
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        className="w-full p-3 border rounded-lg focus:ring-rose-500 focus:border-rose-500 transition"
                                        placeholder="Have a question? Ask the organizer."
                                        rows="3"
                                    ></textarea>
                                    <button type="submit" className="mt-3 bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition">
                                        Ask Question
                                    </button>
                                </form>
                            </div>
                        </div>

                    </div>
                    <div className="lg:col-span-2">
                         {/* Agent Info */}
                        <div className="sticky top-8 space-y-8">
                             <div className="p-6 bg-white rounded-xl shadow-lg flex items-center gap-4">
                                <img src={location.agent_avatar_url || 'https://placehold.co/80x80/e2e8f0/4a5568?text=Agent'} className="w-20 h-20 rounded-full shadow-md" alt={location.agent_name}/>
                                <div>
                                    <h3 className="text-xl font-semibold">Hosted by {location.agent_name}</h3>
                                    <p className="text-gray-600">{location.agent_organization}</p>
                                    <button className="mt-3 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition">
                                        Message Organizer
                                    </button>
                                </div>
                            </div>
                            {/* Embedded Map */}
                            <div className="rounded-xl shadow-lg overflow-hidden">
                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(location.address)}&output=embed`}
                                    className="w-full h-64 border-none"
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Carousels */}
                <div className="mt-16 border-t pt-12">
                    <h2 className="text-2xl font-bold mb-6">Similar Venues</h2>
                    <div className="flex overflow-x-auto gap-6 pb-4 -mx-8 px-8">
                        {similarLocations.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md transform hover:-translate-y-1 transition">
                                <img src={item.image_url || 'https://placehold.co/300x200/e2e8f0/4a5568?text=Venue'} className="h-40 w-full object-cover rounded-t-lg" alt={item.name}/>
                                <div className="p-4">
                                    <p className="font-semibold truncate">{item.name}</p>
                                    <p className="text-gray-600 text-sm">${item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                    <div className="flex overflow-x-auto gap-6 pb-4 -mx-8 px-8">
                        {recommendations.map(item => (
                            <div key={item.id} className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md transform hover:-translate-y-1 transition">
                                <img src={item.image_url || 'https://placehold.co/300x200/e2e8f0/4a5568?text=Venue'} className="h-40 w-full object-cover rounded-t-lg" alt={item.name}/>
                                <div className="p-4">
                                    <p className="font-semibold truncate">{item.name}</p>
                                    <p className="text-gray-600 text-sm">${item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                        onClick={() => setIsLightboxOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.img
                            src={mainImage}
                            className="max-w-4xl max-h-[90vh] rounded-lg shadow-2xl"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
                        />
                         <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white text-4xl">&times;</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default LocationDetailPage;
