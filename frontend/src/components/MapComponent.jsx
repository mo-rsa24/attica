// frontend/src/components/MapComponent.jsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ locations }) => {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map(loc => (
                <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
                    <Popup>{loc.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapComponent;