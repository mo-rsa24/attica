import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Calendar, CheckCircle2, MapPin, Sparkles, Users, X} from 'lucide-react';
import {useEventCreation} from './context/reactContext.jsx';
import {useAuth} from './AuthContext';
import {schedulingApi} from './api/schedulingApi.js';

const SectionCard = ({title, icon, children, action}) => (
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

const Pill = ({label}) => (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
        {label}
    </span>
);

const STATUS_CONFIG = {
    approved: {label: 'Confirmed', color: 'bg-green-100 text-green-700'},
    pending: {label: 'Pending', color: 'bg-amber-100 text-amber-700'},
    counter_proposed: {label: 'Counter', color: 'bg-blue-100 text-blue-700'},
    declined: {label: 'Declined', color: 'bg-red-100 text-red-700'},
    withdrawn: {label: 'Withdrawn', color: 'bg-gray-100 text-gray-500'},
    expired: {label: 'Expired', color: 'bg-gray-100 text-gray-400'},
};

function ReadinessModal({requests, onConfirm, onClose, isPublishing}) {
    const byStatus = useMemo(() => {
        const groups = {approved: [], pending: [], counter_proposed: [], other: []};
        (requests || []).forEach((r) => {
            if (r.status === 'approved') groups.approved.push(r);
            else if (r.status === 'pending') groups.pending.push(r);
            else if (r.status === 'counter_proposed') groups.counter_proposed.push(r);
            else groups.other.push(r);
        });
        return groups;
    }, [requests]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Ready to publish?</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5"/></button>
                </div>
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                    <p className="text-sm text-gray-600">
                        Publishing makes your event visible. You can continue booking providers even after publishing — ticket sale revenue can be used to pay them.
                    </p>

                    {requests.length === 0 && (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                            No booking requests sent yet. You can add providers after publishing.
                        </div>
                    )}

                    {byStatus.approved.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Confirmed</p>
                            <ul className="space-y-1">
                                {byStatus.approved.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between text-sm bg-green-50 rounded-lg px-3 py-2">
                                        <span className="font-medium">{r.resource_display_name || `Request #${r.id}`}</span>
                                        <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">Confirmed</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {byStatus.pending.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Awaiting response</p>
                            <ul className="space-y-1">
                                {byStatus.pending.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between text-sm bg-amber-50 rounded-lg px-3 py-2">
                                        <span className="font-medium">{r.resource_display_name || `Request #${r.id}`}</span>
                                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Pending</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {byStatus.counter_proposed.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Counter proposals</p>
                            <ul className="space-y-1">
                                {byStatus.counter_proposed.map((r) => (
                                    <li key={r.id} className="flex items-center justify-between text-sm bg-blue-50 rounded-lg px-3 py-2">
                                        <span className="font-medium">{r.resource_display_name || `Request #${r.id}`}</span>
                                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">Counter</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Go back
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPublishing}
                        className="flex-1 rounded-xl bg-black text-white py-2.5 text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
                    >
                        {isPublishing ? 'Publishing…' : 'Publish now'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ListingReview() {
    const navigate = useNavigate();
    const {eventId} = useParams();
    const {tokens} = useAuth();
    const listingBase = eventId ? `/listing/${eventId}` : '/createEvent';
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState(null);
    const [eventStatus, setEventStatus] = useState(null);
    const [reviewDetails, setReviewDetails] = useState({});
    const [showReadinessModal, setShowReadinessModal] = useState(false);
    const [bookingRequests, setBookingRequests] = useState([]);
    const {
        selectedLocations = [],
        selectedArtists = [],
        selectedVendors = [],
        eventDetails,
        setCurrentStep,
        publish,
        loadEvent,
        data,
        event,
        getStepData,
    } = useEventCreation();

    useEffect(() => {
        setCurrentStep('review');
    }, [setCurrentStep]);

    useEffect(() => {
        setReviewDetails(eventDetails || {});
    }, [eventDetails]);

    useEffect(() => {
        const hydrate = async () => {
            if (!eventId) return;
            const draft = await loadEvent(eventId);
            if (draft) {
                setEventStatus({
                    status: draft.status,
                    published_at: draft.published_at,
                    updated_at: draft.updated_at,
                    created_at: draft.created_at,
                });
                if (draft.data) {
                    setReviewDetails((current) => (
                        Object.keys(current || {}).length ? current : draft.data
                    ));
                }
            }
        };
        hydrate();
    }, [eventId, loadEvent]);

    const safeDetails = useMemo(() => {
        if (reviewDetails && typeof reviewDetails === 'object' && !Array.isArray(reviewDetails)) return reviewDetails;
        const fallback = data?.steps?.step1;
        return fallback && typeof fallback === 'object' ? fallback : {};
    }, [data?.steps, reviewDetails]);

    const statusLabel = useMemo(() => {
        const source = eventStatus || event;
        if (!source) return null;
        const label = source.status === 'published' ? 'Published' : 'Draft';
        const ts = source.published_at || source.updated_at || source.created_at;
        return { label, timestamp: ts };
    }, [event, eventStatus]);

    const features = useMemo(() => {
        const fromContext = getStepData('step7', {})?.features;
        if (Array.isArray(fromContext)) return fromContext;
        const fromDraft = event?.data?.steps?.step7?.features;
        if (Array.isArray(fromDraft)) return fromDraft;
        return [];
    }, [event?.data?.steps, getStepData]);

    const mediaAssets = useMemo(
        () => (Array.isArray(event?.assets) ? event.assets.filter((asset) => asset.asset_type === 'media') : []),
        [event?.assets],
    );
    const seatingChartAsset = useMemo(
        () => (Array.isArray(event?.assets) ? event.assets.find((asset) => asset.asset_type === 'seating_chart') || null : null),
        [event?.assets],
    );

    const stats = [
        {label: 'Venues', value: selectedLocations.length},
        {label: 'Artists', value: selectedArtists.length},
        {label: 'Vendors', value: selectedVendors.length},
        {label: 'Features', value: features.length},
        {label: 'Media', value: mediaAssets.length},
    ];

    const handlePublishClick = async () => {
        if (!eventId) {
            setError('Missing event id.');
            return;
        }
        // Fetch current booking requests for readiness check
        try {
            const data = await schedulingApi.getRequests(tokens?.access, {event_draft_id: eventId});
            setBookingRequests(data?.results || data || []);
        } catch {
            setBookingRequests([]);
        }
        setShowReadinessModal(true);
    };

    const handlePublish = async () => {
        setIsPublishing(true);
        setError(null);
        const ok = await publish(eventId);
        if (ok) {
            setShowReadinessModal(false);
            const refreshed = await loadEvent(eventId);
            if (refreshed) {
                setEventStatus({
                    status: refreshed.status,
                    published_at: refreshed.published_at,
                    updated_at: refreshed.updated_at,
                    created_at: refreshed.created_at,
                });
            }
        } else {
            setError('Unable to publish right now.');
        }
        setIsPublishing(false);
    };

        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900">
                {showReadinessModal && (
                    <ReadinessModal
                        requests={bookingRequests}
                        onConfirm={handlePublish}
                        onClose={() => setShowReadinessModal(false)}
                        isPublishing={isPublishing}
                    />
                )}
                <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200">
                    <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-10 w-10 rounded-xl bg-pink-600 text-white flex items-center justify-center text-lg font-bold">A
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Review & Publish</p>
                                <h1 className="text-xl font-bold text-gray-900">Confirm your event details</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {statusLabel && (
                                <div
                                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-800">
                                <span
                                    className={statusLabel.label === 'Published' ? 'text-green-600' : 'text-amber-600'}>
                                    {statusLabel.label}
                                </span>
                                    {statusLabel.timestamp && (
                                        <span className="text-gray-500">
                                        {new Date(statusLabel.timestamp).toLocaleString()}
                                    </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {stats.map((stat) => (
                            <div key={stat.label}
                                 className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100 p-4 text-center">
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <SectionCard
                                title="Event basics"
                                icon={<Calendar className="h-5 w-5"/>}
                                action={<Pill label="From steps 1 & 2"/>}
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Title</p>
                                        <p className="font-semibold">{safeDetails.title || safeDetails.name || safeDetails.eventName || 'Pending details from Step 1'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date & time</p>
                                        <p className="font-semibold">{safeDetails.date || safeDetails.start_date || safeDetails.startDate || 'Add schedule in earlier steps'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Category</p>
                                        <p className="font-semibold">{safeDetails.category || safeDetails.selectedEventType || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Capacity</p>
                                        <p className="font-semibold">{safeDetails.capacity || safeDetails.guest_count || 'Not provided'}</p>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Location"
                                icon={<MapPin className="h-5 w-5"/>}
                                action={<Pill label="Step 4"/>}
                            >
                                {safeDetails.location ? (
                                    <div className="text-sm space-y-1">
                                        <p className="font-semibold">{safeDetails.location.address}</p>
                                        <p className="text-gray-500">Lat: {safeDetails.location.lat} •
                                            Lng: {safeDetails.location.lon}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No location selected yet.</p>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Team & partners"
                                icon={<Users className="h-5 w-5"/>}
                                action={<Pill label="Step 3"/>}
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
                                        <div key={item.id || item.name}
                                             className="rounded-lg bg-white ring-1 ring-gray-100 p-3 shadow-xs">
                                            <p className="font-semibold truncate">{item.name || item.title || 'Venue'}</p>
                                            <p className="text-gray-500 truncate">{item.address || item.location || 'No address'}</p>
                                        </div>
                                    ))}
                                    {selectedArtists.slice(0, 3).map((item) => (
                                        <div key={item.id || item.name}
                                             className="rounded-lg bg-white ring-1 ring-gray-100 p-3 shadow-xs">
                                            <p className="font-semibold truncate">{item.name || item.stage_name || 'Artist'}</p>
                                            <p className="text-gray-500 truncate">Booking
                                                fee: {item.booking_fee ? `R ${item.booking_fee}` : 'N/A'}</p>
                                        </div>
                                    ))}
                                    {selectedVendors.slice(0, 3).map((item) => (
                                        <div key={item.id || item.name}
                                             className="rounded-lg bg-white ring-1 ring-gray-100 p-3 shadow-xs">
                                            <p className="font-semibold truncate">{item.name || item.title || 'Vendor'}</p>
                                            <p className="text-gray-500 truncate">{item.price ? `R ${item.price}` : 'No price provided'}</p>
                                        </div>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard
                                title="Features & perks"
                                icon={<Sparkles className="h-5 w-5"/>}
                                action={<Pill label="Step 7"/>}
                            >
                                {features.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {features.map((feature) => (
                                            <Pill key={feature} label={feature}/>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">No features selected yet.</p>
                                )}
                            </SectionCard>

                            <SectionCard
                                title="Uploaded files"
                                icon={<CheckCircle2 className="h-5 w-5"/>}
                                action={<Pill label="Steps 5 & 8"/>}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-gray-500 mb-1">Media uploads</p>
                                        <p className="font-semibold">{mediaAssets.length} saved to draft</p>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <p className="text-gray-500 mb-1">Seating chart</p>
                                        <p className="font-semibold">{seatingChartAsset ? seatingChartAsset.name : 'Not uploaded'}</p>
                                    </div>
                                </div>
                                {mediaAssets.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {mediaAssets.slice(0, 6).map((asset) => (
                                            <Pill key={asset.id} label={asset.name}/>
                                        ))}
                                    </div>
                                )}
                            </SectionCard>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-10 w-10 rounded-full ${statusLabel?.label === 'Published' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center`}>
                                        <CheckCircle2 className="h-5 w-5"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{statusLabel?.label === 'Published' ? 'Live' : 'Ready to publish'}</p>
                                        <p className="text-lg font-semibold">Review complete</p>
                                    </div>
                                </div>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li>• Confirm your selections before creating your event.</li>
                                    <li>• You can return to any step to make changes even after publishing.</li>
                                    <li>• Uploaded files are saved to this draft, and your first images become the published poster and banner.</li>
                                </ul>
                                <button
                                    onClick={handlePublishClick}
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
                                {error && (
                                    <p className="text-sm text-rose-600 text-center">{error}</p>
                                )}
                                <p className="text-xs text-gray-500 text-center">Admins can view the live listing in the
                                    dashboard events table.</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }
