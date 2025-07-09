// mo-rsa24/attica/mo-rsa24-attica-66d10b0638c288bd6fb1974da25940e312773070/frontend/src/EventListingPage.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTicketAlt, FaUsers, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Reusable FAQ Item Component
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
            >
                <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
                {isOpen ? <FaChevronUp className="text-gray-500"/> : <FaChevronDown className="text-gray-500"/>}
            </button>
            {isOpen && (
                <p className="mt-2 text-gray-600 animate-fade-in-down">
                    {answer}
                </p>
            )}
        </div>
    );
};

export default function EventListingPage() {
    const { id } = useParams();
    const [event, setEvents] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sample FAQ data as requested. In a real application, this would come from the backend.
    const faqs = [
        {
            question: "Are Viagogo tickets valid?",
            answer: "We do not recommend purchasing tickets from third-party resellers like Viagogo as we cannot guarantee their validity. Official tickets should be purchased through our designated ticket portal."
        },
        {
            question: "I'd like to make a group booking, how do I do this?",
            answer: "For group bookings of 10 or more, please contact our support team directly through the 'Contact Us' page. We offer special packages and discounts for large groups."
        },
        {
            question: "Is there an age limit?",
            answer: "This event is open to all ages unless otherwise specified. However, attendees under 18 must be accompanied by an adult. Please check the event details for any specific age restrictions."
        },
        {
            question: "How do digital tickets work?",
            answer: "Your digital tickets will be sent to your email address as a QR code. You can either print them or show the QR code on your mobile device at the event entrance for scanning."
        }
    ];

    useEffect(() => {
        const fetchEventData = async () => {
            setIsLoading(true);
            try {
                // Fetch all data in parallel
                const [eventRes,] = await Promise.all([
                    fetch(`/api/events/events/${id}/`),
                ]);

                setEvents(await eventRes.json());

                // setIsMyProfile(artistData.user.id === loggedInUserId);
            } catch (error) {
                console.error("Failed to fetch artist data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventData();
    }, [id]);


    if (isLoading) {
        return <div className="text-center py-40 text-2xl font-semibold">Loading Event...</div>;
    }

    if (!event) {
        return <div className="text-center py-40 text-2xl font-semibold text-red-500">Event Not Found</div>;
    }

    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const startTime = event.start_time ? new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

   return (
        <div className="bg-gray-100 text-gray-800">
            {/* Hero Section */}
            <div
                className="relative h-[500px] bg-cover bg-center text-white"
                style={{ backgroundImage: `url(${event.banner_image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'})` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative h-full flex flex-col justify-center p-8 lg:px-24">
                    <p className="text-sm font-bold text-pink-400 uppercase tracking-widest">{event.category || 'EVENT'}</p>
                    <h1 className="text-6xl font-extrabold mt-2 leading-tight">{event.name}</h1>
                    <div className="flex items-center space-x-6 mt-4 text-lg">
                        <div className="flex items-center"><FaCalendarAlt className="mr-2"/> {eventDate}</div>
                        <div className="flex items-center"><FaMapMarkerAlt className="mr-2"/> {event.location?.name || 'Venue TBD'}</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-x-8 px-8 py-8">
                {/* Left Column (80%) */}
                <div className="lg:col-span-4 bg-white p-8 rounded-xl shadow-lg">
                    <section id="tickets" className="mb-12">
                        <h2 className="text-3xl font-bold mb-6">Tickets</h2>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-200">
                            {event.tickets && event.tickets.length > 0 ? event.tickets.map(ticket => (
                                <div key={ticket.id} className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm">
                                    <div>
                                        <p className="font-semibold capitalize text-lg">{ticket.payment_status} Ticket</p>
                                        <p className="text-sm text-gray-500">Quantity: {ticket.quantity}</p>
                                    </div>
                                    <button className="bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-pink-700 transition">
                                        Select
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">No tickets are currently available for this event online.</p>
                                     <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
                                        Buy Tickets
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section id="about" className="mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-4">About The Event</h2>
                                <p className="text-gray-600 leading-relaxed">{event.notes || 'No additional information available.'}</p>
                            </div>
                            <img
                                src={event.image_url || 'https://placehold.co/600x400/333/fff?text=Event+Image'}
                                alt={event.name}
                                className="w-full h-auto object-cover rounded-lg shadow-md"
                            />
                        </div>
                    </section>

                     <section id="faqs">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <div className="space-y-2">
                           {faqs.map((faq, index) => (
                               <FAQItem key={index} question={faq.question} answer={faq.answer} />
                           ))}
                        </div>
                    </section>
                </div>

                {/* Right Column (20%) */}
                <div className="lg:col-span-1 space-y-4 sticky top-8 h-fit">
                    <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <h3 className="text-xl font-bold mb-4">Date & Time</h3>
                        <div className="flex items-center space-x-3 mb-3">
                            <FaCalendarAlt className="text-pink-500 text-xl" />
                            <span>{eventDate}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FaClock className="text-pink-500 text-xl" />
                            <span>Starts at {startTime}</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <h3 className="text-xl font-bold mb-4">Venue</h3>
                        <div className="flex items-start space-x-3 mb-2">
                            <FaMapMarkerAlt className="text-pink-500 text-xl mt-1" />
                            <div>
                                <span className="font-semibold">{event.location?.name || 'Venue TBD'}</span>
                                <p className="text-sm text-gray-500">{event.location?.address}</p>
                            </div>
                        </div>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-lg border">
                        <h3 className="text-xl font-bold mb-4">Event Info</h3>
                         <div className="flex items-center space-x-3 mb-3">
                            <FaUsers className="text-pink-500 text-xl" />
                            <span>{event.guest_count} Guests Attending</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FaTicketAlt className="text-pink-500 text-xl" />
                            <span>Theme: {event.theme || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
