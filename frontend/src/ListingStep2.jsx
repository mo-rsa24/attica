import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronRight, FaQuestionCircle } from 'react-icons/fa';
import { FiSave } from 'react-icons/fi';

// Reusable EventTypeCard Component
const EventTypeCard = ({ type, icon, selected, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -5, boxShadow: '0px 15px 25px -10px rgba(0,0,0,0.1)' }}
        onClick={onClick}
        className={`p-6 rounded-2xl text-left transition-all duration-300 w-full h-full flex flex-col justify-between
            ${selected
                ? 'bg-pink-600 text-white shadow-lg ring-2 ring-offset-2 ring-pink-600'
                : 'bg-white text-gray-800 shadow-md hover:shadow-lg border border-gray-200'
            }`}
    >
        <span className="text-4xl" role="img" aria-label={type}>{icon}</span>
        <p className="text-xl font-bold mt-4">{type}</p>
    </motion.button>
);


export default function ListingStep2() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const [selectedEventType, setSelectedEventType] = useState(null);

    // Adapted from the original file's placeTypes with added icons
    const eventTypes = [
        { name: 'Concert', icon: '🎤' },
        { name: 'Festival', icon: '🎪' },
        { name: 'Wedding', icon: '💍' },
        { name: 'Birthday Party', icon: '🎂' },
        { name: 'Conference', icon: '💼' },
        { name: 'Club Night', icon: '🪩' },
        { name: 'Gala / Formal', icon: '🥂' },
        { name: 'Food & Wine', icon: '🍷' },
        { name: 'Workshop', icon: '🛠️' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header and Progress Bar */}
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20">
                 <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                         <a href="/">
                            <div className="h-8 w-8 text-pink-600 flex items-center justify-center font-bold text-2xl" style={{ color: '#FF5A5F' }}>A</div>
                        </a>
                        <div className="flex items-center space-x-2">
                             <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">
                                Questions?
                            </button>
                             <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">
                                Save & exit
                            </button>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 h-1">
                        <motion.div
                            className="bg-pink-600 h-1"
                            style={{ background: '#FF5A5F' }}
                            initial={{ width: '10%' }}
                            animate={{ width: '20%' }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-32 flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                            Which of these best describes your event?
                        </h1>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                    >
                        {eventTypes.map(type => (
                             <motion.div key={type.name} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <EventTypeCard
                                    type={type.name}
                                    icon={type.icon}
                                    selected={selectedEventType === type.name}
                                    onClick={() => setSelectedEventType(type.name)}
                                />
                             </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>

             {/* Navigation Footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                 <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button onClick={() => navigate(`${listingBase}/step1`)} className="font-bold text-gray-800 underline hover:text-black transition">
                        Back
                    </button>
                    <motion.button
                        onClick={() => navigate(`${listingBase}/step3`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-3 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg hover:shadow-xl"
                    >
                        <span>Next</span>
                        <FaChevronRight />
                    </motion.button>
                </div>
            </footer>
        </div>
    );
}