import { useState, forwardRef } from 'react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaChevronDown, FaChevronUp, FaTimes, FaUserAlt, FaBuilding } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SearchInput = ({ icon, placeholder, value, onChange }) => (
    <div className="flex items-center w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all duration-200">
        <div className="text-gray-400 mr-3 flex-shrink-0">{icon}</div>
        <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
            value={value}
            onChange={onChange}
        />
    </div>
);

const FilterDropdown = ({ label, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('');

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-sm"
            >
                <span className={selected ? 'text-gray-900 font-medium' : 'text-gray-400'}>{selected || label}</span>
                {isOpen ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
                    {options.map(option => (
                        <div
                            key={option}
                            onClick={() => {
                                setSelected(option);
                                setIsOpen(false);
                            }}
                            className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 hover:text-gray-900 transition-colors"
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function AdvancedSearch() {
    const [activeTab, setActiveTab] = useState('events');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const onDateChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    const DatePickerCustomInput = forwardRef(({ value, onClick }, ref) => (
        <button
            type="button"
            onClick={onClick}
            ref={ref}
            className="flex items-center w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-all duration-200 text-sm"
        >
            <FaCalendarAlt className="text-gray-400 mr-3" />
            <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || "Select dates..."}</span>
        </button>
    ));

    const tabs = [
        { key: 'events', label: 'Events', icon: <FaCalendarAlt className="text-xs" /> },
        { key: 'services', label: 'Services', icon: <FaBuilding className="text-xs" /> },
        { key: 'artists', label: 'Artists', icon: <FaUserAlt className="text-xs" /> },
        { key: 'location', label: 'Locations', icon: <FaMapMarkerAlt className="text-xs" /> },
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'events':
                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SearchInput icon={<FaSearch />} placeholder="Search concerts, festivals, venues..." />
                            <DatePicker
                                selectsRange={true}
                                startDate={startDate}
                                endDate={endDate}
                                onChange={onDateChange}
                                customInput={<DatePickerCustomInput />}
                                placeholderText="Select dates..."
                                dateFormat="MMM d, yyyy"
                            />
                        </div>
                        {showMoreFilters && (
                            <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Refine results</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FilterDropdown label="Category" options={['Conference', 'Workshop', 'Music Festival', 'Food & Drink']} />
                                    <FilterDropdown label="Event size" options={['1-50', '51-200', '201-1000', '1000+']} />
                                    <FilterDropdown label="Price range" options={['Free', 'Paid', '$0-$25', '$26-$50']} />
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'services':
                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SearchInput icon={<FaBuilding />} placeholder="Search catering, photography, security..." />
                            <SearchInput icon={<FaMapMarkerAlt />} placeholder="City or region..." />
                        </div>
                        {showMoreFilters && (
                            <div className="mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Refine results</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <FilterDropdown label="Category" options={['Catering', 'AV & Production', 'Security', 'Entertainment']} />
                                    <FilterDropdown label="Rating" options={['4+ stars', '3+ stars', 'Any']} />
                                    <label className="flex items-center gap-2.5 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                                        <input type="checkbox" className="form-checkbox h-4 w-4 text-gray-900 rounded border-gray-300"/>
                                        <span className="text-sm text-gray-700">Verified only</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'artists':
                return <SearchInput icon={<FaUserAlt />} placeholder="Search for an artist..." />;
            case 'location':
                return <SearchInput icon={<FaMapMarkerAlt />} placeholder="Search city, venue, or address..." />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300">
            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === tab.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Search Form */}
            <form className="space-y-3">
                {renderActiveTabContent()}

                {/* Actions row */}
                <div className="flex justify-between items-center pt-2">
                    {(activeTab === 'events' || activeTab === 'services') ? (
                        <button
                            type="button"
                            onClick={() => setShowMoreFilters(!showMoreFilters)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {showMoreFilters ? (
                                <><FaTimes className="text-xs" /> Less filters</>
                            ) : (
                                <><FaChevronDown className="text-xs" /> More filters</>
                            )}
                        </button>
                    ) : <div />}
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 py-2.5 font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                    >
                        <FaSearch className="text-xs" />
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdvancedSearch;
