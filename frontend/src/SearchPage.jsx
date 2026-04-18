import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import useAxios from './utils/useAxios';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'artists', label: 'Artists' },
    { key: 'events', label: 'Events' },
    { key: 'services', label: 'Services' },
];

const ArtistCard = ({ artist }) => (
    <Link
        to={`/artists/${artist.id}`}
        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow"
    >
        <img
            src={artist.profile_image || 'https://placehold.co/80x80/e2e8f0/64748b?text=A'}
            alt={artist.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
        />
        <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{artist.name}</p>
            <p className="text-sm text-slate-500 truncate">{artist.genres || 'Artist'}</p>
            {artist.rating > 0 && (
                <p className="text-xs text-amber-500 mt-0.5">{'★'.repeat(Math.round(artist.rating))} {artist.rating}</p>
            )}
        </div>
    </Link>
);

const EventCard = ({ event }) => (
    <Link
        to={`/events/${event.id}`}
        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow"
    >
        {event.image && (
            <img src={event.image} alt={event.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        )}
        <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{event.name}</p>
            <p className="text-sm text-slate-500 truncate">{event.date} · {event.location || event.venue || 'Location TBA'}</p>
            {event.category && <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 mt-1 inline-block">{event.category}</span>}
        </div>
    </Link>
);

const ServiceCard = ({ service }) => (
    <Link
        to={`/services/${service.id}`}
        className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:shadow-md transition-shadow"
    >
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🎪</span>
        </div>
        <div className="min-w-0">
            <p className="font-semibold text-slate-900 truncate">{service.name}</p>
            <p className="text-sm text-slate-500 truncate">{service.vendor?.name || 'Vendor'}</p>
            {service.price && <p className="text-xs text-slate-400 mt-0.5">R{service.price}</p>}
        </div>
    </Link>
);

const Section = ({ title, children, count }) => (
    <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {count > 0 && (
                <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{count}</span>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
);

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const api = useAxios();

    const query = searchParams.get('q') || '';
    const activeTab = searchParams.get('type') || 'all';

    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState({ artists: [], events: [], services: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const doSearch = useCallback(async (q, type) => {
        if (!q.trim()) return;
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.get('/api/search/', { params: { q: q.trim(), type } });
            setResults({
                artists: data.artists || [],
                events: data.events || [],
                services: data.services || [],
            });
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        if (query) doSearch(query, activeTab);
    }, [query, activeTab, doSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = inputValue.trim();
        if (q) setSearchParams({ q, type: activeTab });
    };

    const setTab = (tab) => setSearchParams({ q: query, type: tab });

    const totalResults = results.artists.length + results.events.length + results.services.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-10">
                {/* Search input */}
                <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
                    <input
                        type="search"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Search artists, events, services…"
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-base focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                    >
                        Search
                    </button>
                </form>

                {/* Tabs */}
                {query && (
                    <div className="flex gap-1 mb-6 border-b border-slate-200">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setTab(tab.key)}
                                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-slate-900 text-slate-900'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab.label}
                                {tab.key !== 'all' && results[tab.key]?.length > 0 && (
                                    <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">
                                        {results[tab.key].length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-white border border-slate-100 animate-pulse" />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 text-rose-600">{error}</div>
                )}

                {!isLoading && query && totalResults === 0 && (
                    <div className="text-center py-16">
                        <p className="text-3xl mb-3">🔍</p>
                        <h2 className="text-lg font-semibold text-slate-900">No results for "{query}"</h2>
                        <p className="text-slate-500 text-sm mt-2">Try different keywords or browse by category.</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                            <Section title="Artists" count={results.artists.length}>
                                {results.artists.map(a => <ArtistCard key={a.id} artist={a} />)}
                            </Section>
                        )}
                        {(activeTab === 'all' || activeTab === 'events') && results.events.length > 0 && (
                            <Section title="Events" count={results.events.length}>
                                {results.events.map(e => <EventCard key={e.id} event={e} />)}
                            </Section>
                        )}
                        {(activeTab === 'all' || activeTab === 'services') && results.services.length > 0 && (
                            <Section title="Services" count={results.services.length}>
                                {results.services.map(s => <ServiceCard key={s.id} service={s} />)}
                            </Section>
                        )}
                    </>
                )}

                {!query && (
                    <div className="text-center py-16">
                        <p className="text-3xl mb-3">✨</p>
                        <h2 className="text-lg font-semibold text-slate-900">Search Attica</h2>
                        <p className="text-slate-500 text-sm mt-2">Find artists, events, venues, and services all in one place.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
