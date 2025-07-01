import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'

function SearchForm() {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [where, setWhere] = useState('')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const suggestions = ['Nearby', 'Cape Town', 'Pretoria', 'Durban']

  const baseField = {
    variant: 'standard',
    InputProps: { disableUnderline: true },
    sx: { '& input': { paddingTop: 0, paddingBottom: 0 } },
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
      <form className="w-full">
        <div className="flex flex-wrap items-center bg-white rounded-full shadow-md px-6 py-3 gap-4">
          {/* Location */}
          <div className="relative flex-1 min-w-[180px]">
            <input
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              placeholder="Search destinations"
              className="w-full bg-transparent placeholder-gray-500 text-sm focus:outline-none"
            />
            {showSuggestions && (
              <ul className="absolute left-0 top-full mt-2 w-full bg-white shadow rounded-md text-sm z-10">
                {suggestions.map((item) => (
                  <li
                    key={item}
                    onMouseDown={() => {
                      setWhere(item)
                      setShowSuggestions(false)
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                  >
                    <LocationOnIcon fontSize="small" className="text-gray-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Dates */}
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            calendars={2}
            slotProps={{
              textField: {
                ...baseField,
                placeholder: 'Check in',
                className: 'w-32 text-sm',
              },
            }}
          />
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            calendars={2}
            slotProps={{
              textField: {
                ...baseField,
                placeholder: 'Check out',
                className: 'w-32 text-sm',
              },
            }}
          />

          {/* Times */}
          <TimePicker
            value={startTime}
            onChange={setStartTime}
            ampm
            slotProps={{
              textField: {
                ...baseField,
                placeholder: 'Start time',
                className: 'w-24 text-sm',
              },
            }}
          />
          <TimePicker
            value={endTime}
            onChange={setEndTime}
            ampm
            slotProps={{
              textField: {
                ...baseField,
                placeholder: 'End time',
                className: 'w-24 text-sm',
              },
            }}
          />

          {/* Search button */}
          <button
            type="submit"
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 py-2.5 font-bold"
          >
            <SearchIcon fontSize="small"/>
          </button>
        </div>
      </form>
    </LocalizationProvider>
  )
}

export default SearchForm
