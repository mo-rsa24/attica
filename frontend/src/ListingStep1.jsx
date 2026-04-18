import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {useNavigate, Link, useParams} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {FaChevronRight, FaTimes} from 'react-icons/fa';
import {useEventCreation, getStepProgress} from './context/reactContext.jsx';
import {saveDraftAndExit} from './utils/wizardExit.js';

// Mock data and components
const heroImages = [
    'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
];
const provinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];
const eventTypes = [
    {name: 'Concert', icon: '🎤'}, {name: 'Festival', icon: '🎪'}, {name: 'Wedding', icon: '💍'},
    {name: 'Birthday Party', icon: '🎂'}, {name: 'Conference', icon: '💼'}, {name: 'Club Night', icon: '🪩'},
    {name: 'Gala / Formal', icon: '🥂'}, {name: 'Food & Wine', icon: '🍷'}, {name: 'Workshop', icon: '🛠️'},
];

// Reusable UI Components

const RotatingHero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setCurrentImageIndex(prev => (prev + 1) % heroImages.length), 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[500px] rounded-2xl shadow-xl overflow-hidden">
            <AnimatePresence>
                <motion.img key={currentImageIndex} src={heroImages[currentImageIndex]} alt="Event Inspiration"
                            initial={{opacity: 0, scale: 1.1}} animate={{opacity: 1, scale: 1}}
                            exit={{opacity: 0, scale: 1.1}} transition={{duration: 1.5, ease: 'easeInOut'}}
                            className="absolute inset-0 w-full h-full object-cover"/>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
    );
};

const TextInput = ({label, name, value, onChange, maxLength, placeholder, type = 'text'}) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} maxLength={maxLength} placeholder={placeholder}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"/>
        {maxLength && <p className="text-xs text-gray-500 mt-1 text-right">{String(value).length} / {maxLength}</p>}
    </div>
);

const TagInput = ({label, tags, setTags, placeholder}) => {
    const [inputValue, setInputValue] = useState('');
    const handleKeyDown = e => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
            setInputValue('');
        }
    };
    const removeTag = tagToRemove => setTags(tags.filter(tag => tag !== tagToRemove));

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg">
                {tags.map(tag => (
                    <div key={tag}
                         className="flex items-center bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-2 text-pink-600 hover:text-pink-800">
                            <FaTimes size={12}/></button>
                    </div>
                ))}
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                       onKeyDown={handleKeyDown} placeholder={placeholder}
                       className="flex-grow bg-transparent focus:outline-none"/>
            </div>
        </div>
    );
};

const EventTypeCard = ({type, icon, selected, onClick}) => (
    <motion.button whileHover={{scale: 1.05, y: -5, boxShadow: '0px 15px 25px -10px rgba(0,0,0,0.1)'}} onClick={onClick}
                   className={`p-6 rounded-2xl text-left transition-all duration-300 w-full h-full flex flex-col justify-between ${selected ? 'bg-pink-600 text-white shadow-lg ring-2 ring-offset-2 ring-pink-600' : 'bg-white text-gray-800 shadow-md hover:shadow-lg border border-gray-200'}`}>
        <span className="text-4xl" role="img" aria-label={type}>{icon}</span>
        <p className="text-xl font-bold mt-4">{type}</p>
    </motion.button>
);


const defaultFormState = {
    eventName: '', description: '', selectedEventType: null, region: '',
    genres: [], tags: [], theme: '',
    startDate: '', startTime: '', endDate: '', endTime: '',
    capacity: '', videoUrl: '', additionalNotes: ''
};


