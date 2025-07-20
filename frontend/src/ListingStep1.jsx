import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';

// Array of images for the rotating hero banner
const heroImages = [
    'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Music Festival
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Wedding
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'  // Corporate
];

// Reusable RotatingHero Component
const RotatingHero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000); // Change image every 5 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-2xl shadow-xl overflow-hidden">
            <AnimatePresence>
                <motion.img
                    key={currentImageIndex}
                    src={heroImages[currentImageIndex]}
                    alt="Event Inspiration"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
    );
};


export default function ListingStep1() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans">
            {/* Top Bar with Progress and Actions */}
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20">
                <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/">
                            <div className="h-8 w-8 text-pink-600 flex items-center justify-center font-bold text-2xl" style={{ color: '#FF5A5F' }}>A</div>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">
                                Questions?
                            </button>
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">
                                Save & exit
                            </button>
                        </div>
                    </div>
                    {/* Slim Progress Bar */}
                    <div className="w-full bg-gray-200 h-1">
                        <motion.div
                            className="bg-pink-600 h-1"
                            style={{ background: '#FF5A5F' }}
                            initial={{ width: 0 }}
                            animate={{ width: '10%' }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-20 flex items-center justify-center min-h-screen">
                <div className="max-w-screen-xl mx-auto py-10 px-6 w-full">
                    <div className="flex flex-col lg:flex-row items-center gap-16">

                        {/* Left Column: Text Content (40%) */}
                        <motion.div
                            className="w-full lg:w-2/5 space-y-6"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                        >
                            <p className="font-semibold text-pink-600" style={{ color: '#FF5A5F' }}>Step 1</p>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Tell us about your event
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                In this step, we'll ask you which type of event you would like to have and help facilitate the entire management of the event. Then let us know the location, service providers and artist that you would like to book.
                            </p>
                        </motion.div>

                        {/* Right Column: Rotating Hero (60%) */}
                        <motion.div
                            className="w-full lg:w-3/5"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                        >
                           <RotatingHero />
                        </motion.div>
                    </div>

                    {/* Ubuntu Quote Banner */}
                    <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ duration: 0.7, delay: 0.6 }}
                         className="text-center mt-24"
                    >
                         <div className="inline-block p-4 bg-rose-50 border-l-4 border-pink-500 rounded-r-lg">
                            <p className="text-lg italic text-gray-700">"Ubuntu: I am because we celebrate together."</p>
                         </div>
                    </motion.div>
                </div>
            </main>

            {/* Floating Navigation Buttons */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                 <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button
                        onClick={() => navigate('/events')}
                        className="font-bold text-gray-800 underline hover:text-black transition"
                    >
                        Back
                    </button>
                    <motion.button
                        onClick={() => navigate('/listing/step2')}
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