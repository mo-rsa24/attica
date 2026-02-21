import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Typography, FormControlLabel, Switch, Chip, Box, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from '@mui/material';
import CreateWizardStepper from '../components/create/CreateWizardStepper';
import useAxios from '../utils/useAxios';
import { useAuth } from '../AuthContext';

export default function CreateVenuePage() {
    const navigate = useNavigate();
    const api = useAxios();
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [availableAmenities, setAvailableAmenities] = useState([]);

    const [form, setForm] = useState({
        name: '',
        address: '',
        capacity: '',
        price: '',
        image: null,
        parking_info: '',
        is_wheelchair_accessible: false,
        is_indoor: true,
        is_outdoor: false,
        amenities: [],
        latitude: '',
        longitude: '',
    });

    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        const loadVenueDefaults = async () => {
            if (!user?.id) return;
            try {
                const response = await api.get(`/api/locations/locations/?owner=${user.id}`);
                const payload = response?.data;
                const venues = Array.isArray(payload) ? payload : payload?.results || [];
                const defaults = venues[0];
                if (!defaults) return;

                setForm(prev => ({
                    ...prev,
                    name: defaults.name || '',
                    address: defaults.address || '',
                    capacity: defaults.capacity != null ? String(defaults.capacity) : '',
                    price: defaults.price != null ? String(defaults.price) : '',
                    parking_info: defaults.parking_info || '',
                    is_wheelchair_accessible: Boolean(defaults.is_wheelchair_accessible),
                    is_indoor: Boolean(defaults.is_indoor),
                    is_outdoor: Boolean(defaults.is_outdoor),
                    latitude: defaults.latitude != null ? String(defaults.latitude) : '',
                    longitude: defaults.longitude != null ? String(defaults.longitude) : '',
                    amenities: Array.isArray(defaults.amenities)
                        ? defaults.amenities
                            .map(a => (typeof a === 'object' ? a.id : a))
                            .filter(Boolean)
                        : [],
                }));
            } catch (error) {
                console.error('Failed to load venue defaults:', error);
            }
        };

        loadVenueDefaults();
    }, [api, user?.id]);

    const updateField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            updateField('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const trimmedPrice = String(form.price ?? '').trim();
            const trimmedLatitude = String(form.latitude ?? '').trim();
            const trimmedLongitude = String(form.longitude ?? '').trim();
            const parsedPrice = trimmedPrice === '' ? 0 : Number(trimmedPrice);
            const parsedLatitude = trimmedLatitude === '' ? null : Number(trimmedLatitude);
            const parsedLongitude = trimmedLongitude === '' ? null : Number(trimmedLongitude);

            if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
                alert('Price must be a valid non-negative number.');
                return;
            }
            if (parsedLatitude !== null && !Number.isFinite(parsedLatitude)) {
                alert('Latitude must be a valid number.');
                return;
            }
            if (parsedLongitude !== null && !Number.isFinite(parsedLongitude)) {
                alert('Longitude must be a valid number.');
                return;
            }

            const data = new FormData();
            data.append('name', form.name);
            data.append('address', form.address);
            data.append('capacity', form.capacity);
            data.append('price', String(parsedPrice));
            if (form.image) data.append('image', form.image);
            data.append('parking_info', form.parking_info);
            data.append('is_wheelchair_accessible', form.is_wheelchair_accessible);
            data.append('is_indoor', form.is_indoor);
            data.append('is_outdoor', form.is_outdoor);
            if (parsedLatitude !== null) data.append('latitude', String(parsedLatitude));
            if (parsedLongitude !== null) data.append('longitude', String(parsedLongitude));
            form.amenities.forEach(id => data.append('amenities', id));

            await api.post('/api/locations/locations/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/dashboard/venue');
        } catch (error) {
            console.error('Failed to create venue:', error);
            alert('Failed to create venue. Please check all required fields.');
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        {
            label: 'Venue Info',
            content: (
                <div className="space-y-5">
                    <Typography variant="h6" fontWeight={600}>Basic venue details</Typography>
                    <TextField
                        fullWidth label="Venue Name" required
                        value={form.name} onChange={e => updateField('name', e.target.value)}
                    />
                    <TextField
                        fullWidth label="Address" required
                        placeholder="e.g. 123 Main Street, Sandton, Johannesburg"
                        value={form.address} onChange={e => updateField('address', e.target.value)}
                    />
                    <TextField
                        fullWidth label="Capacity" type="number" required
                        helperText="Maximum number of guests the venue can hold"
                        value={form.capacity} onChange={e => updateField('capacity', e.target.value)}
                    />
                    <TextField
                        fullWidth label="Price per day (ZAR)" type="number"
                        value={form.price} onChange={e => updateField('price', e.target.value)}
                    />
                </div>
            ),
        },
        {
            label: 'Media',
            content: (
                <div className="space-y-5">
                    <Typography variant="h6" fontWeight={600}>Upload venue images</Typography>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Main Image</label>
                        <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                            ) : (
                                <div className="text-center">
                                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v8.942a3.019 3.019 0 002.093 2.876l.684.228a3 3 0 001.446 0l.684-.228A3.019 3.019 0 0010.75 11.942V3M3.75 21h7m4.5-18v8.942a3.019 3.019 0 002.093 2.876l.684.228a3 3 0 001.446 0l.684-.228A3.019 3.019 0 0020.25 11.942V3M14.25 21h7M3.75 3h16.5" />
                                    </svg>
                                    <p className="text-sm text-gray-500">Click to upload a venue photo</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            fullWidth label="Latitude" type="number"
                            inputProps={{ step: "0.000001" }}
                            value={form.latitude} onChange={e => updateField('latitude', e.target.value)}
                        />
                        <TextField
                            fullWidth label="Longitude" type="number"
                            inputProps={{ step: "0.000001" }}
                            value={form.longitude} onChange={e => updateField('longitude', e.target.value)}
                        />
                    </div>
                </div>
            ),
        },
        {
            label: 'Amenities',
            content: (
                <div className="space-y-5">
                    <Typography variant="h6" fontWeight={600}>Features and accessibility</Typography>

                    <TextField
                        fullWidth label="Parking Info"
                        placeholder="e.g. On-site parking for 50 cars"
                        value={form.parking_info} onChange={e => updateField('parking_info', e.target.value)}
                    />

                    <div className="space-y-2">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.is_wheelchair_accessible}
                                    onChange={e => updateField('is_wheelchair_accessible', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Wheelchair Accessible"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.is_indoor}
                                    onChange={e => updateField('is_indoor', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Indoor"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.is_outdoor}
                                    onChange={e => updateField('is_outdoor', e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Outdoor"
                        />
                    </div>

                    {availableAmenities.length > 0 && (
                        <FormControl fullWidth>
                            <InputLabel>Amenities</InputLabel>
                            <Select
                                multiple value={form.amenities} label="Amenities"
                                onChange={e => updateField('amenities', e.target.value)}
                                input={<OutlinedInput label="Amenities" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map(id => {
                                            const am = availableAmenities.find(a => a.id === id);
                                            return <Chip key={id} label={am?.name || id} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {availableAmenities.map(am => (
                                    <MenuItem key={am.id} value={am.id}>{am.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </div>
            ),
        },
        {
            label: 'Review',
            content: (
                <div className="space-y-4">
                    <Typography variant="h6" fontWeight={600}>Review your venue listing</Typography>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <ReviewRow label="Name" value={form.name} />
                        <ReviewRow label="Address" value={form.address} />
                        <ReviewRow label="Capacity" value={form.capacity} />
                        <ReviewRow label="Price" value={form.price ? `R${form.price}/day` : ''} />
                        <ReviewRow label="Parking" value={form.parking_info} />
                        <ReviewRow label="Wheelchair Accessible" value={form.is_wheelchair_accessible ? 'Yes' : 'No'} />
                        <ReviewRow label="Indoor" value={form.is_indoor ? 'Yes' : 'No'} />
                        <ReviewRow label="Outdoor" value={form.is_outdoor ? 'Yes' : 'No'} />
                        {form.latitude && form.longitude && (
                            <ReviewRow label="Coordinates" value={`${form.latitude}, ${form.longitude}`} />
                        )}
                        {imagePreview && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Image</span>
                                <img src={imagePreview} alt="Preview" className="mt-1 h-32 w-48 object-cover rounded-lg" />
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
    ];

    return <CreateWizardStepper title="Add a New Venue" steps={steps} onSubmit={handleSubmit} submitting={submitting} />;
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
