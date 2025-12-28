import React, {useState, useEffect, useMemo} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaChevronDown, FaStar, FaTimes } from 'react-icons/fa';
import { Mail, Phone, Instagram } from 'lucide-react';
import {useEventCreation} from "../context/reactContext.jsx";
import AtticaMark from "../components/AtticaMark.jsx";

// --- API Helper ---
const api = {
    fetchArtists: () => fetch('/api/artists/artists').then(res => res.json()),
    fetchGenres: () => fetch('/api/artists/genres/').then(res => res.json()), // New API call
    requestToBook: (artistId, eventId, eventDate) => {
        console.log(`Requesting to book artist ${artistId} for event ${eventId} on ${eventDate}`);
        return Promise.resolve({ success: true, status: 'pending' });
    }
};

// --- Reusable Components ---

const ArtistCard = ({ artist, onSelect, onOpenModal, isSelected }) => (
    <motion.div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="relative">
            <img src={artist.profile_image || 'https://placehold.co/400x400/e2e8f0/4a5568?text=Artist'} alt={artist.name} className="h-56 w-full object-cover" />
            {artist.is_popular && <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">⭐ Popular</div>}
        </div>
        <div className="p-4">
            <h3 className="text-xl font-bold text-gray-900">{artist.name}</h3>
            <p className="text-gray-600">{artist.genres} • R{parseFloat(artist.booking_fee).toLocaleString()}</p>
            <div className="flex items-center justify-between mt-4">
                <span className="text-yellow-500 font-bold flex items-center"><FaStar className="mr-1"/> {artist.rating}</span>
                <div className="flex gap-2">
                    <button onClick={() => onOpenModal(artist)} className="text-sm text-gray-700 font-semibold hover:text-black">View Profile</button>
                    <button
                        onClick={() => onSelect(artist)}
                        className={`text-sm font-bold px-4 py-2 rounded-full transition-colors ${isSelected ? 'bg-gray-200 text-gray-600' : 'bg-pink-600 text-white hover:bg-pink-700'}`}
                    >
                        {isSelected ? 'Added' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

const SelectedArtistsSidebar = ({ selected, onRemove, totalCost, onBookAll }) => (
    <div className="sticky top-24">
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900">Your Lineup</h3>
            <div className="mt-6 space-y-4">
                {selected.length > 0 ? selected.map(artist => (
                    <div key={artist.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={artist.profile_image || 'https://placehold.co/48x48'} alt={artist.name} className="w-12 h-12 object-cover rounded-full" />
                            <div>
                                <p className="font-bold">{artist.name}</p>
                                <p className="text-sm text-gray-500">R{parseFloat(artist.booking_fee).toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={() => onRemove(artist)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                    </div>
                )) : (
                    <p className="text-gray-500">Select artists to add them to your event lineup.</p>
                )}
            </div>
            <div className="border-t border-gray-200 mt-6 pt-6">
                <p className="text-gray-600 font-semibold">Total Estimated Artist Fees:</p>
                <p className="text-4xl font-extrabold text-pink-600 mt-2">R {totalCost.toLocaleString()}</p>
                <button
                    onClick={onBookAll}
                    disabled={selected.length === 0}
                    className="mt-6 w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 disabled:bg-gray-400"
                >
                    Request to Book All
                </button>
            </div>
        </div>
    </div>
);

const ArtistProfileModal = ({ artist, onClose, onSelect, isSelected }) => {
    if (!artist) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [mainImage, setMainImage] = useState(artist.profile_image || artist.portfolio_items?.[0]?.image || 'https://placehold.co/800x600');

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-100 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Profile & Details */}
                        <div className="md:col-span-1 space-y-6">
                            <img src={artist.profile_image || 'https://placehold.co/400x400'} alt={artist.name} className="w-full aspect-square object-cover rounded-2xl shadow-lg" />
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">{artist.name}</h2>
                                <p className="text-lg text-pink-600 font-semibold">{artist.genres}</p>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3"><FaStar className="text-yellow-500"/> <span>{artist.rating} Rating</span></div>
                                <div className="flex items-center gap-3"><Mail className="text-gray-500"/> <span>{artist.contact_email || 'Not available'}</span></div>
                                <div className="flex items-center gap-3"><Phone className="text-gray-500"/> <span>{artist.phone_number || 'Not available'}</span></div>
                                {artist.instagram_handle && (
                                    <a href={`https://instagram.com/${artist.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                                        <Instagram className="text-gray-500"/> @{artist.instagram_handle}
                                    </a>
                                )}
                            </div>
                             <div className="bg-white p-4 rounded-lg shadow-inner">
                                <p className="text-sm text-gray-600">Booking Fee</p>
                                <p className="text-2xl font-bold text-gray-900">R{parseFloat(artist.booking_fee).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Right Column: Bio & Gallery */}
                        <div className="md:col-span-2 space-y-6">
                             <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">About the Artist</h3>
                                <p className="text-gray-600 leading-relaxed">{artist.bio || "No biography provided."}</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Portfolio</h3>
                                {artist.portfolio_items && artist.portfolio_items.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="bg-gray-200 rounded-xl overflow-hidden">
                                           <img src={mainImage} alt="Portfolio main" className="w-full h-80 object-cover"/>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {artist.portfolio_items.map(item => (
                                                <img
                                                    key={item.id}
                                                    src={item.image}
                                                    alt={item.caption || 'Portfolio image'}
                                                    onClick={() => setMainImage(item.image)}
                                                    className={`w-full h-20 object-cover rounded-md cursor-pointer border-2 transition ${mainImage === item.image ? 'border-pink-500' : 'border-transparent hover:border-pink-300'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-40 bg-white rounded-lg flex items-center justify-center text-gray-500">No portfolio images available.</div>
                                )}
                            </div>
                        </div>
                    </div>
                     <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200">
                        <button
                            onClick={() => { onSelect(artist); onClose(); }}
                            className={`w-full font-bold py-3 rounded-lg text-white ${isSelected ? 'bg-gray-700 hover:bg-gray-800' : 'bg-pink-600 hover:bg-pink-700'}`}
                        >
                            {isSelected ? 'Remove from Event' : 'Add to Event'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Main Selection Page ---
export default function SelectArtists() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const { selectedArtists, setSelectedArtists } = useEventCreation();
    const [allArtists, setAllArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [activeGenre, setActiveGenre] = useState('All');
    const [modalArtist, setModalArtist] = useState(null);

    useEffect(() => {
        Promise.all([api.fetchArtists(), api.fetchGenres()])
            .then(([artistData, genreData]) => {
                setAllArtists(artistData.results || artistData || []);
                setGenres(['All', ...genreData]);
            })
            .catch(error => console.error("Failed to fetch data:", error));
    }, []);

    const handleSelectArtist = (artist) => {
        setSelectedArtists(prev => {
            const isSelected = prev.some(a => a.id === artist.id);
            if (isSelected) {
                return prev.filter(a => a.id !== artist.id);
            } else {
                return [...prev, artist];
            }
        });
    };

    const handleBookAll = () => {
        const eventId = 1;
        const eventDate = "2024-12-10";
        const bookingPromises = selectedArtists.map(artist =>
            api.requestToBook(artist.id, eventId, eventDate)
        );
        Promise.all(bookingPromises).then(() => {
            alert("Booking requests sent to all selected artists!");
        });
    };

    const handleDone = () => {
        navigate(`${listingBase}/step3`);
    };

    const filteredArtists = useMemo(() => {
        if (activeGenre === 'All') {
            return allArtists;
        }
        return allArtists.filter(artist => artist.genres && artist.genres.includes(activeGenre));
    }, [allArtists, activeGenre]);

    const totalCost = selectedArtists.reduce((sum, a) => sum + parseFloat(a.booking_fee || 0), 0);
    const selectedIds = new Set(selectedArtists.map(a => a.id));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            <header className="bg-white/95 backdrop-blur-lg sticky top-0 z-30 shadow-sm border-b border-slate-200/80">
                <div className="p-4 max-w-screen-2xl mx-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <AtticaMark tone="dark" />
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                            <button className="px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-100 font-semibold">Questions?</button>
                            <button className="px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-100 font-semibold">Save & exit</button>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Select Talent for Your Event</h1>
                        <p className="text-sm text-slate-500">Home → Events → Step 3 → Artists</p>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200/80 flex flex-wrap gap-4 items-center bg-slate-50/60">
                    <div className="relative flex-grow"><FaSearch
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"/><input type="text"
                                                                                                   placeholder="Search artists..."
                                                                                                   className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-full bg-white shadow-sm"/>
                    </div>
                    <button
                        className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm hover:shadow">Genre <FaChevronDown
                        size={12}/></button>
                    <button
                        className="px-4 py-2 bg-white border border-slate-200 rounded-full flex items-center gap-2 shadow-sm hover:shadow">Region <FaChevronDown
                        size={12}/></button>
                </div>

                <div className="p-4 border-t border-slate-200/80 flex flex-wrap gap-3 items-center bg-white/70 backdrop-blur-sm">
                    {genres.map(genre => (
                        <button
                            key={genre}
                            onClick={() => setActiveGenre(genre)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeGenre === genre ? 'bg-pink-600 text-white shadow-sm shadow-pink-500/25' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            {genre}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredArtists.map(artist => (
                                <ArtistCard
                                    key={artist.id}
                                    artist={artist}
                                    onSelect={handleSelectArtist}
                                    onOpenModal={setModalArtist}
                                    isSelected={selectedIds.has(artist.id)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 xl:col-span-3">
                        <SelectedArtistsSidebar selected={selectedArtists} onRemove={handleSelectArtist} totalCost={totalCost} onBookAll={handleBookAll} />
                    </div>
                </div>
            </main>

            {modalArtist && <ArtistProfileModal artist={modalArtist} onClose={() => setModalArtist(null)} onSelect={handleSelectArtist} isSelected={selectedIds.has(modalArtist.id)} />}

            <footer className="fixed bottom-6 right-6 z-40">
                <button onClick={handleDone} className="px-8 py-4 bg-pink-600 text-white font-bold rounded-full shadow-2xl hover:bg-pink-700 disabled:bg-gray-400 transform hover:scale-105 transition-transform">Done</button>
            </footer>
        </div>
    );
}
