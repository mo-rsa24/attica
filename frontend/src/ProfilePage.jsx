import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { FaCamera, FaCheckCircle, FaUserCircle } from 'react-icons/fa';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const FEE_OPTION_LABELS = {
    fixed: 'Fixed fee per booking',
    range: 'Fee range (minimum to maximum)',
    negotiable: 'Negotiable pricing',
    quote_only: 'Quote only',
};
const PROFILE_ENDPOINTS = ['/api/accounts/profile/', '/accounts/api/profile/'];
const normalizeMediaUrl = (url) => {
    if (!url) return '';
    if (typeof url !== 'string') return '';
    if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    if (url.startsWith('/')) {
        return url;
    }
    return `/media/${url.replace(/^\/+/, '')}`;
};
const withCacheBust = (url) => {
    if (!url) return url;
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${Date.now()}`;
};

const roleToLabel = (role) => {
    if (!role) return '';
    return role
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const ProfilePage = () => {
    const { tokens, user, currentRole, setUser } = useAuth();
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        profile_picture: null,
    });
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewFailed, setPreviewFailed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [artistProfileId, setArtistProfileId] = useState(null);
    const [venueProfileId, setVenueProfileId] = useState(null);
    const [artistForm, setArtistForm] = useState({
        name: '',
        genres: '',
        contact_email: '',
        phone_number: '',
        instagram_handle: '',
        booking_fee_option: 'range',
        booking_fee: '',
        booking_fee_min: '',
        booking_fee_max: '',
        booking_notes: '',
        available_days: [],
        blackout_dates: '',
        availability_notes: '',
        tour_start_date: '',
        tour_end_date: '',
        general_ticket_price: '',
    });
    const [venueForm, setVenueForm] = useState({
        name: '',
        address: '',
        capacity: '',
        price: '',
        parking_info: '',
        is_wheelchair_accessible: false,
        is_indoor: true,
        is_outdoor: false,
        latitude: '',
        longitude: '',
    });
    const activeRole = currentRole || user?.roles?.[0] || '';
    const isArtistRole = activeRole === 'ARTIST' || user?.roles?.includes('ARTIST');
    const isVenueRole = activeRole === 'VENUE_MANAGER' || user?.roles?.includes('VENUE_MANAGER');
    const errorBannerRef = useRef(null);
    const accountSectionRef = useRef(null);
    const artistSectionRef = useRef(null);
    const artistNameRef = useRef(null);
    const bookingFeeRef = useRef(null);
    const bookingFeeMinRef = useRef(null);
    const bookingFeeMaxRef = useRef(null);
    const tourEndDateRef = useRef(null);
    const selectedImageObjectUrlRef = useRef(null);

    const initials = useMemo(() => {
        const first = profileData.first_name?.trim()?.[0] || '';
        const last = profileData.last_name?.trim()?.[0] || '';
        return `${first}${last}`.toUpperCase() || 'U';
    }, [profileData.first_name, profileData.last_name]);

    const setPreviewSource = (src) => {
        setPreviewFailed(false);
        setPreviewImage(src);
    };

    useEffect(() => {
        return () => {
            if (selectedImageObjectUrlRef.current) {
                URL.revokeObjectURL(selectedImageObjectUrlRef.current);
                selectedImageObjectUrlRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const fetchProfileWithFallback = async () => {
            let lastResponse = null;
            for (const endpoint of PROFILE_ENDPOINTS) {
                const res = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${tokens.access}`,
                    },
                });
                if (res.ok) return res;
                lastResponse = res;
                if (res.status !== 405) break;
            }
            return lastResponse;
        };

        const fetchProfile = async () => {
            if (!tokens?.access) {
                setError('You are not logged in.');
                setLoading(false);
                return;
            }
            try {
                const response = await fetchProfileWithFallback();
                if (!response.ok) {
                    throw new Error('Failed to fetch profile.');
                }

                const data = await response.json();
                const first_name = data?.first_name ?? data?.user?.first_name ?? '';
                const last_name = data?.last_name ?? data?.user?.last_name ?? '';
                const email = data?.email ?? data?.user?.email ?? '';
                const bio = data?.bio ?? '';
                const profile_picture =
                    data?.profile_picture ??
                    data?.user?.profile_picture ??
                    null;
                const normalizedPicture = normalizeMediaUrl(profile_picture);
                const bustedPicture = withCacheBust(normalizedPicture);

                setProfileData({ first_name, last_name, email, bio, profile_picture });
                setPreviewSource(bustedPicture);
                setUser((prev) => ({
                    // On fresh profile fetch, prefer persisted backend URL and avoid carrying stale blob URLs.
                    ...(prev || {}),
                    first_name: first_name || prev?.first_name || '',
                    last_name: last_name || prev?.last_name || '',
                    email: email || prev?.email || '',
                    profile_picture:
                        bustedPicture ||
                        (typeof prev?.profile_picture === 'string' && !prev.profile_picture.startsWith('blob:')
                            ? prev.profile_picture
                            : ''),
                }));

                if (isArtistRole && user?.id) {
                    const artistResponse = await fetch(`/api/artists/artists/?user=${user.id}`, {
                        headers: {
                            Authorization: `Bearer ${tokens.access}`,
                        },
                    });
                    if (artistResponse.ok) {
                        const payload = await artistResponse.json();
                        const artists = Array.isArray(payload) ? payload : payload?.results || [];
                        const existingArtist = artists[0];
                        if (existingArtist) {
                            const availability = existingArtist.availability && typeof existingArtist.availability === 'object'
                                ? existingArtist.availability
                                : {};
                            setArtistProfileId(existingArtist.id);
                            setArtistForm({
                                name: existingArtist.name || '',
                                genres: existingArtist.genres || '',
                                contact_email: existingArtist.contact_email || email || '',
                                phone_number: existingArtist.phone_number || '',
                                instagram_handle: existingArtist.instagram_handle || '',
                                booking_fee_option: availability.booking_fee_option || 'range',
                                booking_fee: existingArtist.booking_fee || '',
                                booking_fee_min: existingArtist.booking_fee_min || '',
                                booking_fee_max: existingArtist.booking_fee_max || '',
                                booking_notes: availability.booking_notes || '',
                                available_days: Array.isArray(availability.available_days) ? availability.available_days : [],
                                blackout_dates: Array.isArray(availability.blackout_dates) ? availability.blackout_dates.join(', ') : '',
                                availability_notes: availability.notes || '',
                                tour_start_date: existingArtist.tour_start_date || '',
                                tour_end_date: existingArtist.tour_end_date || '',
                                general_ticket_price: existingArtist.general_ticket_price || '',
                            });
                        } else {
                            setArtistForm((prev) => ({ ...prev, contact_email: email || '' }));
                        }
                    }
                }

                if (isVenueRole && user?.id) {
                    const venueResponse = await fetch(`/api/locations/locations/?owner=${user.id}`, {
                        headers: {
                            Authorization: `Bearer ${tokens.access}`,
                        },
                    });
                    if (venueResponse.ok) {
                        const payload = await venueResponse.json();
                        const venues = Array.isArray(payload) ? payload : payload?.results || [];
                        const existingVenue = venues[0];
                        if (existingVenue) {
                            setVenueProfileId(existingVenue.id);
                            setVenueForm({
                                name: existingVenue.name || '',
                                address: existingVenue.address || '',
                                capacity: existingVenue.capacity || '',
                                price: existingVenue.price || '',
                                parking_info: existingVenue.parking_info || '',
                                is_wheelchair_accessible: Boolean(existingVenue.is_wheelchair_accessible),
                                is_indoor: Boolean(existingVenue.is_indoor),
                                is_outdoor: Boolean(existingVenue.is_outdoor),
                                latitude: existingVenue.latitude || '',
                                longitude: existingVenue.longitude || '',
                            });
                        }
                    }
                }
            } catch (err) {
                setError('Failed to fetch profile. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [tokens, isArtistRole, isVenueRole, user?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (selectedImageObjectUrlRef.current) {
                URL.revokeObjectURL(selectedImageObjectUrlRef.current);
                selectedImageObjectUrlRef.current = null;
            }
            const objectUrl = URL.createObjectURL(file);
            selectedImageObjectUrlRef.current = objectUrl;
            setNewProfilePicture(file);
            setPreviewSource(objectUrl);
        }
    };

    const handleArtistChange = (e) => {
        const { name, value } = e.target;
        setArtistForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleVenueChange = (e) => {
        const { name, value, type, checked } = e.target;
        setVenueForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleDayToggle = (day) => {
        setArtistForm((prev) => ({
            ...prev,
            available_days: prev.available_days.includes(day)
                ? prev.available_days.filter((d) => d !== day)
                : [...prev.available_days, day],
        }));
    };

    const buildFormError = (message, field = null, section = 'artist') => {
        const err = new Error(message);
        err.field = field;
        err.section = section;
        return err;
    };

    const parseApiError = async (response, fallbackMessage, section = 'artist') => {
        let payload = null;
        try {
            payload = await response.json();
        } catch {
            return buildFormError(fallbackMessage, null, section);
        }

        if (payload?.detail) {
            return buildFormError(payload.detail, null, section);
        }

        if (payload && typeof payload === 'object') {
            const [firstKey, firstValue] = Object.entries(payload)[0] || [];
            if (Array.isArray(firstValue) && firstValue[0]) {
                return buildFormError(String(firstValue[0]), firstKey, section);
            }
            if (typeof firstValue === 'string') {
                return buildFormError(firstValue, firstKey, section);
            }
        }

        return buildFormError(fallbackMessage, null, section);
    };

    const animateAndScrollTo = useCallback((target) => {
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.animate(
            [
                { transform: 'translateX(0)', boxShadow: '0 0 0 rgba(244,63,94,0)' },
                { transform: 'translateX(-4px)', boxShadow: '0 0 0 4px rgba(244,63,94,0.18)' },
                { transform: 'translateX(4px)', boxShadow: '0 0 0 6px rgba(244,63,94,0.10)' },
                { transform: 'translateX(0)', boxShadow: '0 0 0 rgba(244,63,94,0)' },
            ],
            { duration: 520, easing: 'ease-out' }
        );
    }, []);

    const focusErrorTarget = useCallback((err, fallbackSection = 'account') => {
        const fieldMap = {
            name: artistNameRef.current,
            booking_fee: bookingFeeRef.current,
            booking_fee_min: bookingFeeMinRef.current,
            booking_fee_max: bookingFeeMaxRef.current,
            tour_end_date: tourEndDateRef.current,
        };
        const fieldTarget = err?.field ? fieldMap[err.field] : null;
        const sectionTarget = err?.section === 'artist' || fallbackSection === 'artist'
            ? artistSectionRef.current
            : accountSectionRef.current;
        const target = fieldTarget || sectionTarget || errorBannerRef.current;
        animateAndScrollTo(target);
    }, [animateAndScrollTo]);

    const saveArtistProfile = async () => {
        if (!tokens?.access) {
            throw new Error('Authentication token is missing.');
        }

        const pricingOption = artistForm.booking_fee_option;
        if (!artistForm.name.trim()) {
            throw buildFormError('Artist name is required for artist profile.', 'name');
        }
        if (pricingOption === 'fixed' && !artistForm.booking_fee) {
            throw buildFormError('Add a fixed booking fee.', 'booking_fee');
        }
        if (pricingOption === 'range' && (!artistForm.booking_fee_min || !artistForm.booking_fee_max)) {
            throw buildFormError('Add both minimum and maximum booking fee.', 'booking_fee_min');
        }
        if (
            artistForm.booking_fee_min &&
            artistForm.booking_fee_max &&
            Number(artistForm.booking_fee_min) > Number(artistForm.booking_fee_max)
        ) {
            throw buildFormError('Booking fee minimum cannot be greater than maximum.', 'booking_fee_min');
        }
        if (
            artistForm.tour_start_date &&
            artistForm.tour_end_date &&
            new Date(artistForm.tour_end_date) < new Date(artistForm.tour_start_date)
        ) {
            throw buildFormError('Tour end date must be on or after tour start date.', 'tour_end_date');
        }

        const artistPayload = new FormData();
        artistPayload.append('name', artistForm.name.trim());
        artistPayload.append('bio', profileData.bio || '');
        artistPayload.append('genres', artistForm.genres || '');
        artistPayload.append('contact_email', artistForm.contact_email || profileData.email || '');
        artistPayload.append('phone_number', artistForm.phone_number || '');
        artistPayload.append('instagram_handle', artistForm.instagram_handle || '');
        if (pricingOption === 'fixed') {
            if (artistForm.booking_fee) artistPayload.append('booking_fee', artistForm.booking_fee);
        } else if (pricingOption === 'range') {
            if (artistForm.booking_fee) artistPayload.append('booking_fee', artistForm.booking_fee);
            if (artistForm.booking_fee_min) artistPayload.append('booking_fee_min', artistForm.booking_fee_min);
            if (artistForm.booking_fee_max) artistPayload.append('booking_fee_max', artistForm.booking_fee_max);
        }
        if (artistForm.tour_start_date) artistPayload.append('tour_start_date', artistForm.tour_start_date);
        if (artistForm.tour_end_date) artistPayload.append('tour_end_date', artistForm.tour_end_date);
        if (artistForm.general_ticket_price) {
            artistPayload.append('general_ticket_price', artistForm.general_ticket_price);
        }
        artistPayload.append(
            'availability',
            JSON.stringify({
                booking_fee_option: artistForm.booking_fee_option,
                booking_notes: artistForm.booking_notes || '',
                available_days: artistForm.available_days || [],
                blackout_dates: artistForm.blackout_dates
                    .split(',')
                    .map((d) => d.trim())
                    .filter(Boolean),
                notes: artistForm.availability_notes || '',
            })
        );

        const artistUrl = artistProfileId
            ? `/api/artists/artists/${artistProfileId}/`
            : '/api/artists/artists/';
        const artistMethod = artistProfileId ? 'PATCH' : 'POST';

        const artistResponse = await fetch(artistUrl, {
            method: artistMethod,
            headers: {
                Authorization: `Bearer ${tokens.access}`,
            },
            body: artistPayload,
        });

        if (!artistResponse.ok) {
            throw await parseApiError(artistResponse, 'Failed to update artist profile settings.', 'artist');
        }

        if (!artistProfileId) {
            const created = await artistResponse.json();
            if (created?.id) {
                setArtistProfileId(created.id);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage('');
        setError('');

        if (!tokens?.access) {
            setError('Authentication token is missing.');
            return;
        }

        const formData = new FormData();
        formData.append(
            'user',
            JSON.stringify({
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                email: profileData.email,
            })
        );
        formData.append('bio', profileData.bio);

        const selectedObjectUrl = selectedImageObjectUrlRef.current;
        if (newProfilePicture) {
            formData.append('profile_picture', newProfilePicture);
        }

        try {
            const fetchProfileWithFallback = async (method = 'GET', body = undefined) => {
                let lastResponse = null;
                for (const endpoint of PROFILE_ENDPOINTS) {
                    const res = await fetch(endpoint, {
                        method,
                        headers: {
                            Authorization: `Bearer ${tokens.access}`,
                        },
                        body,
                    });
                    if (res.ok) return res;
                    lastResponse = res;
                    if (res.status !== 405) break;
                }
                return lastResponse;
            };

            let response = null;
            response = await fetchProfileWithFallback('PUT', formData);
            if (!response.ok) {
                throw new Error('Failed to update profile.');
            }

            // Read persisted state from the backend so avatar always reflects DB value.
            const freshProfileResponse = await fetchProfileWithFallback('GET');
            const data = freshProfileResponse?.ok ? await freshProfileResponse.json() : await response.json();
            const first_name = data?.first_name ?? data?.user?.first_name ?? profileData.first_name;
            const last_name = data?.last_name ?? data?.user?.last_name ?? profileData.last_name;
            const email = data?.email ?? data?.user?.email ?? profileData.email;
            const bio = data?.bio ?? profileData.bio;
            const profile_picture =
                data?.profile_picture ??
                data?.user?.profile_picture ??
                profileData.profile_picture ??
                null;
            const normalizedPicture = normalizeMediaUrl(profile_picture);
            const bustedPicture = withCacheBust(normalizedPicture);
            // Keep the freshly selected local image visible immediately after save.
            // This avoids a stale backend URL/caching race in the profile card and navbar.
            const nextDisplayPicture = newProfilePicture && selectedObjectUrl
                ? selectedObjectUrl
                : bustedPicture;
            // Persisted avatar source for global auth state/navbar should avoid blob URLs.
            const nextPersistedPicture =
                bustedPicture ||
                (typeof profileData.profile_picture === 'string' && !profileData.profile_picture.startsWith('blob:')
                    ? profileData.profile_picture
                    : '');

            setProfileData({ first_name, last_name, email, bio, profile_picture });
            setPreviewSource(nextDisplayPicture);
            setNewProfilePicture(null);
            if (selectedImageObjectUrlRef.current && !nextDisplayPicture?.startsWith('blob:')) {
                URL.revokeObjectURL(selectedImageObjectUrlRef.current);
                selectedImageObjectUrlRef.current = null;
            }
            setUser((prev) => ({
                ...(prev || {}),
                first_name,
                last_name,
                email,
                profile_picture:
                    nextPersistedPicture ||
                    (typeof prev?.profile_picture === 'string' && !prev.profile_picture.startsWith('blob:')
                        ? prev.profile_picture
                        : ''),
            }));

            setSuccessMessage('Profile updated successfully.');
        } catch (err) {
            setError(err.message);
            console.error(err);
            focusErrorTarget(err, 'account');
        }
    };

    const handleSaveArtistOnly = async () => {
        setSuccessMessage('');
        setError('');
        try {
            await saveArtistProfile();
            setSuccessMessage('Gig & Booking Profile saved successfully.');
        } catch (err) {
            setError(err.message);
            console.error(err);
            focusErrorTarget(err, 'artist');
        }
    };

    const saveVenueProfile = async () => {
        if (!tokens?.access) {
            throw new Error('Authentication token is missing.');
        }
        const parsedCapacity = Number(venueForm.capacity);
        const parsedPrice = venueForm.price === '' ? 0 : Number(venueForm.price);
        const parsedLatitude = venueForm.latitude === '' ? null : Number(venueForm.latitude);
        const parsedLongitude = venueForm.longitude === '' ? null : Number(venueForm.longitude);

        if (!venueForm.name.trim()) {
            throw new Error('Venue name is required.');
        }
        if (!venueForm.address.trim()) {
            throw new Error('Venue address is required.');
        }
        if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0) {
            throw new Error('Venue capacity must be greater than 0.');
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            throw new Error('Venue price cannot be negative.');
        }
        if (parsedLatitude !== null && !Number.isFinite(parsedLatitude)) {
            throw new Error('Venue latitude must be a valid number.');
        }
        if (parsedLongitude !== null && !Number.isFinite(parsedLongitude)) {
            throw new Error('Venue longitude must be a valid number.');
        }

        const payload = {
            name: venueForm.name.trim(),
            address: venueForm.address.trim(),
            capacity: parsedCapacity,
            price: parsedPrice,
            parking_info: venueForm.parking_info || '',
            is_wheelchair_accessible: Boolean(venueForm.is_wheelchair_accessible),
            is_indoor: Boolean(venueForm.is_indoor),
            is_outdoor: Boolean(venueForm.is_outdoor),
        };
        if (parsedLatitude !== null) payload.latitude = parsedLatitude;
        if (parsedLongitude !== null) payload.longitude = parsedLongitude;

        const venueUrl = venueProfileId
            ? `/api/locations/locations/${venueProfileId}/`
            : '/api/locations/locations/';
        const venueMethod = venueProfileId ? 'PATCH' : 'POST';

        const response = await fetch(venueUrl, {
            method: venueMethod,
            headers: {
                Authorization: `Bearer ${tokens.access}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const err = await parseApiError(response, 'Failed to update venue defaults.', 'venue');
            throw err;
        }

        if (!venueProfileId) {
            const created = await response.json();
            if (created?.id) setVenueProfileId(created.id);
        }
    };

    const handleSaveVenueOnly = async () => {
        setSuccessMessage('');
        setError('');
        try {
            await saveVenueProfile();
            setSuccessMessage('Venue defaults saved successfully.');
        } catch (err) {
            setError(err.message);
            console.error(err);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-stone-100 p-8 text-center text-gray-600">Loading profile...</div>;
    }
    if (error && !profileData.email) {
        return <div className="min-h-screen bg-stone-100 p-8 text-center text-red-600">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-stone-100 px-4 py-8 md:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">Account</p>
                            <h1 className="mt-2 text-3xl font-semibold text-gray-900">Edit Profile</h1>
                            <p className="mt-1 text-sm text-gray-600">Keep your details polished for better trust and faster bookings.</p>
                        </div>
                        {activeRole && (
                            <span className="inline-flex items-center self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 md:self-auto">
                                Logged in as {roleToLabel(activeRole)}
                            </span>
                        )}
                    </div>
                </div>

                {error && (
                    <div ref={errorBannerRef} className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        <FaCheckCircle className="h-4 w-4" />
                        <span>{successMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <section ref={accountSectionRef} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Profile Photo</h2>
                        <div className="mt-6 flex flex-col items-center">
                            <div className="relative">
                                {previewImage && !previewFailed ? (
                                    <img
                                        key={previewImage}
                                        src={previewImage}
                                        alt="Profile"
                                        className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-md"
                                        onError={() => setPreviewFailed(true)}
                                    />
                                ) : (
                                    <div className="flex h-36 w-36 items-center justify-center rounded-full bg-amber-100 text-4xl font-bold text-amber-700 shadow-md">
                                        {initials}
                                    </div>
                                )}
                                <label
                                    htmlFor="profile_picture"
                                    className="absolute -bottom-1 -right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white bg-gray-900 text-white shadow-md transition hover:scale-105"
                                    title="Change picture"
                                >
                                    <FaCamera className="h-4 w-4" />
                                </label>
                            </div>

                            <input
                                type="file"
                                id="profile_picture"
                                name="profile_picture"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <p className="mt-4 text-center text-sm text-gray-500">
                                Use a clear portrait for quicker recognition in chats and listings.
                            </p>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 text-gray-800">
                            <FaUserCircle className="h-5 w-5 text-amber-700" />
                            <h2 className="text-lg font-semibold">Personal Details</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">First Name</span>
                                <input
                                    type="text"
                                    name="first_name"
                                    id="first_name"
                                    value={profileData.first_name}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-gray-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                                />
                            </label>

                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Last Name</span>
                                <input
                                    type="text"
                                    name="last_name"
                                    id="last_name"
                                    value={profileData.last_name}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-gray-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                                />
                            </label>
                        </div>

                        <label className="mt-5 block">
                            <span className="text-sm font-medium text-gray-700">Email Address</span>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={profileData.email}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-gray-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                            />
                        </label>

                        <label className="mt-5 block">
                            <span className="text-sm font-medium text-gray-700">Bio</span>
                            <textarea
                                name="bio"
                                id="bio"
                                rows="5"
                                value={profileData.bio || ''}
                                onChange={handleChange}
                                placeholder="Share a short intro about what you do."
                                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-gray-800 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100"
                            />
                        </label>

                        <div className="mt-8 flex justify-end">
                            <button
                                type="submit"
                                className="rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Save changes
                            </button>
                        </div>
                    </section>

                    {isArtistRole && (
                        <section ref={artistSectionRef} className="rounded-3xl border border-rose-200 bg-gradient-to-br from-white via-rose-50/40 to-amber-50/40 p-6 shadow-sm lg:col-span-2">
                            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Artist Defaults</p>
                                    <h2 className="text-xl font-semibold text-gray-900">Gig & Booking Profile</h2>
                                    <p className="text-sm text-gray-600">Set consistent details used across your gig guides and booking requests.</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200">
                                    Reusable profile settings
                                </span>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Artist / Stage Name</span>
                                    <input
                                        ref={artistNameRef}
                                        type="text"
                                        name="name"
                                        value={artistForm.name}
                                        onChange={handleArtistChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        placeholder="e.g. Blxckie"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Genres</span>
                                    <input
                                        type="text"
                                        name="genres"
                                        value={artistForm.genres}
                                        onChange={handleArtistChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        placeholder="Amapiano, Hip Hop, Afro Pop"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Artist Contact Email</span>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={artistForm.contact_email}
                                        onChange={handleArtistChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Phone Number</span>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={artistForm.phone_number}
                                        onChange={handleArtistChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                    />
                                </label>
                                <label className="block md:col-span-2">
                                    <span className="text-sm font-medium text-gray-700">Instagram Handle</span>
                                    <input
                                        type="text"
                                        name="instagram_handle"
                                        value={artistForm.instagram_handle}
                                        onChange={handleArtistChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        placeholder="@yourhandle"
                                    />
                                </label>
                            </div>

                            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Booking Fee Options</h3>
                                <div className="mt-3 grid gap-2 md:grid-cols-2">
                                    {Object.entries(FEE_OPTION_LABELS).map(([value, label]) => (
                                        <label key={value} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="booking_fee_option"
                                                value={value}
                                                checked={artistForm.booking_fee_option === value}
                                                onChange={handleArtistChange}
                                                className="accent-rose-500"
                                            />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Default Fee (ZAR)</span>
                                        <input
                                            ref={bookingFeeRef}
                                            type="number"
                                            name="booking_fee"
                                            value={artistForm.booking_fee}
                                            onChange={handleArtistChange}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Min Fee (ZAR)</span>
                                        <input
                                            ref={bookingFeeMinRef}
                                            type="number"
                                            name="booking_fee_min"
                                            value={artistForm.booking_fee_min}
                                            onChange={handleArtistChange}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="text-sm font-medium text-gray-700">Max Fee (ZAR)</span>
                                        <input
                                            ref={bookingFeeMaxRef}
                                            type="number"
                                            name="booking_fee_max"
                                            value={artistForm.booking_fee_max}
                                            onChange={handleArtistChange}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        />
                                    </label>
                                </div>

                                <label className="mt-4 block">
                                    <span className="text-sm font-medium text-gray-700">Pricing Notes</span>
                                    <textarea
                                        name="booking_notes"
                                        rows="3"
                                        value={artistForm.booking_notes}
                                        onChange={handleArtistChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                        placeholder="Travel, accommodation, set duration, etc."
                                    />
                                </label>
                            </div>

                            <div className="mt-6 grid gap-6 md:grid-cols-2">
                                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Availability</h3>
                                    <p className="mt-1 text-xs text-gray-500">Choose your recurring available days.</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {DAYS.map((day) => {
                                            const active = artistForm.available_days.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => handleDayToggle(day)}
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                                        active
                                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                            : 'bg-stone-100 text-gray-600 border border-stone-200 hover:bg-stone-200'
                                                    }`}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <label className="mt-4 block">
                                        <span className="text-sm font-medium text-gray-700">Blackout Dates</span>
                                        <input
                                            type="text"
                                            name="blackout_dates"
                                            value={artistForm.blackout_dates}
                                            onChange={handleArtistChange}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                            placeholder="2026-03-20, 2026-03-21"
                                        />
                                    </label>
                                    <label className="mt-4 block">
                                        <span className="text-sm font-medium text-gray-700">Availability Notes</span>
                                        <textarea
                                            name="availability_notes"
                                            rows="3"
                                            value={artistForm.availability_notes}
                                            onChange={handleArtistChange}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                            placeholder="Preferred set times, off days, travel limits, etc."
                                        />
                                    </label>
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-white p-5">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Gig Guide Defaults</h3>
                                    <p className="mt-1 text-xs text-gray-500">Reusable default values for upcoming tours.</p>
                                    <div className="mt-3 grid gap-4">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">Tour Start Date</span>
                                            <input
                                                type="date"
                                                name="tour_start_date"
                                                value={artistForm.tour_start_date}
                                                onChange={handleArtistChange}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">Tour End Date</span>
                                            <input
                                                ref={tourEndDateRef}
                                                type="date"
                                                name="tour_end_date"
                                                value={artistForm.tour_end_date}
                                                onChange={handleArtistChange}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">General Ticket Price (ZAR)</span>
                                            <input
                                                type="number"
                                                name="general_ticket_price"
                                                value={artistForm.general_ticket_price}
                                                onChange={handleArtistChange}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveArtistOnly}
                                    className="rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                                >
                                    Save Gig & Booking Profile
                                </button>
                            </div>
                        </section>
                    )}

                    {isVenueRole && (
                        <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/40 to-cyan-50/40 p-6 shadow-sm lg:col-span-2">
                            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Venue Defaults</p>
                                    <h2 className="text-xl font-semibold text-gray-900">Venue Profile Settings</h2>
                                    <p className="text-sm text-gray-600">Set reusable venue defaults for faster listings and bookings.</p>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Venue Name</span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={venueForm.name}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Address</span>
                                    <input
                                        type="text"
                                        name="address"
                                        value={venueForm.address}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Capacity</span>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={venueForm.capacity}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Base Price (ZAR)</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={venueForm.price}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                                <label className="block md:col-span-2">
                                    <span className="text-sm font-medium text-gray-700">Parking Info</span>
                                    <input
                                        type="text"
                                        name="parking_info"
                                        value={venueForm.parking_info}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                        placeholder="On-site parking for 80 cars"
                                    />
                                </label>
                            </div>

                            <div className="mt-6 grid gap-3 md:grid-cols-3">
                                <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="is_wheelchair_accessible"
                                        checked={venueForm.is_wheelchair_accessible}
                                        onChange={handleVenueChange}
                                        className="accent-sky-500"
                                    />
                                    Wheelchair Accessible
                                </label>
                                <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="is_indoor"
                                        checked={venueForm.is_indoor}
                                        onChange={handleVenueChange}
                                        className="accent-sky-500"
                                    />
                                    Indoor Venue
                                </label>
                                <label className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        name="is_outdoor"
                                        checked={venueForm.is_outdoor}
                                        onChange={handleVenueChange}
                                        className="accent-sky-500"
                                    />
                                    Outdoor Venue
                                </label>
                            </div>

                            <div className="mt-5 grid gap-5 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Latitude (optional)</span>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        name="latitude"
                                        value={venueForm.latitude}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Longitude (optional)</span>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        name="longitude"
                                        value={venueForm.longitude}
                                        onChange={handleVenueChange}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                                    />
                                </label>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleSaveVenueOnly}
                                    className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                                >
                                    Save Venue Defaults
                                </button>
                            </div>
                        </section>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
