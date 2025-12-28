import React, { useEffect, useMemo, useState } from 'react';
import { FaBolt, FaMapMarkerAlt, FaTags } from 'react-icons/fa';
import ServiceCard from './ServiceCard.jsx';

const CITY_COORDINATES = {
    JHB: { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
    CPT: { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
    PTA: { name: 'Pretoria', lat: -25.7479, lng: 28.2293 },
};

const SortPill = ({ isActive, label, description, onClick, icon }) => {
    const IconComponent = icon;
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-full border transition ${
                isActive
                    ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-pink-300'
            }`}
        >
            <div className={`p-2 rounded-full ${isActive ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-600'}`}>
                <IconComponent />
            </div>
            <div className="text-left">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </button>
    );
};

const ServiceCardSkeleton = () => (
    <div className="animate-pulse bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="h-44 bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
    </div>
);

const SORT_OPTIONS = {
    popular: {
        label: 'Most Popular',
        description: 'Vendors trending with top ratings',
        icon: FaBolt,
    },
    closest: {
        label: 'Closest',
        description: 'Vendors nearest to your city',
        icon: FaMapMarkerAlt,
    },
    category: {
        label: 'By Category',
        description: 'Group by service specialty',
        icon: FaTags,
    },
};

const haversineDistanceKm = (a, b) => {
    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
    return R * c;
};

const inferNearestCityTag = coords => {
    if (!coords) return null;
    let closestTag = null;
    let minDistance = Number.POSITIVE_INFINITY;
    Object.entries(CITY_COORDINATES).forEach(([tag, cityCoords]) => {
        const distance = haversineDistanceKm(coords, cityCoords);
        if (distance < minDistance) {
            minDistance = distance;
            closestTag = tag;
        }
    });
    return closestTag;
};

const sortServices = (items, sortKey, userCityTag) => {
    const services = [...items];
    switch (sortKey) {
        case 'popular':
            return services.sort((a, b) => {
                const ratingDiff = (Number(b.rating) || 0) - (Number(a.rating) || 0);
                if (ratingDiff !== 0) return ratingDiff;
                return (b.likes || 0) - (a.likes || 0);
            });
        case 'closest':
            if (!userCityTag) {
                return services;
            }
            return services.sort((a, b) => {
                const aMatch = a.location_tags === userCityTag;
                const bMatch = b.location_tags === userCityTag;
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return (Number(b.rating) || 0) - (Number(a.rating) || 0);
            });
        case 'category':
            return services.sort((a, b) => {
                const catA = a.category_name?.toLowerCase() || '';
                const catB = b.category_name?.toLowerCase() || '';
                if (catA === catB) {
                    return (Number(b.rating) || 0) - (Number(a.rating) || 0);
                }
                return catA.localeCompare(catB);
            });
        default:
            return services;
    }
};

export default function Services() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSort, setSelectedSort] = useState('popular');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [locationStatus, setLocationStatus] = useState('');
    const [userCityTag, setUserCityTag] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/vendors/categories/');
                if (!response.ok) throw new Error('Unable to load categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const shouldFetchLocation = selectedSort === 'closest' && !userCityTag;
        if (!shouldFetchLocation) return;

        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setLocationStatus('Location not supported in this browser.');
            return;
        }

        setLocationStatus('Finding the nearest city to you...');
        navigator.geolocation.getCurrentPosition(
            position => {
                const tag = inferNearestCityTag({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setUserCityTag(tag);
                setLocationStatus(tag ? `Showing vendors near ${CITY_COORDINATES[tag].name}` : '');
            },
            () => {
                setLocationStatus('We could not access your location. Showing all vendors instead.');
            }
        );
    }, [selectedSort, userCityTag]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        const fetchServices = async () => {
            setIsLoading(true);
            setError('');
            const categoryFilter =
                selectedCategory !== 'all'
                    ? `?category__name=${encodeURIComponent(selectedCategory)}`
                    : '';
            try {
                const response = await fetch(`/api/vendors/services/${categoryFilter}`, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error('Unable to load services');
                }
                const payload = await response.json();
                const rawServices = Array.isArray(payload) ? payload : payload?.results || [];
                const sorted = sortServices(rawServices, selectedSort, userCityTag);
                if (isMounted) {
                    setServices(sorted);
                }
            } catch (err) {
                if (isMounted && err.name !== 'AbortError') {
                    setError('We had trouble loading services. Please try again.');
                    console.error(err);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchServices();
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [selectedCategory, selectedSort, userCityTag]);

    const filteredServices = useMemo(() => {
        const query = searchTerm.toLowerCase();
        const visible = services.filter(service => {
            const vendorName = service.vendor?.name?.toLowerCase() || '';
            const categoryName = service.category_name?.toLowerCase() || '';
            const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory.toLowerCase();
            const matchesSearch =
                vendorName.includes(query) ||
                service.name?.toLowerCase().includes(query) ||
                categoryName.includes(query);
            return matchesCategory && matchesSearch;
        });
        return sortServices(visible, selectedSort, userCityTag);
    }, [services, searchTerm, selectedCategory, selectedSort, userCityTag]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-400 text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <p className="uppercase text-xs tracking-[0.3em] font-semibold text-white/80 mb-2">
                        Services & Vendors
                    </p>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-3">Find trusted vendors for your event</h1>
                            <p className="text-white/85 text-lg max-w-2xl">
                                Browse popular providers, discover options closest to you, or filter by category to fill
                                every need.
                            </p>
                        </div>
                        <div className="bg-white/15 border border-white/30 rounded-2xl p-4 backdrop-blur-lg w-full lg:w-[420px]">
                            <p className="text-sm text-white/80 mb-2">Quick search</p>
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by vendor, service, or category"
                                className="w-full px-4 py-3 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(SORT_OPTIONS).map(([key, option]) => (
                            <SortPill
                                key={key}
                                isActive={selectedSort === key}
                                label={option.label}
                                description={option.description}
                                icon={option.icon}
                                onClick={() => setSelectedSort(key)}
                            />
                        ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                selectedCategory === 'all'
                                    ? 'bg-white text-pink-600 shadow'
                                    : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            All categories
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                                    selectedCategory === category.name
                                        ? 'bg-white text-pink-600 shadow'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">
                            {SORT_OPTIONS[selectedSort].label}
                        </p>
                        <h2 className="text-2xl font-bold text-gray-900">Vendors curated for you</h2>
                        {locationStatus && (
                            <p className="text-sm text-pink-700 mt-1 bg-pink-50 inline-block px-3 py-2 rounded-full">
                                {locationStatus}
                            </p>
                        )}
                    </div>
                    <div className="text-sm text-gray-600">
                        Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <ServiceCardSkeleton key={idx} />
                        ))}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                        <p className="text-lg font-semibold text-gray-800 mb-2">No services match your search.</p>
                        <p className="text-gray-500 mb-4">
                            Try clearing filters or switching to another sorting option.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                                setSelectedSort('popular');
                            }}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map(service => (
                            <ServiceCard key={service.id} service={service} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}