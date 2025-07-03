import { AiOutlineHome } from 'react-icons/ai';
import { useAuth } from './AuthProvider.jsx';
import { HiOutlineMenu } from 'react-icons/hi';
import { FaAirbnb } from 'react-icons/fa';
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ userProfileImageUrl, onLogout }) => {

  const { user, currentRole, setCurrentRole } = useAuth();
  return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo and Nav Links */}
            <div className="flex items-center space-x-12">
              <a href="/" className="flex items-center space-x-2">
                <FaAirbnb className="h-6 w-6 text-pink-600" />
                <span className="text-xl font-bold lowercase text-gray-800">attica</span>
              </a>

              <div className="flex items-center space-x-8">
                {/* Homes (active) */}
                <a
                    href="#"
                    className="inline-flex items-center space-x-2 text-sm font-medium text-gray-900 border-b-2 border-black pb-2"
                >
                  <AiOutlineHome className="h-5 w-5" />
                  <span>Homes</span>
                </a>

                {/* Experiences */}
                <Link
                    to="/events" // Add the path to your events page
                    className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative"
                >
                  <span>Events</span>
                </Link>

                {/* Services */}
                <Link
                    to="/services" // Add the path to your events page
                    className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative"
                >
                  <span>Services</span>
                </Link>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {user && user.roles?.length > 1 && (
                  <select
                      className="text-sm border rounded px-2 py-1"
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
              <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-2 ring-gray-300">
                    <img
                        src={userProfileImageUrl || 'https://placehold.co/40x40/EFEFEF/3A3A3A?text=P'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </Link>

              {user ? (
                 <Link
                    to="/login"
                    onClick={onLogout}
                    className="text-gray-600 hover:text-gray-900"
                >
                    Logout
                </Link>
              ) : (
                  <Link
                      to="/login"
                      className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Login
                  </Link>
              )}


              <button className="p-2 rounded-full hover:bg-gray-100">
                <HiOutlineMenu className="h-5 w-5 text-gray-700"/>
              </button>
            </div>

          </div>
        </div>
      </nav>
  );
}
export default Navbar;