import React, { createContext, useState, useContext } from 'react';

// 1. Create the context
const EventCreationContext = createContext();

// 2. Create a custom hook for easy consumption
export const useEventCreation = () => {
    return useContext(EventCreationContext);
};

// 3. Create the Provider component
export const EventCreationProvider = ({ children }) => {
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);

    const value = {
        selectedLocations,
        setSelectedLocations,
        selectedArtists,
        setSelectedArtists,
        selectedVendors,
        setSelectedVendors,
    };

    return (
        <EventCreationContext.Provider value={value}>
            {children}
        </EventCreationContext.Provider>
    );
};
