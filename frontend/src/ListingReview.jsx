import React, {useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, CheckCircle2, Image, MapPin, Sparkles, UploadCloud, Users, Video } from 'lucide-react';
import { useEventCreation } from './context/reactContext.jsx';

const SectionCard = ({ title, icon, children, action }) => (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {action}
        </div>
        {children}
    </div>
);

const Pill = ({ label }) => (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
        {label}
    </span>
);

export default function ListingReview() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const api = useAxios();
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const { selectedLocations = [], selectedArtists = [], selectedVendors = [], eventDetails, setCurrentStep } = useEventCreation();

    useEffect(() => {
        setCurrentStep('review');
    }, [setCurrentStep]);

    const safeDetails = useMemo(() => {
        if (eventDetails && typeof eventDetails === 'object' && !Array.isArray(eventDetails)) return eventDetails;
        return {};
    }, [eventDetails]);

    const statusLabel = useMemo(() => {
        if (!eventStatus) return null;
        const label = eventStatus.status === 'published' ? 'Published' : 'Draft';
        const ts = eventStatus.published_at || eventStatus.updated_at || eventStatus.created_at;
        return { label, timestamp: ts };
    }, [eventStatus]);

    const loadEvent = async () => {
        if (!eventId) return;
        try {
            const { data } = await api.get(`/api/events/events/${eventId}/`);
            setEventDetails(data);
            setEventStatus({ status: data.status, published_at: data.published_at, updated_at: data.updated_at, created_at: data.created_at });
        } catch (e) {
            console.error('Failed to load event', e);
        }
    };

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    const features = useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem('listingStep7Selections') || '[]');
        } catch {
            return [];
        }
    }, []);

    const uploads = useMemo(() => {
        try {
            return JSON.parse(sessionStorage.getItem('listingStep8Uploads') || '[]');
        } catch {
            return [];
        }
    }, []);

    const stats = [
        { label: 'Venues', value: selectedLocations.length },
        { label: 'Artists', value: selectedArtists.length },
        { label: 'Vendors', value: selectedVendors.length },
        { label: 'Features', value: features.length },
        { label: 'Uploads', value: uploads.length },
    ];

    const handlePublish = async () => {
        if (!eventId) {
            setError('Missing event id.');
            return;
        }
        setIsPublishing(true);
        setError(null);
        try {
            const { data } = await api.post(`/api/events/events/${eventId}/publish/`);
            setEventStatus({ status: data.status, published_at: data.published_at, updated_at: data.updated_at, created_at: data.created_at });
        } catch (e) {
            setError('Unable to publish right now.');
        } finally {
            setIsPublishing(false);
        }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900">
            <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-pink-600 text-white flex items-center justify-center text-lg font-bold">A</div>
                        <div>
                            <p className="text-sm text-gray-500">Review & Publish</p>
                            <h1 className="text-xl font-bold text-gray-900">Confirm your event details</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {statusLabel && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-800">
                                <span className={statusLabel.label === 'Published' ? 'text-green-600' : 'text-amber-600'}>
                                    {statusLabel.label}
                                </span>
                                {statusLabel.timestamp && (
                                    <span className="text-gray-500">
                                        {new Date(statusLabel.timestamp).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/listing/step8')}
                            className="text-sm font-semibold text-gray-700 hover:text-gray-900 underline"
                        >
                            Edit uploads
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4 text-center">
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <SectionCard
                            title="Event basics"
                            icon={<Calendar className="h-5 w-5" />}
                            action={<Pill label="From steps 1 & 2" />}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Title</p>
                                    <p className="font-semibold">{safeDetails.title || 'Pending details from Step 1'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Date & time</p>
                                    <p className="font-semibold">{safeDetails.date || 'Add schedule in earlier steps'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Category</p>
                                    <p className="font-semibold">{safeDetails.category || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Capacity</p>
                                    <p className="font-semibold">{safeDetails.capacity || 'Not provided'}</p>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Location"
                            icon={<MapPin className="h-5 w-5" />}
                            action={<Pill label="Step 4" />}
                        >
                            {safeDetails.location ? (
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold">{safeDetails.location.address}</p>
                                    <p className="text-gray-500">Lat: {safeDetails.location.lat} • Lng: {safeDetails.location.lon}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No location selected yet.</p>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Team & partners"
                            icon={<Users className="h-5 w-5" />}
                            action={<Pill label="Step 3" />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500 mb-1">Venues</p>
                                    <p className="font-semibold">{selectedLocations.length} selected</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500 mb-1">Artists</p>
                                    <p className="font-semibold">{selectedArtists.length} selected</p>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-3">
                                    <p className="text-gray-500 mb-1">Vendors</p>
                                    <p className="font-semibold">{selectedVendors.length} selected</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                {selectedLocations.slice(0, 3).map((item) => (
                                    <div key={item.id || item.name} className="rounded-lg bg-white ring-1 ring-gray-100 p-3 shadow-xs">
                                        <p className="font-semibold truncate">{item.name || item.title || 'Venue'}</p>
                                        <p className="text-gray-500 truncate">{item.address || item.location || 'No address'}</p>
                                    </div>
                                ))}
                                {selectedArtists.slice(0, 3).map((item) => (
                                    <div key={item.id || item.name} className="rounded-lg bg-white ring-1 ring-gray-100 p-3 shadow-xs">
                                        <p className="font-semibold truncate">{item.name || item.stage_name || 'Artist'}</p>
                                        <p className="text-gray-500 truncate">Booking fee: {item.booking_fee ? `R ${item.booking_fee}` : 'N/A'}</p>
                                    </div>
                                ))}
                                {selectedVendors.slice(0, 3).map((item) => (
                                    <div key={item.id || item.name} className="rounded-lg bg-white ring-1 ring-gray-100 p-3 shadow-xs">
                                        <p className="font-semibold truncate">{item.name || item.title || 'Vendor'}</p>
                                        <p className="text-gray-500 truncate">{item.price ? `R ${item.price}` : 'No price provided'}</p>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>

                        <SectionCard
                            title="Features & perks"
                            icon={<Sparkles className="h-5 w-5" />}
                            action={<Pill label="Step 7" />}
                        >
                            {features.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {features.map((feature) => (
                                        <Pill key={feature} label={feature} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No features selected yet.</p>
                            )}
                        </SectionCard>

                        <SectionCard
                            title="Uploads"
                            icon={<UploadCloud className="h-5 w-5" />}
                            action={<Pill label="Step 8" />}
                        >
                            {uploads.length ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {uploads.map((file) => (
                                        <div key={file.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                                            <div className="h-12 w-12 rounded-lg bg-white shadow-sm ring-1 ring-gray-100 flex items-center justify-center text-gray-600">
                                                {file.type?.startsWith('video') || file.isVideo ? <Video className="h-5 w-5" /> : <Image className="h-5 w-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{file.type || 'Media'} • {file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : 'Size unavailable'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No media uploaded yet.</p>
                            )}
                        </SectionCard>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full ${statusLabel?.label === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center`}>
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">{statusLabel?.label === 'Published' ? 'Live' : 'Ready to publish'}</p>
                                    <p className="text-lg font-semibold">Review complete</p>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>• Confirm your selections before creating your event.</li>
                                <li>• You can return to any step to make changes even after publishing.</li>
                                <li>• Media uploads will be finalized when you publish.</li>
                            </ul>
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="w-full rounded-xl bg-black text-white py-3 font-semibold shadow-sm transition hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isPublishing ? 'Publishing…' : statusLabel?.label === 'Published' ? 'Republish' : 'Publish listing'}
                            </button>
                            <button
                                onClick={() => navigate(`${listingBase}/step6`)}
                                className="w-full rounded-xl border border-gray-200 text-gray-800 py-3 font-semibold transition hover:bg-gray-50"
                            >
                                Back to pricing (Step 6)
                            </button>
                             <p className="text-xs text-gray-500 text-center">Admins can view the live listing in the dashboard events table.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}