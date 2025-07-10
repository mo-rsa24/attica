// frontend/src/components/FilterSidebar.jsx

import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

const FilterSidebar = ({ onFilterChange }) => {
    const [capacity, setCapacity] = useState(0);
    const [price, setPrice] = useState(10000);
    const [features, setFeatures] = useState([]);
    const [debouncedCapacity] = useDebounce(capacity, 500);
    const [debouncedPrice] = useDebounce(price, 500);

    const handleFeatureChange = (e) => {
        const { value, checked } = e.target;
        setFeatures(prev =>
            checked ? [...prev, value] : prev.filter(f => f !== value)
        );
    };

    useEffect(() => {
        const filters = {
            capacity__gte: debouncedCapacity,
            price__lte: debouncedPrice,
            features: features.join(',')
        };
        onFilterChange(filters);
    }, [debouncedCapacity, debouncedPrice, features, onFilterChange]);

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Filters</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                        Minimum Capacity: {capacity}
                    </label>
                    <input
                        type="range"
                        id="capacity"
                        min="0"
                        max="10000"
                        step="100"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Maximum Price: ${price}
                    </label>
                    <input
                        type="range"
                        id="price"
                        min="0"
                        max="10000"
                        step="100"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-700">Features</h4>
                    <div className="space-y-2 mt-2">
                        {['WiFi', 'Parking', 'Air Conditioning'].map(feature => (
                            <div key={feature} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={feature}
                                    value={feature}
                                    onChange={handleFeatureChange}
                                    className="h-4 w-4 text-rose-600 border-gray-300 rounded"
                                />
                                <label htmlFor={feature} className="ml-2 block text-sm text-gray-900">
                                    {feature}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterSidebar;