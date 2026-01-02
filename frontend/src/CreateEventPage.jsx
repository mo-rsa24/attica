import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {motion as Motion} from 'framer-motion';
import AtticaMark from "./components/AtticaMark.jsx";
import useAxios from "./utils/useAxios.js";
import { useAuth } from './AuthContext.js';

// --- Reusable Components ---

// StepCard Component (Card for each step)
const StepCard = ({number, title, description, delay}) => {
    const cardVariants = {
        hidden: {opacity: 0, y: 30},
        visible: {
            opacity: 1,
            y: 0,
            transition: {duration: 0.5, delay, ease: "easeOut"}
        }
    };

    return (
        <Motion.div
            variants={cardVariants}
            whileHover={{
                scale: 1.02,
                y: -4,
                boxShadow: '0px 20px 40px -12px rgba(15,23,42,0.2)',
                borderColor: '#EC4899'
            }}
            className="flex items-start space-x-6 p-6 bg-white rounded-2xl border-2 border-transparent transition-all duration-300 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.4)]"
        >
            <div className="flex-shrink-0">
                <span className="text-5xl font-black bg-gradient-to-br from-pink-500 to-fuchsia-600 bg-clip-text text-transparent drop-shadow-[0_8px_20px_rgba(236,72,153,0.35)]">{number}</span>
            </div>
            <div>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h3>
                <p className="mt-2 text-lg text-slate-500 leading-relaxed">{description}</p>
            </div>
        </Motion.div>
    );
};

// Main EventsPage Component
export default function CreateEventPage() {
    const navigate = useNavigate();
    const api = useAxios();
    const { tokens } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);

    const handleStart = async () => {
        if (isCreating) return;
        if (!tokens) {
            navigate('/login');
            return;
        }
        setIsCreating(true);
        setError(null);
        try {
            const response = await api.post('/api/events/event-drafts/', {
                data: { steps: {} },
                current_step: 'step1',
            });
            const newEventId = response.data?.id;
            if (newEventId) {
                navigate(`/listing/${newEventId}/step1`, { replace: true });
            } else {
                setError('Could not start the event wizard. Please try again.');
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 401) {
                navigate('/login');
                return;
            }
            setError('Unable to create a draft event right now. Please try again.');
            console.error('Error creating draft event:', err);
        } finally {
            setIsCreating(false);
        }
    };

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
        <div className="bg-slate-50 min-h-screen font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-30 border-b border-slate-200/80">
                <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-screen-2xl mx-auto">
                    <AtticaMark tone="dark" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => alert('Are you sure you want to exit setup?')}
                            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 border border-slate-200"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="pt-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-80px)]">
                    {/* Left Side: Hero Image and Title */}
                    <div className="relative flex items-center justify-center bg-gray-900 text-white p-8 lg:p-12 overflow-hidden">
                        <Motion.div
                            initial={{opacity: 0}}
                            animate={{opacity: 0.5}}
                            transition={{duration: 1.5}}
                            className="absolute inset-0 z-0"
                        >
                            <img
                                src="https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                                alt="Vibrant event setup"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent"></div>
                        </Motion.div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_30%)]"></div>
                        <Motion.h1
                            initial={{opacity: 0, scale: 0.9}}
                            animate={{opacity: 1, scale: 1}}
                            transition={{duration: 0.8, delay: 0.2, ease: "easeOut"}}
                            className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.45)]"
                        >
                            It's easy to get<br/>started on Attica
                        </Motion.h1>
                        <Motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="relative z-10 mt-8 flex items-center gap-4 bg-white/10 border border-white/15 backdrop-blur-lg rounded-full px-6 py-3 text-sm text-white shadow-xl"
                        >
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-lg font-semibold">✨</span>
                            </div>
                            <p className="leading-snug"><span className="font-semibold">Create</span> a premium event listing with guided steps and live previews.</p>
                        </Motion.div>
                    </div>

                    {/* Right Side: Steps */}
                    <Motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.8, delay: 0.4}}
                        className="flex flex-col justify-center p-8 lg:p-20"
                    >
                        <div className="space-y-10">
                            {steps.map((step, index) => (
                                <StepCard key={step.number} {...step} delay={0.5 + index * 0.3}/>
                            ))}
                        </div>
                        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.3)] p-6 lg:p-8 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/30">
                                <span className="text-xl">🎉</span>
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold text-lg">Get started with confidence</p>
                                <p className="text-slate-600">We autosave your progress and keep your brand styling consistent through every step.</p>
                            </div>
                        </div>
                    </Motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-20 border-t border-slate-200/80">
                <div className="w-full h-1 bg-slate-100">
                    <Motion.div
                        className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 h-1"
                        initial={{width: '0%'}}
                        animate={{ width: '12%' }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                    >
                    </Motion.div>
                </div>
                <div className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-screen-2xl mx-auto">
                    <div className="text-sm text-slate-500">You can exit anytime — your progress is saved.</div>
                    <Motion.button
                        whileHover={{ scale: 1.04, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 text-white bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl disabled:opacity-70"
                        onClick={handleStart}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Preparing...' : 'Get started'}
                    </Motion.button>
                </div>
                {error && (
                    <div className="text-sm text-red-600 font-semibold mt-2">
                        {error}
                    </div>
                )}
            </footer>
        </div>
    );
}