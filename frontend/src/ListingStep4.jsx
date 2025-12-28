import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import InteractiveMap from './components/InteractiveMap';
import {useEventCreation} from "./context/reactContext.jsx"; // Assuming InteractiveMap is in components folder


// --- Geocoding API Helper ---
const geoApi = {
    search: async (query) => {
        if (!query) return [];
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=za`);
        if (!response.ok) return [];
        return await response.json();
    },
    reverse: async (lat, lon) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        if (!response.ok) return null;
        return await response.json();
    }
};

export default function ListingStep4() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { eventDetails, setEventDetails, saveAndExit, setCurrentStep, event } = useEventCreation();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null); // Will hold { lat, lon, address }
    const [mapCenter, setMapCenter] = useState([-28.4793, 24.6727]); // Default center of South Africa
    const [mapZoom, setMapZoom] = useState(5);

     useEffect(() => {
        setCurrentStep('step4');
    }, [setCurrentStep]);
    // Debounce search input to avoid excessive API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.length > 2) {
                geoApi.search(searchQuery).then(setSuggestions);
            } else {
                setSuggestions([]);
            }
        }, 500); // 500ms delay
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleSelectSuggestion = (suggestion) => {
        const location = {
            lat: parseFloat(suggestion.lat),
            lon: parseFloat(suggestion.lon),
            address: suggestion.display_name,
        };
        setSelectedLocation(location);
        setSearchQuery(suggestion.display_name);
        setMapCenter([location.lat, location.lon]);
        setMapZoom(15);
        setSuggestions([]);
    };

    const handleMapInteraction = useCallback(async (latlng) => {
        const { lat, lng } = latlng;
        const data = await geoApi.reverse(lat, lng);
        if (data) {
            const location = { lat, lon: lng, address: data.display_name };
            setSelectedLocation(location);
            setSearchQuery(data.display_name);
            setMapCenter([lat, lng]);
        }
    }, []);

    const handleNext = () => {
        // Save location to context before proceeding
        setEventDetails(prev => ({ ...prev, location: selectedLocation }));
        navigate(`${listingBase}/step5`);
    };

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col">
            <header className="fixed top-0 left-0 right-0 bg-white z-20">
                 <div className="flex items-center justify-between p-6">
                    <a href="/"><svg viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" className="h-8 w-8 text-pink-600" style={{ display: 'block', fill: 'currentColor' }}><path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-21 41-32 72-32 31 0 54 11 72 32 17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43.2c-11-12.9-25-23.9-40-31.9-50-23.9-92-42.9-123-58.9-32-16-56-28.9-73-38.9-17-9-29-15-37-19-21-10.9-35-18.9-44-24.9-7-5-13-9-20-13-102.1-59-183.1-131-242.1-215-30-42-52-84-65-127.1-14-44-19-87-19-129.1 0-78.1 21-148.1 63-210.1 42-62 101-111 176-147 24-12 50-21 77-28 10-2 19-5 28-7 8-2 17-4 25-6 2-1 3-1 4-2 11-4 22-7 33-9 12-2 24-4 36-4s24 2 36 4c11 2 22 5 33 9 1 1 2 1 4 2 8 2 17 4 25 6 10 2 19 5 28 7 27 7 53 16 77 28 75 36 134 85 176 147 42 62 63 132 63 210.1 0 42-5 85-19 129.1-13 43-35 85-65 127.1-59 84-140 156-242.1 215-7 4-13 8-20 13-9 6-23 14-44 25-8 4-20 10-37 19-17 10-41 23-73 39-31 16-73 35-123 59-15 8-29 19-40 32z"></path></svg></a>
                    <div className="flex items-center space-x-4"><button className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200" onClick={() => saveAndExit(event?.id)}>Save & exit</button></div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-28">
                <div className="w-full max-w-3xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Where's your event located?</h1>
                    <p className="text-gray-600 mb-8">Search for an address or click on the map to set your event's location.</p>

                    <div className="relative w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Start typing an address..."
                            className="w-full p-4 border-2 border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10 shadow-lg">
                                {suggestions.map(s => (
                                    <li
                                        key={s.place_id}
                                        onClick={() => handleSelectSuggestion(s)}
                                        className="p-4 hover:bg-gray-100 cursor-pointer text-left"
                                    >
                                        {s.display_name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="w-full h-96 mt-6 rounded-2xl overflow-hidden shadow-lg">
                        <InteractiveMap
                            center={mapCenter}
                            zoom={mapZoom}
                            onMapClick={(e) => handleMapInteraction(e.latlng)}
                            markerPosition={selectedLocation ? [selectedLocation.lat, selectedLocation.lon] : null}
                            onMarkerDragEnd={handleMapInteraction}
                        />
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 bg-white z-20">
                <div className="w-full bg-gray-200 h-1.5"><div className="bg-black h-1.5" style={{ width: '60%' }}></div></div>
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate(`${listingBase}/step3`)} className="font-semibold text-gray-800 underline hover:text-black">Back</button>
                    <button
                        onClick={handleNext}
                        disabled={!selectedLocation}
                        className="px-8 py-3 text-white bg-gray-800 rounded-lg font-semibold hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </footer>
        </div>
    );
}
