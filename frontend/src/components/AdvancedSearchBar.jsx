import React, { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedSearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebounce(query, 300);

    useEffect(() => {
        onSearch(debouncedQuery);
    }, [debouncedQuery, onSearch]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search locations by name, description..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 transition"
            />
            <AnimatePresence>
                {query && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg p-4"
                    >
                        {/* You can show live suggestions here */}
                        <p className="text-sm text-gray-500">Searching for: "{query}"</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSearchBar;