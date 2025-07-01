import { AiOutlineHome } from 'react-icons/ai';
import { BiBell } from 'react-icons/bi';
import { FiGlobe } from 'react-icons/fi';
import { HiOutlineMenu } from 'react-icons/hi';
import { FaAirbnb } from 'react-icons/fa';

export default function NavBar() {
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
              <a
                href="#"
                className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative"
              >
                <span>Experiences</span>
              </a>

              {/* Services */}
              <a
                href="#"
                className="inline-flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 relative"
              >
                <BiBell className="h-5 w-5" />
                <span>Services</span>
              </a>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <a
              href="/vendors/profile/update/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Become a host
            </a>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiGlobe className="h-5 w-5 text-gray-700" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <HiOutlineMenu className="h-5 w-5 text-gray-700" />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
