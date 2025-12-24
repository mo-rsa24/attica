import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue which can sometimes cause problems in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Map Controller for programmatic updates ---
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.length === 2 && center[0] != null && center[1] != null) {
            map.setView(center, zoom, { animate: true, duration: 0.5 });
        }
    }, [center, zoom, map]);
    return null;
};

// --- Component to handle map events ---
const MapEvents = ({ onMapChange }) => {
    useMapEvents({
        dragend: (e) => onMapChange(e.target.getCenter()),
        zoomend: (e) => onMapChange(e.target.getCenter()),
        click: (e) => onMapChange(e.latlng),
    });
    return null;
}

const InteractiveMap = ({ center, zoom, onMapChange, markerPosition, onMarkerDragEnd, locations, onMarkerClick }) => {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                onMarkerDragEnd(marker.getLatLng());
            }
        },
    }), [onMarkerDragEnd]);

    // --- CRITICAL FIX: Filter out locations with invalid coordinates ---
    const validLocations = Array.isArray(locations) ? locations.filter(
        loc => loc && loc.latitude != null && loc.longitude != null
    ) : [];

    return (
        <MapContainer center={center || [0,0]} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: '1rem' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
            <MapController center={center} zoom={zoom} />
            <MapEvents onMapChange={onMapChange} />

            {/* Draggable marker for custom placement */}
            {markerPosition && markerPosition[0] != null && (
                <Marker position={markerPosition} draggable={true} eventHandlers={eventHandlers} ref={markerRef}>
                    <Popup>Drag to set the exact location</Popup>
                </Marker>
            )}

            {/* Markers for venue locations */}
            {validLocations.map(loc => (
                 <Marker key={loc.id} position={[loc.latitude, loc.longitude]} eventHandlers={{ click: () => onMarkerClick(loc) }}>
                    <Popup>{loc.name}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default InteractiveMap;