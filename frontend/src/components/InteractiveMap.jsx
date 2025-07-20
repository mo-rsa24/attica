import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A component to programmatically control the map's view
const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const InteractiveMap = ({ center, zoom, onMapClick, markerPosition, onMarkerDragEnd }) => {
    const markerRef = useRef(null);

    const handleMarkerDragEnd = () => {
        const marker = markerRef.current;
        if (marker != null) {
            onMarkerDragEnd(marker.getLatLng());
        }
    };

    return (
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: '1rem' }} onClick={onMapClick}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController center={center} zoom={zoom} />
            {markerPosition && (
                <Marker
                    position={markerPosition}
                    draggable={true}
                    eventHandlers={{ dragend: handleMarkerDragEnd }}
                    ref={markerRef}
                >
                    <Popup>Drag to fine-tune the location</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default InteractiveMap;
