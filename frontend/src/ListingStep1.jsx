import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {FaChevronRight, FaTimes, FaTrash} from 'react-icons/fa';
import {FiImage, FiUploadCloud, FiVideo} from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';

// Mock data and components
const heroImages = [
    'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
];
const provinces = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'];
const eventTypes = [
    { name: 'Concert', icon: '🎤' }, { name: 'Festival', icon: '🎪' }, { name: 'Wedding', icon: '💍' },
    { name: 'Birthday Party', icon: '🎂' }, { name: 'Conference', icon: '💼' }, { name: 'Club Night', icon: '🪩' },
    { name: 'Gala / Formal', icon: '🥂' }, { name: 'Food & Wine', icon: '🍷' }, { name: 'Workshop', icon: '🛠️' },
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
                <motion.img key={currentImageIndex} src={heroImages[currentImageIndex]} alt="Event Inspiration" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1.5, ease: 'easeInOut' }} className="absolute inset-0 w-full h-full object-cover" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
    );
};

const TextInput = ({ label, name, value, onChange, maxLength, placeholder, type = 'text' }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} maxLength={maxLength} placeholder={placeholder} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
        {maxLength && <p className="text-xs text-gray-500 mt-1 text-right">{String(value).length} / {maxLength}</p>}
    </div>
);

const TagInput = ({ label, tags, setTags, placeholder }) => {
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
                    <div key={tag} className="flex items-center bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-2 text-pink-600 hover:text-pink-800"><FaTimes size={12} /></button>
                    </div>
                ))}
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="flex-grow bg-transparent focus:outline-none" />
            </div>
        </div>
    );
};

