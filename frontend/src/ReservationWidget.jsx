import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaPlus, FaMinus } from 'react-icons/fa';
import RequestToBookModal from './RequestToBook2.jsx';
// import PaymentForm from './PaymentForm'; // To be added

export default function ReservationWidget({ service, userRole, onRequestToBookClick }) {
    const [dates, setDates] = useState(new Date());
    const [guests, setGuests] = useState(1);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);
    const [totalPrice, setTotalPrice] = useState(service.price);
    const [availability, setAvailability] = useState({ booked_dates: [], timeslots: {} });
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);
    // const [showPayment, setShowPayment] = useState(false);
    // const [clientSecret, setClientSecret] = useState(null);

    // Fetch availability on component mount
    useEffect(() => {
        fetch(`/api/services/${service.id}/availability/`)
            .then(res => res.json())
            .then(data => setAvailability(data))
            .catch(console.error);
    }, [service.id]);

    // Update total price when inputs change
    useEffect(() => {
        const days = Array.isArray(dates) ? (dates[1] - dates[0]) / (1000 * 3600 * 24) + 1 : 1;
        setTotalPrice(service.price * days * guests);
    }, [dates, guests, service.price]);

    const handleBookNow = async () => {
        // Logic to create payment intent and show PaymentForm
    };

    const isDateDisabled = ({ date, view }) => {
        if (view === 'month') {
            return availability.booked_dates.includes(date.toISOString().split('T')[0]);
        }
    };

    const isOrganizer = userRole === 'organizer';

    return (
        <>
            <div className="sticky top-24 p-6 bg-white border rounded-xl shadow-lg transition-all duration-300">
                <p className="text-2xl font-bold text-gray-900">
                    R {service.price} <span className="text-base font-normal text-gray-500">/ day</span>
                </p>

                <div className="mt-4">
                    <Calendar
                        onChange={setDates}
                        value={dates}
                        selectRange={true}
                        tileDisabled={isDateDisabled}
                        className="border-0"
                    />
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-2">TIME SLOT</h3>
                    <div className="flex space-x-2">
                        {availability.timeslots.default?.map(slot => (
                            <button
                                key={slot}
                                onClick={() => setSelectedTimeslot(slot)}
                                className={`px-4 py-2 text-sm rounded-md border ${selectedTimeslot === slot ? 'bg-gray-900 text-white' : 'bg-white'}`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <h3 className="font-semibold text-sm mb-2">GUESTS</h3>
                    <div className="flex items-center justify-between border rounded-md p-2">
                        <button onClick={() => setGuests(g => Math.max(1, g - 1))}><FaMinus /></button>
                        <span>{guests} guest(s)</span>
                        <button onClick={() => setGuests(g => Math.min(service.max_capacity, g + 1))}><FaPlus /></button>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between"><span>R {service.price} x {Array.isArray(dates) ? (dates[1] - dates[0]) / (1000 * 3600 * 24) + 1 : 1} days</span> <span>R {service.price * (Array.isArray(dates) ? (dates[1] - dates[0]) / (1000 * 3600 * 24) + 1 : 1)}</span></div>
                    <div className="flex justify-between"><span>Service fee</span> <span>R 150</span></div>
                    <div className="flex justify-between font-bold text-base mt-2"><span>Total</span> <span>R {totalPrice + 150}</span></div>
                </div>

                {isOrganizer && (
                    <div className="mt-4 space-y-2">
                        <button onClick={handleBookNow}
                                className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition">
                            Book Now
                        </button>
                        <button
                            onClick={onRequestToBookClick}
                            className="w-full bg-gray-200 ..."
                        >
                            Request to Book
                        </button>
                    </div>
                )}
            </div>

            <RequestToBookModal
                isOpen={isRequestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                serviceId={service.id}
            />
        </>
    );
}