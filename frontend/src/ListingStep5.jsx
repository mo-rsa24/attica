import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import {FiPlus, FiTrash2, FiChevronDown, FiUpload, FiPaperclip} from 'react-icons/fi';
import {useEventCreation} from './context/reactContext.jsx';
// --- Reusable Components ---

// Simple Counter from original file
const Counter = ({value, onIncrease, onDecrease, min = 0}) => (
    <div className="flex items-center space-x-3">
        <button type="button" onClick={onDecrease} disabled={value <= min}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition">-
        </button>
        <span className="text-lg font-semibold w-12 text-center">{value}</span>
        <button type="button" onClick={onIncrease}
                className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition">+
        </button>
    </div>
);

// Toggle Switch from original file
const ToggleSwitch = ({enabled, setEnabled}) => (
    <button type="button" onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-pink-600' : 'bg-gray-300'}`}>
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
    </button>
);

// New Accordion for Tiered Pricing
const AccordionItem = ({title, children, isOpen, onClick}) => (
    <div className="border rounded-lg overflow-hidden">
        <button type="button" onClick={onClick}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100">
            <span className="font-semibold">{title}</span>
            <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
        </button>
        {isOpen && <div className="p-4 bg-white">{children}</div>}
    </div>
);

// --- Main Component ---

