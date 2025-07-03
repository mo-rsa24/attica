import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// REUSABLE COUNTER COMPONENT (from original file)
const Counter = ({ value, onIncrease, onDecrease, min = 0 }) => (
    <div className="flex items-center space-x-4">
        <button
            onClick={onDecrease}
            disabled={value <= min}
            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-lg text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            -
        </button>
        <span className="text-lg font-semibold w-10 text-center">{value}</span>
        <button
            onClick={onIncrease}
            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full text-lg text-gray-600"
        >
            +
        </button>
    </div>
);

// NEW REUSABLE TOGGLE SWITCH COMPONENT
const ToggleSwitch = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out ${enabled ? 'bg-black' : 'bg-gray-300'}`}
        role="switch"
        aria-checked={enabled}
    >
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);


export default function ListingStep5_Event() {
    // State for event-specific details
    const [totalTickets, setTotalTickets] = useState(100);
    const [vipTickets, setVipTickets] = useState(10);
    const [isAgeRestricted, setIsAgeRestricted] = useState(false);
    const [isSeated, setIsSeated] = useState(true);

    const navigate = useNavigate();

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white z-20">
                <div className="flex items-center justify-between p-6">
                    <a href="/"><svg viewBox="0 0 1000 1000" role="presentation" aria-hidden="true" focusable="false" className="h-8 w-8 text-pink-600" style={{ display: 'block', fill: 'currentColor' }}><path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70 11-93 18-21 41-32 72-32 31 0 54 11 72 32 17 23 21 54 11 93-11 49-41 105-91 168.1zm362.2 43.2c-11-12.9-25-23.9-40-31.9-50-23.9-92-42.9-123-58.9-32-16-56-28.9-73-38.9-17-9-29-15-37-19-21-10.9-35-18.9-44-24.9-7-5-13-9-20-13-102.1-59-183.1-131-242.1-215-30-42-52-84-65-127.1-14-44-19-87-19-129.1 0-78.1 21-148.1 63-210.1 42-62 101-111 176-147 24-12 50-21 77-28 10-2 19-5 28-7 8-2 17-4 25-6 2-1 3-1 4-2 11-4 22-7 33-9 12-2 24-4 36-4s24 2 36 4c11 2 22 5 33 9 1 1 2 1 4 2 8 2 17 4 25 6 10 2 19 5 28 7 27 7 53 16 77 28 75 36 134 85 176 147 42 62 63 132 63 210.1 0 42-5 85-19 129.1-13 43-35 85-65 127.1-59 84-140 156-242.1 215-7 4-13 8-20 13-9 6-23 14-44 25-8 4-20 10-37 19-17 10-41 23-73 39-31 16-73 35-123 59-15 8-29 19-40 32z"></path></svg></a>
                    <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200">Questions?</button>
                        <button className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-full hover:bg-gray-200">Save & exit</button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-28">
                <div className="w-full max-w-lg mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Share some basics about your event</h1>
                    <p className="text-gray-600 mb-8">You can add more details later, like tiered pricing.</p>

                    <div className="space-y-6">
                        {/* Total Tickets Counter */}
                        <div className="flex items-center justify-between border-b pb-6">
                            <span className="text-lg text-gray-800">Number of tickets</span>
                            <Counter value={totalTickets} onIncrease={() => setTotalTickets(v => v + 10)} onDecrease={() => setTotalTickets(v => v - 10)} min={0} />
                        </div>

                        {/* VIP Tickets Counter */}
                        <div className="flex items-center justify-between border-b pb-6">
                             <span className="text-lg text-gray-800">Number of VIP tickets</span>
                             <Counter value={vipTickets} onIncrease={() => setVipTickets(v => v + 1)} onDecrease={() => setVipTickets(v => v - 1)} min={0} />
                        </div>

                        {/* Age Restriction Toggle */}
                        <div className="flex items-center justify-between border-b pb-6">
                             <span className="text-lg text-gray-800">Age restricted (18+)</span>
                             <ToggleSwitch enabled={isAgeRestricted} setEnabled={setIsAgeRestricted} />
                        </div>

                        {/* Seating Type Toggle */}
                        <div className="flex items-center justify-between border-b pb-6">
                             <span className="text-lg text-gray-800">Assigned seating</span>
                             <ToggleSwitch enabled={isSeated} setEnabled={setIsSeated} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white z-20">
                <div className="w-full bg-gray-200 h-1.5"><div className="bg-black h-1.5" style={{ width: '50%' }}></div></div>
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate('/listing/step4')} className="font-semibold text-gray-800 underline hover:text-black">Back</button>
                    <button onClick={() => navigate('/listing/step6')} className="px-8 py-3 text-white bg-gray-800 rounded-lg font-semibold hover:bg-black">Next</button>
                </div>
            </footer>
        </div>
    );
}