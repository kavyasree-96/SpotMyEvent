import { GEOAPIFY_KEY } from "../config";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SetView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 13);
  }, [center, map]);
  return null;
};

const EventMap = ({ center, events }) => {
  // For now we don't have lat/lng for events, we'll just place a marker at city center.
  // In a real app you'd geocode event addresses.
  return (
    <MapContainer
      center={center || [12.9716, 77.5946]}
      zoom={12}
      style={{ height: '400px', width: '100%', borderRadius: '16px' }}
    >
     <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
/>
      <SetView center={center} />
      {center && <Marker position={center}><Popup>Selected city</Popup></Marker>}
      {/* Here you could add markers for each event after geocoding */}
    </MapContainer>
  );
};

export default EventMap;