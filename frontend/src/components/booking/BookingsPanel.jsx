import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import dayjs from 'dayjs';

import { useAuth } from '../../AuthContext';
import { schedulingApi } from '../../api/schedulingApi.js';
import ProviderCard from './ProviderCard.jsx';
import OrganizerCounterResponseModal from './CounterProposalModal.jsx';

const TABS = [
  { key: 'venue', label: 'Venues', emoji: '🏟️' },
  { key: 'artist', label: 'Artists', emoji: '🎤' },
  { key: 'vendor', label: 'Vendors', emoji: '🛠️' },
];

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
export default function BookingsPanel({
  eventDraftId,
  selectedRange,
  bookingRequests,
  onRequestCreated,
  onRequestUpdated,
  onOpenCounter,
}) {
  const { tokens } = useAuth();
  const authToken = tokens?.access;

  const [activeTab, setActiveTab] = useState('venue');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minRating: '', maxPrice: '' });

  // Results per tab
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Counter proposal modal
  const [counterTarget, setCounterTarget] = useState(null);

  const sentinelRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Reset results when tab, search or filters change
  // ---------------------------------------------------------------------------
  const resetAndLoad = useCallback(() => {
    setResults([]);
    setOffset(0);
    setHasMore(true);
  }, []);

  useEffect(() => {
    resetAndLoad();
  }, [activeTab, debouncedSearch, filters, resetAndLoad]);

  // ---------------------------------------------------------------------------
  // Fetch a page of enriched providers
  // ---------------------------------------------------------------------------
  const fetchPage = useCallback(
    async (currentOffset) => {
      if (!authToken || !selectedRange?.start || !selectedRange?.end) return;
      setLoading(true);
      try {
        const params = {
          resource_type: activeTab,
          start_at: dayjs(selectedRange.start).toISOString(),
          end_at: dayjs(selectedRange.end).toISOString(),
          limit: PAGE_SIZE,
          offset: currentOffset,
        };
        if (debouncedSearch) params.name = debouncedSearch;
        if (filters.minRating) params.min_rating = parseFloat(filters.minRating);
        if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);

        const data = await schedulingApi.searchEnriched(authToken, params);
        const items = data?.results || [];
        setResults((prev) => (currentOffset === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === PAGE_SIZE);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [authToken, selectedRange, activeTab, debouncedSearch, filters]
  );

  // Load first page whenever deps change (offset reset triggers this)
  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  // Load more when offset increments
  useEffect(() => {
    if (offset > 0) fetchPage(offset);
  }, [offset, fetchPage]);

  // ---------------------------------------------------------------------------
  // Infinite scroll observer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          setOffset((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // ---------------------------------------------------------------------------
  // Map booking request for a resource
  // ---------------------------------------------------------------------------
  const requestForResource = useCallback(
    (resourceId) =>
      bookingRequests.find(
        (r) => r.resource === resourceId || r.resource_id === resourceId
      ),
    [bookingRequests]
  );

  // ---------------------------------------------------------------------------
  // Counter modal handlers
  // ---------------------------------------------------------------------------
  const handleOpenCounter = (req) => {
    setCounterTarget(req);
    onOpenCounter?.(req);
  };

  const handleCounterResponse = (updatedRequest) => {
    onRequestUpdated(updatedRequest);
    setCounterTarget(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full pb-4">
      {/* Tab bar */}
      <div className="flex gap-2 mb-4 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder={`Search ${activeTab}s…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
            showFilters
              ? 'bg-pink-50 border-pink-300 text-pink-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FaFilter className="inline mr-1.5" />
          Filters
        </button>
      </div>

      {/* Filter drawer */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Min Rating
              </span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.5"
                placeholder="e.g. 4"
                value={filters.minRating}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, minRating: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Max Price (ZAR)
              </span>
              <input
                type="number"
                min="0"
                step="500"
                placeholder="e.g. 10000"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                }
                className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </label>
          </div>
          <button
            onClick={() => setFilters({ minRating: '', maxPrice: '' })}
            className="mt-3 text-xs text-slate-400 hover:text-slate-700 underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Venue single-select notice */}
      {activeTab === 'venue' && (
        <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
          <span className="text-amber-500">⚠</span>
          Only one venue can be booked per event. Booking a new venue will cancel any pending venue request.
        </p>
      )}

      {/* Results list */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {results.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-medium">No {activeTab}s available for this time window.</p>
            <p className="text-sm mt-1">Try adjusting your date range or filters.</p>
          </div>
        )}

        {results.map((provider) => {
          const existingRequest = requestForResource(provider.resource_id);
          return (
            <ProviderCard
              key={provider.resource_id}
              provider={provider}
              existingRequest={existingRequest}
              eventDraftId={eventDraftId}
              selectedRange={selectedRange}
              singleSelect={activeTab === 'venue'}
              onRequestCreated={onRequestCreated}
              onRequestUpdated={onRequestUpdated}
              onOpenCounter={handleOpenCounter}
            />
          );
        })}

        {loading && (
          <div className="py-6 flex justify-center">
            <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />
      </div>

      {/* Counter proposal modal */}
      {counterTarget && (
        <OrganizerCounterResponseModal
          bookingRequest={counterTarget}
          onClose={() => setCounterTarget(null)}
          onResponse={handleCounterResponse}
        />
      )}
    </div>
  );
}
