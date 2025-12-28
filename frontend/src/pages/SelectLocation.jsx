import React, {useState, useEffect, Fragment, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {
    FaSearch,
    FaChevronDown,
    FaMapMarkedAlt,
    FaCheck,
    FaInfoCircle,
    FaTimes,
    FaWifi,
    FaVolumeUp, FaPhotoVideo, FaParking, FaWheelchair
} from 'react-icons/fa';
import {Users, MapPin, Star} from 'lucide-react';
import {useEventCreation} from "../context/reactContext.jsx";
import InteractiveMap from "../components/InteractiveMap.jsx";
import { useDebounce } from 'use-debounce';
import AtticaMark from "../components/AtticaMark.jsx";

// --- API Helper ---
const api = {
    searchLocations: (query, region = '') => fetch(`/api/locations/search/?q=${query}&region=${region}`).then(res => res.json()),
    reverseGeocode: (lat, lng) => fetch(`/api/locations/reverse/?lat=${lat}&lng=${lng}`).then(res => res.json()),
    fetchLocations: (filters = {}) => {
        const query = new URLSearchParams(filters).toString();
        return fetch(`/api/locations/locations/?${query}`).then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        });
    },
    fetchMapData: () => fetch('/api/locations/locations/map-data/').then(res => res.json()),
};

const SearchBar = ({ onSelectSuggestion, value, setValue }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [debouncedSearch] = useDebounce(value, 300);

    useEffect(() => {
        if (debouncedSearch) {
            api.searchLocations(debouncedSearch).then(setSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [debouncedSearch]);

    const handleSelect = (location) => {
        setValue(location.name);
        setSuggestions([]);
        onSelectSuggestion(location);
    };

    return (
        <div className="relative w-full">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 z-10" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search for a location..."
                className="w-full pl-12 pr-4 py-3 border rounded-full shadow-sm focus:ring-2 focus:ring-pink-500 outline-none"
            />
            <AnimatePresence>
                {suggestions.length > 0 && (
                    <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute w-full mt-2 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                        {suggestions.map(s => (
                            <li key={s.id} onClick={() => handleSelect(s)} className="p-3 hover:bg-pink-50 cursor-pointer">
                                {s.name}
                                <p className="text-sm text-gray-500">{s.address}</p>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}

const LocationDetailModal = ({location, onClose, onSelect, isSelected}) => {
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

    const amenitiesIcons = {
        'Projector': <FaPhotoVideo/>,
        'Sound System': <FaVolumeUp/>,
        'WiFi': <FaWifi/>,
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{y: 50, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                exit={{y: 50, opacity: 0}}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative">
                    <img
                        src={currentImage?.image_url || 'https://placehold.co/1200x600/e2e8f0/4a5568?text=Venue'}
                        alt={location.name}
                        className="h-80 w-full object-cover rounded-t-2xl"
                    />
                    <button onClick={onClose}
                            className="absolute top-4 right-4 bg-white/70 rounded-full p-2 hover:bg-white">
                        <FaTimes className="text-gray-800"/>
                    </button>
                    {/* Gallery Thumbnails */}
                    {galleryImages.length > 0 && (
                        <div className="absolute bottom-4 left-0 right-0 px-4">
                            <div className="flex gap-2 bg-black/30 backdrop-blur-sm p-2 rounded-xl overflow-x-auto">
                                {galleryImages.map(img => (
                                    <img
                                        key={img.id}
                                        src={img.image_url}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImage(img);
                                        }}
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
                        <MapPin className="w-5 h-5 text-gray-400"/>
                        <span>{location.address}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-gray-700">
                        <div className="flex items-center gap-2"><Users
                            className="w-5 h-5 text-pink-500"/><span>Capacity: {location.capacity}</span></div>
                        <div className="flex items-center gap-2"><Star
                            className="w-5 h-5 text-pink-500"/><span>{location.rating} ({location.reviews?.length || 0} reviews)</span>
                        </div>
                    </div>
                    <p className="mt-6 text-gray-700 leading-relaxed">{location.description || "No description available."}</p>
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Features</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {location.features?.map(f => (
                                <div key={f.id} className="flex items-center gap-3">
                                    <Star className="w-6 h-6 text-pink-500"/>
                                    <span>{f.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto">
                    {/* Venue Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">Venue Details</h3>
                            <div className="space-y-3 text-gray-700">
                                <div className="flex items-center gap-3"><Users
                                    className="w-5 h-5 text-pink-500"/><span>Capacity: {location.capacity} guests</span>
                                </div>
                                <div className="flex items-center gap-3"><FaParking
                                    className="w-5 h-5 text-pink-500"/><span>Parking: {location.parking_info || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3"><FaWheelchair
                                    className="w-5 h-5 text-pink-500"/><span>Accessibility: {location.is_wheelchair_accessible ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Budget Estimate</h3>
                            <p className="text-3xl font-bold text-pink-600">
                                R{location.budget_estimate_min || '...'} – R{location.budget_estimate_max || '...'}
                            </p>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {location.amenities?.map(amenity => (
                                <div key={amenity.id} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    {amenitiesIcons[amenity.name] || <Star className="w-6 h-6 text-pink-500"/>}
                                    <span>{amenity.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Organizer Notes */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">Notes</h3>
                        <p className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">{location.organizer_notes || 'No specific notes for this venue.'}</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t mt-auto sticky bottom-0">
                    <button onClick={() => onSelect(location)}
                            className={`w-full py-3 font-bold text-white rounded-lg ${isSelected ? 'bg-red-500' : 'bg-green-600'}`}>
                        {isSelected ? 'Remove from Event' : 'Add to Event'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const VenueCard = ({loc, onSelect, onDetails, isSelected}) => {
    // Use the thumbnail for the card if available, otherwise the main image
    const cardImage = loc.images?.find(img => img.image_type === 'thumbnail') || loc.images?.find(img => img.image_type === 'main') || loc.images?.[0];

    return (
        <div
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative">
                <img src={cardImage?.image_url || 'https://placehold.co/400x300/e2e8f0/4a5568?text=Venue'}
                     alt={loc.name} className="h-48 w-full object-cover"/>
                {loc.is_featured && <div
                    className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">⭐
                    Featured</div>}
                <button onClick={() => onSelect(loc)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                    {isSelected ? <FaCheck className="text-green-500"/> : <span className="text-xl">+</span>}
                </button>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{loc.name}</h3>
                <p className="text-gray-600">{loc.region?.name || 'N/A'} • {loc.capacity} guests</p>
                <p className="text-lg font-semibold text-pink-600 mt-1">
                    {loc.has_variable_pricing ? "Quote on Request" : `R ${parseFloat(loc.price).toLocaleString()}`}
                </p>
                <button onClick={() => onDetails(loc)}
                        className="mt-4 w-full text-center text-gray-800 font-bold py-2 rounded-md border border-gray-300 hover:bg-gray-100">
                    Details
                </button>
            </div>
        </div>
    );
};

const BudgetPlanner = ({totalCost}) => (
    <div className="bg-white p-4 rounded-lg shadow-inner">
        <h3 className="font-bold text-lg text-gray-800">Budget Planner</h3>
        <p className="text-sm text-gray-500">Estimated total for selected items.</p>
        <div className="mt-4 text-3xl font-extrabold text-pink-600">
            R {totalCost.toLocaleString()}
        </div>
    </div>
);

const RequestForm = ({onSubmit}) => {
    const [date, setDate] = useState('');
    const [attendees, setAttendees] = useState('');
    const [notes, setNotes] = useState('');
    return (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
            <h3 className="font-bold text-lg text-gray-800">Request a Quote</h3>
            <label className="block text-sm">Preferred date
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                       className="mt-1 w-full border rounded-md p-2"/>
            </label>
            <label className="block text-sm">Number of attendees
                <input type="number" value={attendees} onChange={e => setAttendees(e.target.value)}
                       className="mt-1 w-full border rounded-md p-2"/>
            </label>
            <label className="block text-sm">Additional details
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                          className="mt-1 w-full border rounded-md p-2" rows="3"/>
            </label>
            <button type="button" onClick={() => onSubmit({date, attendees, notes})}
                    className="w-full py-2 px-4 bg-pink-600 text-white rounded-md font-bold hover:bg-pink-700">Send
            </button>
        </div>
    );
};

// --- Main Selection Page ---
export default function SelectLocation() {
    const navigate = useNavigate();
    const {selectedLocations, setSelectedLocations} = useEventCreation();
    const [allLocations, setAllLocations] = useState([]);
    const [mapLocations, setMapLocations] = useState([]);
    const [viewingLocation, setViewingLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([-26.2041, 28.0473]); // Default to Johannesburg
    const [markerPosition, setMarkerPosition] = useState(mapCenter);
    const [searchValue, setSearchValue] = useState('');

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

    const handleMapChange = useCallback(async (latlng) => {
        const newCenter = [latlng.lat, latlng.lng];
        setMapCenter(newCenter);
        setMarkerPosition(newCenter);
        try {
            const data = await api.reverseGeocode(latlng.lat, latlng.lng);
            setSearchValue(data.address || `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`);
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            setSearchValue(`Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`);
        }
    }, []);

    const handleSelectSuggestion = (location) => {
        const newCenter = [location.latitude, location.longitude];
        setSearchValue(location.name); // Update search bar with selected name
        setMapCenter(newCenter);
        setMarkerPosition(newCenter);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <AnimatePresence>
                {viewingLocation &&
                    <LocationDetailModal location={viewingLocation} onClose={() => setViewingLocation(null)}/>}
            </AnimatePresence>

            <header className="bg-white/95 backdrop-blur-lg sticky top-0 z-30 shadow-sm border-b border-slate-200/80">
                <div className="p-4 max-w-screen-2xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <AtticaMark tone="dark" />
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <button className="px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-100 font-semibold">Questions?</button>
                            <button className="px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-100 font-semibold">Save & exit</button>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Select a Venue for Your Event</h1>
                        <p className="text-sm text-slate-500">Home → Events → Venue</p>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200/80 flex flex-wrap gap-4 items-center bg-slate-50/60">
                    <div className="relative flex-grow">
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"/>
                        <SearchBar
                        value={searchValue}
                        setValue={setSearchValue}
                        onSelectSuggestion={handleSelectSuggestion}
                        />
                    </div>
                    <button
                         className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm hover:shadow">Region <FaChevronDown
                        size={12}/></button>
                    <button
                        className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm hover:shadow">Capacity <FaChevronDown
                        size={12}/></button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm hover:shadow">Price
                        Range <FaChevronDown size={12}/></button>
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 order-2 lg:order-1">
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

                <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
                    <div className="bg-white rounded-2xl h-80 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] overflow-hidden border border-slate-100">
                        <InteractiveMap
                                center={mapCenter}
                                zoom={12}
                                onMapChange={handleMapChange}
                                markerPosition={markerPosition}
                                onMarkerDragEnd={handleMapChange}
                                locations={allLocations}
                                onMarkerClick={(loc) => setViewingLocation(loc)}
                            />
                    </div>
                    <RequestForm onSubmit={(data) => console.log('request', data)}/>
                    <BudgetPlanner totalCost={totalCost}/>
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-inner">
                        <h4 className="font-bold text-teal-800 flex items-center gap-2"><FaInfoCircle/> Recommended
                            Combo</h4>
                        <p className="text-sm text-teal-700 mt-1">Book <span
                            className='font-bold'>Sandton CC</span> with <span
                            className='font-bold'>Staging Pro</span> and get 10% off lighting!</p>
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
