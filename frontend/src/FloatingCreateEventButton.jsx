import React from 'react';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

/**
 * Floating action button for starting a new event listing.
 */
export default function FloatingCreateEventButton({ label = 'Create event' }) {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/createEvent')}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-pink-500 text-white shadow-xl flex items-center justify-center text-2xl hover:bg-pink-600 transition"
            aria-label={label}
        >
            <FaPlus />
        </button>
    );
}