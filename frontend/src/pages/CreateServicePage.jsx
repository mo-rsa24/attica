import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, MenuItem, FormControl, InputLabel, Select, Chip, Box, Typography, OutlinedInput } from '@mui/material';
import CreateWizardStepper from '../components/create/CreateWizardStepper';
import useAxios from '../utils/useAxios';

export default function CreateServicePage() {
    const navigate = useNavigate();
    const api = useAxios();
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [amenities, setAmenities] = useState([]);

    const [form, setForm] = useState({
        name: '',
        category: '',
        description: '',
        price: '',
        number_of_guests: '',
        max_capacity: '',
        location_tags: 'JHB',
        available_timeslots: '',
        image: null,
        amenities: [],
    });

    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        api.get('/api/vendors/categories/').then(res => setCategories(res.data)).catch(() => {});
        // Amenities are nested under vendors — fetch if available
        api.get('/api/vendors/vendors/1/amenities/').then(res => setAmenities(res.data)).catch(() => {});
    }, []);

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
            const data = new FormData();
            data.append('name', form.name);
            data.append('category', form.category);
            data.append('description', form.description);
            data.append('price', form.price);
            data.append('number_of_guests', form.number_of_guests);
            data.append('max_capacity', form.max_capacity || 100);
            data.append('location_tags', form.location_tags);
            data.append('available_timeslots', form.available_timeslots);
            if (form.image) data.append('image', form.image);
            form.amenities.forEach(id => data.append('amenities', id));

            await api.post('/api/vendors/services/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            navigate('/dashboard/service');
        } catch (error) {
            console.error('Failed to create service:', error);
            const responseData = error?.response?.data;
            let message = 'Failed to create service. Please check all required fields.';

            if (typeof responseData === 'string') {
                message = responseData;
            } else if (responseData?.detail) {
                message = responseData.detail;
            } else if (responseData?.vendor?.[0]) {
                message = responseData.vendor[0];
            } else if (responseData && typeof responseData === 'object') {
                const firstValue = Object.values(responseData)[0];
                if (Array.isArray(firstValue) && firstValue[0]) {
                    message = String(firstValue[0]);
                }
            }

            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const steps = [
        {
            label: 'Service Info',
            content: (
                <div className="space-y-5">
                    <Typography variant="h6" fontWeight={600}>Tell us about your service</Typography>
                    <TextField
                        fullWidth label="Service Name" required
                        value={form.name} onChange={e => updateField('name', e.target.value)}
                    />
                    <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={form.category} label="Category"
                            onChange={e => updateField('category', e.target.value)}
                        >
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth label="Description" multiline rows={4}
                        value={form.description} onChange={e => updateField('description', e.target.value)}
                    />
                </div>
            ),
        },
        {
            label: 'Pricing & Capacity',
            content: (
                <div className="space-y-5">
                    <Typography variant="h6" fontWeight={600}>Pricing and capacity details</Typography>
                    <TextField
                        fullWidth label="Price (ZAR)" type="number" required
                        value={form.price} onChange={e => updateField('price', e.target.value)}
                    />
                    <TextField
                        fullWidth label="Number of Guests" type="number" required
                        value={form.number_of_guests} onChange={e => updateField('number_of_guests', e.target.value)}
                    />
                    <TextField
                        fullWidth label="Max Capacity" type="number"
                        value={form.max_capacity} onChange={e => updateField('max_capacity', e.target.value)}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Location</InputLabel>
                        <Select
                            value={form.location_tags} label="Location"
                            onChange={e => updateField('location_tags', e.target.value)}
                        >
                            <MenuItem value="JHB">Johannesburg</MenuItem>
                            <MenuItem value="CPT">Cape Town</MenuItem>
                            <MenuItem value="PTA">Pretoria</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth label="Available Timeslots"
                        helperText="Comma-separated, e.g. 10:00-12:00,13:00-15:00"
                        value={form.available_timeslots}
                        onChange={e => updateField('available_timeslots', e.target.value)}
                    />
                </div>
            ),
        },
        {
            label: 'Media',
            content: (
                <div className="space-y-5">
                    <Typography variant="h6" fontWeight={600}>Add photos and amenities</Typography>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Image *</label>
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-2xl" />
                            ) : (
                                <div className="text-center">
                                    <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                    </svg>
                                    <p className="text-sm text-gray-500">Click to upload an image</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                    </div>

                    {amenities.length > 0 && (
                        <FormControl fullWidth>
                            <InputLabel>Amenities</InputLabel>
                            <Select
                                multiple value={form.amenities} label="Amenities"
                                onChange={e => updateField('amenities', e.target.value)}
                                input={<OutlinedInput label="Amenities" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map(id => {
                                            const am = amenities.find(a => a.id === id);
                                            return <Chip key={id} label={am?.name || id} size="small" />;
                                        })}
                                    </Box>
                                )}
                            >
                                {amenities.map(am => (
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
                    <Typography variant="h6" fontWeight={600}>Review your service listing</Typography>
                    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                        <ReviewRow label="Name" value={form.name} />
                        <ReviewRow label="Category" value={categories.find(c => c.id === form.category)?.name} />
                        <ReviewRow label="Description" value={form.description} />
                        <ReviewRow label="Price" value={form.price ? `R${form.price}` : ''} />
                        <ReviewRow label="Guests" value={form.number_of_guests} />
                        <ReviewRow label="Max Capacity" value={form.max_capacity} />
                        <ReviewRow label="Location" value={form.location_tags} />
                        <ReviewRow label="Timeslots" value={form.available_timeslots} />
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

    return <CreateWizardStepper title="Add a New Service" steps={steps} onSubmit={handleSubmit} submitting={submitting} />;
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
