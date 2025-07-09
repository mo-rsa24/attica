// frontend/src/components/ReservationWidget.jsx

import React, { useState, useEffect } from 'react';
import { differenceInCalendarDays } from 'date-fns';

// ✅ FIX: Replaced react-icons with self-contained SVG components
const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
);
  
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
);


export default function ReservationWidget({ service, userRole, onRequestToBookClick }) {
    // Use string state for native date inputs
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // ✅ FIX: Initialize guests state to 1 to prevent NaN error
    const [guests, setGuests] = useState(1);
    
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [availability, setAvailability] = useState({ unavailable_dates: [], timeslots: [] });
    const [isLoading, setIsLoading] = useState(false);

    // ✅ FIX: Add a guard clause to prevent crash if service is not yet loaded.
    if (!service) {
        return (
            <div className="sticky top-24 w-full md:w-96 lg:w-[400px] p-6 bg-white border rounded-2xl shadow-xl space-y-5 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
            </div>
        );
    }

    // Fetch availability from the new API endpoint
    useEffect(() => {
        if (!service.id) return;
        fetch(`/api/vendors/services/${service.id}/availability/`)
            .then(res => {
                if (!res.ok) {
                    console.error("Availability API not found or returned an error.");
                    return Promise.resolve({ unavailable_dates: [], timeslots: [] });
                }
                return res.json();
            })
            .then(data => {
                // ✅ FIX: Defensively set the state to prevent .map error
                const timeslots = Array.isArray(data?.timeslots) ? data.timeslots : [];
                const unavailable_dates = Array.isArray(data?.unavailable_dates) ? data.unavailable_dates : [];

                setAvailability({
                    unavailable_dates: unavailable_dates,
                    timeslots: timeslots
                });
            })
            .catch(error => {
                console.error("Failed to fetch availability:", error);
                // Also set a default state on catch
                setAvailability({ unavailable_dates: [], timeslots: [] });
            });
    }, [service.id]);

    // Dynamic price calculation
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end > start) {
                const days = differenceInCalendarDays(end, start) + 1;
                const calculatedPrice = service.price * days * guests;
                setTotalPrice(calculatedPrice);
            } else {
                setTotalPrice(0);
            }
        } else {
            setTotalPrice(0);
        }
    }, [startDate, endDate, guests, service.price]);

    const handleBooking = async () => {
        setIsLoading(true);
        // This would be the "Book Now" flow with payment
        // For now, it simulates the request flow
        onRequestToBookClick(); 
        setTimeout(() => setIsLoading(false), 1000);
    };
    
    const isOrganizer = userRole === 'EVENT_ORGANIZER';

    return (
        // ✅ UI: Larger, sticky widget with modern styling
        <div className="sticky top-24 w-full md:w-96 lg:w-[400px] p-6 bg-white border rounded-2xl shadow-xl space-y-5">
            <p className="text-2xl font-bold text-gray-900">
                R {service.price} <span className="text-base font-normal text-gray-500">/ day</span>
            </p>

            {/* ✅ FIX: Replaced DatePicker with native date inputs */}
            <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">CHECK-IN</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full p-3 border rounded-lg bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">CHECK-OUT</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split("T")[0]}
                        disabled={!startDate}
                        className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200"
                    />
                </div>
            </div>
            
            {/* ✅ UI: Improved Timeslot Selector */}
            <div>
                <h3 className="font-semibold text-sm mb-2 text-gray-600">AVAILABLE TIME SLOTS</h3>
                <div className="flex flex-wrap gap-2">
                    {availability.timeslots.map(slot => (
                        <button 
                            key={slot}
                            onClick={() => setSelectedTimeslot(slot)}
                            className={`px-4 py-2 text-sm rounded-lg border transition ${selectedTimeslot === slot ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:border-gray-500'}`}
                        >
                            {slot}
                        </button>
                    ))}
                </div>
            </div>

            {/* ✅ FIX & UI: Improved Guest Selector */}
            <div>
                <h3 className="font-semibold text-sm mb-2 text-gray-600">GUESTS</h3>
                <div className="flex items-center justify-between border rounded-lg p-3">
                    <span className="font-medium">Number of Guests</span>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setGuests(g => Math.max(1, g - 1))}
                            disabled={guests <= 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full border disabled:opacity-50"
                        ><MinusIcon /></button>
                        <span className="text-lg font-medium w-4 text-center">{guests}</span>
                        <button 
                            onClick={() => setGuests(g => Math.min(service.max_capacity || 10, g + 1))}
                            disabled={guests >= (service.max_capacity || 10)}
                            className="w-8 h-8 flex items-center justify-center rounded-full border disabled:opacity-50"
                        ><PlusIcon /></button>
                    </div>
                </div>
            </div>

            {/* ✅ UI: Styled CTA Button */}
            <button 
                onClick={handleBooking} 
                disabled={!isOrganizer || isLoading || !startDate || !endDate}
                className="w-full bg-rose-500 text-white font-bold py-3 rounded-lg hover:bg-rose-600 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Processing...' : 'Request to Book'}
            </button>

            {/* Dynamic Price Summary */}
            {totalPrice > 0 && (
                 <div className="mt-6 pt-4 border-t space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between"><span>R {service.price} x {differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1} days</span> <span>R {service.price * (differenceInCalendarDays(new Date(endDate), new Date(startDate)) + 1)}</span></div>
                    <div className="flex justify-between"><span>Service fee</span> <span>R 150</span></div>
                    <div className="flex justify-between font-bold text-base mt-2 text-gray-800"><span>Total</span> <span>R {totalPrice + 150}</span></div>
                </div>
            )}
            <p className="text-center text-xs text-gray-500">You won't be charged yet</p>
        </div>
    );
}
