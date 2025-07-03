import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// A placeholder for SVG icons.
const Icon = ({ className = "h-8 w-8" }) => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" className={className} style={{ display: 'block', fill: 'none', stroke: 'currentcolor', strokeWidth: 2, overflow: 'visible' }}>
    <path d="m2 16h28m-14-14v28"></path>
    <title>Icon</title>
  </svg>
);

const placeOptions = [
    {
        title: "Location: Venue",
        description: "Book a venue via a location stakeholder & trustee",
        icon: <Icon />
    },
    {
        title: "Talent: Artist/Management",
        description: "Talent can be booked for your event easily.",
        icon: <Icon />
    },
    {
        title: "Vendor: Service Provider",
        description: "Select relevant service providers to ensure your event is a success",
        icon: <Icon />
    }
];

export default function ListingStep3() {
    const [selected, setSelected] = useState("An entire place");
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
            <main className="flex-grow flex items-center justify-center pt-24 pb-28">
                <div className="w-full max-w-xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">What type of engagement would you like to procure?</h1>
                    <div className="space-y-4">
                        {placeOptions.map((option) => (
                            <button
                                key={option.title}
                                onClick={() => setSelected(option.title)}
                                className={`w-full p-6 border rounded-lg flex items-center justify-between text-left transition-colors duration-200 ${selected === option.title ? 'border-black bg-gray-50 border-2' : 'border-gray-300 hover:border-black'}`}
                            >
                                <div>
                                    <h2 className="font-semibold text-lg text-gray-800">{option.title}</h2>
                                    <p className="text-gray-600">{option.description}</p>
                                </div>
                                {option.icon}
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer with Progress Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white z-20">
                <div className="w-full bg-gray-200 h-1.5"><div className="bg-black h-1.5" style={{ width: '30%' }}></div></div>
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => navigate('/listing/step2')}
                            className="font-semibold text-gray-800 underline hover:text-black">Back
                    </button>
                    <button onClick={() => navigate('/listing/step4')}
                            className="px-8 py-3 text-white bg-gray-800 rounded-lg font-semibold hover:bg-black">Next
                    </button>
                </div>
            </footer>
        </div>
    );
}