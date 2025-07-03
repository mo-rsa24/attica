import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

function AdvancedSearch() {
  const [activeTab, setActiveTab] = useState('events');

  const renderInput = (icon, placeholder) => (
    <div className="flex items-center w-full bg-gray-50 p-4 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-pink-500 transition">
      <div className="text-gray-400 mr-3">{icon}</div>
      <input type="text" placeholder={placeholder} className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none" />
    </div>
  );

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 px-6 font-semibold text-lg transition-colors ${activeTab === 'events' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
        >
          Search Events
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`py-3 px-6 font-semibold text-lg transition-colors ${activeTab === 'services' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'}`}
        >
          Search Services
        </button>
      </div>

      {/* Search Form */}
      <form className="space-y-6">
        {activeTab === 'events' && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">WHAT & WHERE</label>
              {renderInput(<FaSearch />, "Search for concerts, festivals, or venues...")}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">WHEN</label>
              {renderInput(<FaCalendarAlt />, "Select a date or date range...")}
            </div>
          </>
        )}

        {activeTab === 'services' && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SERVICE TYPE</label>
              {renderInput(<FaSearch />, "Search for catering, photography, security...")}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">LOCATION</label>
              {renderInput(<FaMapMarkerAlt />, "Enter city or region...")}
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-10 py-4 font-bold text-lg flex items-center transition"
          >
            <FaSearch className="mr-3" />
            Search
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdvancedSearch;