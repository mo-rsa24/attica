import {useAuth} from './AuthContext';
import {HiOutlineMenu, HiSearch} from 'react-icons/hi';
import {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {NotificationBell} from './components/notifications';
import atticaLogo from './assets/attica2.png';
import { getActiveRole, getRoleWorkspace } from './utils/roleWorkspace';

const Navbar = ({userProfileImageUrl, onLogout}) => {
    const normalizeProfileImage = (url) => {
        if (!url || typeof url !== 'string') return '';
        if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        if (url.startsWith('/')) return url;
        return `/media/${url.replace(/^\/+/, '')}`;
    };

    const {user, currentRole, setCurrentRole} = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isArtistsMenuOpen, setIsArtistsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef(null);
    const artistsMenuRef = useRef(null);
    const artistsMenuCloseTimerRef = useRef(null);
    const searchInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const roleToLabel = (role) => {
        if (!role) return '';
        return role
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    const activeRole = getActiveRole(user, currentRole);
    const myWorkspaceLabel = getRoleWorkspace(activeRole)?.myLabel || 'My Events';
    const isAdminUser = Boolean(user?.is_staff || user?.is_superuser || user?.roles?.includes('ADMIN'));
    const PROVIDER_ROLES = ['ARTIST', 'SERVICE_PROVIDER', 'VENUE_MANAGER', 'VENDOR', 'VENUE'];
    const isProvider = PROVIDER_ROLES.includes(activeRole);

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (artistsMenuRef.current && !artistsMenuRef.current.contains(event.target)) {
                setIsArtistsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (artistsMenuCloseTimerRef.current) {
                clearTimeout(artistsMenuCloseTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setIsArtistsMenuOpen(false);
        setIsMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    };

    const navLinks = [
        { to: '/', label: 'Explore' },
        { to: '/events', label: 'Events' },
        { to: '/services', label: 'Services' },
    ];

    const isArtistsOrTours = isActive('/artists') || isActive('/tours');

    const openArtistsMenu = () => {
        if (artistsMenuCloseTimerRef.current) {
            clearTimeout(artistsMenuCloseTimerRef.current);
            artistsMenuCloseTimerRef.current = null;
        }
        setIsArtistsMenuOpen(true);
    };

    const closeArtistsMenuWithDelay = () => {
        if (artistsMenuCloseTimerRef.current) {
            clearTimeout(artistsMenuCloseTimerRef.current);
        }
        artistsMenuCloseTimerRef.current = setTimeout(() => {
            setIsArtistsMenuOpen(false);
        }, 180);
    };

    return (
        <nav className="navbar-atmosphere border-b border-slate-200/80 sticky top-0 z-50">
            <div className="navbar-bg-layer navbar-bg-layer--base" />
            <div className="navbar-bg-layer navbar-bg-layer--mesh" />
            <div className="navbar-orb navbar-orb--one" />
            <div className="navbar-orb navbar-orb--two" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
                <div className="flex items-center justify-between h-28 md:h-32">

                    {/* Logo and Nav Links */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center flex-shrink-0 rounded-2xl px-2 py-1 bg-white/60 backdrop-blur-sm ring-1 ring-white/80">
                            <img src={atticaLogo} alt="Attica" className="h-20 md:h-24 w-auto drop-shadow-[0_8px_18px_rgba(15,23,42,0.35)] saturate-125 contrast-110" />
                        </Link>

                        <div className="hidden md:flex items-center gap-2">
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`px-4 py-2.5 rounded-xl text-[1.06rem] font-semibold transition-all duration-200 ${
                                        isActive(link.to)
                                            ? 'text-slate-900 bg-white/80 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div
                                className="relative"
                                ref={artistsMenuRef}
                                onMouseEnter={openArtistsMenu}
                                onMouseLeave={closeArtistsMenuWithDelay}
                            >
                                <button
                                    type="button"
                                    onFocus={openArtistsMenu}
                                    className={`px-4 py-2.5 rounded-xl text-[1.06rem] font-semibold transition-all duration-200 inline-flex items-center gap-2 ${
                                        isArtistsOrTours
                                            ? 'text-slate-900 bg-white/80 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                                    }`}
                                    aria-haspopup="menu"
                                    aria-expanded={isArtistsMenuOpen}
                                >
                                    Artists
                                    <span className={`text-xs transition-transform ${isArtistsMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                                </button>
                                <div
                                    onMouseEnter={openArtistsMenu}
                                    onMouseLeave={closeArtistsMenuWithDelay}
                                    className={`absolute left-0 top-full mt-2 w-52 rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xl transition-all duration-200 ${
                                        isArtistsMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
                                    }`}
                                >
                                    <Link
                                        to="/artists"
                                        className={`block px-4 py-3 text-base font-semibold rounded-t-2xl transition-colors ${
                                            isActive('/artists') ? 'text-slate-900 bg-slate-100/80' : 'text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        Browse Artists
                                    </Link>
                                    <Link
                                        to="/tours"
                                        className={`block px-4 py-3 text-base font-semibold rounded-b-2xl transition-colors ${
                                            isActive('/tours') ? 'text-slate-900 bg-slate-100/80' : 'text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        Tours
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center">
                        <div className="relative">
                            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                ref={searchInputRef}
                                type="search"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search artists, events… ⌘K"
                                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent w-64"
                            />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Role badge */}
                        {user && activeRole && (
                            <span
                                className="hidden lg:inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600"
                                title={`Logged in as ${roleToLabel(activeRole)}`}
                            >
                                {roleToLabel(activeRole)}
                            </span>
                        )}

                        {/* Role switcher */}
                        {user && user.roles?.length > 1 && (
                            <select
                                className="hidden sm:block text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white/90 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-slate-600"
                                value={activeRole}
                                onChange={e => setCurrentRole(e.target.value)}
                            >
                                {user.roles.map(r => (
                                    <option key={r} value={r}>
                                        {roleToLabel(r)}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Notifications */}
                        {user && <NotificationBell />}

                        {user && isProvider && (
                            <Link
                                to="/provider-dashboard"
                                className={`hidden sm:inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                                    isActive('/provider-dashboard')
                                        ? 'border-pink-400 bg-pink-50 text-pink-700'
                                        : 'border-slate-300 bg-white/90 text-slate-700 hover:bg-white'
                                }`}
                            >
                                My Dashboard
                            </Link>
                        )}
                        {user && !isProvider && activeRole === 'EVENT_ORGANIZER' && (
                            <Link
                                to="/dashboard/organizer"
                                className={`hidden sm:inline-flex items-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                                    isActive('/dashboard/organizer')
                                        ? 'border-pink-400 bg-pink-50 text-pink-700'
                                        : 'border-slate-300 bg-white/90 text-slate-700 hover:bg-white'
                                }`}
                            >
                                My Bookings
                            </Link>
                        )}
                        {user && isAdminUser && (
                            <Link
                                to="/scheduling/ops"
                                className="hidden sm:inline-flex items-center rounded-lg border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white transition-colors"
                            >
                                Scheduling Ops
                            </Link>
                        )}

                        {/* Profile avatar */}
                        <Link
                            to="/profile"
                            className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-1 ring-slate-200 hover:ring-slate-400 transition-all flex-shrink-0"
                        >
                            <img
                                src={normalizeProfileImage(userProfileImageUrl) || 'https://placehold.co/36x36/F3F4F6/9CA3AF?text=U'}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = 'https://placehold.co/36x36/F3F4F6/9CA3AF?text=U';
                                }}
                            />
                        </Link>

                        {/* Auth action */}
                        {user ? (
                            <button
                                onClick={onLogout}
                                className="hidden sm:inline-flex text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Log out
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Log in
                            </Link>
                        )}

                        {/* Hamburger menu */}
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsMenuOpen(prev => !prev)}
                                className="p-2.5 rounded-xl hover:bg-white/80 text-slate-500 hover:text-slate-900 transition-all"
                                aria-label="Open menu"
                            >
                                <HiOutlineMenu className="h-6 w-6"/>
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white/95 rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 backdrop-blur-md">
                                    {/* Mobile search */}
                                    <div className="md:hidden px-3 pt-2 pb-2">
                                        <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="flex gap-2">
                                            <input
                                                type="search"
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                placeholder="Search…"
                                                className="flex-1 pl-3 pr-2 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                            />
                                            <button type="submit" className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">
                                                Go
                                            </button>
                                        </form>
                                    </div>

                                    {/* Mobile nav links */}
                                    <div className="md:hidden border-b border-gray-100 pb-1.5 mb-1.5">
                                        {navLinks.map(link => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                                    isActive(link.to) ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                        <Link
                                            to="/artists"
                                            className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                                isActive('/artists') ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Artists
                                        </Link>
                                        <Link
                                            to="/tours"
                                            className={`block pl-7 pr-4 py-2.5 text-sm font-medium transition-colors ${
                                                isActive('/tours') ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Tours
                                        </Link>
                                    </div>
                                    {user && (
                                        <Link
                                            to="/my-events"
                                            className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {myWorkspaceLabel}
                                        </Link>
                                    )}
                                    {user && isProvider && (
                                        <Link
                                            to="/provider-dashboard"
                                            className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                                isActive('/provider-dashboard')
                                                    ? 'text-pink-700 bg-pink-50'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Dashboard
                                        </Link>
                                    )}
                                    {user && isProvider && (
                                        <Link
                                            to="/provider-availability"
                                            className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                                isActive('/provider-availability')
                                                    ? 'text-pink-700 bg-pink-50'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Availability
                                        </Link>
                                    )}
                                    {user && !isProvider && activeRole === 'EVENT_ORGANIZER' && (
                                        <Link
                                            to="/dashboard/organizer"
                                            className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                                isActive('/dashboard/organizer')
                                                    ? 'text-pink-700 bg-pink-50'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                    )}
                                    {user && (
                                        <Link
                                            to="/scheduling"
                                            className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                                isActive('/scheduling')
                                                    ? 'text-pink-700 bg-pink-50'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Calendar
                                        </Link>
                                    )}
                                    {user && isAdminUser && (
                                        <Link
                                            to="/scheduling/ops"
                                            className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Scheduling Ops
                                        </Link>
                                    )}
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <div className="border-t border-gray-100 mt-1.5 pt-1.5">
                                        {user ? (
                                            <button
                                                onClick={() => {
                                                    onLogout?.();
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
                                            >
                                                Log out
                                            </button>
                                        ) : (
                                            <Link
                                                to="/login"
                                                className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
}
export default Navbar;
