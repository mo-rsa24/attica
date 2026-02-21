import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import CreateWizardStepper from '../components/create/CreateWizardStepper';
import useAxios from '../utils/useAxios';
import { useAuth } from '../AuthContext';

const SA_CITIES = [
    'Johannesburg',
    'Cape Town',
    'Durban',
    'Pretoria',
    'Bloemfontein',
    'Port Elizabeth',
    'Polokwane',
    'Nelspruit',
    'Kimberley',
    'Pietermaritzburg',
];

const SA_CLUBS = [
    'Zone 6 (Soweto)',
    'Konka (Soweto)',
    'Coco (Cape Town)',
    'Shimmy Beach Club (Cape Town)',
    'Taboo (Sandton)',
    'Carfax (Johannesburg)',
    'Origin (Durban)',
    'Tiger Tiger (Durban)',
    'Rockets (Bryanston)',
    'Truth (Midrand)',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FEE_OPTION_LABELS = {
    fixed: 'Fixed fee per booking',
    range: 'Fee range (min to max)',
    negotiable: 'Negotiable pricing',
    quote_only: 'Quote-only (no public fee)',
};

const defaultForm = {
    name: '',
    bio: '',
    genres: '',
    profile_image: null,
    booking_fee: '',
    booking_fee_min: '',
    booking_fee_max: '',
    booking_fee_option: 'range',
    booking_notes: '',
    contact_email: '',
    phone_number: '',
    instagram_handle: '',
    available_days: [],
    blackout_dates: '',
    availability_notes: '',
    tour_start_date: '',
    tour_end_date: '',
    tour_cities: [],
    tour_clubs: [],
    general_ticket_price: '',
};

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const hasValue = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && String(value).trim());
};

const SectionCard = ({ title, subtitle, children }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <Typography variant="h6" fontWeight={700}>{title}</Typography>
        {subtitle ? <p className="text-sm text-gray-500 mt-1 mb-4">{subtitle}</p> : null}
        <div className="space-y-4">{children}</div>
    </div>
);

