import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// A placeholder for SVG icons.
const Icon = ({ name, className = "h-8 w-8 mb-2" }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5-10-5-10 5z"></path>
        <title>{name}</title>
    </svg>
);

// Arrays for event-specific features and perks
const commonFeatures = [
    { name: 'Food Trucks', icon: 'Food' },
    { name: 'Bar Available', icon: 'Drinks' },
    { name: 'Merch Stall', icon: 'Merch' },
    { name: 'Wheelchair Accessible', icon: 'Accessibility' },
    { name: 'Outdoor Seating', icon: 'Seating' },
    { name: 'Accepts Cards', icon: 'Card' }
];

const standoutPerks = [
    { name: 'Special Guest Appearance', icon: 'Guest' },
    { name: 'VIP Area', icon: 'VIP' },
    { name: 'Meet & Greet', icon: 'Meet' },
    { name: 'Live Q&A', icon: 'QA' },
    { name: 'Photo Booth', icon: 'Photo' },
    { name: 'Free Giveaways', icon: 'Gift' }
];

export default function ListingStep7_Event() {
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const navigate = useNavigate();

    const toggleFeature = (name) => {
        setSelectedFeatures(prev =>
            prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
        );
    };

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
            <main className="flex-grow flex items-center justify-center pt-24 pb-28">
                <div className="w-full max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Tell attendees what your event has to offer</h1>
                    <p className="text-gray-600 mb-6">You can add more features and perks after you publish your listing.</p>

                    <h2 className="text-xl font-semibold text-gray-800 mb-4">What about these common features?</h2>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {commonFeatures.map((item) => (
                            <button key={item.name} onClick={() => toggleFeature(item.name)}
                                className={`p-4 border rounded-lg flex flex-col items-start text-left transition-colors duration-200 ${selectedFeatures.includes(item.name) ? 'border-black bg-gray-50 border-2' : 'border-gray-300 hover:border-black'}`}>
                                <Icon name={item.icon} />
                                <span className="font-semibold text-gray-800">{item.name}</span>
                            </button>
                        ))}
                    </div>

                     <h2 className="text-xl font-semibold text-gray-800 mb-4">Do you have any standout perks?</h2>
                     <div className="grid grid-cols-3 gap-4">
                        {standoutPerks.map((item) => (
                            <button key={item.name} onClick={() => toggleFeature(item.name)}
                                className={`p-4 border rounded-lg flex flex-col items-start text-left transition-colors duration-200 ${selectedFeatures.includes(item.name) ? 'border-black bg-gray-50 border-2' : 'border-gray-300 hover:border-black'}`}>
                                <Icon name={item.icon} />
                                <span className="font-semibold text-gray-800">{item.name}</span>
                            </button>
                        ))}
                     </div>
                </div>
            </main>

            {/* Footer with Progress Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white z-20">
                <div className="w-full bg-gray-200 h-1.5"><div className="bg-black h-1.5" style={{ width: '70%' }}></div></div>
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate('/listing/step6')}
                            className="font-semibold text-gray-800 underline hover:text-black">Back
                    </button>
                    <button onClick={() => navigate('/listing/step8')}
                            className="px-8 py-3 text-white bg-gray-800 rounded-lg font-semibold hover:bg-black">Next
                    </button>
                </div>
            </footer>
        </div>
    );
}