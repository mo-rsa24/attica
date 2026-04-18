import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import useAxios from './utils/useAxios';

const STEPS = {
    ARTIST: ['Basics', 'Bio & Genres', 'Availability', 'Done'],
    SERVICE_PROVIDER: ['Basics', 'Your Service', 'Pricing', 'Done'],
    VENUE_MANAGER: ['Basics', 'Venue Details', 'Capacity', 'Done'],
    EVENT_ORGANIZER: ['Basics', 'Preferences', 'Done'],
    DEFAULT: ['Basics', 'Done'],
};

function ProgressBar({ current, total }) {
    return (
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-8">
            <div
                className="bg-slate-900 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((current + 1) / total) * 100}%` }}
            />
        </div>
    );
}

function BasicsStep({ form, setForm }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Welcome! Let's set up your profile</h2>
            <p className="text-slate-500 text-sm">A complete profile helps others find and connect with you.</p>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First name</label>
                <input
                    type="text"
                    value={form.first_name}
                    onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                    placeholder="Your first name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last name</label>
                <input
                    type="text"
                    value={form.last_name}
                    onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                    placeholder="Your last name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Profile photo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setForm(p => ({ ...p, profile_picture: e.target.files?.[0] || null }))}
                    className="block text-sm text-slate-600 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-slate-800"
                />
            </div>
        </div>
    );
}

function ArtistBioStep({ form, setForm }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Tell us about your artistry</h2>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
                <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Describe your style, influences, and what you offer…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Genres (comma-separated)</label>
                <input
                    type="text"
                    value={form.genres}
                    onChange={e => setForm(p => ({ ...p, genres: e.target.value }))}
                    placeholder="Afrobeats, Jazz, House…"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
            </div>
        </div>
    );
}

function ServiceBioStep({ form, setForm }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Describe your service</h2>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service description</label>
                <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="What do you offer? What makes you stand out?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
            </div>
        </div>
    );
}

function VenueBioStep({ form, setForm }) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Tell us about your venue</h2>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Venue description</label>
                <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Describe the space, amenities, and type of events you host…"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                />
            </div>
        </div>
    );
}

function OrganizerPreferencesStep({ form, setForm }) {
    const EVENT_TYPES = ['Music', 'Corporate', 'Wedding', 'Festival', 'Sports', 'Food & Drink', 'Art', 'Other'];
    const toggleType = (type) => {
        setForm(p => ({
            ...p,
            preferred_event_types: p.preferred_event_types.includes(type)
                ? p.preferred_event_types.filter(t => t !== type)
                : [...p.preferred_event_types, type],
        }));
    };
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">What kinds of events do you organize?</h2>
            <p className="text-slate-500 text-sm">Select all that apply.</p>
            <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map(type => (
                    <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                            form.preferred_event_types.includes(type)
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>
    );
}

function DoneStep({ role }) {
    const roleDestinations = {
        ARTIST: { label: 'Go to your dashboard', path: '/provider-dashboard' },
        SERVICE_PROVIDER: { label: 'Go to your dashboard', path: '/provider-dashboard' },
        VENUE_MANAGER: { label: 'Go to your dashboard', path: '/provider-dashboard' },
        EVENT_ORGANIZER: { label: 'Create your first event', path: '/createEvent' },
    };
    const dest = roleDestinations[role] || { label: 'Explore Attica', path: '/' };

    return (
        <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-slate-900">You're all set!</h2>
            <p className="text-slate-500 text-sm">Your profile is ready. Start exploring Attica.</p>
            <a
                href={dest.path}
                className="inline-block mt-4 px-8 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
            >
                {dest.label}
            </a>
        </div>
    );
}

export default function OnboardingPage() {
    const { user } = useAuth();
    const api = useAxios();
    const navigate = useNavigate();
    const activeRole = user?.roles?.[0] || 'DEFAULT';

    const steps = STEPS[activeRole] || STEPS.DEFAULT;
    const [step, setStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        profile_picture: null,
        bio: '',
        genres: '',
        preferred_event_types: [],
    });

    const isLastStep = step === steps.length - 1;

    const renderStep = () => {
        const stepLabel = steps[step];
        if (stepLabel === 'Done') return <DoneStep role={activeRole} />;
        if (stepLabel === 'Basics') return <BasicsStep form={form} setForm={setForm} />;
        if (stepLabel === 'Bio & Genres') return <ArtistBioStep form={form} setForm={setForm} />;
        if (stepLabel === 'Your Service') return <ServiceBioStep form={form} setForm={setForm} />;
        if (stepLabel === 'Venue Details') return <VenueBioStep form={form} setForm={setForm} />;
        if (stepLabel === 'Preferences') return <OrganizerPreferencesStep form={form} setForm={setForm} />;
        return null;
    };

    const handleNext = async () => {
        setError('');
        const nextStep = step + 1;

        // On the Basics step, save basic profile info
        if (steps[step] === 'Basics') {
            setIsSaving(true);
            try {
                const formData = new FormData();
                if (form.first_name) formData.append('first_name', form.first_name);
                if (form.last_name) formData.append('last_name', form.last_name);
                if (form.profile_picture) formData.append('profile_picture', form.profile_picture);
                await api.put('/api/accounts/profile/', formData);
            } catch {
                setError('Failed to save. Please try again.');
                setIsSaving(false);
                return;
            }
            setIsSaving(false);
        }

        if (nextStep < steps.length) {
            setStep(nextStep);
        }
    };

    const handleSkip = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
            <div className="w-full max-w-lg">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Step {step + 1} of {steps.length}
                        </p>
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
                        >
                            Skip for now
                        </button>
                    </div>

                    <ProgressBar current={step} total={steps.length} />

                    {renderStep()}

                    {error && (
                        <div className="mt-4 text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-3">{error}</div>
                    )}

                    {!isLastStep && (
                        <div className="mt-8 flex items-center justify-between">
                            {step > 0 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep(s => s - 1)}
                                    className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                                >
                                    ← Back
                                </button>
                            ) : <span />}
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isSaving}
                                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-60 transition-colors"
                            >
                                {isSaving ? 'Saving…' : steps[step + 1] === 'Done' ? 'Finish' : 'Next →'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