export default function CreateArtistPage() {
    const navigate = useNavigate();
    const api = useAxios();
    const { user } = useAuth();

    const [submitting, setSubmitting] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [showAllQuestions, setShowAllQuestions] = useState(false);
    const [existingArtistId, setExistingArtistId] = useState(null);
    const [prefilled, setPrefilled] = useState({});

    const [form, setForm] = useState(defaultForm);
    const [imagePreview, setImagePreview] = useState(null);

    const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
    const shouldAsk = useCallback((field) => showAllQuestions || !hasValue(prefilled[field]), [showAllQuestions, prefilled]);

    useEffect(() => {
        let mounted = true;

        const loadPrefill = async () => {
            if (!user?.id) {
                setLoadingInitial(false);
                return;
            }

            try {
                const response = await api.get(`/api/artists/artists/?user=${user.id}`);
                const payload = response?.data;
                const artists = Array.isArray(payload) ? payload : payload?.results || [];
                const existing = artists[0];

                const nextForm = { ...defaultForm, contact_email: user.email || '' };
                const nextPrefilled = { contact_email: user.email || '' };

                if (existing) {
                    const availability = existing.availability && typeof existing.availability === 'object'
                        ? existing.availability
                        : {};

                    setExistingArtistId(existing.id);
                    Object.assign(nextForm, {
                        name: existing.name || '',
                        bio: existing.bio || '',
                        genres: existing.genres || '',
                        booking_fee: existing.booking_fee || '',
                        booking_fee_min: existing.booking_fee_min || '',
                        booking_fee_max: existing.booking_fee_max || '',
                        booking_fee_option: availability.booking_fee_option || 'range',
                        booking_notes: availability.booking_notes || '',
                        contact_email: existing.contact_email || nextForm.contact_email,
                        phone_number: existing.phone_number || '',
                        instagram_handle: existing.instagram_handle || '',
                        available_days: asArray(availability.available_days),
                        blackout_dates: asArray(availability.blackout_dates).join(', '),
                        availability_notes: availability.notes || '',
                        tour_start_date: existing.tour_start_date || '',
                        tour_end_date: existing.tour_end_date || '',
                        tour_cities: asArray(existing.tour_cities),
                        tour_clubs: asArray(existing.tour_clubs),
                        general_ticket_price: existing.general_ticket_price || '',
                    });

                    Object.assign(nextPrefilled, {
                        ...nextForm,
                        profile_image: existing.profile_image || '',
                    });

                    if (existing.profile_image) setImagePreview(existing.profile_image);
                }

                if (mounted) {
                    setForm(nextForm);
                    setPrefilled(nextPrefilled);
                }
            } catch (error) {
                console.error('Failed to preload artist profile:', error);
            } finally {
                if (mounted) setLoadingInitial(false);
            }
        };

        loadPrefill();
        return () => {
            mounted = false;
        };
    }, [api, user?.email, user?.id]);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        updateField('profile_image', file);
        setImagePreview(URL.createObjectURL(file));
    }, []);

    const validatePricing = () => {
        if (form.booking_fee_option === 'fixed' && !hasValue(form.booking_fee)) {
            return 'For fixed pricing, provide your booking fee.';
        }
        if (form.booking_fee_option === 'range' && (!hasValue(form.booking_fee_min) || !hasValue(form.booking_fee_max))) {
            return 'For fee range pricing, provide both minimum and maximum fee.';
        }
        if (hasValue(form.booking_fee_min) && hasValue(form.booking_fee_max) && Number(form.booking_fee_min) > Number(form.booking_fee_max)) {
            return 'Booking fee minimum cannot be greater than maximum.';
        }
        return null;
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            alert('Artist / Stage Name is required.');
            return;
        }

        const pricingError = validatePricing();
        if (pricingError) {
            alert(pricingError);
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('name', form.name.trim());
            data.append('bio', form.bio);
            data.append('genres', form.genres);
            if (form.profile_image) data.append('profile_image', form.profile_image);
            if (hasValue(form.booking_fee)) data.append('booking_fee', form.booking_fee);
            if (hasValue(form.booking_fee_min)) data.append('booking_fee_min', form.booking_fee_min);
            if (hasValue(form.booking_fee_max)) data.append('booking_fee_max', form.booking_fee_max);
            data.append('contact_email', form.contact_email);
            data.append('phone_number', form.phone_number);
            data.append('instagram_handle', form.instagram_handle);

            const blackoutDates = form.blackout_dates
                .split(',')
                .map((x) => x.trim())
                .filter(Boolean);

            data.append(
                'availability',
                JSON.stringify({
                    booking_fee_option: form.booking_fee_option,
                    booking_notes: form.booking_notes,
                    available_days: form.available_days,
                    blackout_dates: blackoutDates,
                    notes: form.availability_notes,
                }),
            );

            if (hasValue(form.tour_start_date)) data.append('tour_start_date', form.tour_start_date);
            if (hasValue(form.tour_end_date)) data.append('tour_end_date', form.tour_end_date);
            data.append('tour_cities', JSON.stringify(form.tour_cities));
            data.append('tour_clubs', JSON.stringify(form.tour_clubs));
            if (hasValue(form.general_ticket_price)) data.append('general_ticket_price', form.general_ticket_price);

            if (existingArtistId) {
                await api.patch(`/api/artists/artists/${existingArtistId}/`, data);
            } else {
                await api.post('/api/artists/artists/', data);
            }

            navigate('/dashboard/artist');
        } catch (error) {
            console.error('Failed to save artist profile:', error);
            const responseData = error?.response?.data;
            let message = 'Failed to save artist profile. Please review your details and try again.';

            if (responseData?.detail) {
                message = responseData.detail;
            } else if (responseData && typeof responseData === 'object') {
                const [firstKey, firstValue] = Object.entries(responseData)[0] || [];
                if (Array.isArray(firstValue) && firstValue[0]) {
                    message = firstKey ? `${firstKey}: ${String(firstValue[0])}` : String(firstValue[0]);
                }
            }
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const fieldsToShow = useMemo(
        () => ({
            basics: ['name', 'bio', 'genres', 'contact_email', 'phone_number', 'instagram_handle'].some(shouldAsk),
            media: shouldAsk('profile_image'),
            pricing: ['booking_fee_option', 'booking_fee', 'booking_fee_min', 'booking_fee_max', 'booking_notes'].some(shouldAsk),
            availability: ['available_days', 'blackout_dates', 'availability_notes'].some(shouldAsk),
            tour: ['tour_start_date', 'tour_end_date', 'tour_cities', 'tour_clubs', 'general_ticket_price'].some(shouldAsk),
        }),
        [shouldAsk],
    );

    const stepContent = useMemo(() => {
        const steps = [];

        if (fieldsToShow.basics) {
            steps.push({
                label: 'Identity',
                content: (
                    <SectionCard title="Artist Identity" subtitle="Core details shown across profile, guides, and bookings.">
                        {shouldAsk('name') && <TextField fullWidth label="Artist / Stage Name" required value={form.name} onChange={(e) => updateField('name', e.target.value)} />}
                        {shouldAsk('bio') && <TextField fullWidth label="Bio" multiline rows={4} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} />}
                        {shouldAsk('genres') && <TextField fullWidth label="Genres" helperText="Comma-separated" value={form.genres} onChange={(e) => updateField('genres', e.target.value)} />}
                        {shouldAsk('contact_email') && <TextField fullWidth label="Contact Email" type="email" value={form.contact_email} onChange={(e) => updateField('contact_email', e.target.value)} />}
                        {shouldAsk('phone_number') && <TextField fullWidth label="Phone Number" value={form.phone_number} onChange={(e) => updateField('phone_number', e.target.value)} />}
                        {shouldAsk('instagram_handle') && <TextField fullWidth label="Instagram Handle" placeholder="@yourhandle" value={form.instagram_handle} onChange={(e) => updateField('instagram_handle', e.target.value)} />}
                    </SectionCard>
                ),
            });
        }

        if (fieldsToShow.media) {
            steps.push({
                label: 'Branding',
                content: (
                    <SectionCard title="Profile Branding" subtitle="A recognizable image improves trust and booking conversion.">
                        <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                        <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-rose-400 hover:bg-rose-50/60 transition-colors overflow-hidden">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <p className="text-sm text-gray-500">Click to upload image</p>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </SectionCard>
                ),
            });
        }

        if (fieldsToShow.pricing) {
            steps.push({
                label: 'Booking Terms',
                content: (
                    <SectionCard title="Booking Terms" subtitle="Set your pricing logic once and reuse it consistently.">
                        {shouldAsk('booking_fee_option') && (
                            <FormControl>
                                <Typography variant="body2" className="mb-2 text-gray-600">Booking Fee Option</Typography>
                                <RadioGroup
                                    value={form.booking_fee_option}
                                    onChange={(e) => updateField('booking_fee_option', e.target.value)}
                                >
                                    {Object.entries(FEE_OPTION_LABELS).map(([value, label]) => (
                                        <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        )}

                        {(form.booking_fee_option === 'fixed' || form.booking_fee_option === 'range' || shouldAsk('booking_fee')) && (
                            <TextField fullWidth label="Default Booking Fee (ZAR)" type="number" value={form.booking_fee} onChange={(e) => updateField('booking_fee', e.target.value)} />
                        )}
                        {(form.booking_fee_option === 'range' || shouldAsk('booking_fee_min')) && (
                            <TextField fullWidth label="Booking Fee Min (ZAR)" type="number" value={form.booking_fee_min} onChange={(e) => updateField('booking_fee_min', e.target.value)} />
                        )}
                        {(form.booking_fee_option === 'range' || shouldAsk('booking_fee_max')) && (
                            <TextField fullWidth label="Booking Fee Max (ZAR)" type="number" value={form.booking_fee_max} onChange={(e) => updateField('booking_fee_max', e.target.value)} />
                        )}
                        {shouldAsk('booking_notes') && (
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Pricing Notes"
                                placeholder="Example: Travel and accommodation billed separately for out-of-province shows."
                                value={form.booking_notes}
                                onChange={(e) => updateField('booking_notes', e.target.value)}
                            />
                        )}
                    </SectionCard>
                ),
            });
        }

        if (fieldsToShow.availability) {
            steps.push({
                label: 'Availability',
                content: (
                    <SectionCard title="Availability" subtitle="Set your recurring availability for booking requests.">
                        {shouldAsk('available_days') && (
                            <TextField
                                select
                                fullWidth
                                label="Available Days"
                                value={form.available_days}
                                onChange={(e) => updateField('available_days', e.target.value)}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((day) => <Chip key={day} label={day} size="small" />)}
                                        </Box>
                                    ),
                                }}
                            >
                                {DAYS.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                            </TextField>
                        )}
                        {shouldAsk('blackout_dates') && (
                            <TextField
                                fullWidth
                                label="Blackout Dates"
                                helperText="Comma-separated, e.g. 2026-03-21, 2026-03-22"
                                value={form.blackout_dates}
                                onChange={(e) => updateField('blackout_dates', e.target.value)}
                            />
                        )}
                        {shouldAsk('availability_notes') && (
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Availability Notes"
                                placeholder="Example: Late-night sets available only on Fridays and Saturdays."
                                value={form.availability_notes}
                                onChange={(e) => updateField('availability_notes', e.target.value)}
                            />
                        )}
                    </SectionCard>
                ),
            });
        }

        if (fieldsToShow.tour) {
            steps.push({
                label: 'Gig Guide',
                content: (
                    <SectionCard title="Tour Defaults" subtitle="These defaults can be reused when publishing gig guides.">
                        {shouldAsk('tour_start_date') && <TextField fullWidth label="Tour Start Date" type="date" value={form.tour_start_date} onChange={(e) => updateField('tour_start_date', e.target.value)} InputLabelProps={{ shrink: true }} />}
                        {shouldAsk('tour_end_date') && <TextField fullWidth label="Tour End Date" type="date" value={form.tour_end_date} onChange={(e) => updateField('tour_end_date', e.target.value)} InputLabelProps={{ shrink: true }} />}
                        {shouldAsk('tour_cities') && (
                            <TextField
                                select
                                fullWidth
                                label="Tour Cities (South Africa)"
                                value={form.tour_cities}
                                onChange={(e) => updateField('tour_cities', e.target.value)}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                                        </Box>
                                    ),
                                }}
                            >
                                {SA_CITIES.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                            </TextField>
                        )}
                        {shouldAsk('tour_clubs') && (
                            <TextField
                                select
                                fullWidth
                                label="Tour Clubs (South Africa)"
                                value={form.tour_clubs}
                                onChange={(e) => updateField('tour_clubs', e.target.value)}
                                SelectProps={{
                                    multiple: true,
                                    renderValue: (selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                                        </Box>
                                    ),
                                }}
                            >
                                {SA_CLUBS.map((club) => <MenuItem key={club} value={club}>{club}</MenuItem>)}
                            </TextField>
                        )}
                        {shouldAsk('general_ticket_price') && (
                            <TextField fullWidth label="General Ticket Price (ZAR)" type="number" value={form.general_ticket_price} onChange={(e) => updateField('general_ticket_price', e.target.value)} />
                        )}
                    </SectionCard>
                ),
            });
        }

        steps.push({
            label: 'Review',
            content: (
                <SectionCard title="Review" subtitle="Confirm your profile defaults before saving.">
                    <ReviewRow label="Artist Name" value={form.name} />
                    <ReviewRow label="Genres" value={form.genres} />
                    <ReviewRow label="Fee Option" value={FEE_OPTION_LABELS[form.booking_fee_option]} />
                    <ReviewRow label="Default Fee" value={form.booking_fee ? `R${form.booking_fee}` : ''} />
                    <ReviewRow label="Fee Range" value={form.booking_fee_min || form.booking_fee_max ? `R${form.booking_fee_min || '-'} to R${form.booking_fee_max || '-'}` : ''} />
                    <ReviewRow label="Available Days" value={form.available_days.join(', ')} />
                    <ReviewRow label="Tour Dates" value={form.tour_start_date || form.tour_end_date ? `${form.tour_start_date || '?'} to ${form.tour_end_date || '?'}` : ''} />
                    <ReviewRow label="Tour Cities" value={form.tour_cities.join(', ')} />
                    <ReviewRow label="Tour Clubs" value={form.tour_clubs.join(', ')} />
                    <ReviewRow label="General Ticket Price" value={form.general_ticket_price ? `R${form.general_ticket_price}` : ''} />
                </SectionCard>
            ),
        });

        return steps;
    }, [fieldsToShow, form, imagePreview, shouldAsk, handleImageChange]);

    if (loadingInitial) {
        return (
            <div className="min-h-screen grid place-items-center bg-gray-50">
                <CircularProgress />
            </div>
        );
    }

    const title = existingArtistId ? 'Artist Profile Studio' : 'Create Artist Profile Studio';

    return (
        <CreateWizardStepper
            title={title}
            steps={stepContent}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel={existingArtistId ? 'Save Profile' : 'Create Profile'}
            submittingLabel="Saving profile..."
            topContent={(
                <div className="space-y-3">
                    <Alert severity="info">
                        Smart mode hides questions already answered in your profile. Toggle it off to edit everything.
                    </Alert>
                    <FormControlLabel
                        control={<Switch checked={showAllQuestions} onChange={(e) => setShowAllQuestions(e.target.checked)} />}
                        label="Show all profile questions"
                    />
                </div>
            )}
        />
    );
}

function ReviewRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start py-1 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="text-sm text-gray-900 text-right max-w-xs">{value}</span>
        </div>
    );
}
