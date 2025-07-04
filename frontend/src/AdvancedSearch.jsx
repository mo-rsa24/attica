import { useState, forwardRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaChevronDown, FaChevronUp, FaTimes, FaUserAlt, FaBuilding } from 'react-icons/fa';
import DatePicker from 'react-datepicker';

// You'll need to import the CSS for the date picker to style it correctly.
// Add this line at the top of the file.
import "react-datepicker/dist/react-datepicker.css";

// Reusable Input Component
const SearchInput = ({ icon, placeholder, value, onChange }) => (
    <div className="flex items-center w-full bg-gray-100 p-3 rounded-lg border border-transparent focus-within:ring-2 focus-within:ring-pink-500 transition-all duration-300">
        <div className="text-gray-500 mr-3">{icon}</div>
        <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none"
            value={value}
            onChange={onChange}
        />
    </div>
);

// Reusable Filter Dropdown
const FilterDropdown = ({ label, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('');

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200"
            >
                <span className="text-gray-700">{selected || label}</span>
                {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
                    {options.map(option => (
                        <div
                            key={option}
                            onClick={() => {
                                setSelected(option);
                                setIsOpen(false);
                            }}
                            className="p-3 hover:bg-pink-50 cursor-pointer"
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// Main AdvancedSearch Component
function AdvancedSearch() {
    const [activeTab, setActiveTab] = useState('events');
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    // --- NEW: State for managing the selected dates ---
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const onDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    // --- NEW: Custom Input for the DatePicker ---
    // This allows us to style the input field while using the DatePicker's functionality.
    const DatePickerCustomInput = forwardRef(({ value, onClick }, ref) => (
        <button type="button" onClick={onClick} ref={ref} className="flex items-center w-full bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-pink-400 transition-all duration-300">
            <FaCalendarAlt className="text-gray-500 mr-3" />
            <span className="text-gray-700">{value || "Select a date or date range..."}</span>
        </button>
    ));

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'events':
                return (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchInput icon={<FaSearch />} placeholder="Search for concerts, festivals, or venues..." />

                            {/* --- UPDATED: This now uses the functional DatePicker --- */}
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={onDateChange}
                                customInput={<DatePickerCustomInput />}
                                placeholderText="Select a date or date range..."
                                dateFormat="MMM d, yyyy"
                            />
                        </div>
                        {showMoreFilters && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fade-in-down">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Advanced Event Filters</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <FilterDropdown label="Event Category" options={['Conference', 'Workshop', 'Music Festival', 'Food & Drink']} />
                                     <FilterDropdown label="Event Size" options={['1-50', '51-200', '201-1000', '1000+']} />
                                     <FilterDropdown label="Ticket Price" options={['Free', 'Paid', '$0-$25', '$26-$50']} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'services':
                 return (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SearchInput icon={<FaBuilding />} placeholder="Search for catering, photography, security..." />
                             <SearchInput icon={<FaMapMarkerAlt />} placeholder="Enter city or region..." />
                        </div>
                         {showMoreFilters && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fade-in-down">
                                <h3 className="text-lg font-semibold mb-3 text-gray-800">Advanced Service Filters</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <FilterDropdown label="Service Category" options={['Catering', 'AV & Production', 'Security', 'Entertainment']} />
                                     <FilterDropdown label="Rating" options={['4+ stars', '3+ stars', 'Any']} />
                                     <label className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
                                         <input type="checkbox" className="form-checkbox h-5 w-5 text-pink-600"/>
                                         <span className="text-gray-700">Verified by Attica</span>
                                     </label>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'artists':
                 return (
                    <div className="animate-fade-in">
                        <SearchInput icon={<FaUserAlt />} placeholder="Search for an artist..." />
                    </div>
                 );
            case 'location':
                 return (
                    <div className="animate-fade-in">
                        <SearchInput icon={<FaMapMarkerAlt />} placeholder="Search for a city, venue, or address..." />
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg transition-all duration-500">
            {/* Tabs */}
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                {['events', 'services', 'artists', 'location'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-6 font-semibold text-lg capitalize transition-all duration-300 ${activeTab === tab ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Search {tab}
                    </button>
                ))}
            </div>

            {/* Search Form */}
            <form className="space-y-4">
                {renderActiveTabContent()}

                {/* More Filters & Search Button */}
                {(activeTab === 'events' || activeTab === 'services') && (
                     <div className="flex justify-between items-center pt-4">
                        <button
                            type="button"
                            onClick={() => setShowMoreFilters(!showMoreFilters)}
                            className="flex items-center text-sm font-semibold text-gray-700 hover:text-pink-600 transition-colors"
                        >
                            {showMoreFilters ? (
                                <>
                                    <FaTimes className="mr-2" /> Less Filters
                                </>
                            ) : (
                                <>
                                    <FaChevronDown className="mr-2" /> More Filters
                                </>
                            )}
                        </button>
                         <button
                            type="submit"
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 py-3 font-bold text-lg flex items-center transform hover:scale-105 transition-transform"
                        >
                            <FaSearch className="mr-3" />
                            Search
                        </button>
                    </div>
                )}

                 {(activeTab === 'artists' || activeTab === 'location') && (
                     <div className="flex justify-end pt-4">
                         <button
                            type="submit"
                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 py-3 font-bold text-lg flex items-center transform hover:scale-105 transition-transform"
                        >
                            <FaSearch className="mr-3" />
                            Search
                        </button>
                    </div>
                 )}
            </form>
        </div>
    );
}

export default AdvancedSearch;