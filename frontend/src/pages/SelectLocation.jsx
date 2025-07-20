import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaChevronDown, FaMapMarkedAlt, FaCheck, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { Users, MapPin, Star } from 'lucide-react';
import {useEventCreation} from "../context/reactContext.jsx";
import InteractiveMap from "../components/InteractiveMap.jsx";

// --- API Helper ---
const api = {
    fetchLocations: () => fetch('/api/locations/locations/').then(res => {
        if (!res.ok) {
            throw new Error('Network response was not ok');
        }
        return res.json();
    }),
    fetchMapData: () => fetch('/api/locations/locations/map-data/').then(res => res.json()), // New API call
};

// --- Reusable Components ---

const LocationDetailModal = ({ location, onClose }) => {
    if (!location) return null;

    // Logic to find the main image and gallery images
    const mainImage = location.images?.find(img => img.image_type === 'main') || location.images?.[0];
    const galleryImages = location.images?.filter(img => img.image_type === 'gallery') || [];


    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentImage, setCurrentImage] = React.useState(mainImage);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        // Reset the current image when the location changes
        setCurrentImage(mainImage);
    }, [location, mainImage]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative">
                    <img
                        src={currentImage?.image_url || 'https://placehold.co/1200x600/e2e8f0/4a5568?text=Venue'}
                        alt={location.name}
                        className="h-80 w-full object-cover rounded-t-2xl"
                    />
                    <button onClick={onClose} className="absolute top-4 right-4 bg-white/70 rounded-full p-2 hover:bg-white">
                        <FaTimes className="text-gray-800" />
                    </button>
                     {/* Gallery Thumbnails */}
                    {galleryImages.length > 0 && (
                        <div className="absolute bottom-4 left-0 right-0 px-4">
                            <div className="flex gap-2 bg-black/30 backdrop-blur-sm p-2 rounded-xl overflow-x-auto">
                                {galleryImages.map(img => (
                                    <img
                                        key={img.id}
                                        src={img.image_url}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImage(img); }}
                                        className={`w-16 h-16 rounded-lg object-cover shadow-sm cursor-pointer border-2 transition ${currentImage?.id === img.id ? 'border-pink-500' : 'border-transparent hover:border-white/50'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-gray-900">{location.name}</h2>
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span>{location.address}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-gray-700">
                        <div className="flex items-center gap-2"><Users className="w-5 h-5 text-pink-500"/><span>Capacity: {location.capacity}</span></div>
                        <div className="flex items-center gap-2"><Star className="w-5 h-5 text-pink-500"/><span>{location.rating} ({location.reviews?.length || 0} reviews)</span></div>
                    </div>
                     <p className="mt-6 text-gray-700 leading-relaxed">{location.description || "No description available."}</p>
                    <div className="mt-8">
                         <h3 className="text-xl font-bold mb-4">Features</h3>
                         <div className="grid grid-cols-2 gap-4">
                            {location.features?.map(f => (
                                <div key={f.id} className="flex items-center gap-3">
                                    <Star className="w-6 h-6 text-pink-500" />
                                    <span>{f.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const VenueCard = ({ loc, onSelect, onDetails, isSelected }) => {
    // Use the thumbnail for the card if available, otherwise the main image
    const cardImage = loc.images?.find(img => img.image_type === 'thumbnail') || loc.images?.find(img => img.image_type === 'main') || loc.images?.[0];

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative">
                <img src={cardImage?.image_url || 'https://placehold.co/400x300/e2e8f0/4a5568?text=Venue'} alt={loc.name} className="h-48 w-full object-cover" />
                {loc.is_featured && <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</div>}
                <button onClick={() => onSelect(loc)} className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                    {isSelected ? <FaCheck className="text-green-500" /> : <span className="text-xl">+</span>}
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{loc.name}</h3>
                <p className="text-gray-600">{loc.region?.name || 'N/A'} • {loc.capacity} guests</p>
                <p className="text-lg font-semibold text-pink-600 mt-1">
                    {loc.has_variable_pricing ? "Quote on Request" : `R ${parseFloat(loc.price).toLocaleString()}`}
                </p>
                <button onClick={() => onDetails(loc)} className="mt-4 w-full text-center text-gray-800 font-bold py-2 rounded-md border border-gray-300 hover:bg-gray-100">
                    Details
                </button>
            </div>
        </div>
    );
};

const BudgetPlanner = ({ totalCost }) => (
    <div className="bg-white p-4 rounded-lg shadow-inner">
        <h3 className="font-bold text-lg text-gray-800">Budget Planner</h3>
        <p className="text-sm text-gray-500">Estimated total for selected items.</p>
        <div className="mt-4 text-3xl font-extrabold text-pink-600">
            R {totalCost.toLocaleString()}
        </div>
    </div>
);

// --- Main Selection Page ---
export default function SelectLocation() {
    const navigate = useNavigate();
    const { selectedLocations, setSelectedLocations } = useEventCreation();
    const [allLocations, setAllLocations] = useState([]);
    const [mapLocations, setMapLocations] = useState([]);
    const [viewingLocation, setViewingLocation] = useState(null);


    // useEffect(() => {
    //     api.fetchLocations()
    //         .then(data => setAllLocations(data.results || data || []))
    //         .catch(err => console.error("Failed to fetch locations:", err));
    // }, []);
    useEffect(() => {
        // Fetch both full data for cards and lightweight data for map
        Promise.all([api.fetchLocations(), api.fetchMapData()])
            .then(([fullData, mapData]) => {
                setAllLocations(fullData.results || fullData || []);
                setMapLocations(mapData || []);
            })
            .catch(err => console.error("Failed to fetch location data:", err));
    }, []);


    const handleSelect = (location) => {
        setSelectedLocations(prev => {
            const isSelected = prev.some(l => l.id === location.id);
            if (isSelected) {
                return prev.filter(l => l.id !== location.id);
            } else {
                return [...prev, location];
            }
        });
    };

     const handleMarkerClick = (mapLoc) => {
        // Find the full location data to show in the modal
        const fullLocation = allLocations.find(loc => loc.id === mapLoc.id);
        if (fullLocation) {
            setViewingLocation(fullLocation);
        }
    };

    const handleDone = () => {
        navigate('/listing/step3');
    };

    const totalCost = selectedLocations.reduce((acc, loc) => acc + (loc.has_variable_pricing ? 0 : parseFloat(loc.price)), 0);
    const selectedIds = new Set(selectedLocations.map(l => l.id));

    return (
        <div className="min-h-screen bg-gray-100">
            <AnimatePresence>
                {viewingLocation && <LocationDetailModal location={viewingLocation} onClose={() => setViewingLocation(null)} />}
            </AnimatePresence>

            <header className="bg-white sticky top-0 z-10 shadow-md">
                 <div className="p-4 max-w-screen-2xl mx-auto">
                    <h1 className="text-2xl font-bold">Select a Venue for Your Event</h1>
                    <p className="text-sm text-gray-500">Home → Events → Venue</p>
                </div>
                <div className="p-4 border-t border-gray-200 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-grow">
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search venues..." className="w-full pl-10 pr-4 py-2 border rounded-full" />
                    </div>
                    <button className="px-4 py-2 bg-white border rounded-full flex items-center gap-2">Region <FaChevronDown size={12} /></button>
                    <button className="px-4 py-2 bg-white border rounded-full flex items-center gap-2">Capacity <FaChevronDown size={12} /></button>
                    <button className="px-4 py-2 bg-white border rounded-full flex items-center gap-2">Price Range <FaChevronDown size={12} /></button>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gray-300 rounded-lg h-80 shadow-md">
                        <InteractiveMap locations={mapLocations} onMarkerClick={handleMarkerClick}/>
                    </div>
                    <BudgetPlanner totalCost={totalCost}/>
                    <div className="bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                        <h4 className="font-bold text-teal-800 flex items-center gap-2"><FaInfoCircle /> Recommended Combo</h4>
                        <p className="text-sm text-teal-700 mt-1">Book <span className='font-bold'>Sandton CC</span> with <span className='font-bold'>Staging Pro</span> and get 10% off lighting!</p>
                     </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {allLocations.map(loc => (
                            <VenueCard
                                key={loc.id}
                                loc={loc}
                                onSelect={handleSelect}
                                onDetails={setViewingLocation}
                                isSelected={selectedIds.has(loc.id)}
                            />
                        ))}
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-6 right-6">
                <button
                    onClick={handleDone}
                    className="px-8 py-4 bg-pink-600 text-white font-bold rounded-full shadow-2xl hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                >
                    Done
                </button>
            </footer>
        </div>
    );
}