export default function ListingStep5() {
    const navigate = useNavigate();
    const {setCurrentStep, saveAndExit, event, getStepData, setStepData, saveStep, getNextStep} = useEventCreation();
    const {eventId} = useParams();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const initialStepData = useMemo(() => getStepData('step5', {}), [getStepData]);
    const [basePrice, setBasePrice] = useState(initialStepData.base_price ?? 150.00);
    const [currency, setCurrency] = useState(initialStepData.currency ?? 'ZAR');
    const [maxTickets, setMaxTickets] = useState(initialStepData.max_tickets_per_buyer ?? 10);
    const [refundPolicy, setRefundPolicy] = useState(initialStepData.refund_policy ?? 'full');
    const [customPolicy, setCustomPolicy] = useState(initialStepData.custom_policy ?? '');
    const [openTier, setOpenTier] = useState(null);

    const [isSeated, setIsSeated] = useState(initialStepData.is_seated ?? false);
    const [seatingChart, setSeatingChart] = useState(initialStepData.seating_chart ?? null);

    const [isAgeRestricted, setIsAgeRestricted] = useState(initialStepData.is_age_restricted ?? false);
    const [isInviteOnly, setIsInviteOnly] = useState(initialStepData.access_type === 'private');

    useEffect(() => {
        setCurrentStep('step5');
    }, [setCurrentStep]);

    useEffect(() => {
        const next = getStepData('step5', {});
        if (Object.keys(next || {}).length) {
            setBasePrice(next.base_price ?? 150.0);
            setCurrency(next.currency ?? 'ZAR');
            setMaxTickets(next.max_tickets_per_buyer ?? 10);
            setRefundPolicy(next.refund_policy ?? 'full');
            setCustomPolicy(next.custom_policy ?? '');
            setIsSeated(next.is_seated ?? false);
            setSeatingChart(next.seating_chart ?? null);
            setIsAgeRestricted(next.is_age_restricted ?? false);
            setIsInviteOnly((next.access_type || '') === 'private');
        }
    }, [getStepData]);

    useEffect(() => {
        setStepData('step5', {
            base_price: basePrice,
            currency,
            max_tickets_per_buyer: maxTickets,
            refund_policy: refundPolicy === 'custom' ? customPolicy : refundPolicy,
            custom_policy: refundPolicy === 'custom' ? customPolicy : null,
            is_seated: isSeated,
            seating_chart: seatingChart,
            is_age_restricted: isAgeRestricted,
            access_type: isInviteOnly ? 'private' : 'public',
        });
    }, [basePrice, currency, maxTickets, refundPolicy, customPolicy, isSeated, seatingChart, isAgeRestricted, isInviteOnly, setStepData]);

    const handleNext = async () => {
        const payload = {
            base_price: basePrice,
            currency,
            max_tickets_per_buyer: maxTickets,
            refund_policy: refundPolicy === 'custom' ? customPolicy : refundPolicy,
            custom_policy: refundPolicy === 'custom' ? customPolicy : null,
            is_seated: isSeated,
            seating_chart: seatingChart,
            is_age_restricted: isAgeRestricted,
            access_type: isInviteOnly ? 'private' : 'public',
        };
        const nextStep = getNextStep('step5');
        await saveStep(eventId || event?.id, 'step5', payload, nextStep);
        navigate(nextStep === 'review' ? `${listingBase}/review` : `${listingBase}/${nextStep}`);
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setSeatingChart(e.target.files[0]);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20">
                <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        <a href="/">
                            <div className="text-2xl font-bold text-pink-600">A</div>
                        </a>
                        <button
                            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full"
                            onClick={() => saveAndExit(eventId || event?.id)}
                        >
                            Save & exit
                        </button>
                    </div>
                    <div className="w-full bg-gray-200 h-1">
                        <motion.div className="bg-pink-600 h-1" initial={{width: '40%'}} animate={{width: '60%'}}
                                    transition={{duration: 1, ease: 'easeInOut'}}/>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-28">
                <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 px-6">

                    {/* Left Column: Form Sections */}
                    <div className="lg:col-span-7 space-y-10">
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.7}}>
                            <h1 className="text-4xl font-bold text-gray-900">Set your ticket price and options</h1>
                            <p className="mt-2 text-lg text-gray-600">Configure pricing, seating, and access controls
                                for your event.</p>
                        </motion.div>

                        {/* 1. Ticket Options */}
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.7, delay: 0.2}}
                                    className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">📦 Ticket Options</h2>
                            <div className="space-y-6 pt-6">
                                {/* Base Price */}
                                <div>
                                    <label className="block font-semibold text-gray-700">Base Price per Ticket</label>
                                    <div className="mt-2 flex items-center border rounded-lg p-2 bg-gray-50">
                                        <input type="number" value={basePrice}
                                               onChange={e => setBasePrice(parseFloat(e.target.value))}
                                               className="w-full bg-transparent font-semibold text-lg focus:outline-none"/>
                                        <span className="font-bold text-gray-500 pr-2">{currency} 🇿🇦</span>
                                    </div>
                                </div>
                                {/* Max tickets per buyer */}
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-gray-700">Max Tickets Per Buyer</label>
                                    <Counter value={maxTickets} onIncrease={() => setMaxTickets(v => v + 1)}
                                             onDecrease={() => setMaxTickets(v => v - 1)} min={1}/>
                                </div>
                                {/* Tiered Pricing Accordion */}
                                <AccordionItem title="Tiered Pricing" isOpen={openTier === 'tiered'}
                                               onClick={() => setOpenTier(openTier === 'tiered' ? null : 'tiered')}>
                                    <p className="text-sm text-gray-600">Create different ticket types like 'Early Bird'
                                        or 'VIP'.</p>
                                    {/* Add logic here to manage tiers */}
                                </AccordionItem>
                                {/* Promo Codes Accordion */}
                                <AccordionItem title="Promo Codes & Discounts" isOpen={openTier === 'promo'}
                                               onClick={() => setOpenTier(openTier === 'promo' ? null : 'promo')}>
                                    <p className="text-sm text-gray-600">Offer special discounts to drive sales.</p>
                                    {/* Add logic here to manage promo codes */}
                                </AccordionItem>
                                {/* Refund Policy */}
                                <div>
                                    <label className="block font-semibold text-gray-700 mb-2">Refund Policy</label>
                                    <select value={refundPolicy} onChange={e => setRefundPolicy(e.target.value)}
                                            className="w-full p-2 border rounded-lg">
                                        <option value="full">Full Refund (up to 24 hours before)</option>
                                        <option value="partial">Partial Refund</option>
                                        <option value="none">No Refunds</option>
                                        <option value="custom">Custom Policy</option>
                                    </select>
                                    {refundPolicy === 'custom' &&
                                        <textarea value={customPolicy} onChange={e => setCustomPolicy(e.target.value)}
                                                  className="w-full mt-2 p-2 border rounded-lg"
                                                  placeholder="Specify your custom refund policy..."/>}
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Seating Options */}
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.7, delay: 0.3}}
                                    className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">🪑 Seating Options</h2>
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-gray-700">Assigned Seating</label>
                                    <ToggleSwitch enabled={isSeated} setEnabled={setIsSeated}/>
                                </div>
                                {isSeated && (
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-2">Seating Chart
                                            (optional)</label>
                                        <label htmlFor="seating-chart-upload"
                                               className="w-full flex items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                                            {seatingChart ? <div className="flex items-center gap-2 text-green-600">
                                                    <FiPaperclip/><span>{seatingChart.name}</span></div> :
                                                <div className="flex items-center gap-2"><FiUpload/><span>Upload PDF or Image</span>
                                                </div>}
                                        </label>
                                        <input id="seating-chart-upload" type="file" className="hidden"
                                               onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png"/>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* 3. Audience & Access */}
                        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.7, delay: 0.4}}
                                    className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">🎟️ Audience & Access
                                Controls</h2>
                            <div className="space-y-6 pt-6">
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-gray-700">Age Restricted (18+)</label>
                                    <ToggleSwitch enabled={isAgeRestricted} setEnabled={setIsAgeRestricted}/>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="font-semibold text-gray-700">Invite-Only Access</label>
                                    <ToggleSwitch enabled={isInviteOnly} setEnabled={setIsInviteOnly}/>
                                </div>
                                <AccordionItem title="Custom Registration Questions" isOpen={openTier === 'questions'}
                                               onClick={() => setOpenTier(openTier === 'questions' ? null : 'questions')}>
                                    <p className="text-sm text-gray-600">Ask for dietary needs, T-shirt sizes, etc.</p>
                                    {/* Add logic here to manage custom questions */}
                                </AccordionItem>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Hero Image & Dynamic Revenue */}
                    <div className="lg:col-span-5 lg:sticky top-24 h-fit">
                        <div className="bg-white p-4 rounded-2xl shadow-lg">
                            <img src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg" alt="Concert"
                                 className="w-full h-64 object-cover rounded-xl"/>
                            <div className="p-4">
                                <p className="text-gray-600 font-semibold">Potential Revenue (Est.)</p>
                                <p className="text-4xl font-extrabold text-green-600">R {(basePrice * 100).toLocaleString()}</p>
                                <p className="text-sm text-gray-500 mt-2">Based on 100 tickets at the base price. Does
                                    not include tiered pricing or discounts.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
                <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button onClick={() => navigate(`${listingBase}/step4`)}
                            className="font-bold text-gray-800 underline">Back
                    </button>
                    <button onClick={handleNext}
                            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg">Next
                    </button>
                </div>
            </footer>
        </div>
    );
}