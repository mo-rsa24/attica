import React from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';

// --- Reusable Components ---

// StepCard Component (Card for each step)
const StepCard = ({ number, title, description, delay }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay, ease: "easeOut" }
        }
    };

    return (
        <Motion.div
            variants={cardVariants}
            whileHover={{
                scale: 1.03,
                y: -5,
                boxShadow: '0px 20px 30px -10px rgba(0,0,0,0.15)',
                borderColor: '#FF5A5F' // Coral-pink border on hover
            }}
            className="flex items-start space-x-6 p-6 bg-white rounded-2xl border-2 border-transparent transition-all duration-300 shadow-md"
        >
            <div className="flex-shrink-0">
                {/* Popping coral-pink number */}
                <span className="text-5xl font-extrabold" style={{ color: '#FF5A5F' }}>{number}</span>
            </div>
            <div>
                <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-lg text-gray-500 leading-relaxed">{description}</p>
            </div>
        </Motion.div>
    );
};

// Main EventsPage Component
export default function EventsPage() {
    const steps = [
        {
            number: 1,
            title: 'Tell us about your event',
            description: 'Share some basic info, like where it is and how many people will be attending your event.',
        },
        {
            number: 2,
            title: 'Make it stand out',
            description: 'Add 5 or more photos plus a title and description—we’ll help you out.',
        },
        {
            number: 3,
            title: 'Finish up and publish',
            description: 'Choose a starting price, verify a few details, then publish your listing.',
        },
    ];

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white z-20">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                     <svg
                        viewBox="0 0 1000 1000"
                        role="presentation"
                        aria-hidden="true"
                        focusable="false"
                        className="h-8 w-8 text-pink-600"
                        style={{ display: 'block', fill: 'currentColor' }}
                      >
                        <path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-21 41-32 72-32 31 0 54 11 72 32 17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43.2c-11-12.9-25-23.9-40-31.9-50-23.9-92-42.9-123-58.9-32-16-56-28.9-73-38.9-17-9-29-15-37-19-21-10.9-35-18.9-44-24.9-7-5-13-9-20-13-102.1-59-183.1-131-242.1-215-30-42-52-84-65-127.1-14-44-19-87-19-129.1 0-78.1 21-148.1 63-210.1 42-62 101-111 176-147 24-12 50-21 77-28 10-2 19-5 28-7 8-2 17-4 25-6 2-1 3-1 4-2 11-4 22-7 33-9 12-2 24-4 36-4s24 2 36 4c11 2 22 5 33 9 1 1 2 1 4 2 8 2 17 4 25 6 10 2 19 5 28 7 27 7 53 16 77 28 75 36 134 85 176 147 42 62 63 132 63 210.1 0 42-5 85-19 129.1-13 43-35 85-65 127.1-59 84-140 156-242.1 215-7 4-13 8-20 13-9 6-23 14-44 25-8 4-20 10-37 19-17 10-41 23-73 39-31 16-73 35-123 59-15 8-29 19-40 32z"></path>
                    </svg>
                    <button
                         onClick={() => alert('Are you sure you want to exit setup?')}
                         className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                        Exit
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-20">
                 <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
                    {/* Left Side: Hero Image and Title */}
                    <div className="relative flex items-center justify-center bg-gray-800 text-white p-8 lg:p-12">
                         <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0 z-0"
                         >
                            <img
                                src="https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                alt="Vibrant event setup"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </Motion.div>
                        <Motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="relative z-10 text-6xl md:text-7xl font-bold leading-tight"
                            style={{ textShadow: '2px 3px 10px rgba(0,0,0,0.5)' }}
                        >
                           It's easy to get<br />started on Attica
                        </Motion.h1>
                    </div>

                    {/* Right Side: Steps */}
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex flex-col justify-center p-8 lg:p-24"
                    >
                        <div className="space-y-16">
                            {steps.map((step, index) => (
                                <StepCard key={step.number} {...step} delay={0.5 + index * 0.3} />
                            ))}
                        </div>
                    </Motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white z-20">
                <div className="w-full bg-gray-200 h-1.5">
                    <Motion.div
                        className="bg-pink-600 h-1.5"
                        initial={{ width: '0%' }}
                        animate={{ width: '0%' }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                    </Motion.div>
                </div>
                <div className="flex justify-end p-6 border-t border-gray-200">
                    <Link to="/createEvent">
                        <Motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 text-white bg-pink-600 rounded-lg font-semibold hover:bg-pink-700"
                        >
                            Get started
                        </Motion.button>
                    </Link>
                </div>
            </footer>
        </div>
    );
}