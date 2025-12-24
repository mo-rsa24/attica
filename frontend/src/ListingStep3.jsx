import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaMapMarkerAlt, FaUsers, FaTools, FaCheckCircle } from 'react-icons/fa';
import {useEventCreation} from "./context/reactContext.jsx";

// --- Reusable Summary Components ---

const SummaryRow = ({ title, items, imageKey, priceKey }) => {
    const totalCost = items.reduce((sum, item) => sum + parseFloat(item[priceKey] || 0), 0);
    const firstImage = items[0]?.[imageKey] || 'https://placehold.co/100x100/e2e8f0/4a5568?text=?';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src={firstImage} alt={title} className="w-12 h-12 object-cover rounded-full bg-gray-200" />
                <div>
                    <p className="font-bold text-gray-800">{title}</p>
                    <p className="text-sm text-gray-500">{items.length} Selected</p>
                </div>
            </div>
            <p className="font-semibold text-gray-700">R {totalCost.toLocaleString()}</p>
        </div>
    );
};

const SummaryCard = () => {
    const { selectedLocations, selectedArtists, selectedVendors } = useEventCreation();

    const locationCost = selectedLocations.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    const artistCost = selectedArtists.reduce((sum, item) => sum + parseFloat(item.booking_fee || 0), 0);
    const vendorCost = selectedVendors.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
    const grandTotal = locationCost + artistCost + vendorCost;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Event Summary</h3>
            <div className="space-y-5">
                <SummaryRow title="Venues" items={selectedLocations} imageKey="image_url" priceKey="price" />
                <SummaryRow title="Artists" items={selectedArtists} imageKey="profile_image" priceKey="booking_fee" />
                <SummaryRow title="Vendors" items={selectedVendors} imageKey="image" priceKey="price" />
            </div>
            <div className="border-t border-gray-200 mt-6 pt-5">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-600">Grand Total (Est.)</p>
                    <p className="text-3xl font-extrabold text-pink-600">R {grandTotal.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};


// --- Main Component for the Step 3 Hub (Updated) ---
export default function ListingStep3() {
    const navigate = useNavigate();
    const { selectedLocations, selectedArtists, selectedVendors } = useEventCreation();

    const locationSelected = selectedLocations.length > 0;
    const artistsSelected = selectedArtists.length > 0;
    const vendorsSelected = selectedVendors.length > 0;

    const sections = [
        { name: 'Location: Venue', icon: <FaMapMarkerAlt />, isComplete: locationSelected, path: '/listing/step3/location' },
        { name: 'Talent: Artist/Management', icon: <FaUsers />, isComplete: artistsSelected, path: '/listing/step3/artists' },
        { name: 'Vendor: Service Providers', icon: <FaTools />, isComplete: vendorsSelected, path: '/listing/step3/vendors' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20">
                 <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        <a href="/"><div className="text-2xl font-bold text-pink-600">A</div></a>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">Questions?</button>
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">Save & exit</button>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 h-1">
                        <motion.div className="bg-pink-600 h-1" initial={{ width: '20%' }} animate={{ width: '40%' }} transition={{ duration: 1, ease: 'easeInOut' }} />
                    </div>
                </div>
            </header>

            {/* CORRECTED: Reduced vertical padding (pt-24 pb-24) */}
            <main className="pt-24 pb-24">
                <div className="max-w-screen-xl mx-auto px-6">
                     {/* CORRECTED: Reduced bottom margin (mb-12) */}
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-12">
                        <p className="font-semibold text-pink-600">Step 3 of 5</p>
                        {/* CORRECTED: Reduced font size on larger screens (text-4xl) */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mt-2">Curate your event</h1>
                        <p className="mt-4 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                            Select your venue, artists, and service providers to bring your event to life.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Column: Selection Buttons */}
                        <motion.div
                            className="space-y-6 lg:col-span-7"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        >
                            {sections.map((section, index) => (
                                <motion.div
                                    key={index}
                                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                >
                                    {/* CORRECTED: Reduced padding and font sizes */}
                                    <button
                                        onClick={() => navigate(section.path)}
                                        className="w-full p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center">
                                            <div className="text-2xl lg:text-3xl text-pink-500 mr-5">{section.icon}</div>
                                            <span className="text-xl lg:text-2xl font-bold text-gray-800">{section.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            {section.isComplete ? (
                                                <FaCheckCircle className="text-green-500 text-2xl lg:text-3xl" />
                                            ) : (
                                                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xl lg:text-2xl">+</div>
                                            )}
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Right Column: Summary Card */}
                        <div className="lg:sticky lg:top-24 lg:col-span-5">
                            <SummaryCard />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button onClick={() => navigate('/listing/step1')} className="font-bold text-gray-800 underline">Back</button>
                    <motion.button
                        onClick={() => navigate('/listing/step5')}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center space-x-3 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg disabled:bg-gray-400"
                        disabled={!locationSelected || !artistsSelected || !vendorsSelected}
                    >
                        <span>Review and Finalize</span>
                        <FaChevronRight />
                    </motion.button>
                </div>
            </footer>
        </div>
    );
}
