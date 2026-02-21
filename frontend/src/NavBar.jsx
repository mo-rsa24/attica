import {useAuth} from './AuthContext';
import {HiOutlineMenu} from 'react-icons/hi';
import {useEffect, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
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
    const menuRef = useRef(null);
    const artistsMenuRef = useRef(null);
    const artistsMenuCloseTimerRef = useRef(null);
    const location = useLocation();

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

    const navLinks = [
        { to: '/', label: 'Explore' },
        { to: '/offerings', label: 'Offerings' },
        { to: '/events', label: 'Events' },
        { to: '/services', label: 'Services' },
    ];

    const isArtistsOrTours = location.pathname === '/artists' || location.pathname === '/tours';

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
                <div className="flex items-center justify-between h-24 md:h-28">

                    {/* Logo and Nav Links */}
                    <div className="flex items-center gap-10">
                        <Link to="/" className="flex items-center flex-shrink-0">
                            <img src={atticaLogo} alt="Attica" className="h-16 md:h-20 w-auto drop-shadow-sm" />
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
                                            location.pathname === '/artists' ? 'text-slate-900 bg-slate-100/80' : 'text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        Browse Artists
                                    </Link>
                                    <Link
                                        to="/tours"
                                        className={`block px-4 py-3 text-base font-semibold rounded-b-2xl transition-colors ${
                                            location.pathname === '/tours' ? 'text-slate-900 bg-slate-100/80' : 'text-slate-700 hover:bg-slate-100/70'
                                        }`}
                                    >
                                        Tours
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                                location.pathname === '/artists' ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Artists
                                        </Link>
                                        <Link
                                            to="/tours"
                                            className={`block pl-7 pr-4 py-2.5 text-sm font-medium transition-colors ${
                                                location.pathname === '/tours' ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
