import React, { useEffect } from 'react';
import { useNavigate, useParams} from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaMapMarkerAlt, FaUsers, FaTools, FaCheckCircle } from 'react-icons/fa';
import {useEventCreation} from "./context/reactContext.jsx";
import AtticaMark from "./components/AtticaMark.jsx";

// --- Reusable Summary Components ---

const SummaryRow = ({ title, items, imageKey, priceKey }) => {
    const totalCost = items.reduce((sum, item) => sum + parseFloat(item[priceKey] || 0), 0);
    const firstImage = items[0]?.[imageKey] || 'https://placehold.co/100x100/e2e8f0/4a5568?text=?';

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src={firstImage} alt={title} className="w-12 h-12 object-cover rounded-full bg-gray-200 shadow-inner" />
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-600/10 -z-10" />
                </div>
                <div>
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500">{items.length} Selected</p>
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
        <div className="bg-white p-6 lg:p-7 rounded-3xl shadow-[0_25px_80px_-30px_rgba(15,23,42,0.45)] w-full border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-pink-500 font-semibold">Overview</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">Event Summary</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <FaCheckCircle />
                </div>
            </div>
            <div className="space-y-5">
                <SummaryRow title="Venues" items={selectedLocations} imageKey="image_url" priceKey="price" />
                <SummaryRow title="Artists" items={selectedArtists} imageKey="profile_image" priceKey="booking_fee" />
                <SummaryRow title="Vendors" items={selectedVendors} imageKey="image" priceKey="price" />
            </div>
            <div className="border-t border-gray-200 mt-6 pt-5">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm uppercase tracking-[0.18em] text-slate-500 font-semibold">Grand Total (Est.)</p>
                        <p className="text-lg font-semibold text-slate-700">Based on your current selections</p>
                    </div>
                    <p className="text-3xl font-black text-pink-600">R {grandTotal.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};


// --- Main Component for the Step 3 Hub (Updated) ---
export default function ListingStep3() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const {
        event,
        selectedLocations,
        selectedArtists,
        selectedVendors,
        saveAndExit,
        saveStep,
        getNextStep,
        setCurrentStep,
    } = useEventCreation();

    useEffect(() => {
        setCurrentStep('step3');
    }, [setCurrentStep]);

    const locationSelected = selectedLocations.length > 0;
    const artistsSelected = selectedArtists.length > 0;
    const vendorsSelected = selectedVendors.length > 0;

    const handleNext = async () => {
        const nextStep = getNextStep('step3');
        const payload = {
            location: selectedLocations[0]?.id || selectedLocations[0]?.location_id || selectedLocations[0]?.location,
        };
        await saveStep(eventId || event?.id, 'step3', payload, nextStep);
        navigate(nextStep === 'review' ? `${basePath}/review` : `${basePath}/${nextStep}`);
    };

    const basePath = eventId ? `/listing/${eventId}` : '/createEvent';

    const sections = [
        { name: 'Location: Venue', icon: <FaMapMarkerAlt />, isComplete: locationSelected, path: `${basePath}/step3/location` },
        { name: 'Talent: Artist/Management', icon: <FaUsers />, isComplete: artistsSelected, path: `${basePath}/step3/artists` },
        { name: 'Vendor: Service Providers', icon: <FaTools />, isComplete: vendorsSelected, path: `${basePath}/step3/vendors` },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-30 border-b border-slate-200/70 shadow-sm">
                 <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
                    <div className="flex items-center justify-between h-20">
                       <a href="/"><AtticaMark tone="dark" /></a>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200">Questions?</button>
                             <button
                                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200"
                                onClick={() => saveAndExit(eventId || event?.id)}
                            >
                                Save & exit
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div className="h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600" initial={{ width: '22%' }} animate={{ width: '45%' }} transition={{ duration: 1, ease: 'easeInOut' }} />
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24">
                <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
                     {/* CORRECTED: Reduced bottom margin (mb-12) */}
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-12">
                        <p className="font-semibold text-pink-600">Step 3 of 5</p>
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 mt-2 tracking-tight">Curate your event</h1>
                        <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
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
                                        className="w-full p-6 bg-white rounded-2xl shadow-[0_20px_60px_-28px_rgba(15,23,42,0.35)] hover:shadow-[0_25px_80px_-32px_rgba(236,72,153,0.35)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-between text-left border border-slate-100"
                                    >
                                        <div className="flex items-center">
                                            <div className="text-2xl lg:text-3xl text-pink-500 mr-5">{section.icon}</div>
                                            <span className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">{section.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            {section.isComplete ? (
                                                <FaCheckCircle className="text-emerald-500 text-2xl lg:text-3xl" />
                                            ) : (
                                                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xl lg:text-2xl border border-slate-200">+</div>
                                            )}
                                        </div>
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Right Column: Summary Card */}
                        <div className="lg:sticky lg:top-24 lg:col-span-5">
                            <div className="relative">
                                <div className="absolute -inset-x-4 -inset-y-4 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/5 to-purple-600/10 blur-2xl rounded-3xl"></div>
                                <SummaryCard />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_-20px_rgba(15,23,42,0.35)]">
                <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button onClick={() => navigate(eventId ? `/listing/${eventId}/step1` : '/createEvent')} className="font-bold text-slate-800 underline">Back</button>
                    <motion.button
                        onClick={handleNext}
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
                        disabled={!locationSelected || !artistsSelected || !vendorsSelected}
                    >
                        <span>Next</span>
                        <FaChevronRight />
                    </motion.button>
                </div>
            </footer>
        </div>
    );
}
