import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEventCreation } from './context/reactContext.jsx';
import {
  Truck,
  Martini,
  ShoppingBag,
  Accessibility,
  Armchair,
  CreditCard,
  Sparkles,
  Crown,
  Handshake,
  Mic2,
  Camera,
  CheckCircle2
} from 'lucide-react';

// Icon mapping for features
const ICONS = {
    'Food Trucks': Truck,
    'Bar Available': Martini,
    'Merch Stall': ShoppingBag,
    'Wheelchair Accessible': Accessibility,
    'Outdoor Seating': Armchair,
    'Accepts Cards': CreditCard,
    'Special Guest Appearance': Sparkles,
    'VIP Area': Crown,
    'Meet & Greet': Handshake,
    'Live Q&A': Mic2,
    'Photo Booth': Camera
};

const ListingStep7 = () => {
    const navigate = useNavigate();
    const { setCurrentStep } = useEventCreation();
    const { eventId } = useParams();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

     useEffect(() => {
        setCurrentStep('step7');
    }, [setCurrentStep]);

    const toggleFeature = (name) => {
        if (selectedFeatures.includes(name)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== name));
        } else {
            setSelectedFeatures([...selectedFeatures, name]);
        }
    };

    const commonFeatures = [
        { name: 'Food Trucks', desc: 'Gourmet street food options' },
        { name: 'Bar Available', desc: 'Alcoholic & non-alcoholic drinks' },
        { name: 'Merch Stall', desc: 'Space for selling merchandise' },
        { name: 'Wheelchair Accessible', desc: 'Ramps and accessible facilities' },
        { name: 'Outdoor Seating', desc: 'Comfortable open-air spots' },
        { name: 'Accepts Cards', desc: 'Cashless payment options' }
    ];

    const standoutPerks = [
        { name: 'Special Guest Appearance', desc: 'Celebrity or industry expert' },
        { name: 'VIP Area', desc: 'Exclusive lounge access' },
        { name: 'Meet & Greet', desc: 'Photo ops with talent' },
        { name: 'Live Q&A', desc: 'Interactive audience sessions' },
        { name: 'Photo Booth', desc: 'Fun props and instant prints' }
    ];

    const FeatureCard = ({ item }) => {
        const isSelected = selectedFeatures.includes(item.name);
        const IconComponent = ICONS[item.name] || Sparkles;

        return (
            <button
                onClick={() => toggleFeature(item.name)}
                className={`relative group p-5 rounded-2xl border-2 text-left transition-all duration-300 ease-out h-full flex flex-col gap-3
                ${isSelected 
                    ? 'border-violet-500 bg-violet-50 shadow-[0_8px_30px_rgb(139,92,246,0.15)] scale-[1.02]' 
                    : 'border-gray-100 bg-white hover:border-violet-200 hover:shadow-lg hover:-translate-y-1'
                }`}
            >
                {/* Checkmark Badge */}
                <div className={`absolute top-4 right-4 transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <CheckCircle2 className="text-violet-500 fill-violet-100" size={24} />
                </div>

                {/* Icon */}
                <div className={`p-3 rounded-xl w-fit transition-colors duration-300 ${
                    isSelected ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-violet-100 group-hover:text-violet-600'
                }`}>
                    <IconComponent size={28} strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div>
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${isSelected ? 'text-violet-900' : 'text-gray-900'}`}>
                        {item.name}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors ${isSelected ? 'text-violet-700' : 'text-gray-500'}`}>
                        {item.desc}
                    </p>
                </div>
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header */}
            <header className="max-w-4xl mx-auto pt-12 pb-8 px-6">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-600 mb-3">
                    What does your event offer?
                </h1>
                <p className="text-xl text-gray-500 font-medium">
                    Select all the amenities and perks available to your guests.
                </p>
            </header>

            <main className="max-w-4xl mx-auto px-6 space-y-12 mb-12">

                {/* Common Features Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span className="w-8 h-1 bg-gray-200 rounded-full"></span>
                        Event Amenities
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {commonFeatures.map((item) => (
                            <FeatureCard key={item.name} item={item} />
                        ))}
                    </div>
                </section>

                {/* Standout Perks Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <span className="w-8 h-1 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"></span>
                        Exclusive Perks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {standoutPerks.map((item) => (
                            <FeatureCard key={item.name} item={item} />
                        ))}
                    </div>
                </section>

            </main>

            {/* Sticky Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-100">
                    <div
                        className="h-full bg-gradient-to-r from-violet-600 to-pink-600 transition-all duration-500 ease-out"
                        style={{ width: '87.5%' }} // Step 7 of 8 approx
                    />
                </div>

                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(`${listingBase}/step6`)}
                        className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Back
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="hidden sm:block text-sm font-medium text-gray-500">
                            {selectedFeatures.length} items selected
                        </span>
                        <button
                            onClick={() => navigate(`${listingBase}/step8`)}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
                        >
                            Next Step
                            <CheckCircle2 size={18} />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ListingStep7;