export default function ListingStep1() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const {
        event,
        getStepData,
        setStepData,
        getNextStep,
        setCurrentStep,
        saveStep,
        saveAndExit,
        loadEvent,
        setEventDetails,
    } = useEventCreation();
    const [formData, setFormData] = useState(() => getStepData('step1', defaultFormState));
    const [formErrors, setFormErrors] = useState({});
    const [saveError, setSaveError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const loadEventRef = useRef(loadEvent);
    // Dirty-state tracking: snapshot of last-saved form data
    const savedSnapshotRef = useRef(null);
    useEffect(() => { loadEventRef.current = loadEvent; }, [loadEvent]);

    useEffect(() => {
        setCurrentStep('step1');
    }, [setCurrentStep]);

    // Load event data from backend (once per eventId)
    useEffect(() => {
        if (eventId) {
            loadEventRef.current(eventId);
        }
    }, [eventId]);

    // Sync form when event is hydrated from the server (event changes only on hydrate, not on local mergeStepData)
    useEffect(() => {
        if (event) {
            const loaded = getStepData('step1', defaultFormState);
            setFormData(prev => ({...prev, ...loaded}));
            // Treat the server-loaded data as the "saved" baseline
            if (savedSnapshotRef.current === null) {
                savedSnapshotRef.current = loaded;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event]);

    useEffect(() => {
        setStepData('step1', formData);
    }, [formData, setStepData]);

    const validationErrors = useMemo(() => {
        const errors = {};
        if (!formData.eventName?.trim()) errors.eventName = 'Event name is required.';
        if (!formData.description?.trim()) errors.description = 'Description is required.';
        if (!formData.region) errors.region = 'Please select a region.';
        if (!formData.startDate) errors.startDate = 'Start date is required.';
        if (!formData.startTime) errors.startTime = 'Start time is required.';
        if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
            errors.endDate = 'End date cannot be before start date.';
        }
        return errors;
    }, [formData]);

    const handleInputChange = e => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const syncStoreWithForm = useCallback((payloadFromApi = {}) => {
        setEventDetails(prev => ({
            ...prev,
            ...payloadFromApi,
            name: formData.eventName,
            description: formData.description,
            category: formData.selectedEventType,
            region: formData.region,
            theme: formData.theme,
            guest_count: formData.capacity ? Number(formData.capacity) : null,
            start_date: formData.startDate ? `${formData.startDate}T${formData.startTime || '00:00'}` : null,
            end_date: formData.endDate || null,
            end_time: formData.endTime || null,
            genres: formData.genres,
            tags: formData.tags,
            videoUrl: formData.videoUrl,
            additionalNotes: formData.additionalNotes,
        }));
    }, [formData, setEventDetails]);

    const handleSave = async (destination) => {
        setSaveError('');
        setFormErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            const firstErrorField = document.querySelector('[name="' + Object.keys(validationErrors)[0] + '"]');
            if (firstErrorField) firstErrorField.scrollIntoView({behavior: 'smooth', block: 'center'});
            return;
        }
        setIsSaving(true);

        const startDateTime = formData.startDate ? `${formData.startDate}T${formData.startTime || '00:00'}` : null;
        const nextStep = destination === 'continue' ? getNextStep('step1') : undefined;
        const payload = {
            name: formData.eventName,
            category: formData.selectedEventType,
            theme: formData.theme,
            guest_count: formData.capacity ? Number(formData.capacity) : null,
            start_date: startDateTime,
            end_date: formData.endDate || null,
            start_time: startDateTime,
            end_time: formData.endTime || null,
            date: formData.startDate || null,
            notes: [formData.description, formData.additionalNotes].filter(Boolean).join('\n\n'),
        };

        const result = await saveStep(eventId, 'step1', payload, nextStep);
        setIsSaving(false);

        if (!result.ok) {
            setSaveError(result.error || 'Unable to save changes.');
            return;
        }

        syncStoreWithForm(result.data || {});
        savedSnapshotRef.current = formData;

        if (destination === 'continue') {
            const stepRoute = nextStep === 'review' ? 'review' : nextStep;
            navigate(`${listingBase}/${stepRoute}`);
        } else if (destination === 'exit') {
            navigate('/my-events');
        }
    };

    const handleSaveAndExit = async () => {
        await saveDraftAndExit({
            saveAndExit,
            draftId: eventId || event?.id,
            navigate,
        });
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/">
                            <div className="h-8 w-8 text-pink-600 flex items-center justify-center font-bold text-2xl"
                                 style={{color: '#FF5A5F'}}>A
                            </div>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">Questions?
                            </button>

                            {/*<button*/}
                            {/*    onClick={() => handleSave('exit')}*/}
                            {/*    disabled={isSaving}*/}
                            {/*    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-60"*/}
                            {/*>*/}
                            {/*    {isSaving ? 'Saving...' : 'Save & exit'}*/}
                            {/*</button>*/}
                            <button
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full"
                                onClick={handleSaveAndExit}
                            >
                                Save & exit
                            </button>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 h-1">
                        <motion.div className="bg-pink-600 h-1" style={{background: '#FF5A5F'}} initial={{width: 0}}
                                    animate={{width: `${getStepProgress('step1')}%`}} transition={{duration: 1, ease: 'easeInOut'}}/>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-24">
                <div className="max-w-screen-xl mx-auto py-10 px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div className="w-full lg:w-2/5 space-y-6" initial={{opacity: 0, x: -50}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.8, delay: 0.2, ease: 'easeOut'}}>
                            <p className="font-semibold text-pink-600" style={{color: '#FF5A5F'}}>Step 1 of 8</p>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">Tell us about
                                your event</h1>
                            <p className="text-xl text-gray-600 leading-relaxed">Let's get the basics down. The more
                                detail you provide, the better we can help you find the perfect audience and
                                resources.</p>
                        </motion.div>
                        <motion.div className="w-full lg:w-3/5" initial={{opacity: 0, scale: 0.9}}
                                    animate={{opacity: 1, scale: 1}}
                                    transition={{duration: 0.8, delay: 0.4, ease: 'easeOut'}}><RotatingHero/>
                        </motion.div>
                    </div>

                    <div className="mt-20 space-y-12">
                        {/* Event Details Form */}
                        <div className="p-8 bg-white shadow-md space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Event Details</h2>
                            <div className="space-y-1">
                                <TextInput label="Event Name" name="eventName" value={formData.eventName} onChange={handleInputChange} maxLength={70} placeholder="e.g., Afrobeat Summer Fest" />
                                {formErrors.eventName && <p className="text-xs text-red-600">{formErrors.eventName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange}
                                          rows="6"
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                          placeholder="Describe your event in detail. What makes it special?"></textarea>
                                {formErrors.description && <p className="text-xs text-red-600 mt-1">{formErrors.description}</p>}
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <TagInput label="Genres" tags={formData.genres}
                                          setTags={newGenres => setFormData(p => ({...p, genres: newGenres}))}
                                          placeholder="Add genres (e.g., Amapiano, R&B)"/>
                                <TagInput label="Tags / Keywords" tags={formData.tags}
                                          setTags={newTags => setFormData(p => ({...p, tags: newTags}))}
                                          placeholder="Add tags (e.g., Outdoor, LGBTQ-friendly)"/>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">🌐 Region</label>
                                    <select name="region" value={formData.region} onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                                        <option value="" disabled>Select a Province</option>
                                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    {formErrors.region && <p className="text-xs text-red-600 mt-1">{formErrors.region}</p>}
                                </div>
                                <TextInput label="Theme / Style" name="theme" value={formData.theme}
                                           onChange={handleInputChange} placeholder="e.g., Black Tie, Bohemian"/>
                                <TextInput label="Expected Capacity" name="capacity" value={formData.capacity}
                                           onChange={handleInputChange} type="number" placeholder="e.g., 500"/>
                                <TextInput label="Promo Video URL" name="videoUrl" value={formData.videoUrl}
                                           onChange={handleInputChange} placeholder="https://youtube.com/watch?v=..."/>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date &
                                        Time</label>
                                    <div className="flex gap-4">
                                        <input type="date" name="startDate" value={formData.startDate}
                                               onChange={handleInputChange}
                                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                                        <input type="time" name="startTime" value={formData.startTime}
                                               onChange={handleInputChange}
                                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                                    </div>
                                    {(formErrors.startDate || formErrors.startTime) && (
                                        <p className="text-xs text-red-600 mt-1">{formErrors.startDate || formErrors.startTime}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date &
                                        Time</label>
                                    <div className="flex gap-4">
                                        <input type="date" name="endDate" value={formData.endDate}
                                               onChange={handleInputChange}
                                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                                        <input type="time" name="endTime" value={formData.endTime}
                                               onChange={handleInputChange}
                                               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"/>
                                    </div>
                                    {formErrors.endDate && <p className="text-xs text-red-600 mt-1">{formErrors.endDate}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional
                                    Notes</label>
                                <textarea name="additionalNotes" value={formData.additionalNotes}
                                          onChange={handleInputChange} rows="4"
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                          placeholder="Any other details? (e.g., parking info, specific instructions)"></textarea>
                            </div>
                        </div>

                        {/* Event Type Selection */}
                        <motion.div className="mt-24 text-center" initial="hidden" animate="visible"
                                    variants={{visible: {transition: {staggerChildren: 0.05}}}}>
                            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Which of these best describes
                                your event?</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-12">
                                {eventTypes.map(type => (
                                    <motion.div key={type.name}
                                                variants={{hidden: {opacity: 0, y: 20}, visible: {opacity: 1, y: 0}}}>
                                        <EventTypeCard type={type.name} icon={type.icon}
                                                       selected={formData.selectedEventType === type.name}
                                                       onClick={() => setFormData(p => ({
                                                           ...p,
                                                           selectedEventType: type.name
                                                       }))}/>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <footer
                className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-20">
                <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button
                        onClick={() => {
                            const snapshot = savedSnapshotRef.current;
                            const isDirty = snapshot !== null &&
                                JSON.stringify(formData) !== JSON.stringify(snapshot);
                            if (isDirty && !window.confirm('You have unsaved changes. Leave without saving?')) return;
                            navigate('/events');
                        }}
                        className="font-bold text-gray-800 underline hover:text-pink-600 transition">Back
                    </button>
                    
                    <div className="flex items-center space-x-4">
                        {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                        <motion.button
                            onClick={() => handleSave('continue')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isSaving}
                            className="flex items-center space-x-3 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg hover:bg-pink-600 hover:shadow-xl transition-all disabled:opacity-60"
                        >
                            <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span><FaChevronRight />
                        </motion.button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
