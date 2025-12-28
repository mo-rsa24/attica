import {AiOutlineHome} from 'react-icons/ai';
import {useAuth} from './AuthContext';
import {HiOutlineMenu} from 'react-icons/hi';
import {FaAirbnb} from 'react-icons/fa';
import React from 'react';
import {Link} from 'react-router-dom';

const Navbar = ({userProfileImageUrl, onLogout}) => {

    const {user, currentRole, setCurrentRole} = useAuth();
    return (
        <nav className="bg-gradient-to-r from-white via-pink-50 to-white border-b border-pink-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">

                    {/* Logo and Nav Links */}
                    <div className="flex items-center space-x-16">
                        <a href="/" className="flex items-center space-x-2">
                            <FaAirbnb className="h-7 w-7 text-pink-600"/>
                            <span className="text-2xl font-bold lowercase text-gray-800 tracking-tight">attica</span>
                        </a>

                        <div className="flex items-center space-x-10">
                            {/* Homes (active) */}
                            <a
                                href="#"
                                className="inline-flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
                            >
                                <AiOutlineHome className="h-5 w-5"/>
                                <span>Homes</span>
                            </a>

                            {/* Experiences */}
                            <Link
                                to="/events" // Add the path to your events page
                                className="inline-flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
                            >
                                <span>Events</span>
                            </Link>
                            {/* Artists */}
                            <Link
                                to="/artists"
                                className="inline-flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
                            >
                                <span>Artists</span>
                            </Link>

                            {/* Services */}
                            <Link
                                to="/services" // Add the path to your events page
                                className="inline-flex items-center space-x-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
                            >
                                <span>Services</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-5">
                        {user && user.roles?.length > 1 && (
                            <select
                                className="text-sm border border-pink-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                value={currentRole || ''}
                                onChange={e => setCurrentRole(e.target.value)}
                            >
                                {user.roles.map(r => (
                                    <option key={r} value={r}>
                                        {r.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        )}
                        <Link to="/profile"
                              className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-offset-2 ring-pink-200 shadow-sm">
                            <img
                                src={userProfileImageUrl || 'https://placehold.co/44x44/EFEFEF/3A3A3A?text=P'}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </Link>

                        {user ? (
                            <Link
                                to="/login"
                                onClick={onLogout}
                                className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Logout
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Login
                            </Link>
                        )}


                        <button className="p-3 rounded-full hover:bg-pink-50 text-gray-700 transition-all shadow-sm">
                            <HiOutlineMenu className="h-5 w-5"/>
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
}
export default Navbar;