const ImageUploader = ({ title, file, onFileChange }) => {
    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            onFileChange(Object.assign(selectedFile, {
                preview: URL.createObjectURL(selectedFile)
            }));
        }
    }, [onFileChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    const removeFile = (e) => {
        e.stopPropagation(); // Prevent triggering the dropzone
        onFileChange(null);
    };

    return (
        <div {...getRootProps()} className={`relative p-6 border-2 border-dashed rounded-lg text-center flex flex-col items-center justify-center h-48 cursor-pointer transition-all duration-300 ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400'}`}>
            <input {...getInputProps()} />
            {file ? (
                <>
                    <img src={file.preview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                    <button onClick={removeFile} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 text-xs shadow-lg hover:bg-red-700 transition-colors">
                        <FaTrash />
                    </button>
                </>
            ) : (
                <div className="text-gray-500">
                    <FiImage className="mx-auto text-4xl mb-2" />
                    <p className="text-sm font-semibold text-gray-700">{title}</p>
                    <p className="text-xs mt-1">Drag & drop or click</p>
                </div>
            )}
        </div>
    );
};

const GalleryUploader = ({ files, setFiles }) => {
    const onDrop = useCallback(acceptedFiles => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        setFiles(prev => [...prev, ...newFiles].slice(0, 10)); // Limit to 10 images
    }, [setFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });
    const removeFile = (fileToRemove, e) => {
        e.stopPropagation();
        setFiles(files.filter(file => file !== fileToRemove));
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">🖼️ Drag & Drop Gallery</label>
            <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-pink-500 bg-pink-50' : 'border-gray-300'}`}>
                <input {...getInputProps()} />
                <FiUploadCloud className="mx-auto text-4xl text-gray-400 mb-2" />
                <p>Drag & drop your gallery images here, or click to select files</p>
            </div>
            <AnimatePresence>
                <motion.div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {files.map((file, index) => (
                        <motion.div
                            key={file.preview}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="relative aspect-square group"
                        >
                            <img src={file.preview} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <button onClick={(e) => removeFile(file, e)} className="text-white text-2xl">
                                    <FaTrash />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const EventTypeCard = ({ type, icon, selected, onClick }) => (
    <motion.button whileHover={{ scale: 1.05, y: -5, boxShadow: '0px 15px 25px -10px rgba(0,0,0,0.1)' }} onClick={onClick} className={`p-6 rounded-2xl text-left transition-all duration-300 w-full h-full flex flex-col justify-between ${selected ? 'bg-pink-600 text-white shadow-lg ring-2 ring-offset-2 ring-pink-600' : 'bg-white text-gray-800 shadow-md hover:shadow-lg border border-gray-200'}`}>
        <span className="text-4xl" role="img" aria-label={type}>{icon}</span>
        <p className="text-xl font-bold mt-4">{type}</p>
    </motion.button>
);


// Main Component
export default function ListingStep1() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        eventName: '', description: '', selectedEventType: null, region: '',
        genres: [], tags: [], theme: '',
        mainImage: null, thumbnailImage: null, heroImage: null, gallery: [],
        startDate: '', startTime: '', endDate: '', endTime: '',
        capacity: '', videoUrl: '', additionalNotes: ''
    });

    // Load and Auto-save logic
    useEffect(() => {
        const savedData = localStorage.getItem('eventFormData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setFormData(prev => ({ ...prev, ...parsedData, mainImage: null, thumbnailImage: null, heroImage: null, gallery: [] }));
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            const { mainImage, thumbnailImage, heroImage, gallery, ...rest } = formData;
            localStorage.setItem('eventFormData', JSON.stringify(rest));
        }, 1000);
        return () => clearTimeout(handler);
    }, [formData]);

     const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const setFileFor = (fieldName, file) => {
        setFormData(prev => ({...prev, [fieldName]: file}));
    }

    const setGalleryFiles = useCallback((updater) => {
        setFormData(prev => {
            const currentGallery = Array.isArray(prev.gallery) ? prev.gallery : [];
            const newGallery = typeof updater === 'function' ? updater(currentGallery) : updater;
            return {
                ...prev,
                gallery: newGallery,
            };
        });
    }, []);
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-6">
                    <div className="flex items-center justify-between h-20">
                        <Link to="/"><div className="h-8 w-8 text-pink-600 flex items-center justify-center font-bold text-2xl" style={{ color: '#FF5A5F' }}>A</div></Link>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">Questions?</button>
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full">Save & exit</button>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 h-1"><motion.div className="bg-pink-600 h-1" style={{ background: '#FF5A5F' }} initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 1, ease: 'easeInOut' }} /></div>
                </div>
            </header>

            <main className="pt-24 pb-24">
                <div className="max-w-screen-xl mx-auto py-10 px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <motion.div className="w-full lg:w-2/5 space-y-6" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}>
                            <p className="font-semibold text-pink-600" style={{ color: '#FF5A5F' }}>Step 1 of 7</p>
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">Tell us about your event</h1>
                            <p className="text-xl text-gray-600 leading-relaxed">Let's get the basics down. The more detail you provide, the better we can help you find the perfect audience and resources.</p>
                        </motion.div>
                        <motion.div className="w-full lg:w-3/5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}><RotatingHero /></motion.div>
                    </div>

                    <div className="mt-20 space-y-12">
                        {/* Event Details Form */}
                        <div className="p-8 bg-white shadow-md space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Event Details</h2>
                            <TextInput label="Event Name" name="eventName" value={formData.eventName} onChange={handleInputChange} maxLength={70} placeholder="e.g., Afrobeat Summer Fest" />
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="6" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Describe your event in detail. What makes it special?"></textarea>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <TagInput label="Genres" tags={formData.genres} setTags={newGenres => setFormData(p => ({ ...p, genres: newGenres }))} placeholder="Add genres (e.g., Amapiano, R&B)" />
                                <TagInput label="Tags / Keywords" tags={formData.tags} setTags={newTags => setFormData(p => ({ ...p, tags: newTags }))} placeholder="Add tags (e.g., Outdoor, LGBTQ-friendly)" />
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">🌐 Region</label>
                                    <select name="region" value={formData.region} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                                        <option value="" disabled>Select a Province</option>
                                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <TextInput label="Theme / Style" name="theme" value={formData.theme} onChange={handleInputChange} placeholder="e.g., Black Tie, Bohemian" />
                                <TextInput label="Expected Capacity" name="capacity" value={formData.capacity} onChange={handleInputChange} type="number" placeholder="e.g., 500" />
                                <TextInput label="Promo Video URL" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} placeholder="https://youtube.com/watch?v=..." />
                            </div>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date & Time</label>
                                    <div className="flex gap-4">
                                        <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                                        <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date & Time</label>
                                    <div className="flex gap-4">
                                        <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                                        <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                                <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Any other details? (e.g., parking info, specific instructions)"></textarea>
                            </div>
                        </div>

                         {/* Image Uploads */}
                        <div className="p-8 bg-white rounded-2xl shadow-md space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Visuals</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                <ImageUploader title="Main Image" file={formData.mainImage}
                                               onFileChange={(file) => setFileFor('mainImage', file)}/>
                                <ImageUploader title="Thumbnail Image" file={formData.thumbnailImage}
                                               onFileChange={(file) => setFileFor('thumbnailImage', file)}/>
                                <ImageUploader title="Hero Image" file={formData.heroImage}
                                               onFileChange={(file) => setFileFor('heroImage', file)}/>
                            </div>
                            <GalleryUploader files={formData.gallery} setFiles={setGalleryFiles}/>
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
                                                       onClick={() => setFormData(p => ({...p, selectedEventType: type.name}))} />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 z-20">
                 <div className="max-w-screen-2xl mx-auto flex justify-between items-center px-2">
                    <button onClick={() => navigate('/events')} className="font-bold text-gray-800 underline hover:text-pink-600 transition">Back</button>
                    <motion.button onClick={() => navigate('/listing/step3')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center space-x-3 px-6 py-3 bg-gray-900 text-white font-bold rounded-lg shadow-lg hover:bg-pink-600 hover:shadow-xl transition-all">
                        <span>Next</span><FaChevronRight />
                    </motion.button>
                </div>
            </footer>
        </div>
    );
}